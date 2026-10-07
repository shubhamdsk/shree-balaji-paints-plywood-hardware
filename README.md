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

- **Home** — Hero, category tiles, popular brands, featured products, offers, and a visit-us banner
- **Products catalogue** — Browse by category with filters, sort, and pagination
- **Product detail pages** — Specs, indicative pricing, and related items
- **Brands** — `/brands` lists every brand with product counts; each brand has its own page at `/brands/<brand>`
- **Offers, About, Contact** — Separate pages with clean URLs; the navbar highlights the current page
- **WhatsApp enquiry** — One-tap message to the shop (`7038499108`)
- **Paint calculator** — Room size (feet or metres), doors, windows and coats give the litres and best pack sizes, sent to the shop on WhatsApp; wall-paint product pages link to it at `/paint-calculator/<product>`
- **Google Maps** — Embedded map on `/contact` plus a link to open directions ([map](https://maps.app.goo.gl/hQ4KTEewDSLMKXCQ7))
- **Responsive layout** — Mobile-first navigation and catalogue
- **Search engines** — `/sitemap.xml` lists every page and `/robots.txt` points to it; set `SITE_URL` when the address changes
- **Security headers** — Content Security Policy and related headers on every response (`next.config.ts`)
- **Logo** — House, paintbrush and colour swirl mark with a Marathi wordmark (श्री बालाजी), used in the header, footer, favicon and social preview

## Tech stack

| Layer | Tools |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI | React 19, [Lucide](https://lucide.dev) icons, [Framer Motion](https://www.framer.com/motion/) |

## Getting started

**Requirements:** Node.js 20+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

Every push and pull request to `develop` or `main` runs the same checks in GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)). The required workflow for each change (tests, regression check, code review) is in [`AGENTS.md`](AGENTS.md).

## Project structure

```
src/
  app/               # Routes (home, products, product detail, enquiry, metadata icons)
    api/             # REST endpoints: products, categories, brands
  components/
    brand/           # Logo and brand wordmarks
    layout/          # Navbar, footer, WhatsApp button
    home/            # Home page sections
    products/        # Catalogue, product cards, product detail
    enquiry/         # Enquiry form
    ui/              # Shared: icons, AppLink, Button, FormField, ConfirmDialog, Breadcrumbs, Reveal
  config/            # Shop name, phone, address, hours
  data/              # Local catalogue (read only through services)
  hooks/             # useConfirm, useUnsavedChanges
  lib/api/           # API endpoint list and HTTP client
  providers/         # App-wide confirm popup and unsaved-changes guard
  services/          # Catalogue service used by pages and API routes
  types/             # Shared TypeScript types
public/images/       # Photos (see CREDITS.md); shop/ placeholders for real photos
docs/                # Part 2 sprint plan, architecture, security, scalability, coding standards
scripts/             # Optional Pexels image download helper
```

Coding rules for people and AI agents: [`AGENTS.md`](AGENTS.md) (also loaded through `CLAUDE.md`) and [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md).

## Updating content

| What | Where |
|------|--------|
| Shop name, phone, address, hours, map link | `src/config/shop.ts` |
| Products and categories | `src/data/products.ts`, `src/data/category-tree.ts`, `src/data/brands.ts` (or set `CATALOG_API_URL` to load them from a backend, see `.env.example`) |
| Real shop photos | Replace `public/images/shop/storefront.jpg`, `interior.jpg`, `counter.jpg` (see `public/images/shop/README.md`) |

Image credits and Pexels IDs: [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Deployment

The site is hosted on **[Netlify](https://www.netlify.com)**'s free plan, which allows commercial sites. It is connected to the GitHub repo [`shubhamdsk/shree-balaji-paints-plywood-hardware`](https://github.com/shubhamdsk/shree-balaji-paints-plywood-hardware).

- **Production:** [shree-balaji-paints-plywood-hardware.netlify.app](https://shree-balaji-paints-plywood-hardware.netlify.app/)
- **Automatic deploys:** every push to the production branch (`main`) redeploys the live site. Every pull request into `main` gets a Deploy Preview (visible to members of the Netlify team) and a status check on GitHub.
- **Settings:** [`netlify.toml`](netlify.toml) sets the build command (`npm run build`), the publish directory (`.next`), Node 22, `SITE_URL` and the Next.js runtime (`@netlify/plugin-nextjs`). Leave the dashboard build settings empty and the base directory at the project root. Keep the plugin entry: without it Netlify publishes the raw `.next` folder and every page returns 404.
- **Credits:** the free plan has 300 credits a month. A production deploy uses about 15, so batch changes before merging into `main`.

To publish changes, open a pull request from `develop` into `main`, check its Deploy Preview, then merge.

## Roadmap

Part 2 is planned in [`docs/SPRINT-PLAN.md`](docs/SPRINT-PLAN.md) (3 one-week sprints):

- Owner panel at `/admin`: products, photos, prices, in/out of stock, offers and gallery, edited from a phone
- Enquiry inbox: enquiries saved for the owner and still sent to WhatsApp
- Our work gallery, dated offer banners
- Google Business Profile and Search Console
- Database and photo storage on Netlify ([Architecture](docs/ARCHITECTURE.md))

## Legal note

Brand names (e.g. Asian Paints, Berger, Nerolac) are trademarks of their respective owners. Product images are illustrative stock photos unless replaced with shop-owned photos. **Prices shown are indicative** — confirm availability and rates with the shop before purchase.
