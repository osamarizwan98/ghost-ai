/**
 * Tests for the clerk-nextjs-patterns nextjs-basic-auth layout template.
 *
 * The layout.tsx file is a Next.js root layout template that wraps the app
 * in ClerkProvider and renders conditional auth UI using the Clerk `Show`
 * component. Since this is a template file and no React test infrastructure
 * exists in the project, these tests validate the structural content of the
 * file to ensure it remains correct and complete.
 *
 * Run: node --test .agents/skills/clerk-nextjs-patterns/templates/nextjs-basic-auth/app/__tests__/layout.test.mjs
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LAYOUT_FILE = join(__dirname, "..", "layout.tsx");

const source = readFileSync(LAYOUT_FILE, "utf8");

describe("nextjs-basic-auth layout.tsx", () => {
  describe("Clerk imports", () => {
    test("imports ClerkProvider from @clerk/nextjs", () => {
      assert.match(source, /from\s+['"]@clerk\/nextjs['"]/);
      assert.match(source, /ClerkProvider/);
    });

    test("imports Show component", () => {
      assert.match(source, /\bShow\b/);
    });

    test("imports SignInButton", () => {
      assert.match(source, /\bSignInButton\b/);
    });

    test("imports SignUpButton", () => {
      assert.match(source, /\bSignUpButton\b/);
    });

    test("imports UserButton", () => {
      assert.match(source, /\bUserButton\b/);
    });

    test("all auth components are imported from @clerk/nextjs in a single import", () => {
      // All components come from the same @clerk/nextjs import
      const clerkImportMatch = source.match(/import\s*\{([^}]+)\}\s*from\s*['"]@clerk\/nextjs['"]/s);
      assert.ok(clerkImportMatch, "Should have a named import block from @clerk/nextjs");
      const importedNames = clerkImportMatch[1];
      assert.match(importedNames, /ClerkProvider/, "ClerkProvider should be in the import");
      assert.match(importedNames, /Show/, "Show should be in the import");
      assert.match(importedNames, /SignInButton/, "SignInButton should be in the import");
      assert.match(importedNames, /SignUpButton/, "SignUpButton should be in the import");
      assert.match(importedNames, /UserButton/, "UserButton should be in the import");
    });
  });

  describe("component structure", () => {
    test("exports a default function named RootLayout", () => {
      assert.match(source, /export\s+default\s+function\s+RootLayout/);
    });

    test("RootLayout accepts a children prop typed as React.ReactNode", () => {
      assert.match(source, /children.*React\.ReactNode/s);
    });

    test("renders an html element with lang='en'", () => {
      assert.match(source, /<html\s+lang="en"/);
    });

    test("renders a body element", () => {
      assert.match(source, /<body>/);
    });

    test("wraps content in ClerkProvider", () => {
      assert.match(source, /<ClerkProvider>/);
      assert.match(source, /<\/ClerkProvider>/);
    });

    test("renders a header element", () => {
      assert.match(source, /<header>/);
      assert.match(source, /<\/header>/);
    });

    test("renders children inside ClerkProvider", () => {
      // {children} should appear in the JSX
      assert.match(source, /\{children\}/);
    });
  });

  describe("Show component usage for conditional auth UI", () => {
    test("uses Show with when='signed-out' for unauthenticated state", () => {
      assert.match(source, /Show\s+when="signed-out"/);
    });

    test("uses Show with when='signed-in' for authenticated state", () => {
      assert.match(source, /Show\s+when="signed-in"/);
    });

    test("renders SignInButton inside the signed-out Show block", () => {
      // SignInButton should appear in the file (rendered for signed-out users)
      assert.match(source, /<SignInButton/);
    });

    test("renders SignUpButton inside the signed-out Show block", () => {
      assert.match(source, /<SignUpButton/);
    });

    test("renders UserButton inside the signed-in Show block", () => {
      assert.match(source, /<UserButton/);
    });

    test("signed-out Show block comes before signed-in Show block", () => {
      const signedOutIdx = source.indexOf('when="signed-out"');
      const signedInIdx = source.indexOf('when="signed-in"');
      assert.ok(signedOutIdx !== -1, "signed-out Show must exist");
      assert.ok(signedInIdx !== -1, "signed-in Show must exist");
      assert.ok(
        signedOutIdx < signedInIdx,
        "signed-out block should appear before signed-in block in source order"
      );
    });
  });

  describe("TypeScript correctness", () => {
    test("uses TypeScript type annotation for children prop", () => {
      // Should have a type annotation like: { children: React.ReactNode }
      assert.match(source, /:\s*React\.ReactNode/);
    });

    test("file uses .tsx extension pattern (JSX + TypeScript)", () => {
      assert.ok(LAYOUT_FILE.endsWith(".tsx"), "Layout file should have .tsx extension");
    });
  });

  describe("nesting and layout structure", () => {
    test("ClerkProvider is inside the body element", () => {
      const bodyIdx = source.indexOf("<body>");
      const clerkProviderIdx = source.indexOf("<ClerkProvider>");
      const bodyCloseIdx = source.indexOf("</body>");
      assert.ok(bodyIdx !== -1);
      assert.ok(clerkProviderIdx !== -1);
      assert.ok(bodyIdx < clerkProviderIdx, "ClerkProvider should come after <body>");
      assert.ok(clerkProviderIdx < bodyCloseIdx, "ClerkProvider should come before </body>");
    });

    test("header is inside ClerkProvider", () => {
      const clerkProviderIdx = source.indexOf("<ClerkProvider>");
      const headerIdx = source.indexOf("<header>");
      const clerkProviderCloseIdx = source.indexOf("</ClerkProvider>");
      assert.ok(clerkProviderIdx < headerIdx, "header should come after <ClerkProvider>");
      assert.ok(headerIdx < clerkProviderCloseIdx, "header should come before </ClerkProvider>");
    });

    test("SignInButton and SignUpButton appear in the signed-out Show block", () => {
      // The signed-out Show block should contain both sign-in and sign-up buttons
      const signedOutStart = source.indexOf('when="signed-out"');
      // Find the closing Show tag after the signed-out block
      const closingShowAfterSignedOut = source.indexOf("</Show>", signedOutStart);
      const signedOutBlock = source.slice(signedOutStart, closingShowAfterSignedOut + 7);

      assert.match(signedOutBlock, /<SignInButton/, "SignInButton should be inside signed-out block");
      assert.match(signedOutBlock, /<SignUpButton/, "SignUpButton should be inside signed-out block");
    });

    test("UserButton appears in the signed-in Show block", () => {
      const signedInStart = source.indexOf('when="signed-in"');
      const closingShowAfterSignedIn = source.indexOf("</Show>", signedInStart);
      const signedInBlock = source.slice(signedInStart, closingShowAfterSignedIn + 7);

      assert.match(signedInBlock, /<UserButton/, "UserButton should be inside signed-in block");
    });
  });
});