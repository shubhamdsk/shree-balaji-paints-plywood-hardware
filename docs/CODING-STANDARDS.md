# Coding Standards

The rules for writing code in this repository: the public website and its owner panel. The aim is code that's correct, safe, and easy for the next person to change.

Related: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md)

---

## 1. Language and tooling

- **TypeScript in `strict` mode** everywhere. No `any`: use `unknown` and narrow it with Zod or type guards.
- **Next.js 16:** read the relevant guide in `node_modules/next/dist/docs/` before using an API, and follow its deprecation notices ([AGENTS.md](../AGENTS.md)).
- **Linting:** ESLint with `eslint-config-next` (`core-web-vitals` + `typescript`), as in [`eslint.config.mjs`](../eslint.config.mjs). `npm run lint` must pass with zero errors.
- **Formatting:** Prettier with its defaults (double quotes, semicolons, 2-space indent, trailing commas), matching the existing code. Format on save.
- **Node:** the current LTS, the same version in development, CI and hosting.
- **Packages:** npm with a committed `package-lock.json`. Install with `npm ci` in CI.

## 2. Project structure

- The website uses the Next.js `src/` layout. `public/`, `docs/`, `scripts/` and config files stay at the root. The full folder map is in [AGENTS.md](../AGENTS.md).
  - `src/app/` holds routes only, with REST Route Handlers under `src/app/api/`, one `route.ts` per resource.
  - `src/components/` is grouped by feature (`brand`, `layout`, `home`, `products`, `brands`, `offers`, `about`, `contact`, `enquiry`, and `admin` in Part 2), and shared building blocks go in `ui/`.
  - `src/services/` is the only layer that reads `src/data/`, the database or a backend.
  - `src/lib/api/endpoints.ts` lists every API path, and `src/lib/api/http-client.ts` makes every HTTP call.
  - `src/lib/routes.ts` builds every page path. Paths are clean (`/products/paints/interior-emulsion`), with no query strings or hash pages.
  - `src/providers/` and `src/hooks/` hold the app-wide confirm popup and unsaved-changes guard.
- **Reuse first:** before writing UI or logic, check `ui/`, `hooks/` and `lib/`. Extend an existing component with a prop rather than copying it.
- **Confirmations:** every destructive or irreversible action uses `useConfirm()`, never `window.confirm` or a one-off modal.
- **Unsaved changes:** every form calls `useUnsavedChanges(isDirty)`, and internal links use `AppLink`, so leaving with unsaved input always asks first.
- **No hard-coded endpoints or data in UI:** pages get data from services and pass it to client components as props.
- **Import alias:** always `@/` (it points to `src/`). No relative imports. ESLint (`no-restricted-imports`) blocks relative imports, `@/data/*` outside services, `next/link` outside `AppLink`, and `lucide-react` outside `src/components/ui/icons.ts`.
- **Icons:** one file, `src/components/ui/icons.ts`, exports every icon used in the app. Add new icons there, and import them from `@/components/ui/icons`.
- **Server-only code (Part 2):** everything under `src/server/` starts with `import "server-only";`. Client components never import it. They call Server Actions or receive data as props.
- **Pure logic** such as `src/lib/paint-calculator.ts` imports nothing from Next.js, React or the database.

## 3. Naming

| Thing | Convention | Example |
|-------|------------|---------|
| React components | `PascalCase.tsx`, one main component per file | `ProductForm.tsx` |
| Other modules | `kebab-case.ts` | `catalog-service.ts`, `paint-calculator.ts` |
| Functions and variables | `camelCase`, with verbs for functions | `saveProduct`, `suggestPacks` |
| Types and interfaces | `PascalCase`, no `I` prefix | `Product`, `Enquiry` |
| Constants | `UPPER_SNAKE_CASE` for true constants | `MAX_PHOTO_BYTES` |
| Database tables and columns | `snake_case`, plural tables | `gallery_items.sort_order` |
| Booleans | `is`, `has`, `can` prefixes | `isVisible`, `inStock` |
| Branches | `feature/<short-name>`, `fix/<short-name>` | `feature/owner-login` |

## 4. Prices and quantities

- Prices on the website are **indicative** and shown in rupees. Store them as whole rupees (`integer`) in the database. Never use floating point.
- Format prices with one helper using `Intl.NumberFormat("en-IN")`.
- Stock is only `in_stock` (true or false). Never store or show quantities.
- Paint calculator results round **up** to whole litres, and say they are estimates.

## 5. Data access (Part 2)

- All database access goes through `src/services/*` and `src/server/*`. Pages and components never import the database client.
- An owner action that changes more than one table runs inside one `withTransaction(...)` from `@/server/db/client`. Never call `db.transaction(...)` directly: Neon's HTTP driver in production rejects it, and PGlite in tests doesn't.
- After a successful save, the action calls `updateTag(...)` for the affected cache tags from `src/lib/cache-tags.ts`. Reads in services are wrapped in `unstable_cache(..., { tags: [...] })`.
- Without `DATABASE_URL` the app uses PGlite, so tests run against real Postgres. Tests that touch the database call `setupTestDatabase()` from `@/test/db`, which reseeds before each test.
- Server code under `src/server` starts with `import "server-only"` when it reads secrets, cookies or the database. Client components may import only Server Actions from `src/server/actions`.
- **Migrations:**
  - Generated with Drizzle Kit and committed.
  - **Never edit a migration that has run** in production. Add a new one instead.
  - Migrations must be safe to run on existing data.
- Use the Drizzle query builder. Raw SQL is only allowed through the `sql` template with bound parameters.

## 6. Validation and errors

- Every owner Server Action and admin Route Handler starts with:
  1. `await requireOwner()`
  2. `schema.parse(input)` with Zod
- The public enquiry action validates with Zod, checks the honeypot and the rate limit, and never needs a session.
- Share Zod schemas between form validation (client) and the server, but **always validate again on the server**.
- Expected errors (duplicate product name, file too large) return a typed result such as `{ ok: false, code: "DUPLICATE_ID", message }`. Don't throw them.
- Unexpected errors are logged with a reference ID and shown as "Something went wrong (ref ABC123)". Never show stack traces or SQL to users.
- No empty `catch` blocks.

## 7. React and Next.js

- **Server Components by default.** Add `"use client"` only for interactive parts such as forms, filters, the calculator and dialogs.
- Fetch data in Server Components or services, not with `useEffect`.
- Forms use Server Actions with progressive enhancement where possible, and show pending and error states.
- **Accessibility:**
  - Every input has a label, and errors are linked with `aria-describedby`.
  - Buttons are `<button>`.
  - Visible focus.
  - The owner panel works on a small phone screen and with the keyboard.
- Use Tailwind utility classes and the theme tokens in `src/app/globals.css`. No inline styles or hard-coded colours, except in SVG artwork and `ImageResponse` images.
- Light, dark and system themes switch the `data-theme` attribute on `<html>`, and the dark block overrides the colour tokens. Change the theme only through `useTheme()`. Use `bg-card` and `text-heading` rather than `bg-white` and `text-brand-900`, so panels and headings switch with the theme.

## 8. Comments and documentation

- **Default to no comments.** Code should explain itself through names and small functions.
- Write a comment only for a rule the code can't show, such as a legal rule, a browser quirk, or an external API limit.
- Never write comments that restate the next line, narrate a change, or explain to a reviewer why it's correct.
- No commented-out code, and no `TODO` without an issue link.
- Update `docs/` in the same pull request when behaviour, architecture or security changes.

## 9. Testing

Vitest with React Testing Library (`npm run test`), with tests next to the code as `*.test.ts(x)`. Every change follows the required workflow in [AGENTS.md](../AGENTS.md#workflow-for-every-change-required): unit tests, `npm run check`, a manual regression pass over the main pages, then a self code review against [the pull request checklist](../.github/pull_request_template.md).

| Level | What | Required |
|-------|------|----------|
| Unit | Pure logic: routes, slugs, catalogue helpers, paint calculator, offer date window, validation schemas | Every function |
| Service and action | Services and Server Actions against a test database: save product, hide product, save enquiry, status change, auth guard | Every action |
| Component | Forms, filters, dialogs, calculator, with `renderWithProviders` | Every interactive component |
| Browser | Playwright in `e2e/` (`npm run test:e2e`) against a production build with a fresh in-memory database: the main public pages and the whole owner flow | Every change to a page or flow they cover |
| Manual | Regression pass in AGENTS.md, plus the owner panel on a real phone | Every release |

- Tests run in CI and must pass before merge. Bugs get a test that fails before the fix.
- Test data uses obviously fake names and numbers, never real customer data.

## 10. Git workflow

- **Branches:**
  - `main` is production: the host deploys every push to it.
  - `develop` is for integration.
  - `feature/*` and `fix/*` branches start from `develop`.
- **Commits:** follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(admin): add product photo upload` or `fix(enquiry): open WhatsApp when saving fails`.
- **Pull requests:** keep them small, ideally under about 400 changed lines. Use the checklist in [`.github/pull_request_template.md`](../.github/pull_request_template.md).
- **Releases:** merge into `main` only through a pull request with green CI; every push to `main` deploys to Cloudflare ([Scalability § 3](SCALABILITY.md#3-free-plan-budget-cloudflare-and-neon)).
- **Never commit:** `.env*` (except `.env.example`), database dumps, backups, real customer data, or the `.next/` and `out/` build output.

## 11. Continuous integration (GitHub Actions, free)

On every push and pull request to `develop` and `main`, three jobs run in parallel:

- **check:**
  1. `npm ci`
  2. `npm run lint`
  3. `npm run typecheck` (`next typegen && tsc --noEmit`)
  4. `npm test`
  5. `npm run build`
  6. `npm audit --omit=dev --audit-level=high`
- **migrate:** starts a PostgreSQL service container and runs `npm run db:migrate` twice, on an empty database and then on the migrated one. This is the script Cloudflare runs before each build, so a broken migration fails here first.
- **cloudflare:** builds the worker with `opennextjs-cloudflare build`, then runs `wrangler deploy --dry-run` and fails if the worker is over the free plan's 3 MiB gzipped limit.
- **e2e:** installs Chromium and runs `npm run test:e2e`. On failure the Playwright report is uploaded as an artifact.

Unit, service and action tests run against PGlite, which is real Postgres, so they don't need the service container.
