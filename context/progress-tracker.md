# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 03: Auth

## Current Goal

- Wire Clerk into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Completed

- 01-design-system: shadcn/ui installed (class-variance-authority, clsx, tailwind-merge, @radix-ui primitives); components/ui/ has Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea; lucide-react installed; lib/utils.ts with cn(); globals.css has full dark theme tokens wired to shadcn semantic variables.
- 02-editor-chrome: components/editor/editor-navbar.tsx (fixed top navbar, sidebar toggle with PanelLeftOpen/PanelLeftClose icons, dark background with bottom border); components/editor/project-sidebar.tsx (floating overlay sidebar, slides in from left, Projects header + close button, My Projects / Shared tabs with empty states, full-width New Project button).
- 03-auth: @clerk/ui installed; NEXT_PUBLIC_CLERK_SIGN_IN_URL and NEXT_PUBLIC_CLERK_SIGN_UP_URL added to .env.local; proxy.ts at project root uses clerkMiddleware with createRouteMatcher protecting all non-public routes; ClerkProvider wraps root layout with dark theme from @clerk/ui/themes and CSS variable overrides; sign-in and sign-up pages at app/sign-in/[[...sign-in]] and app/sign-up/[[...sign-up]] use two-panel layout (left: logo + tagline + feature list, right: Clerk form) on large screens, form-only on small screens; root page.tsx redirects authenticated users to /editor and unauthenticated users to /sign-in; UserButton added to editor navbar right section.

## In Progress

- None yet.

## Next Up

- 04 (next feature spec)

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
