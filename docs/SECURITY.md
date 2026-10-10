# Security

How the Shree Balaji website and its owner panel are protected: the threat model, controls, secrets, and the security checks in each sprint.

Related: [Architecture](ARCHITECTURE.md) · [Coding standards](CODING-STANDARDS.md) · [Sprint plan](SPRINT-PLAN.md)

---

## 1. What we protect

| Asset | Why it matters |
|-------|----------------|
| Owner login | Anyone with it can change prices, products and offers |
| Enquiries (customer names and phone numbers) | Personal data, which must not leak |
| Product, offer and gallery data | Wrong prices or offers damage the shop's reputation |
| Cloudflare, Neon, GitHub and Google accounts | Control of the hosting, code and Google listing |
| Backups | A full copy of the data, including enquiries |

## 2. Threat model (main risks)

| Threat | Example | Main controls |
|--------|---------|---------------|
| Password guessing | Repeated tries on `/admin/login` | Lockout after 5 failures, scrypt hashing, rate limit |
| Stolen session | Cookie copied from a shared phone | `HttpOnly`, `Secure`, `SameSite=Lax` cookie, hashed token, logout ends the session, password change ends all sessions |
| Admin action without login | Direct POST to a Server Action | `requireOwner()` on the server in every action and admin page |
| Enquiry data leak | Enquiries exposed in the API or a public page | Enquiries read only by owner-only pages. Never in `/api`, logs or the sitemap |
| Spam enquiries | Bots filling the form | Honeypot field, rate limit per address, server-side validation |
| Injection (SQL, XSS) | A product name containing script | Drizzle parameterised queries, React escaping, no `dangerouslySetInnerHTML`, Zod validation |
| Malicious upload | A script disguised as a photo | Type checked by content, size limit, images served through the image CDN, never executed |
| Vulnerable dependency | npm package issue | Lockfile, `npm audit` in CI, Dependabot, minimal dependencies |
| Account takeover of the host | Cloudflare, Neon or GitHub password stolen | 2-step verification on Cloudflare, Neon, GitHub and Google |

---

## 3. Owner panel controls

### 3.1 Authentication

- **Passwords:** hashed with Node's `crypto.scrypt` (16-byte random salt, 64-byte key), compared with `crypto.timingSafeEqual`. At least 10 characters. The owner replaces the starting password himself at `/admin/password`.
- **Lockout:** after 5 failed attempts the account locks for 15 minutes. Every attempt is written to the audit log.
- **Sessions:**
  - The token is 32 random bytes. Only an HMAC-SHA256 of it, keyed with `SESSION_SECRET`, is stored, so a leaked database copy can't be turned into a working cookie.
  - An unknown username takes as long to reject as a wrong password, and both get the same message.
  - The owner account is created from `ADMIN_USERNAME` and `ADMIN_INITIAL_PASSWORD` on the first login, and only while no account exists.
  - The cookie is `HttpOnly`, `Secure`, `SameSite=Lax` and `Path=/admin`.
  - Lifetime is 30 days, so the owner stays logged in on his own phone. Logout deletes the session.
  - Changing the password needs the current one. It keeps the session in use and ends every other one, so a lost phone is logged out.
  - Wrong current passwords count towards the login lockout. Reaching it ends every session, so a stolen cookie can't be used to guess the password.

### 3.2 Authorisation

- One role in v1: the owner. Every admin page, Server Action and admin Route Handler calls `requireOwner()` from `server/auth/guard.ts` **on the server**. Hiding a link is never the only protection.
- The `(panel)` layout redirects to `/admin/login` when there's no valid session.

### 3.3 Input and output safety

- Every action input is parsed with a Zod schema, and unknown fields are rejected. Typed constraints include phone (10-digit Indian mobile), dates, prices (positive whole rupees) and text lengths.
- Uploads: JPEG, PNG or WebP only, checked by file content. The browser accepts photos up to 8 MB and shrinks them before upload; the server rejects anything over 3 MB. Photos are stored under random keys and served from `/api/photos/[key]` with `nosniff`, and only keys matching the random-key pattern are read.
- The owner panel sends `noindex`, and `robots.txt` disallows `/admin` and `/api/` (uploaded photos stay allowed).
- Server Actions use Next.js's built-in Origin check against CSRF. Admin Route Handlers that change data check the `Origin` header.
- Deleting an offer, a gallery photo or hiding a product asks for confirmation through the shared `ConfirmDialog`.
- `/api/backup` accepts only a POST carrying an HMAC-SHA256 token derived from `SESSION_SECRET` (compared in constant time), so only the worker's own cron can start a backup. Backups contain enquiries (customer names and phones), live in the private bucket under `backups/`, never include password hashes or sessions, and can't be read through the photo route.

### 3.4 Audit

- Login, logout, failed login, and every create, edit, hide and delete of products, offers, gallery items and enquiry statuses are written to `audit_log`, with before and after values.

### 3.5 Secrets

| Secret | Stored in | Protection |
|--------|-----------|------------|
| `DATABASE_URL`, `SESSION_SECRET`, `AWS_*` storage keys | Cloudflare Worker secrets (`DATABASE_URL` is also a build variable) | Never committed. `.env*` is in `.gitignore`, and `.env.example` documents keys without values |
| `ADMIN_INITIAL_PASSWORD` | Cloudflare Worker secret | Used once; removed after the owner sets his own password |
| Owner password | Database (scrypt hash) | Never stored in plain text or logged |

GitHub secret scanning and push protection stay on.

### 3.6 Logging

- Never log passwords, session tokens, or customer names and phone numbers. Mask phone numbers as `98******01` where a log line needs a reference.

---

## 4. Public website controls

- **Security headers** are set on every response with `headers()` in `next.config.ts`:
  - `Content-Security-Policy`: only this site's own scripts, styles, images and fonts, plus the Google Maps embed (`frame-src https://www.google.com`). Pages are statically generated, so the policy follows the Next.js "without nonces" pattern and keeps `'unsafe-inline'` for scripts; `'unsafe-eval'` is added only in development.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy` with camera, microphone and geolocation off (the owner panel's photo upload uses a file input, which needs no permission).
  - `frame-ancestors 'none'`, so the site can't be embedded in another page.
- `robots.txt` and `sitemap.xml` are generated from the same services and `ROUTES` as the pages. `/api/` is excluded from crawling.
- `/admin` pages send `noindex` and are excluded from the sitemap and `robots.txt`.
- The public API returns only visible products and public fields. `in_stock` is true or false, never a quantity.

---

## 5. Dependency and supply-chain security

- Commit `package-lock.json` and install with `npm ci`.
- `npm audit --omit=dev` runs in CI. High or critical issues block a release.
- Dependabot opens weekly update pull requests.
- New dependencies (Drizzle, the Neon HTTP driver, `pg` for migrations, Zod, the OpenNext Cloudflare adapter, `aws4fetch` for photo storage) each need a reason in the pull request.

---

## 6. Personal data (customers)

- Enquiries collect only what's needed to reply: name, phone, product, quantity and message.
- The enquiry form says the details are used only to reply about the enquiry.
- Enquiries are deleted automatically after 12 months, and on request.
- Gallery photos showing people or recognisable homes are used only with permission.

---

## 7. Security checks per sprint

| Sprint | Security work |
|--------|---------------|
| 1 | Login, scrypt, sessions, lockout, `requireOwner()` guard, environment secrets, upload checks, audit log |
| 2 | Enquiry validation, honeypot and rate limit, owner-only inbox, confirmation before deletes, backup contents check |
| 3 | Security headers, `noindex` on admin, sitemap excludes admin, `npm audit` clean, owner sets his own password |

## 8. Reporting a problem

If anyone sees wrong prices, a login problem, or suspects misuse, contact Shubham Deshmukh on WhatsApp straight away.
