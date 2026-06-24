#!/usr/bin/env bash
# Tests for extract-tag-endpoints.sh
#
# extract-tag-endpoints.sh reads an OpenAPI YAML spec from stdin, finds all
# endpoints that have a specific tag, and outputs them in Markdown with
# metadata (method, path, operationId, summary, description, refs).
#
# Run: bash .agents/skills/clerk-backend-api/scripts/__tests__/extract-tag-endpoints.test.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${SCRIPT_DIR}/../extract-tag-endpoints.sh"

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

MULTI_TAG_SPEC='openapi: 3.0.3
info:
  title: Test API
  version: v1
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      description: Returns a paginated list of users
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
      summary: Fetch a specific user
      tags:
        - Users
      responses:
        "200":
          description: OK
    patch:
      operationId: updateUser
      summary: Update a user
      tags:
        - Users
      responses:
        "200":
          description: OK
    delete:
      operationId: deleteUser
      summary: Delete a user
      tags:
        - Users
      responses:
        "200":
          description: Deleted
  /organizations:
    get:
      operationId: listOrgs
      summary: List all organizations
      tags:
        - Organizations
      responses:
        "200":
          description: OK
    post:
      operationId: createOrg
      summary: Create an organization
      tags:
        - Organizations
      responses:
        "201":
          description: Created
  /sessions:
    get:
      operationId: listSessions
      summary: List active sessions
      tags:
        - Sessions
      responses:
        "200":
          description: OK
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
    UserList:
      type: array
      items:
        $ref: "#/components/schemas/User"
    CreateUserRequest:
      type: object
      properties:
        email_address:
          type: string'

# Helper: run script and capture output + exit code
run_script() {
  local yaml="$1" tag="$2"
  local stderr_file
  stderr_file=$(mktemp)
  SCRIPT_OUT=""
  SCRIPT_ERR=""
  SCRIPT_EXIT=0
  SCRIPT_OUT=$(echo "$yaml" | bash "$SCRIPT" "$tag" 2>"$stderr_file") || SCRIPT_EXIT=$?
  SCRIPT_ERR=$(cat "$stderr_file")
  rm -f "$stderr_file"
}

# ─── Tests: basic tag extraction ─────────────────────────────────────────────

echo ""
echo "=== Basic tag extraction ==="

run_script "$MULTI_TAG_SPEC" "Users"
assert_exit_0 "Extracting 'Users' tag exits 0" "$SCRIPT_EXIT"
assert_contains "Users tag output contains all 5 endpoints" '(5 total)' "$SCRIPT_OUT"
assert_contains "Users tag output includes GET /users" '`GET` `/users`' "$SCRIPT_OUT"
assert_contains "Users tag output includes POST /users" '`POST` `/users`' "$SCRIPT_OUT"
assert_contains "Users tag output includes GET /users/{user_id}" '`GET` `/users/{user_id}`' "$SCRIPT_OUT"
assert_contains "Users tag output includes PATCH /users/{user_id}" '`PATCH` `/users/{user_id}`' "$SCRIPT_OUT"
assert_contains "Users tag output includes DELETE /users/{user_id}" '`DELETE` `/users/{user_id}`' "$SCRIPT_OUT"

# ─── Tests: tag isolation ─────────────────────────────────────────────────────

echo ""
echo "=== Tag isolation ==="

run_script "$MULTI_TAG_SPEC" "Organizations"
assert_contains "Organizations tag includes listOrgs" "listOrgs" "$SCRIPT_OUT"
assert_contains "Organizations tag includes createOrg" "createOrg" "$SCRIPT_OUT"
assert_not_contains "Organizations tag does not include Users endpoints" "listUsers" "$SCRIPT_OUT"
assert_not_contains "Organizations tag does not include Sessions endpoints" "listSessions" "$SCRIPT_OUT"

run_script "$MULTI_TAG_SPEC" "Sessions"
assert_contains "Sessions tag includes listSessions" "listSessions" "$SCRIPT_OUT"
assert_contains "Sessions tag shows 1 total" '(1 total)' "$SCRIPT_OUT"
assert_not_contains "Sessions tag does not include Users endpoints" "listUsers" "$SCRIPT_OUT"

# ─── Tests: case-insensitive tag matching ─────────────────────────────────────

echo ""
echo "=== Case-insensitive tag matching ==="

run_script "$MULTI_TAG_SPEC" "users"
assert_exit_0 "Lowercase tag 'users' matches 'Users' endpoints" "$SCRIPT_EXIT"
assert_contains "Lowercase tag 'users' finds correct endpoints" "listUsers" "$SCRIPT_OUT"

run_script "$MULTI_TAG_SPEC" "USERS"
assert_contains "Uppercase tag 'USERS' finds correct endpoints" "listUsers" "$SCRIPT_OUT"

run_script "$MULTI_TAG_SPEC" "ORGANIZATIONS"
assert_contains "Uppercase 'ORGANIZATIONS' finds correct endpoints" "listOrgs" "$SCRIPT_OUT"

# ─── Tests: non-existent tag ─────────────────────────────────────────────────

echo ""
echo "=== Non-existent tag ==="

run_script "$MULTI_TAG_SPEC" "Billing"
assert_exit_1 "Non-existent tag exits 1" "$SCRIPT_EXIT"
assert_contains "Non-existent tag error message includes tag name" "Billing" "$SCRIPT_ERR"

run_script "$MULTI_TAG_SPEC" ""
assert_exit_1 "Empty tag exits 1 (or usage error)" "$SCRIPT_EXIT"

# ─── Tests: metadata extraction ──────────────────────────────────────────────

echo ""
echo "=== Metadata extraction ==="

run_script "$MULTI_TAG_SPEC" "Users"
assert_contains "operationId is extracted" "**operationId**" "$SCRIPT_OUT"
assert_contains "Specific operationId value shown" "listUsers" "$SCRIPT_OUT"
assert_contains "Summary is extracted" "**summary**" "$SCRIPT_OUT"
assert_contains "Specific summary value shown" "List all users" "$SCRIPT_OUT"
# Description differs from summary for listUsers - should be shown
assert_contains "Description is extracted when present and different from summary" "Returns a paginated list of users" "$SCRIPT_OUT"

# ─── Tests: $ref extraction ───────────────────────────────────────────────────

echo ""
echo "=== \$ref extraction ==="

run_script "$MULTI_TAG_SPEC" "Users"
assert_contains "refs section appears when schemas are referenced" "**refs**" "$SCRIPT_OUT"
assert_contains "UserList ref is extracted" "UserList" "$SCRIPT_OUT"
assert_contains "Referenced Components section appears" "Referenced Components" "$SCRIPT_OUT"

run_script "$MULTI_TAG_SPEC" "Organizations"
# Organizations endpoints have no $refs in this spec
assert_not_contains "No refs section when no schemas referenced" "**refs**" "$SCRIPT_OUT"

# ─── Tests: output format ─────────────────────────────────────────────────────

echo ""
echo "=== Output format ==="

run_script "$MULTI_TAG_SPEC" "Users"
# Header: ## Endpoints for "<tag>" (<n> total)
assert_contains "Output header has correct format" '## Endpoints for "Users"' "$SCRIPT_OUT"
# Each endpoint: ### `METHOD` `path`
assert_contains "Endpoint entries use backtick-quoted method and path" '### `GET` `/users`' "$SCRIPT_OUT"

# ─── Tests: spec with no paths section ───────────────────────────────────────

echo ""
echo "=== Spec with no paths section ==="

run_script 'openapi: 3.0.3
info:
  title: Empty
' "Users"
assert_exit_1 "Spec with no paths exits 1 for any tag" "$SCRIPT_EXIT"

# ─── Tests: methods are uppercased in output ──────────────────────────────────

echo ""
echo "=== Methods are uppercased in output ==="

run_script "$MULTI_TAG_SPEC" "Users"
assert_contains "get method shown as GET" '`GET`' "$SCRIPT_OUT"
assert_contains "post method shown as POST" '`POST`' "$SCRIPT_OUT"
assert_contains "patch method shown as PATCH" '`PATCH`' "$SCRIPT_OUT"
assert_contains "delete method shown as DELETE" '`DELETE`' "$SCRIPT_OUT"

# ─── Tests: Organizations count ───────────────────────────────────────────────

echo ""
echo "=== Organization endpoint count ==="

run_script "$MULTI_TAG_SPEC" "Organizations"
assert_contains "Organizations tag shows 2 total endpoints" '(2 total)' "$SCRIPT_OUT"

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