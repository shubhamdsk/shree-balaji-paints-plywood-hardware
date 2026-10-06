# Shree Balaji Paints Plywood and Hardware — Demo Website

A modern demo site for **Shree Balaji Paints Plywood and Hardware**, an authorized Asian Paints dealer in Kotul, Maharashtra — built with Next.js 16, TypeScript, and Tailwind CSS v4.

**Live demo:** _Coming soon — deploy via [Vercel](#deployment) or see instructions below._

## Features

- **Home** — Hero, category tiles, promo banners, “Our Store” section, and footer with contact details
- **Products catalogue** — Browse by category with filters, sort, and pagination
- **Product detail pages** — Specs, indicative pricing, and related items
- **WhatsApp enquiry** — One-tap message to the shop (`9284463701`)
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

## Project structure

```
app/                 # Routes (home, products, product detail, metadata icons)
components/          # UI (Navbar, Hero, catalogue, WhatsApp, etc.)
data/                # Shop info, products, categories, brands
types/               # Shared TypeScript types
public/images/       # Photos (see CREDITS.md); shop/ placeholders for real photos
scripts/             # Optional Pexels image download helper
```

## Updating content

| What | Where |
|------|--------|
| Shop name, phone, address, hours, map link | `data/shop.ts` |
| Products and categories | `data/products.ts`, `data/categoryTree.ts`, `data/brands.ts` |
| Real shop photos | Replace `public/images/shop/storefront.jpg`, `interior.jpg`, `counter.jpg` (see `public/images/shop/README.md`) |

Image credits and Pexels IDs: [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Deployment

**Vercel (recommended)**

1. Push this repo to GitHub.
2. Sign in at [vercel.com](https://vercel.com) with GitHub.
3. **Add New Project** → import `shubhamdsk/shree-balaji-paints-plywood-hardware`.
4. Framework is auto-detected (Next.js). No environment variables required.
5. Deploy. Pushes to `main` trigger automatic redeploys.

Alternatively, with the [Vercel CLI](https://vercel.com/docs/cli): `npx vercel --prod` from the project root (after `vercel login`).

## Roadmap

- Backend and database for live inventory
- Admin panel for stock and product updates
- Sales records, customer CRM, billing, and enquiry tracking

## Legal note

Brand names (e.g. Asian Paints, Berger, Nerolac) are trademarks of their respective owners. Product images are illustrative stock photos unless replaced with shop-owned photos. **Prices shown are indicative** — confirm availability and rates with the shop before purchase.
