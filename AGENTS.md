<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

Website for Shree Balaji Paints, Plywood and Hardware. Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, hosted on Netlify (`netlify.toml`). Full standards: [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md).

## Commands

- `npm run dev`: local server
- `npm run lint`: ESLint, zero errors (it also enforces the import rules below)
- `npm run typecheck`: generates Next.js route types, then runs `tsc --noEmit`
- `npm run test`: Vitest unit tests (`npm run test:watch` while developing)
- `npm run build`: production build
- `npm run check`: all four above in order. It must pass before every commit and push.

## Workflow for every change (required)

Follow these steps for every feature, fix or refactor, however small. A change isn't done until all of them pass.

1. **Read first.** Read the relevant guide in `node_modules/next/dist/docs/`, plus the files you will touch and the shared pieces you can reuse (`src/components/ui`, `src/hooks`, `src/lib`).
2. **Build** following the rules in this file.
3. **Unit tests.** Add or update tests next to the code (`thing.ts` gets `thing.test.ts`) for every new or changed function, hook, service, route handler and interactive component. A bug fix starts with a test that fails before the fix.
4. **Regression check.** Run `npm run check`. Then run the app and check the main flows still work:
   - The home page.
   - `/products`, `/categories`, a category (`/products/paints`) and a type (`/products/paints/interior`), plus the brand and search filters.
   - A product detail page.
   - `/brands`, a brand page, `/offers`, `/about` and `/contact`, with the matching navbar link highlighted.
   - `/enquiry`, including the confirm and unsaved-changes popups.
   - `/paint-calculator` and `/paint-calculator/ap-royale-luxury`: calculate, then the confirm before WhatsApp.
   - The WhatsApp and phone links.
5. **Code review.** Review your own diff against the checklist in `.github/pull_request_template.md` and fix what it finds before committing. Typical problems:
   - Duplicated UI or logic.
   - Data imported directly instead of through a service.
   - A missing confirmation or unsaved-changes guard.
   - Comments that restate the code.
   - Missing labels, or errors not linked to their inputs.
6. **Docs.** Update `README.md`, this file and `docs/` in the same commit when structure or behaviour changes.
7. **Report.** Say what changed, what was tested and anything not verified.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, build and a dependency audit on every push and pull request to `develop` and `main`. Don't merge into `main` while CI is red.

## Structure

```text
src/
  app/                  routes, layouts, metadata files only
    api/                REST Route Handlers, one route.ts per resource
  components/
    brand/              logo and brand wordmarks
    layout/             navbar, mobile bottom bar, footer, floating buttons, nav-links.ts (shared links and active-path check)
    home/               home page sections
    products/           catalogue, cards, product detail
    brands/             brand grid (home and /brands)
    offers/             offer cards and promo banners
    about/              store photos and details
    contact/            contact details and map
    enquiry/            enquiry form
    calculator/         paint calculator
    ui/                 shared building blocks: icons, AppLink, Button, FormField, ConfirmDialog, Breadcrumbs, PageHeader, SectionHeader, Reveal
  config/               site constants (shop.ts: name, phone, address, hours; site.ts: public site URL)
  data/                 local catalogue source, read only by src/services
  hooks/                shared React hooks (use-confirm, use-unsaved-changes)
  lib/
    api/                endpoints.ts (every API path) and http-client.ts (fetch wrapper)
    routes.ts           every page path (clean URLs, no query strings)
    paint-calculator.ts paint area, litres and pack-size logic
    sitemap.ts          every public page path for sitemap.xml
  providers/            app-wide React context providers, composed in AppProviders
  services/             data access used by pages and API routes
  test/                 test setup and render helpers
  types/                shared TypeScript types
.github/                CI workflow and pull request review checklist
public/                 static files (images under public/images)
docs/                   architecture, security, sprint plan
scripts/                developer helper scripts
```

- Put a component in the folder of the feature that uses it. Move it to `ui/` when two features share it.
- Keep route files in `src/app` thin: get data from a service and compose components.
- Keep URLs clean. Every page is a real path (`/brands`, `/brands/asian-paints`). Don't use hash links (`/#section`) as pages, and don't add query strings to drive page content or filters.
- Delete unused files instead of keeping them around.

## Reuse before you build

- Check `src/components/ui`, `src/hooks` and `src/lib` before writing new UI or logic. Extend an existing piece with a prop instead of copying it.
- Icons: import from `@/components/ui/icons`, never from `lucide-react` directly. To use a new icon, add it to the export list in `icons.ts`. A custom SVG icon goes in the same file as a component that takes `IconProps`. Logo artwork stays in `components/brand`.
- Buttons: `Button` (or `buttonClasses()` for links styled as buttons). Inputs: `FormField` with `fieldClasses`.
- Internal links: always `AppLink`, never `next/link` directly. ESLint blocks `next/link` elsewhere.
- Confirmation for any destructive or irreversible action: `const confirm = useConfirm();` then `if (await confirm({ title, message, confirmLabel, tone: "danger" }))`. Never use `window.confirm`, and never build a one-off modal.
- Forms with user input: call `useUnsavedChanges(isDirty)`. Navigating through `AppLink`, reloading, or closing the tab then asks before discarding. For in-page actions that would lose input, use the `confirmDiscard` it returns.

## Data and API

- Pages, components and API routes get data from `src/services/*`. They never import `src/data/*` (ESLint enforces this).
- Every API path is defined once in `src/lib/api/endpoints.ts`. Never write an `/api/...` string anywhere else.
- Every dynamic page path is built with `ROUTES` in `src/lib/routes.ts` (`ROUTES.category("paints", "Interior")`). Never build `/products/...`, `/brands/...` or `/enquiry/...` strings by hand.
- All HTTP calls go through `httpClient` in `src/lib/api/http-client.ts`. No direct `fetch` in components or services.
- One `route.ts` per REST resource under `src/app/api`, delegating to a service function.
- `CATALOG_API_URL` (see `.env.example`) switches the services from the local data to an external backend. Pages don't change when it does.
- Client components receive data as props from a Server Component. They don't fetch on mount.

## Code style

- Components: `PascalCase.tsx`, one main component per file. Other modules: `kebab-case.ts`.
- Imports: always the `@/` alias (it points to `src/`). No relative imports.
- Server Components by default. Add `"use client"` only to components that need state, effects or browser APIs.
- No `any`. Type shared shapes in `src/types`.
- Styling: Tailwind classes with the theme tokens in `src/app/globals.css` (`brand-*` navy, `accent-*` red, `paint-*` orange, `gold-*`, `ink`, `muted`, `subtle`, `line`, `canvas`, `surface-muted`, `success`, plus `rounded-card`, `shadow-card` and `container-page`). Main buttons are red (`cta`); orange is for accents only, because white text on it fails contrast. No inline styles or hard-coded colours, except in SVG artwork and `ImageResponse` metadata images, which can't use Tailwind.
- Images: `next/image` with real `alt` text. Credit stock photos in `public/images/CREDITS.md`.
- Shop details (phone, address, hours) live only in `src/config/shop.ts`. Never hard-code them elsewhere.
- Accessibility: every input has a label, errors are linked with `aria-describedby`, and dialogs use the shared `ConfirmDialog` (native `<dialog>`, focus and Esc handled).

## Testing

- Vitest with React Testing Library in jsdom, configured in `vitest.config.mts`, with shared setup in `src/test/`.
- Test files sit next to the code they test: `src/**/*.test.ts(x)`.
- Render components with `renderWithProviders` from `@/test/render` so the confirm and unsaved-changes providers are present.
- Query by role and label, the way a user finds things. Don't query by class names or test IDs.
- Mock only the edges: `fetch` (`vi.stubGlobal`), `next/navigation`, `next/link` and `window.open`. Don't mock our own modules.
- Async Server Components aren't unit-testable in Vitest. Test their services and the components they render instead.

## Comments

- Default to no comments. Clear names and small functions explain the code.
- Write a comment only for a constraint the code can't show: a legal or GST rule, a browser or printer quirk, an external API limit.
- Never write comments that restate the next line, narrate a change, or explain to a reviewer why the change is correct.
- No commented-out code and no `TODO`s without an issue link.

## Git

- Work on `develop` or a `feature/*` branch. `main` is production: Netlify deploys every push to it. Merge through a pull request so its Netlify Deploy Preview can be checked first.
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Never commit `.env*` (except `.env.example`), secrets, customer data or build output.
- Update `docs/` and `README.md` in the same commit when structure or behaviour changes.
