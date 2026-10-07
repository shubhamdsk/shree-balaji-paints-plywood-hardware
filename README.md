# Shree Balaji Paints Plywood and Hardware — Demo Website

A modern demo site for **Shree Balaji Paints Plywood and Hardware**, an authorized Asian Paints dealer in Kotul, Maharashtra — built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Live app

**[shree-balaji-paints-plywood-hardware.netlify.app](https://shree-balaji-paints-plywood-hardware.netlify.app/)**

| Page | Link |
|------|------|
| Home | [/](https://shree-balaji-paints-plywood-hardware.netlify.app/) |
| Products catalogue | [/products](https://shree-balaji-paints-plywood-hardware.netlify.app/products) |
| Paints | [/products/paints](https://shree-balaji-paints-plywood-hardware.netlify.app/products/paints) |
| Interior paints | [/products/paints/interior](https://shree-balaji-paints-plywood-hardware.netlify.app/products/paints/interior) |
| Plywood | [/products/plywood](https://shree-balaji-paints-plywood-hardware.netlify.app/products/plywood) |
| Hardware | [/products/hardware](https://shree-balaji-paints-plywood-hardware.netlify.app/products/hardware) |
| Sample product | [Royale Luxury Emulsion](https://shree-balaji-paints-plywood-hardware.netlify.app/products/ap-royale-luxury) |
| Brands | [/brands](https://shree-balaji-paints-plywood-hardware.netlify.app/brands) |
| Sample brand | [Asian Paints](https://shree-balaji-paints-plywood-hardware.netlify.app/brands/asian-paints) |
| Offers | [/offers](https://shree-balaji-paints-plywood-hardware.netlify.app/offers) |
| About | [/about](https://shree-balaji-paints-plywood-hardware.netlify.app/about) |
| Contact | [/contact](https://shree-balaji-paints-plywood-hardware.netlify.app/contact) |
| Send an enquiry | [/enquiry](https://shree-balaji-paints-plywood-hardware.netlify.app/enquiry) |
| Quote for a product | [/enquiry/ap-royale-luxury](https://shree-balaji-paints-plywood-hardware.netlify.app/enquiry/ap-royale-luxury) |
| Paint calculator | [/paint-calculator](https://shree-balaji-paints-plywood-hardware.netlify.app/paint-calculator) |
| Products API | [/api/products](https://shree-balaji-paints-plywood-hardware.netlify.app/api/products) |

## Features

- **Home** — Marathi hero, trust bar, category showcase (Paints first), shop-by-project cards, featured products, trusted brands, paint and plywood/hardware sections, offers, why choose us, about and a visit-our-store panel with map
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
- **Owner panel** — `/admin` (password login, locked for 15 minutes after 5 wrong tries) where the owner adds and edits products from his phone: name, brand, category, type, sizes, price in whole rupees, unit, description and a photo taken with the phone (shrunk in the browser before upload). One-tap switches mark a product in or out of stock or put it on the home page, and Hide (after a confirmation) removes it from every public page. Changes show on the website straight away, with no redeploy

## Tech stack

| Layer | Tools |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI | React 19, [Lucide](https://lucide.dev) icons, [Framer Motion](https://www.framer.com/motion/) |
| Data | Postgres through [Drizzle ORM](https://orm.drizzle.team): [Neon](https://neon.tech) (free plan) in production, [PGlite](https://pglite.dev) locally and in tests |
| Photos | [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) in production, the `.data/photos` folder locally |
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
neon checkout dev --create   # writes the branch's DATABASE_URL into .env.local
npm run db:migrate           # run again after every new migration
```

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
| `npm run check` | Lint, typecheck, tests and build: run before every commit |
| `npm run db:generate -- --name <change>` | Create a migration after editing `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations and the first seed to `DATABASE_URL`, read from `.env.local` when present (Netlify runs it before every build) |

Every push and pull request to `develop` or `main` runs the same checks in GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)). The required workflow for each change (tests, regression check, code review) is in [`AGENTS.md`](AGENTS.md).

## Project structure

```
src/
  app/
    (site)/          # Public pages (home, products, brands, enquiry, calculator…) with the navbar and footer
    admin/           # Owner panel: login, dashboard, products
    api/             # REST endpoints: products, categories, brands, uploaded photos
  components/
    admin/           # Owner panel header, product list, product form, login form
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
scripts/             # Database migration script, optional Pexels image download helper
```

Coding rules for people and AI agents: [`AGENTS.md`](AGENTS.md) (also loaded through `CLAUDE.md`) and [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md).

## Updating content

| What | Where |
|------|--------|
| Shop name, phone, address, hours, map link | `src/config/shop.ts` |
| Products, photos, prices, stock | The owner panel at `/admin` |
| Categories, their types and popular brands | `src/data/category-tree.ts`, `src/data/products.ts`, `src/data/brands.ts` (or set `CATALOG_API_URL` to load the catalogue from a backend, see `.env.example`) |
| Demo products for a new database | `src/data/products.ts` (copied in once, when the products table is empty) |
| Real shop photos | Replace `public/images/shop/storefront.jpg`, `interior.jpg`, `counter.jpg` (see `public/images/shop/README.md`) |

Image credits and Pexels IDs: [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Deployment

The site is hosted on **[Netlify](https://www.netlify.com)**'s free plan, which allows commercial sites. It is connected to the GitHub repo [`shubhamdsk/shree-balaji-paints-plywood-hardware`](https://github.com/shubhamdsk/shree-balaji-paints-plywood-hardware).

- **Production:** [shree-balaji-paints-plywood-hardware.netlify.app](https://shree-balaji-paints-plywood-hardware.netlify.app/)
- **Automatic deploys:** every push to the production branch (`main`) redeploys the live site. Every pull request into `main` gets a Deploy Preview (visible to members of the Netlify team) and a status check on GitHub.
- **Environment variables** (Netlify → Site configuration → Environment variables, never in Git):
  - `DATABASE_URL`: Neon's pooled connection string. Give deploy previews a separate Neon branch so they never touch production data. The build fails without it.
  - `SESSION_SECRET`: at least 32 random characters.
  - `ADMIN_USERNAME` and `ADMIN_INITIAL_PASSWORD`: used once, on the first owner login.
  - Netlify's secret scanning fails the build if a secret value appears in the repo or the build output. `ADMIN_USERNAME` is left out of the scan because the login name is usually a shop word, and so is the build cache (`.next/cache`), where Turbopack records the env values a build reads. The other values must be random, not words from the site.
- **Settings:** [`netlify.toml`](netlify.toml) sets the build command (`npm run db:migrate && npm run build`), the publish directory (`.next`), Node 22, `SITE_URL`, the secret-scan exception and the Next.js runtime (`@netlify/plugin-nextjs`). Leave the dashboard build settings empty and the base directory at the project root. Keep the plugin entry: without it Netlify publishes the raw `.next` folder and every page returns 404.
- **Credits:** the free plan has 300 credits a month. A production deploy uses about 15, so batch changes before merging into `main`.

To publish changes, open a pull request from `develop` into `main`, check its Deploy Preview, then merge.

## Roadmap

Part 2 is planned in [`docs/SPRINT-PLAN.md`](docs/SPRINT-PLAN.md) (3 one-week sprints):

- Owner panel at `/admin`: products, photos, prices and stock status (**Sprint 1, built**); offers and gallery next
- Enquiry inbox: enquiries saved for the owner and still sent to WhatsApp
- Our work gallery, dated offer banners
- Google Business Profile and Search Console
- Data on Neon Postgres, photos on Netlify Blobs ([Architecture](docs/ARCHITECTURE.md))

## Legal note

Brand names (e.g. Asian Paints, Berger, Nerolac) are trademarks of their respective owners. Product images are illustrative stock photos unless replaced with shop-owned photos. **Prices shown are indicative** — confirm availability and rates with the shop before purchase.
