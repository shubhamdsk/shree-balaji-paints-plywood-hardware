# Architecture and System Design

This document describes how the Shree Balaji website and the local billing software (Shop Manager) are built, how data flows between them, and how data is protected.

Related documents: [Sprint plan](SPRINT-PLAN.md) · [Security](SECURITY.md) · [Scalability](SCALABILITY.md) · [Coding standards](CODING-STANDARDS.md)

---

## 1. Goals and constraints

| Goal | How the design meets it |
|------|-------------------------|
| Billing must work without internet | Shop Manager and its database run entirely on the shop PC |
| No data loss | Transactions, an append-only ledger, cancel-not-delete, and 3-copy backups (section 7) |
| Zero running cost | Free and open-source software only. The website is on Vercel's free plan |
| Simple installation | One portable folder, a Windows Service, and PostgreSQL as the only installer |
| One language for the team | TypeScript everywhere: the website and Shop Manager both use Next.js |
| Website always matches the shop | A "Publish to website" button sends a filtered product list |
| Correct GST | Pure, unit-tested tax functions, integer money, and stored snapshots of every bill |

**Out of scope for v1:** multiple branches, access from a second PC, a payment gateway, e-invoice. See [Scalability](SCALABILITY.md) for the growth path.

---

## 2. System context

```mermaid
flowchart LR
  Owner[Owner and staff] -->|browser on shop PC| ShopManager[Shop Manager]
  ShopManager -->|bill image and chat link| WhatsApp[WhatsApp Desktop or Web]
  ShopManager -->|print| Printer[Thermal or A4 printer]
  ShopManager -->|"publish products.json (HTTPS)"| GitHub[GitHub repository]
  GitHub -->|push triggers build| Vercel[Vercel - public website]
  Customers[Customers] -->|mobile or desktop| Vercel
  Customers -->|scan UPI QR| Bank[Customer UPI app to shop bank account]
  ShopManager -->|nightly encrypted backup| GDrive[Google Drive]
```

---

## 3. Components

### 3.1 Public website (existing, this repository)

- **Next.js 16 (App Router)**, React 19, Tailwind CSS v4, deployed on **Vercel** (free plan).
- Fully static pages with clean paths and no query strings. Every page path is built in [`src/lib/routes.ts`](../src/lib/routes.ts) and pre-rendered with `generateStaticParams`:
  - `/products/[slug]` is a category (`/products/paints`) or a product (`/products/ap-royale-luxury`); category ids and product ids must never overlap.
  - `/products/[slug]/[type]` is a category type (`/products/paints/interior`).
  - `/brands/[slug]` is a brand (`/brands/asian-paints`), and `/enquiry/[productId]` opens the enquiry form with that product chosen.
  - Brands, Offers, About and Contact are their own routes, not hash links on the home page.
- **Data access:** pages and the REST endpoints in `src/app/api/` (`/api/products`, `/api/products/[id]`, `/api/categories`, `/api/categories/groups`, `/api/brands`) all read through [`src/services/catalog-service.ts`](../src/services/catalog-service.ts). Paths are defined once in [`src/lib/api/endpoints.ts`](../src/lib/api/endpoints.ts). Setting `CATALOG_API_URL` points the service at an external backend with the same endpoints, without changing any page.
- **Enquiries:** `/enquiry` builds a WhatsApp message in the browser. Nothing is stored on the server.
- **Product data source (after Sprint 5):** `src/data/products.json`, written only by the Publish feature and validated at build time. The validation uses the same `Product` shape as [`src/types/index.ts`](../src/types/index.ts).
- **No database, no login, and no personal data.** The website can't reach the shop PC.

### 3.2 Shop Manager (new repository: `shree-balaji-shop-manager`)

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI | Next.js 16 App Router, React 19, Tailwind CSS v4 | Same look and feel as the website |
| Server logic | Next.js Server Actions and Route Handlers | All business rules run on the server, never in the browser |
| Validation | Zod | Every input is validated at the server boundary |
| Domain | Pure TypeScript modules (`src/domain`) | GST, money, invoice numbering. No I/O, fully unit-tested |
| Data access | Drizzle ORM + `pg` (pure JavaScript driver) | No native binaries. SQL migrations are kept in Git |
| Database | PostgreSQL 16 or later (LTS) | Local only, crash-safe, point-in-time recovery |
| Runtime | Portable `node.exe` (Node LTS ZIP) | Nothing to install for Node |
| Process manager | WinSW (Windows Service wrapper) | Auto-start, auto-restart, log rotation |
| Backups | PowerShell scripts + `pg_dump` + WAL archiving + 7-Zip AES-256 | Run by Windows Task Scheduler |

Before building, read the relevant guides in `node_modules/next/dist/docs/` (standalone output, Server Actions, Route Handlers, request interception). Next.js 16 has breaking changes from earlier versions; see [AGENTS.md](../AGENTS.md).

### 3.3 Shop PC deployment layout

```
C:\ShreeBalajiBilling\
  node\node.exe                    # portable Node LTS
  app\server.js                    # Next.js standalone build (output: "standalone")
  app\.next\static\  app\public\   # static assets copied next to server.js
  config\.env                      # DATABASE_URL, SESSION_SECRET, GITHUB_TOKEN (restricted ACL)
  service\billing-service.exe      # WinSW renamed
  service\billing-service.xml      # service definition, env, log rotation
  backup\backup-nightly.ps1  backup\restore.ps1  backup\restore-test.ps1
  logs\                            # app and service logs (rotated)
D:\ShreeBalajiBackups\             # second disk or USB: WAL archive + nightly files
%USERPROFILE%\Google Drive\ShreeBalajiBackups\   # synced off-site copy
```

- The app listens on **`127.0.0.1:3000` only**, so it can't be reached from the network (see [Security](SECURITY.md)).
- A desktop shortcut `Shree Balaji Billing` opens `http://localhost:3000`.
- **Updates:** stop the service, back up, replace `app\`, run migrations, start the service.

---

## 4. Application structure (Shop Manager)

```
src/
  app/
    (auth)/login/page.tsx
    (shop)/layout.tsx              # requires session; sidebar navigation
    (shop)/dashboard/page.tsx
    (shop)/billing/new/page.tsx    # fast billing screen
    (shop)/billing/[id]/page.tsx   # view, reprint, cancel, WhatsApp
    (shop)/billing/[id]/print/page.tsx   # ?format=thermal|a4
    (shop)/products/...            # list, create, edit, import
    (shop)/stock/...               # stock-in, adjustments, ledger
    (shop)/customers/...
    (shop)/reports/...             # sales, payment-mode, gst, stock
    (shop)/settings/...            # shop profile, users, backup status, publish
    api/export/[report]/route.ts   # CSV downloads
    api/health/route.ts            # used by the service and backup scripts
  domain/                          # pure logic, no imports from db or next
    money.ts  gst.ts  invoice-number.ts  stock.ts
  server/
    db/schema.ts  db/client.ts  db/migrations/
    auth/session.ts  auth/password.ts  auth/guard.ts
    services/                      # use cases; each runs in one DB transaction
      billing-service.ts  product-service.ts  stock-service.ts
      report-service.ts  publish-service.ts  backup-status-service.ts
    audit.ts
  components/                      # UI components (PascalCase.tsx)
  lib/                             # client-safe helpers (formatting)
tests/
  domain/  services/  e2e/
scripts/                           # PowerShell: install, backup, restore
```

**Dependency rule:** `app` → `server/services` → `domain` + `server/db`. The `domain` folder imports nothing from Next.js or the database, and UI components never import `server/db`.

---

## 5. Data model

```mermaid
erDiagram
  USERS ||--o{ SESSIONS : has
  USERS ||--o{ INVOICES : creates
  USERS ||--o{ AUDIT_LOG : performs
  CATEGORIES ||--o{ PRODUCTS : groups
  BRANDS ||--o{ PRODUCTS : makes
  PRODUCTS ||--o{ PRODUCT_VARIANTS : "sold as"
  PRODUCT_VARIANTS ||--o{ STOCK_MOVEMENTS : "moves by"
  PRODUCT_VARIANTS ||--o{ INVOICE_ITEMS : "billed as"
  CUSTOMERS ||--o{ INVOICES : receives
  INVOICES ||--|{ INVOICE_ITEMS : contains
  INVOICE_COUNTERS ||--o{ INVOICES : numbers
```

### Key tables

| Table | Important columns | Rules |
|-------|-------------------|-------|
| `shop_settings` | name, gstin, state_code (27 = Maharashtra), address, phone, upi_id, invoice_prefix | Single row |
| `users` | username, password_hash, role (`owner` / `staff`), is_active, failed_attempts, locked_until | Usernames are unique |
| `sessions` | token_hash, user_id, expires_at, last_seen_at | Only a hash of the token is stored |
| `products` | name, brand_id, category_id, hsn, gst_rate_bp, unit, show_on_website, is_active | `gst_rate_bp` is in basis points (1800 = 18%) |
| `product_variants` | product_id, size_label, sku, selling_price_paise, price_includes_gst, stock_qty, min_stock_qty, is_active | `stock_qty` is a cached total of the movements |
| `stock_movements` | variant_id, qty_change, reason (`OPENING` / `PURCHASE` / `SALE` / `CANCEL` / `ADJUSTMENT`), ref_type, ref_id, note, created_by, created_at | **Append-only** |
| `customers` | name, phone, gstin, state_code, address | GSTIN is validated and its first 2 digits become the state code |
| `invoice_counters` | financial_year (e.g. `2026-27`), last_seq | Row-locked when a number is allocated |
| `invoices` | number, financial_year, seq, type (`GST` / `SIMPLE`), customer snapshot (name, gstin, state), place_of_supply, subtotal, discount, cgst, sgst, igst, round_off, total (all paise), payment_mode (`CASH` / `UPI` / `CARD`), upi_ref, status (`ACTIVE` / `CANCELLED`), cancel_reason, cancelled_by, cancelled_at, created_by, created_at | Amounts are **immutable** after saving |
| `invoice_items` | invoice_id, variant_id, **snapshot** of name, size, hsn, gst_rate_bp, qty, unit_price, discount, taxable, cgst, sgst, igst, line_total | Snapshots mean editing a product never changes old bills |
| `audit_log` | user_id, action, entity, entity_id, before (jsonb), after (jsonb), at | Append-only |
| `publish_log` | user_id, at, commit_sha, products_count, status, error | |
| `backup_log` | kind (`WAL` / `NIGHTLY` / `MANUAL` / `RESTORE_TEST`), started_at, finished_at, status, file, size_bytes, checksum, error | Written by the scripts and shown on the dashboard |

### Integrity rules enforced by the database

- **Money:** whole **paise** in `bigint` columns, never floating point.
- **Unique constraints:** `invoices(financial_year, seq)` and `invoices(number)` are unique.
- **Triggers:**
  - A trigger **blocks `DELETE`** on `invoices`, `invoice_items`, `stock_movements` and `audit_log`.
  - A trigger **blocks `UPDATE`** of amount columns on `invoices` and `invoice_items`. Only status and cancel fields may change, and only from `ACTIVE` to `CANCELLED`.
- **Check constraints:**
  - `gst_rate_bp` must be one of 0, 500, 1200, 1800 or 2800 (stored in config, editable if GST rates change).
  - Quantities are greater than 0 on invoice items.
- **Negative stock:** blocked by default (a setting can allow it, and every change is logged).

---

## 6. Key flows

### 6.1 Saving a bill (one transaction)

```mermaid
sequenceDiagram
  participant UI as Billing screen
  participant SA as Server action saveInvoice
  participant D as domain gst and money
  participant DB as PostgreSQL
  UI->>SA: items, customer, discount, payment mode
  SA->>SA: check session and role, validate with Zod
  SA->>D: calculate lines, tax split, round off
  D-->>SA: totals in paise
  SA->>DB: BEGIN
  SA->>DB: SELECT invoice_counters FOR UPDATE
  SA->>DB: INSERT invoice and invoice_items
  SA->>DB: INSERT stock_movements (SALE) and UPDATE stock_qty
  SA->>DB: INSERT audit_log
  SA->>DB: COMMIT
  SA-->>UI: invoice id and number
  UI->>UI: open print view or WhatsApp
```

If any step fails, the whole transaction rolls back: no number is used, no stock moves, and nothing is half-saved.

### 6.2 GST calculation rules (domain/gst.ts)

1. Per line: `net = qty × unit_price − line_discount`. If the price includes GST, take tax out with `taxable = round(net × 10000 / (10000 + rate_bp))`. Otherwise `taxable = net`.
2. **Intra-state** (customer state = shop state 27, or no GSTIN): `cgst = round(taxable × rate_bp / 2 / 10000)`, and `sgst` is calculated the same way.
3. **Inter-state** (customer GSTIN state is not 27): `igst = round(taxable × rate_bp / 10000)`.
4. A bill-level discount is spread across lines in proportion to their value before tax, and any leftover paise go to the largest line.
5. `total = Σ(taxable + taxes)`, rounded to the nearest rupee with a visible **Round off** line.
6. All rounding is **half-up to the paise**. Every rule is covered by unit tests with known examples checked by the CA.

### 6.3 Cancelling a bill

`status = CANCELLED` with a reason. Reverse `CANCEL` stock movements are added. The invoice number is never reused, and the bill still prints with a **CANCELLED** watermark.

### 6.4 WhatsApp receipt (free)

1. The print view renders a receipt image, which is copied with `navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])`. `localhost` counts as a secure context, so this is allowed.
2. The app opens `https://wa.me/91<customer phone>?text=<bill summary>`, and the owner presses **Ctrl+V** and **Send**.
3. **Fallback:** save the PDF from the print dialog and attach it manually.

### 6.5 Publish to website

```mermaid
sequenceDiagram
  participant O as Owner
  participant PS as publish-service
  participant GH as GitHub API
  participant V as Vercel
  O->>PS: Publish (with preview of changes)
  PS->>PS: build public JSON with whitelisted fields only
  PS->>PS: validate with the website Product schema
  PS->>GH: PUT contents src/data/products.json on main
  GH-->>PS: commit sha
  GH->>V: push triggers build and deploy
  PS->>PS: write publish_log
```

**Fields that can be published:** id, name, brand, category, type, description, sizes, priceFrom, unit, image, featured and `inStock` (true or false only).

**Never published:** stock quantities, cost data, customers, bills and users.

---

## 7. Data protection design (no data loss)

| Layer | Protects against | Mechanism | Worst-case loss |
|-------|------------------|-----------|-----------------|
| Transactions + PostgreSQL WAL | App crash, power cut | ACID transactions, `fsync=on`, `synchronous_commit=on` | 0 committed bills |
| Append-only ledger + triggers | Mistakes, misuse | No deletes; cancel only; audit log | 0 (history kept) |
| WAL archiving to second disk/USB | Main disk failure | `archive_mode=on`, `archive_timeout=60s`, base backup weekly | About 1 minute |
| Nightly encrypted full backup | Corruption, ransomware on the live DB | `pg_dump -Fc`, SHA-256 checksum, 7-Zip AES-256, copied to second disk and Google Drive folder | Up to 1 day (WAL covers the gap if the second disk survives) |
| Off-site copy (Google Drive) | Fire, theft, both local disks lost | Google Drive for desktop sync | Up to 1 day |
| Retention | Problem found late | 30 daily + 12 monthly + WAL for 14 days | n/a |
| Monitoring | Silent backup failure | `backup_log` + red dashboard banner if a backup failed or is older than 26 hours | n/a |
| Restore testing | Backups that don't actually work | Monthly automated restore into `shopdb_restore_test`, with row counts compared | n/a |
| UPS | Hardware damage from power cuts | Hardware | n/a |

**Recovery targets:** RPO about 1 minute (second disk available) or 24 hours (off-site only). RTO under 1 hour on the same PC, or under 4 hours on a replacement PC.

**Backup encryption password:** created at go-live, printed, and kept by the owner in a sealed envelope. Without it, off-site backups can't be restored.

---

## 8. Configuration

| Setting | Where | Example |
|---------|-------|---------|
| `DATABASE_URL` | `config\.env` | `postgres://shop_app:***@127.0.0.1:5432/shopdb` |
| `SESSION_SECRET` | `config\.env` | 32+ random bytes, generated at install |
| `GITHUB_TOKEN` | `config\.env` | Fine-grained token, single repo, contents write |
| `HOSTNAME` / `PORT` | WinSW XML | `127.0.0.1` / `3000` |
| Shop profile, UPI ID, invoice prefix | `shop_settings` table, Settings screen | `SB` |

---

## 9. Observability

- **Structured logs** (JSON lines) go to `logs\`, rotated daily by WinSW and kept for 30 days. Passwords, tokens and full customer phone numbers are never logged.
- `GET /api/health` checks database connectivity and the last backup age. The dashboard uses it.
- Errors are shown to the user as plain-language messages with a reference ID that matches the log line.

---

## 10. Architecture decisions (summary)

| # | Decision | Reason | Alternatives rejected |
|---|----------|--------|-----------------------|
| 1 | Next.js for Shop Manager | One language and stack with the website | ASP.NET Core (a second stack), PHP/XAMPP |
| 2 | PostgreSQL | Point-in-time recovery, strong integrity, free | MySQL/XAMPP (weaker PITR tooling), SQLite (harder continuous backup on Windows) |
| 3 | Drizzle + `pg` | No native binaries, so the app folder is portable | Prisma (native engine to bundle) |
| 4 | Portable Node + WinSW | No Node install, real Windows Service with restart | PM2 on Windows (unreliable startup) |
| 5 | Integer paise | Exact money arithmetic | Floating point |
| 6 | Snapshot bill lines | Old bills never change when products change | Join to live product data |
| 7 | Publish via GitHub commit | Free, versioned, and Vercel rebuilds automatically | Hosted DB/API (cost, internet dependency) |
| 8 | Semi-automatic WhatsApp | Free and within WhatsApp terms | Business API (paid), unofficial automation (ban risk) |
