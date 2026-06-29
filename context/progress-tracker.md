# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 07: Wire editor home — complete

## Current Goal

- Feature 08 (next feature spec)

## Completed

- 01-design-system: shadcn/ui installed (class-variance-authority, clsx, tailwind-merge, @radix-ui primitives); components/ui/ has Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea; lucide-react installed; lib/utils.ts with cn(); globals.css has full dark theme tokens wired to shadcn semantic variables.
- 02-editor-chrome: components/editor/editor-navbar.tsx (fixed top navbar, sidebar toggle with PanelLeftOpen/PanelLeftClose icons, dark background with bottom border); components/editor/project-sidebar.tsx (floating overlay sidebar, slides in from left, Projects header + close button, My Projects / Shared tabs with empty states, full-width New Project button).
- 03-auth: @clerk/ui installed; NEXT_PUBLIC_CLERK_SIGN_IN_URL and NEXT_PUBLIC_CLERK_SIGN_UP_URL added to .env.local; proxy.ts at project root uses clerkMiddleware with createRouteMatcher protecting all non-public routes; ClerkProvider wraps root layout with dark theme from @clerk/ui/themes and CSS variable overrides; sign-in and sign-up pages at app/sign-in/[[...sign-in]] and app/sign-up/[[...sign-up]] use two-panel layout (left: logo + tagline + feature list, right: Clerk form) on large screens, form-only on small screens; root page.tsx redirects authenticated users to /editor and unauthenticated users to /sign-in; UserButton added to editor navbar right section.
- 04-project-dialogs: hooks/use-project-dialogs.ts manages dialog/form/loading state and mock project data (CRUD operations on local state). components/editor/project-dialogs.tsx renders Create (name + live slug preview), Rename (prefilled, auto-focus, Enter submits), and Delete (destructive confirm) dialogs. ProjectSidebar updated with project item list showing rename/delete actions on hover for owned projects only, shared projects shown without actions, mobile backdrop scrim added. app/editor/page.tsx updated with centered home screen (heading, description, New Project button) wired to Create dialog. TypeScript and ESLint clean.
- 05-prisma: prisma/models/project.prisma defines Project (ownerId, name, description, status enum DRAFT/ARCHIVED, canvasJsonPath, timestamps, indexes on ownerId and createdAt) and ProjectCollaborator (projectId cascade-delete relation, email, createdAt, unique on projectId/email, indexes on email and projectId/createdAt). lib/prisma.ts is a cached singleton that branches on DATABASE_URL prefix: prisma+postgres:// uses accelerateUrl, otherwise uses PrismaPg adapter. Migration 20260629122043_init_projects applied. Client generated to app/generated/prisma/. npm run build passes.
- 06-project-apis: app/api/projects/route.ts — GET (list owner's projects, ordered by createdAt desc) and POST (create project, defaults name to "Untitled Project"). app/api/projects/[projectId]/route.ts — PATCH (rename, owner-only) and DELETE (owner-only, 204). All routes: 401 for unauthenticated, 403 for non-owner mutations, Clerk userId as ownerId. npm run build passes.
- 07-wire-editor-home: lib/data/projects.ts — getEditorProjects() server-side helper fetches owned projects and shared collaborations in parallel. app/editor/page.tsx converted to async server component, passes owned/shared lists to EditorShell. hooks/use-project-actions.ts replaces mock hook — manages create (POST /api/projects, slugify+suffix roomId, navigate to /editor/[id]), rename (PATCH, refresh), delete (DELETE, redirect to /editor if active project, else refresh). ProjectSidebar updated to split ownedProjects/sharedProjects props; project names link to /editor/[id]. ProjectDialogs wired to UseProjectActionsReturn. npm run build passes.

## In Progress

- None.

## Next Up

- Feature 08 (next feature spec)

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Next.js 16 uses proxy.ts (not middleware.ts) — same API, renamed to reflect its purpose.
- Prisma v7 with prisma-client generator; output to app/generated/prisma/; driver adapter required at runtime (no native engine binary); datasource URL lives in prisma.config.ts, not schema.prisma.

## Session Notes

- Using Next.js 16 with React 19 and Tailwind CSS v4.
- shadcn version 4.11.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.21.0 installed as a direct dependency.
- @clerk/nextjs ^7.5.8 and @clerk/ui ^1.21.0 installed.
- Prisma v7.8.0; @prisma/adapter-pg used for direct postgres:// URLs; accelerateUrl used for prisma+postgres:// URLs.
- Local Prisma dev server managed via `npx prisma dev --detach` (starts postgres on :51213, shadow db on :51214).
