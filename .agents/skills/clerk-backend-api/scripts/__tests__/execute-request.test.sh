#!/usr/bin/env bash
# Tests for execute-request.sh
#
# Tests the scope enforcement logic and request building of execute-request.sh.
# Uses a mock `curl` binary to avoid real HTTP calls.
#
# Run: bash .agents/skills/clerk-backend-api/scripts/__tests__/execute-request.test.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${SCRIPT_DIR}/../execute-request.sh"

# ─── Test counters via temp files ─────────────────────────────────────────────

PASS_FILE=$(mktemp)
FAIL_FILE=$(mktemp)
echo 0 > "$PASS_FILE"
echo 0 > "$FAIL_FILE"
trap 'rm -f "$PASS_FILE" "$FAIL_FILE"' EXIT

pass() {
  echo "  PASS: $1"
  echo $(( $(cat "$PASS_FILE") + 1 )) > "$PASS_FILE"
}

fail() {
  echo "  FAIL: $1"
  echo "        $2"
  echo $(( $(cat "$FAIL_FILE") + 1 )) > "$FAIL_FILE"
}

assert_exit_0() {
  local desc="$1" code="$2"
  if [[ "$code" -eq 0 ]]; then pass "$desc"; else fail "$desc" "exit code was $code, expected 0"; fi
}

assert_exit_1() {
  local desc="$1" code="$2"
  if [[ "$code" -eq 1 ]]; then pass "$desc"; else fail "$desc" "exit code was $code, expected 1"; fi
}

# ─── Helper: create a mock curl binary in a temp directory ───────────────────

# make_mock_curl <tmpdir> <behavior>
# behavior: "record" — prints all args; "succeed" — exits 0 silently
make_mock_curl() {
  local dir="$1"
  cat > "$dir/curl" << 'EOF'
#!/usr/bin/env bash
echo "MOCK_CURL_CALLED"
for arg in "$@"; do echo "  ARG: $arg"; done
exit 0
EOF
  chmod +x "$dir/curl"
}

# run_with_mock <env_assignments...> -- <script_args...>
# Returns: stdout in RUN_STDOUT, stderr in RUN_STDERR, exit code in RUN_EXIT
run_with_mock() {
  local env_args=()
  local script_args=()
  local after_sep=false
  for arg in "$@"; do
    if [[ "$arg" == "--" ]]; then after_sep=true; continue; fi
    if $after_sep; then script_args+=("$arg"); else env_args+=("$arg"); fi
  done

  local tmpdir
  tmpdir=$(mktemp -d)
  make_mock_curl "$tmpdir"

  RUN_STDOUT=""
  RUN_STDERR=""
  RUN_EXIT=0

  local stderr_file
  stderr_file=$(mktemp)

  RUN_STDOUT=$(env "${env_args[@]}" PATH="$tmpdir:$PATH" bash "$SCRIPT" "${script_args[@]}" 2>"$stderr_file") || RUN_EXIT=$?
  RUN_STDERR=$(cat "$stderr_file")
  rm -f "$stderr_file"
  rm -rf "$tmpdir"
}

# ─── Tests: GET requests ─────────────────────────────────────────────────────

echo ""
echo "=== GET requests ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- GET /users
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "GET allowed when CLERK_BAPI_SCOPES is empty"
else
  fail "GET allowed when CLERK_BAPI_SCOPES is empty" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="read" -- GET /users
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "GET allowed with read-only scopes"
else
  fail "GET allowed with read-only scopes" "stdout: $RUN_STDOUT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- get /users
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "lowercase 'get' is normalized to GET"
else
  fail "lowercase 'get' is normalized to GET" "stdout: $RUN_STDOUT"
fi

# ─── Tests: POST/PUT/PATCH scope enforcement ──────────────────────────────────

echo ""
echo "=== POST/PUT/PATCH scope enforcement ==="

for method in POST PUT PATCH post put patch; do
  upper=$(echo "$method" | tr '[:lower:]' '[:upper:]')

  run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- "$method" /users '{}'
  assert_exit_1 "$upper without write scope fails (exit 1)" "$RUN_EXIT"

  if [[ "$RUN_STDERR" == *"write"* ]]; then
    pass "$upper failure message mentions 'write'"
  else
    fail "$upper failure message mentions 'write'" "stderr: $RUN_STDERR"
  fi

  run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write" -- "$method" /users '{}'
  if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
    pass "$upper with write scope proceeds"
  else
    fail "$upper with write scope proceeds" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
  fi
done

# ─── Tests: DELETE scope enforcement ─────────────────────────────────────────

echo ""
echo "=== DELETE scope enforcement ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- DELETE /users/123
assert_exit_1 "DELETE with no scopes fails" "$RUN_EXIT"

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write" -- DELETE /users/123
assert_exit_1 "DELETE with write-only scope fails (missing delete)" "$RUN_EXIT"

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="delete" -- DELETE /users/123
assert_exit_1 "DELETE with delete-only scope fails (missing write)" "$RUN_EXIT"

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write,delete" -- DELETE /users/123
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "DELETE with write,delete scopes proceeds"
else
  fail "DELETE with write,delete scopes proceeds" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write, delete" -- DELETE /users/123
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "DELETE with 'write, delete' (space after comma) proceeds"
else
  fail "DELETE with 'write, delete' (space after comma) proceeds" "stdout: $RUN_STDOUT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- DELETE /users/123
if [[ "$RUN_STDERR" == *"write,delete"* ]]; then
  pass "DELETE failure message mentions 'write,delete'"
else
  fail "DELETE failure message mentions 'write,delete'" "stderr: $RUN_STDERR"
fi

# ─── Tests: --admin flag ──────────────────────────────────────────────────────

echo ""
echo "=== --admin flag ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- --admin POST /users '{}'
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "--admin bypasses write scope check for POST"
else
  fail "--admin bypasses write scope check for POST" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- --admin DELETE /users/123
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "--admin bypasses write+delete scope check for DELETE"
else
  fail "--admin bypasses write+delete scope check for DELETE" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- --admin PATCH /users/123 '{"first_name":"A"}'
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "--admin bypasses scope check for PATCH"
else
  fail "--admin bypasses scope check for PATCH" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- --admin PUT /users/123 '{}'
if [[ "$RUN_STDOUT" == *"MOCK_CURL_CALLED"* ]]; then
  pass "--admin bypasses scope check for PUT"
else
  fail "--admin bypasses scope check for PUT" "stdout: $RUN_STDOUT exit: $RUN_EXIT"
fi

# ─── Tests: unknown HTTP method ──────────────────────────────────────────────

echo ""
echo "=== Unknown HTTP method ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write,delete" -- BLORP /users
assert_exit_1 "Unknown method BLORP fails with exit 1" "$RUN_EXIT"

if [[ "$RUN_STDERR" == *"Unknown HTTP method"* ]]; then
  pass "Unknown method prints 'Unknown HTTP method' to stderr"
else
  fail "Unknown method prints 'Unknown HTTP method' to stderr" "stderr: $RUN_STDERR"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write,delete" -- CONNECT /users
assert_exit_1 "Unknown method CONNECT fails with exit 1" "$RUN_EXIT"

# ─── Tests: CLERK_REST_API_URL override ──────────────────────────────────────

echo ""
echo "=== CLERK_REST_API_URL override ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" CLERK_REST_API_URL="https://custom.clerk.example.com" -- GET /users
if [[ "$RUN_STDOUT" == *"https://custom.clerk.example.com/v1/users"* ]]; then
  pass "CLERK_REST_API_URL overrides the default base URL"
else
  fail "CLERK_REST_API_URL overrides the default base URL" "stdout: $RUN_STDOUT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- GET /users
if [[ "$RUN_STDOUT" == *"https://api.clerk.com/v1/users"* ]]; then
  pass "Default base URL is https://api.clerk.com"
else
  fail "Default base URL is https://api.clerk.com" "stdout: $RUN_STDOUT"
fi

# ─── Tests: CLERK_SECRET_KEY requirement ─────────────────────────────────────

echo ""
echo "=== CLERK_SECRET_KEY requirement ==="

run_with_mock CLERK_SECRET_KEY="" CLERK_BAPI_SCOPES="" -- GET /users
if [[ "$RUN_EXIT" -ne 0 ]]; then
  pass "Missing CLERK_SECRET_KEY causes failure"
else
  fail "Missing CLERK_SECRET_KEY causes failure" "expected non-zero exit but got 0"
fi

# ─── Tests: request body passthrough ─────────────────────────────────────────

echo ""
echo "=== Request body passthrough ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="write" -- POST /users '{"email":"a@b.com"}'
if [[ "$RUN_STDOUT" == *'{"email":"a@b.com"}'* ]]; then
  pass "JSON body is passed to curl via -d flag"
else
  fail "JSON body is passed to curl via -d flag" "stdout: $RUN_STDOUT"
fi

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- GET /users
if [[ "$RUN_STDOUT" != *" -d "* ]]; then
  pass "No body means -d flag is not passed to curl"
else
  fail "No body means -d flag is not passed to curl" "stdout: $RUN_STDOUT"
fi

# ─── Tests: Authorization header ─────────────────────────────────────────────

echo ""
echo "=== Authorization header ==="

run_with_mock CLERK_SECRET_KEY="sk_test_mysecret123" CLERK_BAPI_SCOPES="" -- GET /users
if [[ "$RUN_STDOUT" == *"Authorization: Bearer sk_test_mysecret123"* ]]; then
  pass "Authorization header uses CLERK_SECRET_KEY as Bearer token"
else
  fail "Authorization header uses CLERK_SECRET_KEY as Bearer token" "stdout: $RUN_STDOUT"
fi

# ─── Tests: Content-Type header ──────────────────────────────────────────────

echo ""
echo "=== Content-Type header ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- GET /users
if [[ "$RUN_STDOUT" == *"Content-Type: application/json"* ]]; then
  pass "Content-Type: application/json is always included"
else
  fail "Content-Type: application/json is always included" "stdout: $RUN_STDOUT"
fi

# ─── Test: path is appended correctly ────────────────────────────────────────

echo ""
echo "=== Path construction ==="

run_with_mock CLERK_SECRET_KEY="sk_test_abc" CLERK_BAPI_SCOPES="" -- GET /users/user_abc123
if [[ "$RUN_STDOUT" == *"/v1/users/user_abc123"* ]]; then
  pass "Path is appended to base URL with /v1 prefix"
else
  fail "Path is appended to base URL with /v1 prefix" "stdout: $RUN_STDOUT"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "=== Results ==="
PASS=$(cat "$PASS_FILE")
FAIL=$(cat "$FAIL_FILE")
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  echo "SOME TESTS FAILED"
  exit 1
else
  echo "ALL TESTS PASSED"
  exit 0
fi