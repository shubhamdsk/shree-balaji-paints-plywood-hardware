# Shree Balaji Paints Plywood and Hardware — Demo Website

A modern demo site for **Shree Balaji Paints Plywood and Hardware**, an authorized Asian Paints dealer in Kotul, Maharashtra — built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Live app

**[shree-balaji.shreebalajipaints.workers.dev](https://shree-balaji.shreebalajipaints.workers.dev/)**

| Page | Link |
|------|------|
| Home | [/](https://shree-balaji.shreebalajipaints.workers.dev/) |
| Products catalogue | [/products](https://shree-balaji.shreebalajipaints.workers.dev/products) |
| Paints | [/products/paints](https://shree-balaji.shreebalajipaints.workers.dev/products/paints) |
| Interior paints | [/products/paints/interior-emulsion](https://shree-balaji.shreebalajipaints.workers.dev/products/paints/interior-emulsion) |
| Plywood | [/products/plywood](https://shree-balaji.shreebalajipaints.workers.dev/products/plywood) |
| Hardware | [/products/hardware](https://shree-balaji.shreebalajipaints.workers.dev/products/hardware) |
| Sample product | [Royale Luxury Emulsion](https://shree-balaji.shreebalajipaints.workers.dev/products/ap-royale-luxury) |
| Brands | [/brands](https://shree-balaji.shreebalajipaints.workers.dev/brands) |
| Sample brand | [Asian Paints](https://shree-balaji.shreebalajipaints.workers.dev/brands/asian-paints) |
| Offers | [/offers](https://shree-balaji.shreebalajipaints.workers.dev/offers) |
| About | [/about](https://shree-balaji.shreebalajipaints.workers.dev/about) |
| Contact | [/contact](https://shree-balaji.shreebalajipaints.workers.dev/contact) |
| Send an enquiry | [/enquiry](https://shree-balaji.shreebalajipaints.workers.dev/enquiry) |
| Quote for a product | [/enquiry/ap-royale-luxury](https://shree-balaji.shreebalajipaints.workers.dev/enquiry/ap-royale-luxury) |
| Paint calculator | [/paint-calculator](https://shree-balaji.shreebalajipaints.workers.dev/paint-calculator) |
| Products API | [/api/products](https://shree-balaji.shreebalajipaints.workers.dev/api/products) |

## Features

- **Home** — Marathi hero, trust bar, category showcase (Paints first), featured products, trusted brands, offers and a short store story; the footer carries the phone, address and hours
- **Categories** — `/categories` lists every category with its stocked types
- **Products catalogue** — Browse by category with filters, sort, and pagination
- **Product cards** — Brand, category, type and sizes, with a WhatsApp "Enquire" button that names the product (no prices shown)
- **Product detail pages** — Specs, size picker, "Enquire for Price on WhatsApp" (includes the chosen size) and Call Us
- **Brands** — `/brands` lists every brand with product counts; each brand has its own page at `/brands/<brand>`
- **Offers, About, Contact** — Separate pages with clean URLs; the navbar highlights the current page
- **WhatsApp enquiry** — One-tap message to the shop (`7038499108`)
- **Searchable dropdowns** — Product, paint and brand pickers are custom themed dropdowns with a search box, a height-capped list without a scrollbar and full keyboard support; they open upward near the bottom of the screen
- **Back to top** — A floating arrow above the WhatsApp button appears once you scroll down a long page
- **Paint calculator** — Room size (feet or metres), doors, windows and coats give the litres and best pack sizes, sent to the shop on WhatsApp; wall-paint product pages link to it at `/paint-calculator/<product>`
- **Google Maps** — Embedded map on `/contact` plus a link to open directions ([map](https://maps.app.goo.gl/hQ4KTEewDSLMKXCQ7))
- **Responsive layout** — Sticky header that shrinks on scroll, a bottom bar (Home, Products, Categories, Contact) on phones and tablets, and 44 px tap targets; checked from 360 px to 1920 px
- **Design system** — Navy, red, paint-orange and gold theme tokens with warm neutrals, Noto Sans Devanagari for text and Baloo 2 for the wordmark (`src/app/globals.css`)
- **Light, dark and system themes** — One theme button in the header (in the menu on mobile) cycles Light, Dark and System, and its icon shows the current choice. System (the default) follows the device setting; the choice is saved in the browser and applied before the first paint, so pages never flash the wrong theme. Every page keeps WCAG AA text contrast in both themes
- **Search engines** — `/sitemap.xml` lists every page and `/robots.txt` points to it; set `SITE_URL` when the address changes
- **Security headers** — Content Security Policy and related headers on every response (`next.config.ts`)
- **Logo** — House, paintbrush and colour swirl mark with a Marathi wordmark (श्री बालाजी), used in the header, footer, favicon and social preview
- **Owner panel** — `/admin` (password login, locked for 15 minutes after 5 wrong tries) where the owner adds and edits products from his phone: name, brand, category, type, a price unit picked from a list (litre, kg, sheet, piece and so on), the sizes he sells ticked from that unit's list, price in whole rupees, description and a photo taken with the phone (shrunk in the browser before upload). One-tap switches mark a product in or out of stock or put it on the home page, and Hide (after a confirmation) removes it from every public page. Changes show on the website straight away, with no redeploy. Under **Categories** he adds, renames and reorders the 10 categories and their types, sets a photo and a Google title and description, and hides one (with a confirmation when it has products); products stay linked through a rename

## Tech stack

| Layer | Tools |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI | React 19, [Lucide](https://lucide.dev) icons, [Framer Motion](https://www.framer.com/motion/) |
| Data | Postgres through [Drizzle ORM](https://orm.drizzle.team): [Neon](https://neon.tech) (free plan) in production, [PGlite](https://pglite.dev) locally and in tests |
| Photos | [Neon Object Storage](https://neon.com/docs/storage/overview) (the `product-photos` bucket in [`neon.ts`](neon.ts)) when the `AWS_*` variables are set, otherwise the `.data/photos` folder |
| Validation | [Zod](https://zod.dev) |

## Getting started

**Requirements:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # then set ADMIN_USERNAME and ADMIN_INITIAL_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The owner panel is at [/admin](http://localhost:3000/admin): the first login with `ADMIN_USERNAME` and `ADMIN_INITIAL_PASSWORD` (at least 10 characters) creates the owner account.

Without `DATABASE_URL`, the app runs an in-process Postgres (PGlite) saved in `.data/pglite` and fills it with the demo catalogue. Delete the `.data` folder (with the dev server stopped) to start again from the demo data.

To develop against Neon instead, check out a Neon branch of your own. Never use `production` for this, because every save in the local owner panel would change the live site:

```bash
neon checkout dev --create   # writes the branch's DATABASE_URL and storage credentials into .env.local
npm run db:migrate           # run again after every new migration
```

With the branch's `AWS_*` storage credentials in `.env.local`, photos uploaded locally go to that branch's `product-photos` bucket. `neon deploy` creates the bucket on a branch that doesn't have it yet.

The project is linked in the git-ignored `.neon` file, and [`neon.ts`](neon.ts) holds the Neon branch policy (`neon deploy` applies it).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run the TypeScript check |
| `npm run test` | Unit tests (Vitest + React Testing Library) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Browser tests (Playwright) against a fresh production build; run `npx playwright install chromium` once first |
| `npm run check` | Lint, typecheck, tests and build: run before every commit |
| `npm run db:generate -- --name <change>` | Create a migration after editing `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations and the first seed to `DATABASE_URL`, read from `.env.local` when present (Cloudflare runs it before every build) |
| `npm run preview` | Build the Cloudflare worker and run it locally |
| `npm run deploy` | Build the Cloudflare worker and deploy it (after `npx wrangler login`) |
| `npm run upload` | Build the Cloudflare worker and upload a new version without making it live |

Every push and pull request to `develop` or `main` runs the same checks in GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), plus the browser tests and the migration script against a real PostgreSQL. The required workflow for each change (tests, regression check, code review) is in [`AGENTS.md`](AGENTS.md).

## Project structure

```
src/
  app/
    (site)/          # Public pages (home, products, brands, enquiry, calculator…) with the navbar and footer
    admin/           # Owner panel: login, dashboard, products, password
    api/             # REST endpoints: products, categories, brands, uploaded photos
  components/
    admin/           # Owner panel header, product list, product form, login and password forms
    brand/           # Logo and brand wordmarks
    layout/          # Navbar, mobile bottom bar, footer, floating WhatsApp and back-to-top buttons, theme button, shared nav links
    home/            # Home page sections
    products/        # Catalogue, product cards, product detail, category directory
    enquiry/         # Enquiry form
    ui/              # Shared: icons, AppLink, Button, FormField, ConfirmDialog, Breadcrumbs, Reveal
  config/            # Shop name, phone, address, hours
  data/              # Categories, brands and the demo products that seed the database
  hooks/             # useConfirm, useUnsavedChanges
  lib/api/           # API endpoint list and HTTP client
  providers/         # App-wide confirm popup and unsaved-changes guard
  server/            # Database schema and migrations, login and sessions, Server Actions, photo storage
  services/          # Catalogue, owner products and login, used by pages, actions and API routes
  test/              # Test setup, mocks and the in-memory test database
  types/             # Shared TypeScript types
public/images/       # Photos (see CREDITS.md); shop/ placeholders for real photos
docs/                # Part 2 sprint plan, architecture, security, scalability, coding standards
e2e/                 # Playwright browser tests
scripts/             # Database migration script, optional Pexels image download helper
```

Coding rules for people and AI agents: [`AGENTS.md`](AGENTS.md) (also loaded through `CLAUDE.md`) and [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md).

## Updating content

| What | Where |
|------|--------|
| Shop name, phone, address, hours, map link | `src/config/shop.ts` |
| Products, photos, prices, stock | The owner panel at `/admin` |
| Categories and their types | The owner panel, **Categories** (stored in the database; `src/data/category-tree.ts` only seeds an empty database) |
| Popular brands | `src/data/products.ts`, `src/data/brands.ts` (or set `CATALOG_API_URL` to load the catalogue from a backend, see `.env.example`) |
| Demo products for a new database | `src/data/products.ts` (copied in once, when the products table is empty) |
| Real shop photos | Replace `public/images/shop/storefront.jpg`, `interior.jpg`, `counter.jpg` (see `public/images/shop/README.md`) |

Image credits and Pexels IDs: [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Deployment

The site runs on **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** (free plan, commercial use allowed) through the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare). Cloudflare Workers Builds is connected to the GitHub repo [`shubhamdsk/shree-balaji-paints-plywood-hardware`](https://github.com/shubhamdsk/shree-balaji-paints-plywood-hardware).

- **Production:** [shree-balaji.shreebalajipaints.workers.dev](https://shree-balaji.shreebalajipaints.workers.dev/)
- **Automatic deploys:** every push to `main` builds and deploys the live site. Builds for other branches are off, because preview versions share the production secrets and database.
- **Build settings** (Workers & Pages → `shree-balaji` → Settings → Build):
  - Build command: `npm run db:migrate && npx opennextjs-cloudflare build`
  - Deploy command: `npx opennextjs-cloudflare deploy`
  - Build variables: `DATABASE_URL` (Neon's pooled connection string; pages are prerendered from it and the build fails without it) and `SITE_URL`.
- **Runtime secrets** (Settings → Variables and Secrets, type *Secret*, never in Git): `DATABASE_URL`, `SESSION_SECRET` (at least 32 random characters), `ADMIN_USERNAME` and `ADMIN_INITIAL_PASSWORD` (used once, on the first owner login), and the production branch's Object Storage credentials `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3` and `AWS_REGION` (from `neon env pull --branch production --file <temp file>`; delete the file afterwards). Add `SITE_URL` there as a plain variable.
- **Config:** [`wrangler.jsonc`](wrangler.jsonc) names the worker and its bindings:
  - the Workers KV namespace that holds the page cache;
  - the Durable Objects that store cache tags, so owner saves show on the public site straight away;
  - Cloudflare Images, for `next/image`;
  - a daily cron trigger at 2:00 AM India time that writes the backup (Neon scales to zero between visits and wakes on the next query).

  [`open-next.config.ts`](open-next.config.ts) sets the cache, and [`worker.ts`](worker.ts) adds the cron handler to the generated worker.
- **Size limit:** the free plan rejects workers over 3 MiB gzipped. The `cloudflare` CI job builds the worker and fails above that.
- `npm run preview` runs the built worker locally, and `npm run deploy` deploys from your machine after `npx wrangler login`. On Windows the adapter needs symlinks, so turn on Developer Mode or use WSL.

To publish changes, open a pull request from `develop` into `main`, wait for CI to pass, then merge.

## Roadmap

Part 2 is planned in [`docs/SPRINT-PLAN.md`](docs/SPRINT-PLAN.md) (3 one-week sprints):

- Owner panel at `/admin`: products, photos, prices and stock status, categories, dated offers and the work gallery (**built**)
- Enquiry inbox: enquiries saved for the owner and still sent to WhatsApp (**built**)
- Daily backup to Neon Object Storage at 2:00 AM India time, keeping 30 days (**built**)
- Google Business Profile and Search Console
- Data on Neon Postgres, photos on Neon Object Storage ([Architecture](docs/ARCHITECTURE.md))

## Legal note

Brand names (e.g. Asian Paints, Berger, Nerolac) are trademarks of their respective owners. Product images are illustrative stock photos unless replaced with shop-owned photos. **Prices shown are indicative** — confirm availability and rates with the shop before purchase.
