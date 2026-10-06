# Security

How the website and the Shop Manager billing software are protected. This covers the threat model, controls, secrets, and the security checks done in each sprint.

Related: [Architecture](ARCHITECTURE.md) · [Coding standards](CODING-STANDARDS.md) · [Sprint plan](SPRINT-PLAN.md)

---

## 1. What we protect

| Asset | Why it matters |
|-------|----------------|
| Bills, GST data, stock | Legal records for GST, and the shop's business data |
| Customer details (name, phone, GSTIN) | Personal data, which must not leak |
| Owner and staff passwords | Control of the billing software |
| GitHub token | Could change the public website |
| Backup files and their encryption password | A full copy of all data |
| Public website | The shop's reputation |

## 2. Threat model (main risks)

| Threat | Example | Main controls |
|--------|---------|---------------|
| Someone on the network opens the billing app | Customer on shop Wi-Fi | App bound to `127.0.0.1`. Firewall. No open ports |
| Unauthorised person uses the shop PC | Walk-in, ex-staff | Windows password and auto-lock. App login. Session timeout. Disable users |
| Staff tampers with bills or stock | Deleting a cash bill | No deletes (DB triggers). Cancel needs a reason. Audit log. Owner-only reports |
| Password guessing | Repeated login tries | Account lockout. Strong hashing |
| Malware or ransomware on the PC | Encrypts the database | Encrypted off-site backups. WAL on a separate disk. Windows Defender and updates |
| PC stolen or disk fails | Data lost or read | Backups. BitLocker where available. Encrypted backups |
| Website defacement | Wrong prices online | Website is static. Publish token limited to one repo. Validation before publish. Git history allows rollback |
| Data leak to the website | Stock or customer data published | Whitelisted publish fields. Schema validation. Code review |
| Vulnerable dependency | npm package issue | Lockfile, `npm audit`, Dependabot, minimal dependencies |
| Injection (SQL, XSS) | Product name containing script | Parameterised queries (Drizzle). React escaping. No `dangerouslySetInnerHTML`. Zod validation |

---

## 3. Shop Manager controls

### 3.1 Network exposure

- The Next.js standalone server runs with `HOSTNAME=127.0.0.1`, so **only the shop PC itself** can open it.
- PostgreSQL uses `listen_addresses = 'localhost'`, and `pg_hba.conf` allows only `127.0.0.1/32` and `::1/128` with `scram-sha-256`.
- Windows Firewall stays on. No inbound rules are added for ports 3000 or 5432.
- The only outbound connections are to the GitHub API (Publish) and Google Drive (the sync client).

### 3.2 Authentication

- **Passwords:**
  - Hashed with Node's built-in `crypto.scrypt` (N=2^15, r=8, p=1, 16-byte random salt, 64-byte key). This needs no native dependency.
  - Compared with `crypto.timingSafeEqual`.
  - Minimum 8 characters. The owner sets the passwords at go-live.
- **Lockout:** after 5 failed attempts the account locks for 15 minutes. Every attempt is written to the audit log.
- **Sessions:**
  - The token is 32 random bytes from `crypto.randomBytes`, and only its SHA-256 hash is stored in `sessions`.
  - The cookie is `HttpOnly`, `SameSite=Strict` and `Path=/`. `Secure` isn't used because the app runs on `http://localhost` (traffic never leaves the PC).
  - Idle timeout is 2 hours, with an absolute lifetime of 12 hours.
  - **Logout** deletes the session row.
- Changing a password or disabling a user ends all of that user's sessions.

### 3.3 Authorisation

| Action | Owner | Staff |
|--------|:-----:|:-----:|
| Create bills, reprint, WhatsApp | Yes | Yes |
| Cancel bills | Yes | No |
| Add or edit products and prices | Yes | No |
| Stock-in | Yes | Yes |
| Stock adjustment (correction) | Yes | No |
| Reports and dashboard totals | Yes | No |
| Publish to website | Yes | No |
| Users, settings, backup and restore | Yes | No |

- Every Server Action and Route Handler calls `requireUser(role)` from `server/auth/guard.ts` **on the server**. Hiding a button is never the only protection.
- The `(shop)` layout redirects to `/login` when there's no valid session.

### 3.4 Input and output safety

- **Validation:** every Server Action and Route Handler input is parsed with a Zod schema, and unknown fields are rejected.
  - Typed constraints include GSTIN format (15 characters with checksum), Indian mobile number (10 digits), HSN (4-8 digits), GST rate (allowed list), and quantity (positive, at most 3 decimals).
- **Queries:** Drizzle query builder only (parameterised). Raw SQL is allowed only through Drizzle's `sql` template with bound parameters.
- **Output:** React escapes text, and `dangerouslySetInnerHTML` is banned by lint.
- **CSV injection:** CSV exports escape cells starting with `= + - @` by prefixing them with `'`.
- **CSRF:** Server Actions include Next.js's built-in Origin check. Route Handlers that change data check the `Origin` header equals `http://localhost:3000`, and the session cookie is `SameSite=Strict`.

### 3.5 Data integrity and audit

- Database triggers block `DELETE` on invoices, invoice items, stock movements and the audit log, and block changes to saved bill amounts (see [Architecture](ARCHITECTURE.md#integrity-rules-enforced-by-the-database)).
- **Audit log entries:**
  - Login, logout and failed login.
  - Create, cancel and reprint of a bill.
  - Product and price changes, with before and after values.
  - Stock adjustments.
  - Settings changes.
  - Publish, backup and restore.
- The audit log is visible to the owner only.

### 3.6 Database roles (least privilege)

| Role | Rights | Used by |
|------|--------|---------|
| `postgres` (superuser) | Everything | Installation and migrations only. The password is kept by the owner |
| `shop_app` | `SELECT`, `INSERT`, `UPDATE` on app tables. No `DELETE`. No DDL | The running app |
| `shop_backup` | `pg_read_all_data`, replication for base backups | Backup scripts |

### 3.7 Secrets

| Secret | Stored in | Protection |
|--------|-----------|------------|
| `DATABASE_URL` password, `SESSION_SECRET` | `C:\ShreeBalajiBilling\config\.env` | NTFS permissions allow only Administrators and the service account. Never committed to Git |
| `GITHUB_TOKEN` | Same `.env` | Fine-grained token: **one repository**, **Contents: read and write** only, **1-year expiry** (renewal reminder on the dashboard 30 days before) |
| Backup encryption password | Task Scheduler credential or the restricted `.env`, plus a printed copy in the owner's sealed envelope | AES-256 (7-Zip) |
| User passwords | Database (scrypt hash) | Never stored in plain text or logged |

- The repository has `.env*` in `.gitignore`. An `.env.example` without values documents the keys.
- Secret scanning (GitHub push protection) stays enabled on both repositories.

### 3.8 Shop PC hardening (go-live checklist)

- [ ] A Windows user account with a password. Screen auto-locks after 5 minutes.
- [ ] Windows Update and Microsoft Defender are on.
- [ ] BitLocker on the system and backup drives, if Windows Pro (recovery key printed for the owner).
- [ ] The service runs as a dedicated local account (`ShopBillingSvc`), not as Administrator.
- [ ] The UPS is connected.
- [ ] Google Drive for desktop is signed in to the shop's own Google account, with 2-step verification on.
- [ ] Remote-access tools are not installed unless the owner asks for them.

### 3.9 Logging rules

- Never log passwords, session tokens, the GitHub token, full GSTINs or full phone numbers (mask them as `98******01`).
- Logs stay on the PC, rotate daily, and are kept for 30 days.

---

## 4. Website controls

- **Static site** with no server code, database or user input. It has a very small attack surface.
- **Security headers:** add these with `headers()` in `next.config.ts`, after checking the Next.js 16 docs:
  - `Content-Security-Policy`, allowing self plus Google Maps embed and fonts.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy` (camera, microphone and geolocation off).
  - `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`).
- **Published data validation:** `src/data/products.json` is validated at build time. A bad publish fails the build, and the previous good version stays live.
- **Rollback:** any publish can be undone by reverting its commit on GitHub. Vercel redeploys the previous version.
- **Access control:**
  - The GitHub account and Vercel account have 2-step verification on.
  - Branch protection is on for `main`: pull request required, except for the publish token's commits to `src/data/products.json`.

---

## 5. Dependency and supply-chain security

- Commit `package-lock.json` and install with `npm ci`.
- Run `npm audit --omit=dev` in CI and before each release. High or critical issues block the release.
- Dependabot (GitHub, free) opens weekly update pull requests.
- Keep dependencies minimal and well known: Next.js, React, Tailwind, Drizzle, `pg`, Zod and a QR code library. Every new dependency needs a reason in the pull request.
- Download Node and PostgreSQL installers from their official sites only, and verify the checksums.

---

## 6. Personal data (customers)

- Collect only what's needed for bills: name, phone, GSTIN and address for B2B.
- Customer data never leaves the shop PC, apart from encrypted backups and the WhatsApp message the owner chooses to send.
- No customer data appears on the website.
- On request, a customer's contact details can be anonymised. Legal bill records are kept, as GST rules require.

---

## 7. Security checks per sprint

| Sprint | Security work |
|--------|---------------|
| 1 | Login, scrypt hashing, sessions, lockout, role guard, `.env` handling, DB roles, `127.0.0.1` binding |
| 2 | Zod schemas on all billing inputs, no-delete triggers, audit log, CSRF checks, CSV injection guard |
| 3 | Owner-only reports, masked logging, export permissions |
| 4 | Backup encryption, restricted backup role, restore test, password envelope |
| 5 | Fine-grained GitHub token, publish whitelist and validation, website security headers, PC hardening checklist, `npm audit` clean |

## 8. Reporting a problem

If anyone notices wrong data on the website, a login problem, or suspects misuse, contact Shubham Deshmukh on WhatsApp straight away. Don't try to fix the database by hand.
