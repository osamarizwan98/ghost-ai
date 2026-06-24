/**
 * Tests for extract-tags.js
 *
 * extract-tags.js reads an OpenAPI YAML spec from stdin and prints the top-level
 * tag names (from the "tags:" section). It handles CRLF line endings and stops
 * parsing tags once a non-indented line is encountered after "tags:".
 *
 * Run: node --test .agents/skills/clerk-backend-api/scripts/__tests__/extract-tags.test.mjs
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, "..", "extract-tags.js");

/**
 * Runs extract-tags.js with the given stdin input and returns
 * { stdout, stderr, exitCode }.
 */
function runExtractTags(input) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (exitCode) => resolve({ stdout, stderr, exitCode }));
    child.stdin.write(input);
    child.stdin.end();
  });
}

describe("extract-tags.js", () => {
  describe("basic tag extraction", () => {
    test("extracts a single tag from a minimal YAML spec", async () => {
      const yaml = `openapi: 3.0.0
tags:
  - name: Users
    description: User management
paths:
  /users:
    get:
      tags:
        - Users
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      assert.equal(stdout.trim(), "Users");
    });

    test("extracts multiple tags in order", async () => {
      const yaml = `openapi: 3.0.0
tags:
  - name: Users
  - name: Organizations
  - name: Sessions
paths: {}
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["Users", "Organizations", "Sessions"]);
    });

    test("preserves tag names with spaces", async () => {
      const yaml = `tags:
  - name: Beta Features
  - name: JWT Templates
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["Beta Features", "JWT Templates"]);
    });

    test("extracts tag name with extra description fields present", async () => {
      const yaml = `tags:
  - name: Invitations
    description: Manage invitations
    externalDocs:
      url: https://docs.example.com
  - name: Webhooks
    description: Webhook endpoints
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["Invitations", "Webhooks"]);
    });
  });

  describe("empty and missing tags", () => {
    test("produces no output for empty input", async () => {
      const { stdout, exitCode } = await runExtractTags("");
      assert.equal(exitCode, 0);
      assert.equal(stdout, "");
    });

    test("produces no output when no 'tags:' section exists", async () => {
      const yaml = `openapi: 3.0.0
info:
  title: Test API
paths:
  /users:
    get:
      summary: List users
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      assert.equal(stdout, "");
    });

    test("produces no output for tags section with no entries", async () => {
      const yaml = `tags:
paths:
  /users: {}
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      assert.equal(stdout, "");
    });
  });

  describe("line-ending handling", () => {
    test("handles CRLF line endings correctly", async () => {
      const yaml = "openapi: 3.0.0\r\ntags:\r\n  - name: Users\r\n  - name: Orgs\r\n";
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["Users", "Orgs"]);
    });

    test("handles mixed LF line endings", async () => {
      const yaml = "tags:\n  - name: Alpha\n  - name: Beta\n";
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["Alpha", "Beta"]);
    });
  });

  describe("tags section boundary detection", () => {
    test("stops extracting tags when a non-indented line follows 'tags:'", async () => {
      const yaml = `tags:
  - name: Users
  - name: Orgs
info:
  title: My API
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["Users", "Orgs"]);
    });

    test("stops at 'paths:' top-level key after tags", async () => {
      const yaml = `tags:
  - name: Users
paths:
  /users:
    get:
      tags:
        - Users
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      assert.equal(stdout.trim(), "Users");
    });

    test("ignores content after the tags section ends", async () => {
      const yaml = `tags:
  - name: RealTag
components:
  - name: ShouldBeIgnored
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      assert.equal(stdout.trim(), "RealTag");
    });
  });

  describe("malformed entries", () => {
    test("ignores non-name entries in tags section", async () => {
      const yaml = `tags:
  - name: ValidTag
  - description: no-name-entry
  - name: AnotherValid
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      // "description: no-name-entry" does not match /^\s{2}- name:\s*(.+)/
      assert.deepEqual(lines, ["ValidTag", "AnotherValid"]);
    });

    test("ignores tags entries with wrong indentation", async () => {
      const yaml = `tags:
    - name: TooDeepIndent
  - name: CorrectIndent
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      // Only "  - name:" (2-space indent) matches the regex /^\s{2}- name:\s*(.+)/
      assert.equal(stdout.trim(), "CorrectIndent");
    });

    test("handles tag name with special characters", async () => {
      const yaml = `tags:
  - name: OAuth 2.0 / OIDC
  - name: Multi-Factor Authentication
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, ["OAuth 2.0 / OIDC", "Multi-Factor Authentication"]);
    });
  });

  describe("real-world-like YAML structure", () => {
    test("extracts tags from a spec that resembles Clerk's OpenAPI format", async () => {
      const yaml = `openapi: 3.0.3
info:
  title: Clerk Backend API
  version: v1
tags:
  - name: Clients
    description: Manage clients
  - name: Email Addresses
    description: Manage email addresses
  - name: Invitations
    description: Manage invitations
  - name: Organizations
    description: Manage organizations
  - name: Sessions
    description: Manage sessions
  - name: Users
    description: Manage users
paths:
  /users:
    get:
      operationId: GetUserList
      tags:
        - Users
      summary: List all users
`;
      const { stdout, exitCode } = await runExtractTags(yaml);
      assert.equal(exitCode, 0);
      const lines = stdout.trim().split("\n");
      assert.deepEqual(lines, [
        "Clients",
        "Email Addresses",
        "Invitations",
        "Organizations",
        "Sessions",
        "Users",
      ]);
    });
  });
});