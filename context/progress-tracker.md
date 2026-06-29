# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

<<<<<<< HEAD
- Feature 04: Project Dialogs & Editor Home

## Current Goal

- Build the /editor home screen and add project dialogs/sidebar actions (mock data only, no API calls).
=======
- Feature 04 complete; Feature 05 (TBD)

## Current Goal

- To be determined for Feature 05.
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748

## Completed

- 01-design-system: shadcn/ui installed (class-variance-authority, clsx, tailwind-merge, @radix-ui primitives); components/ui/ has Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea; lucide-react installed; lib/utils.ts with cn(); globals.css has full dark theme tokens wired to shadcn semantic variables.
- 02-editor-chrome: components/editor/editor-navbar.tsx (fixed top navbar, sidebar toggle with PanelLeftOpen/PanelLeftClose icons, dark background with bottom border); components/editor/project-sidebar.tsx (floating overlay sidebar, slides in from left, Projects header + close button, My Projects / Shared tabs with empty states, full-width New Project button).
- 03-auth: @clerk/ui installed; NEXT_PUBLIC_CLERK_SIGN_IN_URL and NEXT_PUBLIC_CLERK_SIGN_UP_URL added to .env.local; proxy.ts at project root uses clerkMiddleware with createRouteMatcher protecting all non-public routes; ClerkProvider wraps root layout with dark theme from @clerk/ui/themes and CSS variable overrides; sign-in and sign-up pages at app/sign-in/[[...sign-in]] and app/sign-up/[[...sign-up]] use two-panel layout (left: logo + tagline + feature list, right: Clerk form) on large screens, form-only on small screens; root page.tsx redirects authenticated users to /editor and unauthenticated users to /sign-in; UserButton added to editor navbar right section.
<<<<<<< HEAD
- 04-project-dialogs: hooks/use-project-dialogs.ts manages dialog/form/loading state; components/editor/create-project-dialog.tsx has name input with live slug preview; components/editor/rename-project-dialog.tsx prefills name, shows current name in description, auto-focuses, Enter submits; components/editor/delete-project-dialog.tsx is destructive-confirm only; ProjectSidebar updated with per-item rename/delete actions (owned only), mobile backdrop scrim, and close-on-tap-outside; EditorShell updated with editor home heading/description/New Project button wired to Create dialog; all sidebar actions wired; mock data only.
=======
- Feature 04: Project Dialogs — hooks/use-project-dialogs.ts manages dialog/form/loading state and mock project data (CRUD operations on local state). components/editor/project-dialogs.tsx renders Create (name + live slug preview), Rename (prefilled, auto-focus, Enter submits), and Delete (destructive confirm) dialogs. ProjectSidebar updated with project item list showing rename/delete actions on hover for owned projects only, shared projects shown without actions, mobile backdrop scrim added. app/editor/page.tsx updated with centered home screen (heading, description, New Project button) wired to Create dialog. TypeScript and ESLint clean.
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748

## In Progress

- None.

## Next Up

<<<<<<< HEAD
- 05 (next feature spec)
=======
- Feature 05 (TBD)
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Next.js 16 uses proxy.ts (not middleware.ts) — same API, renamed to reflect its purpose.

## Session Notes

- Using Next.js 16 with React 19 and Tailwind CSS v4.
- shadcn version 4.11.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.21.0 installed as a direct dependency.
- @clerk/nextjs ^7.5.8 and @clerk/ui ^1.21.0 installed.
