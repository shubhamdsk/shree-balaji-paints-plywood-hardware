# Shree Balaji Paints Plywood and Hardware — Demo Website

A modern demo site for **Shree Balaji Paints Plywood and Hardware**, an authorized Asian Paints dealer in Kotul, Maharashtra — built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Live app

**[shree-balaji-paints-plywood-hardwar.vercel.app](https://shree-balaji-paints-plywood-hardwar.vercel.app/)**

| Page | Link |
|------|------|
| Home | [/](https://shree-balaji-paints-plywood-hardwar.vercel.app/) |
| Products catalogue | [/products](https://shree-balaji-paints-plywood-hardwar.vercel.app/products) |
| Paints | [/products?category=paints](https://shree-balaji-paints-plywood-hardwar.vercel.app/products?category=paints) |
| Plywood | [/products?category=plywood](https://shree-balaji-paints-plywood-hardwar.vercel.app/products?category=plywood) |
| Hardware | [/products?category=hardware](https://shree-balaji-paints-plywood-hardwar.vercel.app/products?category=hardware) |
| Sample product | [Royale Luxury Emulsion](https://shree-balaji-paints-plywood-hardwar.vercel.app/products/ap-royale-luxury) |
| Send an enquiry | [/enquiry](https://shree-balaji-paints-plywood-hardwar.vercel.app/enquiry) |
| Products API | [/api/products](https://shree-balaji-paints-plywood-hardwar.vercel.app/api/products) |

## Features

- **Home** — Hero, category tiles, promo banners, “Our Store” section, and footer with contact details
- **Products catalogue** — Browse by category with filters, sort, and pagination
- **Product detail pages** — Specs, indicative pricing, and related items
- **WhatsApp enquiry** — One-tap message to the shop (`7038499108`)
- **Google Maps** — Embedded map on the home page plus a link to open directions ([map](https://maps.app.goo.gl/hQ4KTEewDSLMKXCQ7))
- **Responsive layout** — Mobile-first navigation and catalogue
- **Custom logo** — SVG wordmark and mark in the header, footer, and social preview

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
docs/                # Sprint plan, architecture, security, scalability, coding standards
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

The site is hosted on **[Vercel](https://vercel.com)** and connected to the GitHub repo [`shubhamdsk/shree-balaji-paints-plywood-hardware`](https://github.com/shubhamdsk/shree-balaji-paints-plywood-hardware).

- **Production:** [shree-balaji-paints-plywood-hardwar.vercel.app](https://shree-balaji-paints-plywood-hardwar.vercel.app/)
- **Automatic deploys:** every push to the production branch (`main`) redeploys the live site. Pushes to other branches (e.g. `develop`) get their own preview URL.
- **Settings:** Framework preset **Next.js**, default build command, no environment variables required.

To publish changes, merge `develop` into `main` and push.

Manual deploy with the [Vercel CLI](https://vercel.com/docs/cli): `npx vercel --prod` from the project root (after `vercel login`).

## Roadmap

- Backend and database for live inventory
- Admin panel for stock and product updates
- Sales records, customer CRM, billing, and enquiry tracking

## Legal note

Brand names (e.g. Asian Paints, Berger, Nerolac) are trademarks of their respective owners. Product images are illustrative stock photos unless replaced with shop-owned photos. **Prices shown are indicative** — confirm availability and rates with the shop before purchase.
