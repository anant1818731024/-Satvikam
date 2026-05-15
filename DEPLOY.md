# Saffron — Vegetarian food subscription platform with admin management.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

Required secrets: `SESSION_SECRET` (for admin session), `DATABASE_URL` (auto-provided by the configured PostgreSQL)
Admin password: `ADMIN_PASSWORD` env var (defaults to `"admin123"`)

Render deployment note: if you deploy the workspace on Render, allow pnpm build scripts and approve packages before building:

```bash
pnpm install --ignore-scripts=false
pnpm approve-builds --all
pnpm --filter @workspace/api-server build
```

For the frontend build, set `BASE_PATH=/` and `PORT=4173` before running:

```bash
BASE_PATH=/ PORT=4173 pnpm --filter @workspace/food-subscription run build
```

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + express-session
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Wouter + TanStack Query + shadcn/ui

## Where things live

- `artifacts/api-server/src/routes/` — API routes (admin, orders, plans, products, subscriptions, payment)
- `artifacts/food-subscription/src/pages/` — Frontend pages (public + admin)
- `artifacts/food-subscription/src/components/layout/` — Navbar, AdminLayout, AdminSidebar
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — Generated hooks + types (do not edit manually)
- `lib/db/src/schema.ts` — Database schema (source of truth)

## Architecture decisions

- Contract-first: all API changes start in `lib/api-spec/openapi.yaml`, then run codegen
- Prices stored in paise (integer): ₹80 = 8000 paise. `formatCurrency(paise)` helper in `lib/format`
- Admin auth via express-session (password-only, single admin). Session stored server-side.
- Two order types: `subscription` (creates active plan) and `single_item` (no plan created)
- `requireAdmin` middleware in `admin.ts` — currently applied to `/admin/summary` only

## Product

- Public: Home, Menu (clickable cards → buy dialog for single items), Plans, Subscribe (full checkout), Success page
- Admin: Dashboard (stats + pending deliveries), Products (with imageUrl), Plans, Orders (filter by type/status), Subscriptions, Delivery management
- Admin login at `/admin/login` (password: `ADMIN_PASSWORD` env var, default `admin123`)

## Gotchas

- After running codegen, `lib/api-zod/src/index.ts` gets overwritten — must stay as `export * from "./generated/api";` only
- Do not run `pnpm dev` at workspace root — use `restart_workflow` instead
- `useListOrders(params)` takes flat params object (not `{ query: params }`); same for all list hooks
- Seeded orders have old amounts (2499 paise) — only new orders use correct prices
