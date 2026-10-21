# SIRISOFT ERP

Next.js 16 (App Router) + TypeScript + Tailwind v4, organised with the
[Bulletproof React](https://github.com/alan2207/bulletproof-react) feature-based structure.

```bash
npm run dev    # http://localhost:3000
npm run lint   # also enforces the import boundaries below
npm run build
```

## Structure

```
src/
├── app/                    # App layer: routes, layouts, providers
│   ├── layout.tsx          # root layout (fonts, global CSS, <AppProvider>)
│   ├── provider.tsx        # global client providers (role, notifications)
│   └── (app)/              # route group sharing the dashboard shell
│       ├── layout.tsx
│       └── <route>/page.tsx  # fetches via feature api/ and renders a feature view
├── components/             # shared UI
│   ├── layouts/            # DashboardLayout (sidebar + topbar)
│   └── ui/                 # Icon, Modal, ConfirmDialog, Field, StatusBadge, notifications…
├── config/paths.ts         # routes, nav labels/icons and allowed roles
├── features/
│   └── <feature>/
│       ├── api/            # data access (mocked today, swap for fetch later)
│       ├── components/     # feature UI
│       └── types/          # feature-only types (optional)
├── lib/authorization.tsx   # role context + <Authorization> guard
├── styles/globals.css      # design tokens and component styles
├── testing/mocks/db.ts     # mock data used by feature api/ functions
└── types/api.ts            # entity types shared across features
```

Features: `dashboard`, `timesheet`, `overtime`, `leave`, `team`, `employees`,
`reports`, `settings`, `history`.

## Rules (enforced by ESLint `import/no-restricted-paths`)

- Code flows one way: **shared → features → app**.
- A feature never imports another feature. When a page needs data from several
  features (e.g. the dashboard uses `timesheet`, `team` and `employees`), the
  route in `src/app` fetches each and passes it down as props.
- Shared modules (`components`, `lib`, `config`, `types`, …) never import from
  `features` or `app`.
- No barrel `index.ts` files — import from the file directly.

## Adding a feature

1. `src/features/<name>/api/get-<thing>.ts` – async data function.
2. `src/features/<name>/components/<name>-view.tsx` – UI.
3. Add the route to `src/config/paths.ts` (label, icon, roles).
4. `src/app/(app)/<name>/page.tsx` – fetch, wrap in `<Authorization>`, render the view.
5. Add `<name>` to the `features` list in `eslint.config.mjs`.
