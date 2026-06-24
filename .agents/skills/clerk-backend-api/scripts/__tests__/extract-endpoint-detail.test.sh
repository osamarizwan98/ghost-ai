#!/usr/bin/env bash
# Tests for extract-endpoint-detail.sh
#
# extract-endpoint-detail.sh reads an OpenAPI YAML spec from stdin and extracts
# full details for a specific endpoint (path + HTTP method), including any
# $ref'd component schemas.
#
# Run: bash .agents/skills/clerk-backend-api/scripts/__tests__/extract-endpoint-detail.test.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${SCRIPT_DIR}/../extract-endpoint-detail.sh"

# ─── Test counters ────────────────────────────────────────────────────────────

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

assert_contains() {
  local desc="$1" needle="$2" haystack="$3"
  if [[ "$haystack" == *"$needle"* ]]; then
    pass "$desc"
  else
    fail "$desc" "expected output to contain: '$needle'"
  fi
}

assert_not_contains() {
  local desc="$1" needle="$2" haystack="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    pass "$desc"
  else
    fail "$desc" "expected output NOT to contain: '$needle'"
  fi
}

assert_exit_0() {
  local desc="$1" code="$2"
  if [[ "$code" -eq 0 ]]; then pass "$desc"; else fail "$desc" "exit code was $code, expected 0"; fi
}

assert_exit_1() {
  local desc="$1" code="$2"
  if [[ "$code" -eq 1 ]]; then pass "$desc"; else fail "$desc" "exit code was $code, expected 1"; fi
}

# ─── Test YAML fixture ────────────────────────────────────────────────────────

MINIMAL_SPEC='openapi: 3.0.3
info:
  title: Test API
  version: v1
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      tags:
        - Users
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserList"
    post:
      operationId: createUser
      summary: Create a user
      tags:
        - Users
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserRequest"
      responses:
        "201":
          description: Created
  /users/{user_id}:
    get:
      operationId: getUser
      summary: Get a specific user
      tags:
        - Users
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
    delete:
      operationId: deleteUser
      summary: Delete a user
      tags:
        - Users
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Deleted
  /organizations:
    post:
      operationId: createOrganization
      summary: Create an organization
      tags:
        - Organizations
      responses:
        "200":
          description: Created
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
    UserList:
      type: array
      items:
        $ref: "#/components/schemas/User"
    CreateUserRequest:
      type: object
      properties:
        email_address:
          type: string
        first_name:
          type: string'

# Helper: run script and capture output + exit code
run_script() {
  local yaml="$1" path="$2" method="$3"
  local stderr_file
  stderr_file=$(mktemp)
  SCRIPT_OUT=""
  SCRIPT_ERR=""
  SCRIPT_EXIT=0
  SCRIPT_OUT=$(echo "$yaml" | bash "$SCRIPT" "$path" "$method" 2>"$stderr_file") || SCRIPT_EXIT=$?
  SCRIPT_ERR=$(cat "$stderr_file")
  rm -f "$stderr_file"
}

# ─── Tests: basic extraction ─────────────────────────────────────────────────

echo ""
echo "=== Basic extraction ==="

run_script "$MINIMAL_SPEC" "/users" "get"
assert_exit_0 "Extracting GET /users exits 0" "$SCRIPT_EXIT"
assert_contains "Output contains the method header" '`GET`' "$SCRIPT_OUT"
assert_contains "Output contains the path header" '`/users`' "$SCRIPT_OUT"
assert_contains "Output includes 'Endpoint Definition' section" "Endpoint Definition" "$SCRIPT_OUT"
assert_contains "Output contains operationId" "listUsers" "$SCRIPT_OUT"
assert_contains "Output contains summary" "List all users" "$SCRIPT_OUT"
assert_contains "Output is wrapped in a yaml code block" '```yaml' "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users/{user_id}" "get"
assert_contains "Path parameter endpoint extracted correctly" "getUser" "$SCRIPT_OUT"
assert_contains "Path parameter appears in endpoint path header" "/users/{user_id}" "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users/{user_id}" "delete"
assert_contains "DELETE endpoint extracted correctly" "deleteUser" "$SCRIPT_OUT"
assert_contains "DELETE method appears in header" '`DELETE`' "$SCRIPT_OUT"

# ─── Tests: method case normalization ────────────────────────────────────────

echo ""
echo "=== Method case normalization ==="

run_script "$MINIMAL_SPEC" "/users" "get"
assert_contains "Lowercase 'get' works" "listUsers" "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users/{user_id}" "delete"
assert_contains "Lowercase 'delete' works" "deleteUser" "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users" "post"
assert_contains "Lowercase 'post' works" "createUser" "$SCRIPT_OUT"

# ─── Tests: non-existent endpoint ────────────────────────────────────────────

echo ""
echo "=== Non-existent endpoint ==="

run_script "$MINIMAL_SPEC" "/nonexistent" "get"
assert_exit_1 "Non-existent path exits 1" "$SCRIPT_EXIT"
assert_contains "Non-existent endpoint error message includes path" "/nonexistent" "$SCRIPT_ERR"

run_script "$MINIMAL_SPEC" "/users" "head"
assert_exit_1 "Existing path with non-existent method exits 1" "$SCRIPT_EXIT"

run_script "$MINIMAL_SPEC" "/users" "options"
assert_exit_1 "Existing path with non-existent method 'options' exits 1" "$SCRIPT_EXIT"

# ─── Tests: $ref resolution ──────────────────────────────────────────────────

echo ""
echo "=== \$ref resolution ==="

run_script "$MINIMAL_SPEC" "/users" "get"
assert_contains "GET /users output references UserList" "UserList" "$SCRIPT_OUT"
assert_contains "GET /users output contains 'Referenced Components' section" "Referenced Components" "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users/{user_id}" "get"
assert_contains "GET /users/{user_id} resolves User schema" "User" "$SCRIPT_OUT"
assert_contains "GET /users/{user_id} includes components section" "Referenced Components" "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users" "post"
assert_contains "POST /users resolves CreateUserRequest schema" "CreateUserRequest" "$SCRIPT_OUT"

# ─── Tests: endpoint with no $refs ───────────────────────────────────────────

echo ""
echo "=== Endpoint with no \$refs ==="

run_script "$MINIMAL_SPEC" "/users/{user_id}" "delete"
assert_contains "DELETE endpoint output has endpoint definition" "Endpoint Definition" "$SCRIPT_OUT"
assert_not_contains "DELETE endpoint without refs has no 'Referenced Components' section" "Referenced Components" "$SCRIPT_OUT"

# ─── Tests: recursive $ref resolution ────────────────────────────────────────

echo ""
echo "=== Recursive \$ref resolution ==="

# UserList -> User: the script should resolve transitively
run_script "$MINIMAL_SPEC" "/users" "get"
# Both UserList and User should appear (User is transitive via UserList)
assert_contains "Transitively resolves User from UserList" "User" "$SCRIPT_OUT"

# ─── Tests: multiple endpoints in same path ───────────────────────────────────

echo ""
echo "=== Multiple endpoints in same path ==="

run_script "$MINIMAL_SPEC" "/organizations" "post"
assert_contains "POST /organizations extracted correctly" "createOrganization" "$SCRIPT_OUT"
assert_not_contains "POST /organizations does not include /users endpoints" "listUsers" "$SCRIPT_OUT"

# ─── Tests: output format ─────────────────────────────────────────────────────

echo ""
echo "=== Output format ==="

run_script "$MINIMAL_SPEC" "/users" "get"
# Header format: ## `METHOD` `path`
assert_contains "Header uses backtick-quoted method and path" '## `GET` `/users`' "$SCRIPT_OUT"

run_script "$MINIMAL_SPEC" "/users" "post"
assert_contains "POST header format is correct" '## `POST` `/users`' "$SCRIPT_OUT"

# ─── Tests: boundary case - last endpoint in spec ─────────────────────────────

echo ""
echo "=== Last endpoint in spec ==="

# /organizations POST is the last path in the spec
run_script "$MINIMAL_SPEC" "/organizations" "post"
assert_exit_0 "Last path+method in spec is extracted successfully" "$SCRIPT_EXIT"
assert_contains "Last endpoint operationId is present" "createOrganization" "$SCRIPT_OUT"

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