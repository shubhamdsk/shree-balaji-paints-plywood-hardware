# Scalability and Performance

How big the website needs to be, how fast it must feel, what the free hosting plan allows, and how it can grow.

Related: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md)

---

## 1. Expected load (single shop)

| Measure | Today (estimate) | Design limit |
|---------|------------------|--------------|
| Visitors per month | 500-3,000 | 30,000 |
| Products | 100-500 | 5,000 |
| Photos | 100-600 | 5,000 |
| Enquiries per month | 20-200 | 5,000 |
| Owner edits per day | 0-30 | 500 |
| Database size | under 50 MB | the free plan's storage limit |

## 2. Performance targets

| Action | Target | How |
|--------|--------|-----|
| Page load on 4G mobile | LCP under 2.5 s | Cached pages on the CDN, responsive images through the image CDN |
| Owner change visible on the site | about 1 minute | `updateTag` after each save; the next visit renders fresh pages |
| Owner panel screens | under 1 s | Indexed queries, small pages |
| Enquiry save | under 1 s | One insert. WhatsApp opens even if it fails |
| First request after the database sleeps | under 1 s extra | The database wakes on demand; public pages are served from the cache meanwhile |

## 3. Free-plan budget (Netlify)

The free plan has 300 credits a month with a hard limit, and the site pauses if they run out. Approximate costs: a production deploy uses 15 credits, 1 GB of bandwidth uses 20, 10,000 requests use 2, and compute uses 10 per GB-hour.

| Rule | Why |
|------|-----|
| Owner edits never trigger a deploy | Edits refresh cached pages by tag instead |
| Batch code releases (a few production deploys a month) | Each deploy costs credits; preview deploys on branches are for testing |
| All images through `next/image` and the image CDN | Bandwidth is the largest cost |
| Check usage monthly during support | Spot growth before the limit; the next plan is about Rs 800 a month |

## 4. Indexes (planned)

- `products`: `category`, `brand`, `is_visible`, `featured`.
- `offers`: `(starts_on, ends_on)`.
- `enquiries`: `(status, created_at)`.
- `sessions`: `token_hash` (unique), `expires_at`.

## 5. Housekeeping

- Expired sessions: removed daily.
- Enquiries: deleted after 12 months.
- Backups: last 30 daily files.
- Audit log: kept for 2 years.

## 6. Growth path

| Stage | Change | Effort |
|-------|--------|--------|
| **Part 2 (now)** | One owner account, cached pages, Netlify free plan | n/a |
| **Staff logins** | Add a `role` column and limit staff to products and enquiries | Small |
| **Custom website name** | Buy a domain, point it at Netlify, update `SITE_URL` and Google | Small |
| **Marathi / English switch** | Locale route segment, translated labels and product names | Medium |
| **More traffic** | Netlify's paid plan; no code change | Small |
| **Online orders** | Cart, order table and owner order inbox; payment gateway later | Medium-Large |
| **Billing software** | Separate project; would read and write the same product table | Large (separate quote) |

## 7. Reliability

| Failure | Effect | Recovery |
|---------|--------|----------|
| Database asleep or briefly down | Public pages still served from the cache. Owner panel and enquiry saving wait | Enquiries still reach WhatsApp. Retry the edit |
| Free credits exhausted | Site paused until next month | Upgrade the plan the same day if needed |
| Bad edit by the owner | Wrong price shown | Fix it in the panel; the audit log shows the previous value |
| Data lost or corrupted | Products or enquiries missing | Restore from the daily JSON backup or the database restore window |
| Netlify outage | Site unavailable | Wait. The code and backups can be deployed elsewhere if it lasts |
