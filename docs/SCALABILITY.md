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
| Owner panel screens | under 1 s | Indexed queries, small pages (the enquiry inbox loads 50 at a time) |
| Enquiry save | under 1 s | One insert. WhatsApp opens even if it fails |
| First request after the database sleeps | under 1 s extra | The database wakes on demand; public pages are served from the cache meanwhile |

## 3. Free-plan budget (Cloudflare and Neon)

The Workers Free plan allows 100,000 requests a day, a worker of at most 3 MiB gzipped, and 10 ms of CPU time per request (cron runs included). Static files (`public/`, `_next/static`) are free and don't count as requests. Workers KV (the page cache) allows 100,000 reads and 1,000 writes a day, reset at 00:00 UTC; each deploy writes every page rendered at build once, and each cache refresh writes again. Photos use Neon Object Storage, alongside Neon's own compute and storage allowance. No payment card is needed on Cloudflare.

Once the KV writes run out, rendered pages can't be stored, so every visit renders again. A Next.js render costs more than 10 ms of CPU, so the site then fails with error 1102 until the daily reset. Keeping KV writes low is what keeps the site on the free plan.

| Rule | Why |
|------|-----|
| Owner edits never trigger a deploy | Edits refresh cached pages by tag instead |
| Deploy rarely, and only after `npm run check` passes | Each deploy writes the build-time pages to KV (77 entries since the October 2026 trim, down from 147: 48 pages and 29 data-cache entries) |
| Render only list pages at build | Product, brand, enquiry and calculator pages return `[]` from `generateStaticParams` and are cached on their first visit |
| Keep cache tags scoped | One product save refreshes only the pages that show it (see the table in [Architecture 6.1](ARCHITECTURE.md)) |
| Keep the worker under 3 MiB gzipped | The `cloudflare` CI job fails above it; check new dependencies before adding them |
| Watch CPU time on login and owner pages | Password hashing (scrypt, N=16384, measured at about 70 to 110 ms on a desktop) and owner pages rendered on every request pass 10 ms. Cloudflare tolerates occasional bursts; if the logs show 1102 errors on these routes, move to Workers Paid, which allows up to 30 s and needs no code change. Don't weaken the hashing to fit |
| All images through `next/image` and Cloudflare Images | Keeps pages light on mobile data |
| Check usage monthly during support | Workers & Pages → `shree-balaji` → Metrics, and Neon's usage page |

### Measuring usage without load tests

Don't send bursts of requests at the live site to test it: that spends the same CPU and KV allowance the shop needs. Use Cloudflare's own data instead:

1. Workers & Pages → `shree-balaji` → Metrics shows requests, errors and CPU time. Observability → Events lists each failed request with its outcome (`exceededResources` covers both CPU and memory).
2. Storage & Databases → KV → the page-cache namespace → Metrics shows reads, writes and failed writes per day.
3. For a single page, open it once and check the `x-nextjs-cache` response header: `HIT` means served from KV, `MISS` or `STALE` means it rendered.
4. To count the KV writes a deploy will make, delete `.open-next`, run `npx opennextjs-cloudflare build`, and count the files under `.open-next/cache`.

Record before and after each release: the deployed version id and commit (for rollback with `npx wrangler rollback <version>`), KV writes and failed writes for the day, CPU time and 1102 counts, and the `x-nextjs-cache` header on the home page, a category page and a product page. The October 2026 baseline was commit `cd79ee2` (version `5c75203b`), 147 KV entries per deploy, and a 3-minute keep-awake cron.

### Reviewed and left as they are

- **Owner write transactions.** Each product, category or enquiry write opens one WebSocket transaction, because its audit row records the row the write returned. Neon's HTTP `db.batch()` can't feed one statement's result into the next, and owner writes are rare, so the transactions stay.
- **Daily backup.** It reads six small tables once a day into one JSON file. At today's size that is well inside the limits. Split it into one file per table if the catalogue grows past about 1,000 products or the cron logs show 1102 errors.

## 4. Indexes

- `products`: `subcategory_id`.
- `offers`: `ends_on`.
- `enquiries`: `(status, created_at desc)` for the inbox tabs, `(client_hash, created_at)` for the rate limit.
- Planned: `sessions` `expires_at` when the session table grows.

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
