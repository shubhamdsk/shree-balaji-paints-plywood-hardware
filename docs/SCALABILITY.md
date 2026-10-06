# Scalability and Performance

How big the system needs to be today, how fast it must feel, and how it can grow without a rewrite.

Related: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md)

---

## 1. Expected load (single shop)

| Measure | Today (estimate) | Design limit for v1 |
|---------|------------------|---------------------|
| Bills per day | 50-200 | 2,000 |
| Lines per bill | 1-15 | 200 |
| Products (with sizes) | 300-2,000 | 50,000 |
| Customers | 500-3,000 | 100,000 |
| Bills per year | about 50,000 | 700,000 |
| Users at the same time | 1-2 (one PC) | 5 |
| Database size after 10 years | under 2 GB | PostgreSQL handles hundreds of GB on one PC |

One PostgreSQL database on a normal shop PC (4 GB RAM, SSD recommended) handles this load easily. No caching layer, queue or extra server is needed.

## 2. Performance targets

| Action | Target | How |
|--------|--------|-----|
| Product search while billing | under 150 ms | `pg_trgm` GIN index on product name and size, plus an index on SKU. Search on the server with a 200 ms debounce |
| Save a bill | under 500 ms | One transaction, a few inserts, indexed counter row |
| Open the print view | under 1 s | Single query with joins. Print CSS with no heavy libraries |
| Dashboard | under 1 s | Aggregates on indexed `invoices(created_at)` |
| Monthly or GST report | under 2 s for 1 year of data | SQL `GROUP BY` on indexed columns, with streaming CSV for exports |
| App start after reboot | under 30 s | Windows Service auto-start |
| Website page load (4G mobile) | LCP under 2.5 s | Static pages on Vercel's CDN, responsive images |

These targets are checked with a seed script that generates **3 years of fake data** (about 150,000 bills) during Sprint 3.

## 3. Indexes (planned)

- `products`: GIN trigram on `name`, plus `category_id`, `brand_id` and `is_active`.
- `product_variants`: `product_id`, `sku` (unique), and a partial index for low stock (`stock_qty <= min_stock_qty`).
- `invoices`: `created_at`, `(financial_year, seq)` (unique), `customer_id`, `status`, `payment_mode`.
- `invoice_items`: `invoice_id`, `variant_id`.
- `stock_movements`: `(variant_id, created_at)`.
- `customers`: `phone`, `gstin`, and trigram on `name`.

## 4. Data growth and housekeeping

- Bills are kept forever, because GST requires at least 6 years and older bills cost very little space.
- **Logs:** 30 days.
- **Sessions:** cleaned daily.
- **WAL archive:** 14 days.
- **Backups:** 30 daily + 12 monthly.
- `VACUUM` and `ANALYZE` run automatically through PostgreSQL autovacuum (default on).
- Year-end: nothing to close in the database. The financial year is a column, and invoice numbers restart automatically on 1 April.

## 5. Growth path (no rewrite needed)

Each step reuses the same code. Only configuration or deployment changes.

| Stage | Change | Effort |
|-------|--------|--------|
| **v1 (now)** | One PC, `127.0.0.1` only | n/a |
| **Second billing PC in the shop** | Bind to the LAN IP, open the firewall for the shop subnet only, add HTTPS with a local certificate (mkcert) and the `Secure` cookie flag. Second PC uses a browser only | Small |
| **Barcode scanner** | USB scanners act as a keyboard. Add a SKU or barcode field and a scan input on the billing screen | Small |
| **Owner checks sales from his phone** | Read-only cloud copy: nightly push of summary figures to a free hosted database or a private JSON on Vercel, with login | Medium |
| **Second branch / multi-shop** | Move PostgreSQL to a managed cloud database. Add `branch_id` to the main tables (planned in the schema from day 1 as a nullable column). Each shop's app connects online, with an offline queue | Large (separate quote) |
| **Online orders on the website** | Website form, then a hosted API, then an order inbox in Shop Manager | Medium-Large |
| **E-invoice / e-way bill** | Integrate with a GST Suvidha Provider (GSP) API. Invoice data is already structured for it | Medium |

## 6. Website scale

- The website is static and served from Vercel's global CDN, so traffic spikes don't need any change.
- The free plan's limits (bandwidth and build minutes) are far above what a local shop site uses.
- Each Publish triggers one build of about 1-2 minutes. A few publishes per day is fine, and the publish button allows at most one every 2 minutes.

## 7. Reliability

| Failure | Effect | Recovery |
|---------|--------|----------|
| App crashes | Billing stops for a few seconds | WinSW restarts it automatically |
| PC restarts | Billing back in under 1 minute | Service auto-start |
| Internet down | No effect on billing. Publish waits | Publish when back online |
| Database disk fails | Billing stops | Restore from the second disk, losing about 1 minute of data |
| PC lost or destroyed | Billing stops | New PC: install, then restore from Google Drive (target under 4 hours) |
| Vercel or GitHub down | Website can't update. The last published version stays online | Publish again later |
