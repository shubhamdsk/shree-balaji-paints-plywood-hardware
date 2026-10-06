# Coding Standards

The rules for writing code in this repository (the website) and in `shree-balaji-shop-manager` (the billing software). The aim is code that's correct (especially money and GST), safe, and easy for the next person to change.

Related: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md)

---

## 1. Language and tooling

- **TypeScript in `strict` mode** everywhere. No `any`: use `unknown` and narrow it with Zod or type guards.
- **Next.js 16:** read the relevant guide in `node_modules/next/dist/docs/` before using an API, and follow its deprecation notices ([AGENTS.md](../AGENTS.md)).
- **Linting:** ESLint with `eslint-config-next` (`core-web-vitals` + `typescript`), as in [`eslint.config.mjs`](../eslint.config.mjs). `npm run lint` must pass with zero errors.
- **Formatting:** Prettier with its defaults (double quotes, semicolons, 2-space indent, trailing commas), matching the existing code. Format on save.
- **Node:** the current LTS, the same version in development, CI and the shop PC.
- **Packages:** npm with a committed `package-lock.json`. Install with `npm ci` in CI.

## 2. Project structure

- The website uses the Next.js `src/` layout. `public/`, `docs/`, `scripts/` and config files stay at the root. The full folder map is in [AGENTS.md](../AGENTS.md).
  - `src/app/` holds routes only, with REST Route Handlers under `src/app/api/`, one `route.ts` per resource.
  - `src/components/` is grouped by feature (`brand`, `layout`, `home`, `products`, `enquiry`), and shared building blocks go in `ui/`.
  - `src/services/` is the only layer that reads `src/data/` or calls a backend.
  - `src/lib/api/endpoints.ts` lists every API path, and `src/lib/api/http-client.ts` makes every HTTP call.
  - `src/providers/` and `src/hooks/` hold the app-wide confirm popup and unsaved-changes guard.
- **Reuse first:** before writing UI or logic, check `ui/`, `hooks/` and `lib/`. Extend an existing component with a prop rather than copying it.
- **Confirmations:** every destructive or irreversible action uses `useConfirm()`, never `window.confirm` or a one-off modal.
- **Unsaved changes:** every form calls `useUnsavedChanges(isDirty)`, and internal links use `AppLink`, so leaving with unsaved input always asks first.
- **No hard-coded endpoints or data in UI:** pages get data from services and pass it to client components as props.
- Shop Manager follows the structure in [Architecture § 4](ARCHITECTURE.md#4-application-structure-shop-manager).
- **Import alias:** always `@/` (it points to `src/`). No relative imports. ESLint (`no-restricted-imports`) blocks relative imports, `@/data/*` outside services, `next/link` outside `AppLink`, and `lucide-react` outside `src/components/ui/icons.ts`.
- **Icons:** one file, `src/components/ui/icons.ts`, exports every icon used in the app. Add new icons there, and import them from `@/components/ui/icons`.
- **Layers:**
  - `domain/` is pure logic, with no imports from Next.js, React or the database.
  - `server/` is server-only. Every file that touches the database or secrets starts with `import "server-only";`.
  - UI components never import `server/db`. They call Server Actions or receive data as props.

## 3. Naming

| Thing | Convention | Example |
|-------|------------|---------|
| React components | `PascalCase.tsx`, one main component per file | `InvoiceTable.tsx` |
| Other modules | `kebab-case.ts` | `billing-service.ts`, `invoice-number.ts` |
| Functions and variables | `camelCase`, with verbs for functions | `calculateLineTax`, `allocateInvoiceNumber` |
| Types and interfaces | `PascalCase`, no `I` prefix | `Invoice`, `GstBreakdown` |
| Constants | `UPPER_SNAKE_CASE` for true constants | `MAHARASHTRA_STATE_CODE = "27"` |
| Database tables and columns | `snake_case`, plural tables | `invoice_items.unit_price_paise` |
| Money fields | Always end with `_paise` (DB) or `Paise` (TS) | `totalPaise` |
| Rates | Basis points, ending with `Bp` | `gstRateBp = 1800` |
| Booleans | `is`, `has`, `can` prefixes | `isActive`, `priceIncludesGst` |
| Branches | `feature/<short-name>`, `fix/<short-name>` | `feature/gst-invoice` |

## 4. Money and GST rules (must follow)

- **Store and calculate money as integer paise** (`bigint` in the DB, `number` in TypeScript, which is safe up to about 9 × 10^13 rupees). **Never use floating point** for money.
- Convert to rupees **only for display**, with one helper: `formatRupees(paise)` gives `₹1,234.50` using `Intl.NumberFormat("en-IN")`.
- **One place for GST:** `domain/gst.ts`. UI and services never calculate tax themselves.
- **Rounding:** use one shared helper, `roundHalfUp`. Never call `Math.round` on money directly in feature code.
- Every GST or rounding rule has unit tests with real examples, including:
  - Intra-state and inter-state sales.
  - Prices that include and exclude GST.
  - Line and bill discounts.
  - Odd-paise splits.
  - The 0% rate.
  - Round-off to the nearest rupee.
- **Bill lines are snapshots.** Copy name, HSN, rate and price into `invoice_items`, and never read live product data when showing an old bill.

## 5. Data access and transactions

- All database access goes through `server/services/*`. Each use case (save bill, cancel bill, stock-in, adjustment, publish) runs inside **one** `db.transaction(...)`.
- Invoice numbers are allocated **inside** the bill transaction, with `SELECT ... FOR UPDATE` on `invoice_counters`.
- **No deletes** of business records. Use status fields such as `is_active` and `status = 'CANCELLED'`.
- **Migrations:**
  - Generated with Drizzle Kit and committed.
  - **Never edit a migration that has run** on the shop PC. Add a new one instead.
  - Migrations must be safe to run on existing data.
  - Take a backup before every production migration. The update script does this automatically.
- Use the Drizzle query builder. Raw SQL is only allowed through the `sql` template with bound parameters, plus a comment explaining why.

## 6. Validation and errors

- Every Server Action and Route Handler starts with:
  1. `await requireUser(role)`
  2. `schema.parse(input)` with Zod
- Share Zod schemas between form validation (client) and the server, but **always validate again on the server**.
- Expected business errors (out of stock, invalid GSTIN) return a typed result such as `{ ok: false, code: "OUT_OF_STOCK", message }`. Don't throw them.
- Unexpected errors are logged with a reference ID and shown as "Something went wrong (ref ABC123)". Never show stack traces or SQL to users.
- No empty `catch` blocks.

## 7. React and Next.js

- **Server Components by default.** Add `"use client"` only for interactive parts such as the billing cart, search box and dialogs.
- Fetch data in Server Components or services, not with `useEffect`.
- Forms use Server Actions with progressive enhancement where possible, and show pending and error states.
- **Accessibility:**
  - Every input has a label.
  - Buttons are `<button>`.
  - Visible focus.
  - Keyboard-first billing: `Enter` adds an item, `F2` searches, `Ctrl+S` saves the bill, `Ctrl+P` prints.
- Use Tailwind utility classes and the shared design tokens from the website (colours, fonts). No inline styles except print-size rules.
- Print views use dedicated print CSS (`@page` size for 80mm and A4) and are tested on the real printer.

## 8. Comments and documentation

- **Default to no comments.** Code should explain itself through names and small functions.
- Write a comment only for a rule the code can't show, such as a GST regulation, a database constraint, or a printer quirk.
- Never write comments that restate the next line, narrate a change, or explain to a reviewer why it's correct.
- No commented-out code, and no `TODO` without an issue link.
- Update `docs/` in the same pull request when behaviour, architecture or security changes.

## 9. Testing

**Website (this repository, in place now):** Vitest with React Testing Library (`npm run test`), with tests next to the code as `*.test.ts(x)`. Every change follows the required workflow in [AGENTS.md](../AGENTS.md#workflow-for-every-change-required): unit tests, `npm run check`, a manual regression pass over the main pages, then a self code review against [the pull request checklist](../.github/pull_request_template.md). GitHub Actions runs the same checks on every push.

**Shop Manager:**

| Level | Tool | What | Required |
|-------|------|------|----------|
| Unit | Vitest | `domain/*`: money, GST, numbering, stock rules | 100% of `domain/` branches |
| Integration | Vitest + a test PostgreSQL database | Services: save and cancel bills, stock-in, reports, publish payload | All service functions |
| End-to-end | Playwright | Login, create a GST bill, print view, cancel, report totals, backup status | Main flows |
| Manual UAT | Checklist in [Sprint plan](SPRINT-PLAN.md) | Real printer, WhatsApp paste, restore drill | Every release |

- Tests run in CI and must pass before merge. Bugs get a test that fails before the fix.
- Test data uses obviously fake names and numbers, never real customer data.

## 10. Git workflow

- **Branches:**
  - `main` is what's released. For the website, `main` is what Vercel deploys.
  - `develop` is for integration.
  - `feature/*` and `fix/*` branches start from `develop`.
- **Commits:** follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(billing): add IGST for inter-state customers` or `fix(gst): round half-up per line`.
- **Pull requests:** keep them small, ideally under about 400 changed lines. Use the self-review checklist below.
- **Releases:** tag `v1.0.0` and later (semantic versioning), keep a `CHANGELOG.md`, and attach the shop install ZIP to the GitHub release.
- **Never commit:** `.env*`, database dumps, backups, real customer data, or the `.next/` and `out/` build output.

### Pull request checklist

- [ ] `npm run check` passes (lint, typecheck, tests, build).
- [ ] Money is integer paise, and GST goes through `domain/gst.ts`.
- [ ] Server Actions check the role and validate input with Zod.
- [ ] Data changes run in one transaction, and nothing is hard-deleted.
- [ ] No secrets, tokens or personal data in code, logs or tests.
- [ ] Migrations are new files, not edits to old ones.
- [ ] Docs are updated if behaviour changed.
- [ ] UI checked with the keyboard, and print checked if print views changed.

## 11. Continuous integration (GitHub Actions, free)

On every push and pull request:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck` (`next typegen && tsc --noEmit`)
4. `npm test` (unit and integration tests, with a PostgreSQL service container)
5. `npm run build`
6. `npm audit --omit=dev --audit-level=high`

For Shop Manager releases, a workflow also builds the standalone app and packages the shop install ZIP: `node.exe`, `app\`, WinSW files and scripts.
