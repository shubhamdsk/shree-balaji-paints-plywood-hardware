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
| Database size | under 50 MB | Neon's free storage limit (0.5 GB per project) |

## 2. Performance targets

| Action | Target | How |
|--------|--------|-----|
| Page load on 4G mobile | LCP under 2.5 s | Cached pages on the CDN, responsive images through the image CDN |
| Owner change visible on the site | about 1 minute | `updateTag` after each save; the next visit renders fresh pages |
| Owner panel screens | under 1 s | Indexed queries, small pages |
| Enquiry save | under 1 s | One insert. WhatsApp opens even if it fails |
| First request after the database sleeps | under 1 s extra | The database wakes on demand; public pages are served from the cache meanwhile |

## 3. Free-plan budget (Cloudflare and Neon)

The Workers Free plan allows 100,000 requests a day, a worker of at most 3 MiB gzipped, and 10 ms of CPU time per request. Static files (`public/`, `_next/static`) are free and don't count as requests. R2 includes 10 GB of storage. Neon's free plan has its own monthly compute allowance.

| Rule | Why |
|------|-----|
| Owner edits never trigger a deploy | Edits refresh cached pages by tag instead |
| Keep the worker under 3 MiB gzipped | The `cloudflare` CI job fails above it; check new dependencies before adding them |
| Watch CPU time on login and owner pages | Password hashing and server rendering can pass 10 ms. If the logs show "exceeded CPU" errors (1102), move to Workers Paid, which allows up to 30 s and needs no code change |
| All images through `next/image` and Cloudflare Images | Keeps pages light on mobile data |
| Check usage monthly during support | Workers & Pages → `shree-balaji` → Metrics, and Neon's usage page |

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
| **Part 2 (now)** | One owner account, cached pages, Cloudflare Workers free plan | n/a |
| **Staff logins** | Add a `role` column and limit staff to products and enquiries | Small |
| **Custom website name** | Buy a domain, add it to Cloudflare as a custom domain for the worker, update `SITE_URL` and Google | Small |
| **Marathi / English switch** | Locale route segment, translated labels and product names | Medium |
| **More traffic** | Cloudflare Workers Paid; no code change | Small |
| **Online orders** | Cart, order table and owner order inbox; payment gateway later | Medium-Large |
| **Billing software** | Separate project; would read and write the same product table | Large (separate quote) |

## 7. Reliability

| Failure | Effect | Recovery |
|---------|--------|----------|
| Database asleep or briefly down | Public pages still served from the cache. Owner panel and enquiry saving wait | Enquiries still reach WhatsApp. Retry the edit |
| Free daily request limit reached | Requests fail until the daily reset (00:00 UTC) | Move to Workers Paid the same day if it happens more than once |
| Bad edit by the owner | Wrong price shown | Fix it in the panel; the audit log shows the previous value |
| Data lost or corrupted | Products or enquiries missing | Restore from the daily JSON backup or the database restore window |
| Cloudflare outage | Site unavailable | Wait. The code and backups can be deployed elsewhere if it lasts |
