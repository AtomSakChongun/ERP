<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SIRISOFT ERP — Agent Guide

Read this file before making any change. It describes how the project is organised and the rules every change must follow.

## Stack

- Next.js 16 App Router (`cacheComponents: true`, `partialPrefetching: true`), React 19, TypeScript (strict)
- Tailwind CSS v4, but styling uses the **existing semantic classes** in `src/styles/globals.css` (ported from the Figma design)
- No backend yet: data comes from mock functions
- Package manager: **npm**

## Commands

```bash
npm run dev     # dev server on http://localhost:3000
npm run lint    # ESLint, including architecture boundaries
npm run build   # production build + type check
```

A task is not done until `npm run lint` and `npm run build` both pass.

## Architecture: Bulletproof React (feature-based)

```
src/
├── app/                        # APP LAYER: routing and composition only
│   ├── layout.tsx              # root layout: font, globals.css, <AppProvider>
│   ├── provider.tsx            # global client providers (RoleProvider, NotificationsProvider)
│   ├── page.tsx                # redirects "/" → /dashboard
│   └── (app)/                  # route group that renders inside DashboardLayout
│       ├── layout.tsx
│       └── <route>/page.tsx    # server component: fetch → <Authorization> → <FeatureView>
├── components/                 # SHARED UI, no business logic
│   ├── layouts/dashboard-layout.tsx   # sidebar, topbar, role switcher
│   └── ui/
│       ├── icon.tsx            # <Icon name="..."/>, type IconName
│       ├── modal.tsx           # Modal, ModalHeader, ConfirmDialog
│       ├── notifications.tsx   # useNotifications().notify("...") → toast
│       └── primitives.tsx      # StatusBadge, PageHeader, Field, Avatar
├── config/paths.ts             # SINGLE SOURCE for routes: href, label, icon, roles, hidden
├── features/                   # FEATURE LAYER: one folder per business domain
│   └── <feature>/
│       ├── api/                # async data functions (get-*.ts); mocks today, fetch later
│       ├── components/         # feature UI; entry component is <feature>-view.tsx
│       ├── types/index.ts      # feature-only types (optional)
│       └── utils/              # feature-only helpers (optional), e.g. timesheet/utils/time.ts
├── lib/authorization.tsx       # useRole(), canAccess(), <Authorization allowedRoles>
├── styles/globals.css          # design tokens (CSS vars) and all component classes
├── testing/mocks/db.ts         # in-memory mock data used by feature api/ files
└── types/api.ts                # API entity types used by mocks or 2+ features (Status, Role, Employee, TimeEntry, …)
```

Current features: `dashboard`, `timesheet`, `overtime`, `leave`, `team`, `employees`, `reports`, `settings`, `history`.

### Dependency rules (enforced by ESLint `import/no-restricted-paths`)

Imports flow one way: **shared → features → app**

| From ↓ may import → | shared (`components`, `config`, `lib`, `types`, `testing`, `styles`) | same feature | other feature | `app` |
|---|---|---|---|---|
| `src/app`           | ✅ | ✅ | ✅ | ✅ |
| `src/features/X`    | ✅ | ✅ | ❌ | ❌ |
| shared              | ✅ | ❌ | ❌ | ❌ |

- **Never import one feature from another.** When a page needs data from several features, the route in `src/app/(app)/<route>/page.tsx` fetches from each feature's `api/` and passes the results down as props. Example: `dashboard/page.tsx` combines `timesheet`, `team` and `employees`.
- If a type is needed by two or more features, move it to `src/types/api.ts`.
- If a UI component is needed by two or more features, move it to `src/components/ui/` and keep it free of feature logic.
- Do not weaken or disable the lint rule to make an import work. Restructure the code instead.

## Conventions

- **File names**: kebab-case (`time-entry-modal.tsx`, `get-leave.ts`). Components use PascalCase named exports (`export function TimeEntryModal`). Only Next.js route files (`page.tsx`, `layout.tsx`) use default exports.
- **Imports**: always use the absolute `@/…` alias, e.g. `@/features/leave/types`. Do not add barrel `index.ts` re-export files; `types/index.ts` is the only exception.
- **Server vs client**: route `page.tsx` files are async **server components** that fetch data. Add `"use client"` only to components that need state, effects, context or event handlers, and keep that boundary as low in the tree as possible.
- **Data access**: components never import `@/testing/mocks/db` directly. Go through the feature's `api/get-*.ts`. Each api function is `async` and returns typed data, so swapping in a real `fetch` only changes that file.
- **Routes and navigation**: every route must exist in `src/config/paths.ts`. Use `paths.<key>.href` rather than hard-coded strings, and `next/link` `<Link>` for navigation.
- **Access control**: wrap each page's view in `<Authorization allowedRoles={paths.<key>.roles}>`. The sidebar filters items with `canAccess(role, item.roles)`.
- **Feedback**: use `useNotifications().notify("…")` for success toasts.
- **Dialogs**: use `<Modal>` + `<ModalHeader>` or `<ConfirmDialog>` from `@/components/ui/modal`. Don't build new backdrops.
- **Icons**: use `<Icon name="…" />`. To add an icon, add its SVG path to the `paths` map in `icon.tsx`.
- **Styling**: reuse the existing classes in `globals.css` (`panel`, `panel-head`, `primary-btn`, `secondary-btn`, `form-grid`, `field`, `status-*`, `summary-card`, …) and the CSS variables (`--green-900`, `--muted`, `--border`, …). Put new styles in `globals.css` next to related rules, including their responsive rules in the existing `@media` blocks. Tailwind utilities are OK for small one-off layout tweaks.
- **Brand / theme**: SIRISOFT green theme from the logo: dark green sidebar (`--sidebar-*`), light grey page background (`--bg`) and white cards. The brand tokens are `--brand-green #4a8a6c`, `--brand-teal #2f7086` and `--brand-navy #0c2340` in `:root` of `globals.css`, and `--green-*` are the UI shades derived from them. Change colours there, not inline. Logo files: `public/logo-mark.png` (S mark, transparent), `public/logo.png` (full logo with wordmark), `src/app/icon.png` (favicon).
- **Type scale**: keep text at 11px or larger (11–13px for labels and meta, 14–15px for body and table text, 18px+ for headings and values). Below that it reads too small.
- **Dates**: store dates as ISO strings (`"2025-05-12"`) and times as `"HH:mm"`. Format them through UTC helpers, such as `features/timesheet/utils/time.ts`, so server and client render the same text and hydration doesn't mismatch.
- **Text**: UI copy is English. Keep typographic quotes and dashes (’ “ ” –) consistent with existing copy.

## Next.js 16 gotchas in this project

- **Pages stay mounted after navigation.** `cacheComponents` keeps visited pages alive but hidden (React `<Activity>`), so component state survives navigation. `Modal`/`ConfirmDialog` already close themselves when hidden. Any new transient UI (dropdowns, popovers) should reset in a `useLayoutEffect` cleanup. See `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.
- **Use the generated layout/page prop types.** `LayoutProps<"/">` and `PageProps<"/route">` are global types generated by Next; use them in layouts and pages.
- **Dynamic routes need a `Suspense` boundary.** Any new dynamic route (`[id]`) without `generateStaticParams` needs a `Suspense` boundary around components that call `usePathname`, or the build fails.
- **`next dev` sometimes misses CSS edits.** The dev server can keep serving the old `globals.css` after a change, even after an atomic write; it seems to miss the first change after a while. `touch` alone doesn't help. To unstick it, append a comment, wait about 3 seconds, then remove it. To verify, `curl` the CSS URL from the page HTML and grep for the new rule.
- **Check the bundled docs first.** When unsure about an API, read `node_modules/next/dist/docs/` before relying on memory.

## Recipe: add a new feature/page

1. `src/features/<name>/api/get-<thing>.ts`: an async function returning typed data. Put mock data in `src/testing/mocks/db.ts` if it is shared.
2. `src/features/<name>/components/<name>-view.tsx`: the UI, using shared `components/ui` primitives.
3. `src/config/paths.ts`: add `{ href, label, icon, roles }`. Sidebar counts are computed in `src/app/(app)/layout.tsx` and passed as `badges`. Use `hidden: true` for pages that should not appear in the sidebar.
4. `src/app/(app)/<name>/page.tsx`: `export const metadata = { title: paths.<name>.label }`, fetch with `Promise.all`, then render `<Authorization allowedRoles={paths.<name>.roles}><NameView … /></Authorization>`.
5. `eslint.config.mjs`: add `<name>` to the `features` array.
6. Run `npm run lint && npm run build`.

## Recipe: connect a real backend later

Only edit the bodies of `src/features/*/api/*.ts`, for example to `fetch(...)` with caching per the Next 16 docs. Keep the function signatures and return types, so views and pages do not change. Remove entries from `src/testing/mocks/db.ts` once nothing uses them.
