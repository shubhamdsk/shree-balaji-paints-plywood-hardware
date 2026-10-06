# Sprint Plan: Shree Balaji Website + Billing Software

**Customer:** Shree Balaji Paints Plywood and Hardware, Kotul
**Prepared by:** Shubham Deshmukh · Phone / WhatsApp: +91 72184 38401
**Duration:** 5 sprints of 1 week each (about 5 weeks), plus 1 month of free support after go-live
**Live website:** [shree-balaji-paints-plywood-hardwar.vercel.app](https://shree-balaji-paints-plywood-hardwar.vercel.app/)

Technical documents: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Scalability](SCALABILITY.md) · [Coding standards](CODING-STANDARDS.md)

---

## 1. What we are delivering

| Part | What it does | Where it runs |
|------|--------------|---------------|
| **Website** (already live) | Product catalogue, WhatsApp and call buttons, Google Maps | Online, free hosting (Vercel) |
| **Billing software "Shop Manager"** (new) | GST billing, products, stock, payment records, reports | On the shop computer, **works without internet** |
| **Publish to website** | One click updates products, prices and in-stock status online | Needs internet only when publishing |
| **Data safety** | Data kept in 3 places: shop computer, second disk, Google Drive | Automatic |

---

## 2. Roles

| Role | Person | Responsibilities |
|------|--------|------------------|
| Product owner | Shop owner | Explains needs, gives feedback at each demo, approves each sprint |
| Developer and project lead | Shubham Deshmukh | Design, build, testing, installation, training, support |
| GST reviewer | Shop's CA | Checks the invoice format and GST summary (Sprint 3) |
| Users | Owner and counter staff | Use the billing screens and report problems |

## 3. How each sprint works

| Day | Activity |
|-----|----------|
| Day 1 | **Sprint planning (15 minutes):** confirm this week's stories and any changes from the last demo |
| Days 1-5 | Build and test. Short WhatsApp updates every evening |
| Day 6 | **Demo (30-45 minutes)** on the developer's laptop (Sprints 1-4) or the shop PC (Sprint 5). Owner tries the features himself |
| Day 6 | **Feedback and approval:** owner ticks the "Done when" checklist and confirms on WhatsApp |

- **Definition of Ready (before a story is built):** the owner has explained it, the screens or fields are agreed, and any sample data (bill, item list) is available.
- **Definition of Done (before a story is shown as done):**
  - It works as described, and its acceptance criteria pass.
  - Automated tests pass and lint is clean.
  - It's checked for security (login and role, input validation) and works with the keyboard.
  - It's demonstrated to the owner.
- **Change requests:**
  - Small changes to an agreed feature are added to the next sprint.
  - Anything new goes to the "Later" list (section 10) and is quoted separately, so the agreed timeline stays safe.

## 4. Sprint overview

| Sprint | Week | Goal | Main result |
|--------|------|------|-------------|
| 1 | Week 1 | Foundation, products and stock | Login, all items imported with prices and GST, stock in, low-stock alert |
| 2 | Week 2 | GST billing and payments | GST and simple bills, payment mode recorded, UPI QR, thermal and A4 print, WhatsApp receipt |
| 3 | Week 3 | Reports and CA review | Dashboard, sales, payment-mode, GST and stock reports, Excel export, CA approval |
| 4 | Week 4 | Data safety | Backups every minute (second disk) and nightly (Google Drive), restore tested |
| 5 | Week 5 | Website link, installation, go-live | Publish to website, software running in the shop, staff trained |

---

## 5. Sprint 1: Foundation, products and stock (Week 1)

**Sprint goal:** the owner can log in, all his items are in the software with correct prices and GST, and stock can be added.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-1.1 | Owner | Log in with my username and password | Only my team can use the billing software |
| US-1.2 | Owner | Create a staff login with limited access | Staff can bill but can't change prices or see reports |
| US-1.3 | Owner | Enter my shop details (name, GSTIN, address, phone, UPI ID, invoice prefix) | They print correctly on every bill |
| US-1.4 | Owner | Add and edit products with brand, category, sizes, price, GST rate, HSN and unit | Billing uses the correct price and tax |
| US-1.5 | Owner | Import my item list from Excel | I don't have to type hundreds of items |
| US-1.6 | Owner and staff | Add stock when goods arrive | Stock in hand is correct |
| US-1.7 | Owner | Set a minimum stock level and see a low-stock alert | I reorder before items run out |
| US-1.8 | Owner | Choose which products show on the website | Only the products I want are online |

### Acceptance criteria (highlights)

- **US-1.1:**
  - A wrong password shows "Incorrect username or password".
  - After 5 wrong tries, the account locks for 15 minutes.
  - The app logs out after 2 hours without use.
- **US-1.4:**
  - GST rate can be chosen only from 0, 5, 12, 18 or 28%.
  - HSN must be 4-8 digits.
  - Price can be marked "includes GST" or "excludes GST".
  - Every size has its own price and stock.
- **US-1.5:**
  - Upload an `.xlsx` or `.csv` file and preview the first 20 rows.
  - Rows with errors are listed with a reason (for example "GST rate 15% not allowed").
  - Only valid rows are imported, and a summary shows how many were imported and how many skipped.
- **US-1.6:** each stock-in adds a record with date, quantity, user and note. The stock quantity updates immediately.
- **US-1.7:** items at or below their minimum show in red on the product list and in the alert panel.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | Meet the owner: walk through his current billing app, collect a sample GST bill, GSTIN and item list. Agree and sign the **feature match list** |
| 1-2 | Create the `shree-balaji-shop-manager` project, the PostgreSQL database and the schema (users, sessions, settings, categories, brands, products, variants, stock movements, audit log). Set up CI |
| 2 | Login, sessions, lockout, owner and staff roles, shop settings screen |
| 3 | Product and size screens (list, search, create, edit, deactivate) |
| 4 | Excel/CSV import with preview and error report. Stock-in screen and stock ledger |
| 5 | Low-stock alert, "Show on website" flag, tests, fixes |
| 6 | **Demo** and approval |

### Technical and security tasks

- Next.js 16 standalone setup, Drizzle schema and first migration, plus the `shop_app` and `shop_backup` database roles.
- Passwords hashed with scrypt. The session token hash is stored in the database, with an `HttpOnly` and `SameSite=Strict` cookie.
- The server listens on `127.0.0.1` only, and secrets are kept in `.env` (not in Git).
- Zod validation on every form. Every change is written to the audit log.
- `domain/money.ts`, with all money as integer paise.

### Tests

- Unit tests: money helpers, GSTIN and HSN validation, import row validation.
- Integration tests: create a product with sizes, import 500 rows, stock-in updates the quantity and writes the ledger.
- Security tests: staff can't open product edit or settings, lockout after 5 failures, logged-out users are redirected to login.

### Demo script (owner tries it)

1. Log in as owner, then try a wrong password 5 times on the staff account to see the lock.
2. Fill in the shop details.
3. Import the Excel item list and look at the error report.
4. Edit one product's price and GST rate.
5. Add stock for 3 items, then reduce one item's minimum level and see the alert.

### What we need from the owner

- 30-45 minutes on Day 1 to show the current billing app.
- A sample GST bill, the GSTIN and the shop UPI ID.
- The item list exported to Excel from the current app (or photos of the item register).

### Done when

- [ ] The owner and staff logins work, with correct access.
- [ ] Shop details are saved.
- [ ] Items are imported with correct prices, GST and HSN.
- [ ] Stock-in updates quantities, and the stock history is visible.
- [ ] The low-stock alert works.
- [ ] The **feature match list** is signed by the owner.

---

## 6. Sprint 2: GST billing and payments (Week 2)

**Sprint goal:** every kind of bill the shop makes today can be made, printed and sent on WhatsApp.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-2.1 | Staff | Search an item by name, size or code and add it with quantity | Billing at the counter is fast |
| US-2.2 | Staff | Make a **GST tax invoice** for a customer with a GSTIN | Business customers can claim input tax |
| US-2.3 | Staff | Make a **simple bill** for walk-in customers | Small sales are quick |
| US-2.4 | System | Use CGST and SGST for Maharashtra customers, and IGST for other states | Tax is always correct |
| US-2.5 | Staff | Give a discount on a line or the whole bill | The final amount matches what we agreed |
| US-2.6 | Staff | **Record the payment mode** (cash, UPI or card), and optionally the UPI reference | Reports show how money came in, with no payment gateway |
| US-2.7 | Customer | Scan a **UPI QR** printed on the bill with the amount filled in | I can pay directly to the shop's account |
| US-2.8 | Staff | Print a **small receipt (80mm)** or a **full A4 invoice**, or save as PDF | Every customer gets a proper bill |
| US-2.9 | Staff | **Send the bill on WhatsApp** for free | The customer gets a digital copy |
| US-2.10 | Owner | Cancel a wrong bill with a reason, without deleting it | Records stay complete and honest |
| US-2.11 | Staff | Save customers with name, phone, GSTIN and state | Repeat customers are quick to bill |
| US-2.12 | System | Reduce stock automatically when a bill is saved | Stock is always correct |

### Acceptance criteria (highlights)

- **US-2.1:** search results appear within a fraction of a second. Billing works fully with the keyboard: `F2` search, `Enter` add, `Ctrl+S` save, `Ctrl+P` print.
- **US-2.2 and US-2.4:**
  - The invoice shows the shop GSTIN, customer GSTIN, place of supply, HSN, taxable value and tax.
  - A customer GSTIN starting with `27` gets CGST and SGST. Any other state code gets IGST.
- **Numbering:** invoices are numbered per financial year (for example `SB/2026-27/0001`), with no gaps and no duplicates, and restart on 1 April.
- **Totals:** rounded to the nearest rupee, with a visible **Round off** line.
- **US-2.6:** a bill can't be saved without a payment mode. A UPI reference is optional, up to 30 characters.
- **US-2.7:** the QR uses the shop UPI ID from settings, and the bill amount is filled in.
- **US-2.9:**
  - **Send on WhatsApp** copies the bill image and opens the customer's chat with a short message (shop name, bill number, amount).
  - The staff member presses **Ctrl+V** and **Send**.
  - If pasting isn't supported, the PDF fallback is offered.
- **US-2.10:**
  - Only the owner can cancel, and a reason is required.
  - A cancelled bill stays in the list, marked **CANCELLED**, and its stock is added back.
  - The invoice number is never reused.
- **US-2.12:** a bill can't be saved if it would make stock negative, unless the owner has allowed this in settings.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | GST calculation module with unit tests (intra/inter-state, inclusive/exclusive price, discounts, rounding) |
| 2 | Billing screen: search, cart, quantities, discounts, customer selection or quick-add, payment mode |
| 3 | Save bill in one transaction (number, items, stock, audit). Customers screen. Cancel bill |
| 4 | Print layouts: 80mm thermal and A4, with UPI QR, PDF via the print dialog, reprint |
| 5 | WhatsApp receipt (image copy and chat link, plus PDF fallback). End-to-end tests and fixes |
| 6 | **Demo** and approval |

### Technical and security tasks

- `domain/gst.ts` and `domain/invoice-number.ts` as pure functions, with 100% branch test coverage.
- The bill save runs in one database transaction, with the invoice counter locked using `SELECT ... FOR UPDATE`.
- Bill lines store a **snapshot** (name, HSN, rate, price), so later product edits never change old bills.
- Database triggers block deleting bills and changing saved amounts. Only the owner's cancel action is allowed.
- Zod schemas for every billing input, an Origin check on data-changing routes, and audit entries for save, cancel and reprint.

### Tests (examples)

| # | Case | Expected |
|---|------|----------|
| T2-1 | 2 x paint at Rs 500 (excl. GST) at 18%, Maharashtra customer | Taxable Rs 1,000.00, CGST Rs 90.00, SGST Rs 90.00, total Rs 1,180 |
| T2-2 | Same as T2-1 for a Gujarat GSTIN (state 24) | IGST Rs 180.00, total Rs 1,180 |
| T2-3 | Price Rs 1,180 including 18% GST | Taxable Rs 1,000.00, tax Rs 180.00 |
| T2-4 | Total Rs 1,234.56 | Round off +Rs 0.44, total Rs 1,235 |
| T2-4b | Total Rs 1,234.49 | Round off -Rs 0.49, total Rs 1,234 |
| T2-5 | Two bills saved at the same moment | Two different consecutive numbers, no duplicates |
| T2-6 | Cancel a bill | Status CANCELLED, stock restored, number not reused |
| T2-7 | Staff tries to cancel | Blocked with a "Not allowed" message |
| T2-8 | Stock 2, bill for 3 | Blocked: "Only 2 in stock" |

### Demo script

1. Make a simple bill for a walk-in customer, paid by cash, and print the thermal receipt.
2. Make a GST invoice for a Maharashtra business customer, paid by UPI with the QR. Print it on A4.
3. Make a GST invoice for an out-of-state GSTIN and check that IGST shows.
4. Send a bill on WhatsApp to the owner's own number.
5. Cancel a bill as owner, then try to cancel as staff.
6. Check that stock went down after the bills and came back after the cancel.

### What we need from the owner

- The shop UPI ID, and a test UPI payment of Rs 1 to confirm the QR works.
- The printer model, or the printer itself if already bought.
- 2-3 real past bills (any type) to compare totals.

### Done when

- [ ] GST invoices and simple bills are correct, compared against past bills.
- [ ] CGST/SGST and IGST are chosen correctly.
- [ ] The payment mode is saved on every bill, and the UPI QR works.
- [ ] Thermal and A4 printing work, and PDF saving works.
- [ ] The WhatsApp receipt works on the shop's WhatsApp.
- [ ] Cancel works with a reason, and cancelled bills stay visible.
- [ ] Stock updates correctly.

---

## 7. Sprint 3: Reports and CA review (Week 3)

**Sprint goal:** the owner sees how the shop is doing, and the CA gets everything needed for GST filing.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-3.1 | Owner | See a dashboard with today's sales, bill count, sales by payment mode and low-stock items | I know the day's position at a glance |
| US-3.2 | Owner | See daily and monthly sales for any date range | I can track growth |
| US-3.3 | Owner | See **sales by payment mode** (cash, UPI, card) | I can match cash in the drawer and UPI in the bank |
| US-3.4 | Owner and CA | Get a **GST summary** by tax rate and by HSN for any month | GST returns are easy to file |
| US-3.5 | Owner | See a stock report and low-stock list | I know what to reorder |
| US-3.6 | Owner | See top-selling items | I know what sells best |
| US-3.7 | Owner | Download any report to Excel | I can share it with my CA |
| US-3.8 | Owner | See the list of bills with filters (date, type, payment mode, status) | I can find any bill quickly |

### Acceptance criteria (highlights)

- Report totals exactly match the sum of active bills. Cancelled bills are excluded, and listed separately.
- The GST summary shows, per rate and per HSN: taxable value, CGST, SGST, IGST and total. B2B (with GSTIN) and B2C are shown separately.
- Excel files open in Excel with correct numbers (no "number stored as text") and Indian date format (DD-MM-YYYY).
- Reports and the dashboard totals are visible to the **owner only**.
- With 3 years of test data, any report opens in under 2 seconds.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | Dashboard, bill list with filters |
| 2 | Sales report (daily and monthly) and sales by payment mode |
| 3 | GST summary by rate and HSN (B2B and B2C), stock and top-items reports |
| 4 | Excel/CSV exports, performance test with 3 years of generated data, indexes |
| 5 | Send a sample invoice and the GST summary to the CA, then fix anything from the review |
| 6 | **Demo** and approval |

### Technical and security tasks

- Reports are done with SQL aggregates, on indexed date, status and payment-mode columns.
- A seed script generates about 150,000 fake bills for performance testing (never real data).
- CSV exports are protected against formula injection, and exports are owner-only.
- Logs mask phone numbers and GSTINs.

### Tests

- Report totals equal the sum of the bills in integration tests, including cancelled bills, discounts and round-off.
- Changing the date range at month and financial-year boundaries (31 March to 1 April) gives correct results.
- Staff get "Not allowed" for reports and exports.

### Demo script

1. Open the dashboard after the test bills from Sprint 2.
2. View this month's sales by payment mode and compare with the bills.
3. Open the GST summary and download it to Excel.
4. View low stock and top items.

### What we need from the owner

- The CA's review of one sample GST invoice and one month's GST summary. Photos or a call are fine.

### Done when

- [ ] The dashboard and all reports show correct totals.
- [ ] Excel downloads work.
- [ ] **The CA has approved** the invoice format and GST summary.
- [ ] Reports are fast with large data.

---

## 8. Sprint 4: Data safety (Week 4)

**Sprint goal:** shop data survives a power cut, a crash, a disk failure, a virus or theft.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-4.1 | Owner | Have every change copied to a second disk or USB drive **every minute** | A disk failure loses at most about 1 minute of work |
| US-4.2 | Owner | Have an **encrypted full backup saved to Google Drive every night** | My data is safe even if the computer is stolen or damaged |
| US-4.3 | Owner | See when the last backup ran, and get a **red warning** if something is wrong | I know my data is safe without checking files |
| US-4.4 | Owner | Press **Backup now** before closing the shop | I can make an extra copy any time |
| US-4.5 | Owner (with developer) | Restore the data from any backup | The shop can recover quickly |
| US-4.6 | System | Test a restore automatically every month | Backups are proven to work |
| US-4.7 | Owner | See a history of every change to bills, stock and prices | Nothing can be hidden or lost |

### Acceptance criteria (highlights)

- WAL files appear on the second disk within about 1 minute of new bills.
- The nightly backup file:
  - Is encrypted (it can't be opened without the password).
  - Has a checksum recorded.
  - Appears in both the second-disk folder and the Google Drive folder.
- Old backups are removed automatically: 30 daily and 12 monthly are kept.
- The red dashboard banner appears if the last backup failed, is older than 26 hours, or the backup disk is missing.
- A test restore on a separate test database brings back exactly the same number of bills, items and stock records.
- The audit log shows who changed what and when, with before and after values for prices and stock adjustments.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | PostgreSQL WAL archiving to the second disk, weekly base backup |
| 2 | Nightly backup script (`pg_dump`, checksum, 7-Zip AES-256, copy to disk and Google Drive), retention cleanup, Task Scheduler jobs |
| 3 | Backup log, dashboard status banner, Backup now button |
| 4 | Restore script (full and point-in-time), automatic monthly restore test |
| 5 | Audit log screen for the owner. **Disaster drill:** delete the test database and restore it from backup |
| 6 | **Demo** and approval |

### Technical and security tasks

- Backup scripts run as the restricted `shop_backup` role.
- Backup encryption password: generated once, stored securely for the scheduled job, and **printed for the owner's sealed envelope**.
- The restore procedure is written step by step and printed (see [Architecture § 7](ARCHITECTURE.md#7-data-protection-design-no-data-loss)).

### Tests

| # | Case | Expected |
|---|------|----------|
| T4-1 | Pull the power plug while saving a bill (on the test machine) | After restart, the bill is either fully saved or not saved at all, never half |
| T4-2 | Remove the USB backup drive | The red warning appears within a day, and the backup log shows the error |
| T4-3 | Restore last night's backup to the test database | Row counts match |
| T4-4 | Point-in-time restore to 5 minutes ago | Bills up to that time are present |
| T4-5 | Open the backup file without the password | Not possible |

### Demo script

1. Show the backup status on the dashboard, then press Backup now.
2. Show the backup files on the USB drive and in Google Drive.
3. Unplug the USB drive and show the warning.
4. Run a restore test and compare the counts.

### What we need from the owner

- A **UPS** for the shop computer, strongly recommended.
- A **USB backup drive** (or a second internal disk).
- A **Google account** for Google Drive (free), with 2-step verification on.

### Done when

- [ ] Backups run automatically to the second disk and Google Drive.
- [ ] The dashboard shows the backup status and warns on problems.
- [ ] A test restore and the disaster drill succeeded.
- [ ] The owner has the printed restore guide and the backup password in a sealed envelope.

---

## 9. Sprint 5: Website link, installation and go-live (Week 5)

**Sprint goal:** the software runs in the shop, is connected to the website, and the team is trained.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-5.1 | Owner | Press **Publish to website** and see what will change first | The website shows my current products, prices and stock status |
| US-5.2 | Customer | See "In stock" or "Out of stock" on the website | I know before I visit or call |
| US-5.3 | Owner | Have the software start automatically when the computer starts | Billing is always ready |
| US-5.4 | Owner and staff | Open billing from a desktop shortcut | It's easy for everyone |
| US-5.5 | Owner and staff | Get training and a short user guide | We can use everything confidently |

### Acceptance criteria (highlights)

- **Publish (US-5.1):**
  - A preview lists new, changed and hidden products before publishing.
  - Only products marked "Show on website" are sent.
  - **Stock quantities, customers and bills are never sent.**
  - The website updates within about 5 minutes, and the last publish time and result show in settings.
  - If publishing fails (no internet), a clear message appears and nothing breaks.
- **Website (US-5.2):** shows only "In stock" or "Out of stock", never the quantity.
- **Auto-start (US-5.3):** the software opens after a restart without anyone logging in to start it, and restarts by itself if it ever stops.
- **Training (US-5.5):** both owner and staff complete the checklist (make bills, print, WhatsApp, stock-in, reports, Backup now, what to do if the red warning appears).

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | Website switches from built-in demo products to the published product list. Publish feature with preview |
| 2 | Publish testing (add, edit, hide products), website build validation, security headers on the website |
| 3 | **Installation at the shop:** PostgreSQL, the billing app as a Windows Service, desktop shortcut, printer setup, backup jobs, Google Drive, PC security checklist |
| 4 | Import final items and opening stock with the owner. First real publish. Restore drill on the shop PC |
| 5 | **Training** (owner and staff, about 1 hour), user guide handover. Go-live: real billing starts |
| 6 | **Final demo**, go-live sign-off, start of free support |

### Technical and security tasks

- GitHub token limited to the website repository with content-write permission only, stored in the restricted settings file, with a renewal reminder before expiry.
- Publish sends only whitelisted fields, validated against the website's product format before sending. A bad file can never go live.
- The billing service runs under its own Windows account, and is reachable only from the shop computer itself.
- The PC security checklist from [Security § 3.8](SECURITY.md#38-shop-pc-hardening-go-live-checklist) is completed.

### Go-live checklist

- [ ] The billing software starts after a restart, and the shortcut works.
- [ ] Test bills are cleared from the live database, and invoice numbering starts at 0001.
- [ ] Real items and opening stock are entered, and the owner has checked 10 random items.
- [ ] The thermal and A4 printers print correctly.
- [ ] The WhatsApp receipt works on the shop's WhatsApp.
- [ ] Backups are running: the second disk and Google Drive both have today's backup.
- [ ] The restore drill passed on the shop PC.
- [ ] Publish updated the live website correctly.
- [ ] The owner has the printed user guide, restore guide and sealed backup password.
- [ ] The owner and staff are trained.

### Done when

- [ ] Everything in the go-live checklist is ticked.
- [ ] The owner signs the go-live approval.

---

## 10. Not included (can be added later, quoted separately)

- Udhaar / credit tracking (khata)
- Payment gateway or automatic payment confirmation
- Fully automatic WhatsApp sending (needs the paid WhatsApp Business API)
- Sales returns and credit notes
- Profit report and supplier accounts
- Using the software on a second computer
- Barcode scanning
- Owner's mobile view of sales
- E-invoice and e-way bill
- Online orders from the website

The system is designed so these can be added later without rebuilding (see [Scalability](SCALABILITY.md)).

## 11. Things to buy (paid directly by the shop)

| Item | Approximate cost | Why |
|------|------------------|-----|
| 80mm thermal receipt printer (USB) | Rs 3,000 - 6,000 | Fast counter receipts (recommended) |
| UPS for the computer | about Rs 3,000 | Protects the computer and data during power cuts (strongly recommended) |
| USB backup drive | Rs 500 - 800 | Second copy of data, if the computer has no second disk |
| Custom website name (optional) | about Rs 1,000 per year | For example shreebalaji.in |

**Hosting and software fees: Rs 0 per year.**

## 12. Risks and how we handle them

| Risk | Impact | How we handle it |
|------|--------|------------------|
| Features from the old app are missed | Owner unhappy | Feature match list signed in Sprint 1 |
| GST calculation mistakes | Wrong tax filing | Automated tests, comparison with past bills, CA approval in Sprint 3 |
| Item list is incomplete or messy | Wrong prices at go-live | Import error report, owner checks 10 random items before go-live |
| Printer not bought in time | Can't print receipts | A4 printing and PDF work with any printer; thermal is added when it arrives |
| Backup drive unplugged, or Google Drive signed out | Off-site copy missing | Red dashboard warning, plus monthly check during support |
| Power cuts | Hardware damage | UPS. Database designed to never keep half-saved bills |
| New requests during the build | Delay | "Later" list, quoted separately |

## 13. After go-live

- **First month: free support.** Bug fixes, small adjustments and questions on WhatsApp or phone.
- **After that: optional yearly support.** Backup checks, small fixes, GST rate changes, financial-year start (1 April) check, and token renewal.

## 14. Sign-off

| Sprint | Approved by owner (name / date) | Notes |
|--------|----------------------------------|-------|
| Sprint 1 - Foundation, products and stock | | |
| Sprint 2 - GST billing and payments | | |
| Sprint 3 - Reports and CA review | | |
| Sprint 4 - Data safety | | |
| Sprint 5 - Go-live | | |
