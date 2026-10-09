# Sprint Plan: Shree Balaji Website, Part 2

**Customer:** Shree Balaji Paints Plywood and Hardware, Kotul
**Prepared by:** Shubham Deshmukh · Phone / WhatsApp: +91 72184 38401
**Duration:** 3 sprints of 1 week each, plus 1 month of free support after handover
**Live website:** [shree-balaji-paints-plywood-hardware.netlify.app](https://shree-balaji-paints-plywood-hardware.netlify.app/)

Technical documents: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Scalability](SCALABILITY.md) · [Coding standards](CODING-STANDARDS.md)

---

## 1. What we are delivering

| Part | What it does | Status |
|------|--------------|--------|
| **Part 1: public website** | Logo, products, categories, brands, offers, about, contact, enquiry to WhatsApp | Live |
| **Owner panel** (`/admin`) | The owner adds and edits products, photos, prices, stock status, offers and gallery photos from his phone. Changes appear in about a minute | Sprint 1-2 |
| **Enquiry inbox** | Every website enquiry is saved and listed in the owner panel, and still opens in WhatsApp | Sprint 2 |
| **Smart features** | Paint calculator, our work gallery, dated offer banners | Sprint 2-3 |
| **Google presence** | Google Business Profile, Search Console, sitemap | Sprint 3 |
| **Hosting move** | From Vercel's free plan (non-commercial only) to Netlify's free plan (commercial use allowed). Vercel is retired | Done |

Billing software is **not** part of this plan.

---

## 2. Roles

| Role | Person | Responsibilities |
|------|--------|------------------|
| Product owner | Shop owner | Explains needs, gives feedback at each demo, approves each sprint |
| Developer and project lead | Shubham Deshmukh | Design, build, testing, hosting, training, support |
| User | Shop owner | Uses the owner panel and reports problems |

## 3. How each sprint works

| Day | Activity |
|-----|----------|
| Day 1 | **Sprint planning (15 minutes):** confirm this week's stories and any changes from the last demo |
| Days 1-5 | Build and test. Short WhatsApp updates every evening |
| Day 6 | **Demo (30 minutes)** on the owner's own phone. He tries the features himself |
| Day 6 | **Feedback and approval:** the owner ticks the "Done when" checklist and confirms on WhatsApp |

- **Definition of Ready:** the owner has explained the story, the fields are agreed, and any sample data (product list, photos) is available.
- **Definition of Done:**
  - It works as described, and its acceptance criteria pass.
  - `npm run check` passes (lint, typecheck, unit tests, build), with tests for every new function, service, route handler and interactive component.
  - The regression pass in [AGENTS.md](../AGENTS.md) is done.
  - It's checked for security (login, validation) and works on a phone and with the keyboard.
  - It's demonstrated to the owner.
- **Change requests:** small changes to an agreed feature go into the next sprint. Anything new goes to the "Later" list (section 8), so the timeline stays safe.

## 4. Sprint overview

| Sprint | Week | Goal | Main result |
|--------|------|------|-------------|
| 1 | Week 1 | Hosting, login and products | Site on Netlify, owner login, products with photos, prices and stock status edited from the phone |
| 2 | Week 2 | Offers, gallery and enquiries | Dated offer banners, our work gallery, enquiry inbox |
| 3 | Week 3 | Calculator, Google and handover | Paint calculator, Google Business Profile and Search Console, real products entered, owner trained |

---

## 5. Sprint 1: Hosting, login and products (Week 1)

**Sprint goal:** the website runs on Netlify, and the owner can log in from his phone and manage products himself.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-1.1 | Owner | Keep the same website on a hosting plan that allows business use | The shop website follows the hosting terms and stays free (**done**: live on Netlify) |
| US-1.2 | Customer | Find the shop at one address | Only the Netlify address is shared (**done**: Vercel is retired, with no redirect) |
| US-1.3 | Owner | Log in to `/admin` with my password on my phone | Only I can change the website |
| US-1.4 | Owner | Add, edit and hide products: name, brand, category, type, sizes, price, unit, description | The website shows what I actually sell |
| US-1.5 | Owner | Take a photo with my phone and attach it to a product | Products show real photos |
| US-1.6 | Owner | Mark a product "In stock" or "Out of stock" with one tap | Customers know before they visit |
| US-1.7 | Owner | Choose the featured products for the home page | The best items are seen first |
| US-1.8 | Customer | See the owner's changes within about a minute | The website is always current |
| US-1.9 | Owner | Change my password from the owner panel | Only I know it, even though the developer set up the first one |

### Acceptance criteria (highlights)

- **US-1.1 and US-1.2:**
  - Every page, the enquiry flow and the API respond on the Netlify address (regression pass, done).
  - The sitemap, `robots.txt` and share previews use the Netlify address (`SITE_URL` in `netlify.toml`).
- **US-1.3:**
  - A wrong password shows "Incorrect username or password".
  - After 5 wrong tries the login locks for 15 minutes.
  - The session ends after 30 days, or straight away on logout.
  - Every `/admin` page and admin action redirects to the login when there's no valid session.
- **US-1.4:**
  - Required: name, category, type and at least one size. The price is optional ("Ask for price").
  - The product id (its web address) is created from the name, is unique, and can never equal a category id.
  - Hidden products disappear from every page, the brand counts, search and the API.
- **US-1.5:**
  - JPEG, PNG or WebP up to 8 MB. Anything else is rejected with a clear message.
  - The photo is resized and served in modern formats through the image CDN.
- **US-1.6:** the website shows only "In stock" or "Out of stock", never a quantity.
- **US-1.7:** the home page shows the 8 products most recently put on it, so ticking "Show on the home page" always has a visible effect.
- **US-1.8:** saving refreshes the affected pages (home, products, the category, the brand and the product) without a redeploy.
- **US-1.9:**
  - `/admin/password` asks for the current password, then the new one twice (at least 10 characters, different from the current one).
  - The phone in use stays logged in. Every other phone or computer is logged out.
  - Wrong current passwords count towards the same 15-minute lockout as the login.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | Create the Neon project (one branch for production, one for deploy previews) and set the Netlify environment variables; Blobs needs no setup (the Netlify site itself is already live). Agree the product fields with the owner |
| 2 | Database schema and migrations (admin users, sessions, products, audit log). Move the services from `src/data` to the database, with a seed from the current data |
| 3 | Owner login, sessions, lockout, the `/admin` layout and guard |
| 4 | Product list, create, edit and hide screens. Photo upload. Cache tags and refresh on save |
| 5 | Tests, regression pass, fixes |
| 6 | **Demo** on the owner's phone and approval |

### Technical and security tasks

- Read the Next.js 16 guides on caching (`unstable_cache` with tags), revalidation (`updateTag`) and Server Actions in `node_modules/next/dist/docs/` before building.
- Catalogue reads stay in `src/services/catalog-service.ts`. Pages don't change, only the service's data source.
- Passwords hashed with `crypto.scrypt`. Only a hash of the session token is stored. The cookie is `HttpOnly`, `Secure` and `SameSite=Lax`.
- Zod validation on every admin action. Every change is written to the audit log.
- `DATABASE_URL`, `SESSION_SECRET` and the owner's initial password are Netlify environment variables, never in Git.

### Tests

- Unit: slug creation and the category-id clash rule, product validation, password hashing and checking, lockout timing.
- Route and action: creating, editing and hiding a product updates the service output; admin actions without a session are rejected.
- Components: product form labels, errors linked to inputs, unsaved-changes guard, confirm before hiding.
- Browser (Playwright, `npm run test:e2e`): every main public page with its navbar highlight, the enquiry and calculator popups, and the whole owner flow from login to password change and logout.
- CI also runs the build-time migration script twice against a real PostgreSQL, so a broken migration fails the pull request instead of the Netlify deploy.

### Demo script

1. Open the Netlify address on the owner's phone and check the main pages.
2. Log in on the owner's phone, then try a wrong password 5 times on a test account to see the lock.
3. Add a product with a photo taken on the phone. Open the website and find it.
4. Change a price and mark another product "Out of stock". Refresh the website after a minute.

### What we need from the owner

- His mobile number and a password of his choice (at least 10 characters) for the owner login.
- A first list of products with prices, or a photo of the price list.

### Done when

- [x] The website runs on Netlify, and only the Netlify address is shared.
- [x] The owner can log in on his phone, and the lockout works.
- [x] Products can be added, edited, hidden and given photos.
- [x] Changes appear on the website within about a minute.
- [x] The owner can change his password from the owner panel.

---

## 6. Sprint 2: Offers, gallery and enquiries (Week 2)

**Sprint goal:** the owner runs his own offers and gallery, and no enquiry is ever lost.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-2.1 | Owner | Create an offer with title, text, photo, start date and end date | Festival offers show at the right time |
| US-2.2 | Customer | See current offers on the home page and `/offers` | I know about the deals |
| US-2.3 | Owner | Upload gallery photos of finished work, with a caption | Customers see real local work |
| US-2.4 | Customer | Browse the gallery at `/gallery` | I trust the shop |
| US-2.5 | Customer | Send an enquiry as today, and have it saved for the shop | My request isn't missed |
| US-2.6 | Owner | See all enquiries in the owner panel, newest first, and mark each New, Called or Done | I follow up every customer |
| US-2.7 | Owner | See a count of new enquiries when I open the panel | I notice them quickly |

### Acceptance criteria (highlights)

- **US-2.1 and US-2.2:**
  - An offer shows only from its start date to its end date (Indian time), with no redeploy.
  - Expired offers stay in the owner panel, marked "Ended", and can be copied for next year.
  - Deleting an offer or a gallery photo asks for confirmation first.
- **US-2.5:**
  - The form is saved first, then WhatsApp opens with the same message as today.
  - If saving fails (no internet), WhatsApp still opens, so the enquiry reaches the owner anyway.
  - Spam protection: a hidden honeypot field and at most 5 enquiries per hour from one address.
- **US-2.6:** only the logged-in owner can see enquiries. Customer names and phone numbers never appear on public pages, in the API or in logs.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | Offers table, owner screens, date-based display on home and `/offers` |
| 2 | Gallery table and screens, `/gallery` page, navbar and footer link |
| 3 | Enquiries table, save action with validation, honeypot and rate limit. Update the enquiry form |
| 4 | Enquiry inbox with status changes and the new-enquiry count. Daily backup function |
| 5 | Tests, regression pass, fixes |
| 6 | **Demo** and approval |

### Tests

- Unit: offer date window (start day, end day, timezone), enquiry validation, rate-limit counter.
- Action: saving an enquiry stores it and returns success; a filled honeypot is rejected quietly; status changes need a session.
- Components: the enquiry form still opens WhatsApp when saving fails; confirm dialog before deleting an offer or photo.

### Demo script

1. Create a "Diwali offer" starting today and ending next week, and see it on the website.
2. Upload two gallery photos from the phone.
3. Send an enquiry from another phone, see WhatsApp open, then find it in the inbox and mark it Called.

### What we need from the owner

- One current offer to put online.
- 5-10 photos of finished work (homes, furniture), with permission from the customers where people or homes are recognisable.

### Done when

- [ ] Offers appear and disappear on their dates.
- [x] The gallery works, with confirmation before deleting.
- [x] Every enquiry is saved and still opens in WhatsApp.
- [x] The enquiry inbox is visible only to the owner.
- [ ] The daily backup runs.

---

## 7. Sprint 3: Calculator, Google and handover (Week 3)

**Sprint goal:** customers can work out how much paint they need, the shop is on Google, and the owner runs the website alone.

### User stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-3.1 | Customer | Enter my room size (feet or metres), doors, windows and coats | I know how much paint to buy |
| US-3.2 | Customer | See the litres needed and the best pack sizes | I don't buy too much or too little |
| US-3.3 | Customer | Send the result to the shop on WhatsApp with one tap | The shop can quote me |
| US-3.4 | Owner | Have the shop on Google Maps and Google search, with photos, hours and the website link | Nearby customers find me |
| US-3.5 | Owner | Have the website's pages listed on Google | People searching for products find my pages |
| US-3.6 | Owner | Get training and a one-page guide in Marathi | I can use the owner panel confidently |

### Acceptance criteria (highlights)

- **US-3.1 and US-3.2:**
  - Wall area = 2 × (length + width) × height, minus doors and windows, plus the ceiling if chosen.
  - Litres = area × coats ÷ coverage per litre. The coverage comes from the chosen paint type, and the result is rounded up.
  - Pack suggestion uses the product's real sizes and wastes the least (for example 14 L becomes 1 × 10 L + 1 × 4 L).
  - The result says it's an estimate, and the shop confirms the final quantity.
- **US-3.3:** after a confirmation, WhatsApp opens with the paint, room size, coats, litres and packs. The calculator lives at clean paths (`/paint-calculator`, `/paint-calculator/<product>`), with no query strings.
- **US-3.4:** the Google Business Profile is verified in the owner's name, with category, hours, phone, photos and the website link.
- **US-3.5:** `sitemap.xml` and `robots.txt` are served, and the site is verified in Google Search Console with the sitemap submitted.

### Day-by-day plan

| Day | Work |
|-----|------|
| 1 | Paint calculator logic with unit tests, then the `/paint-calculator` page |
| 2 | Calculator to enquiry. Sitemap, robots, page metadata check. Search Console |
| 3 | Google Business Profile with the owner (verification can take a few days) |
| 4 | Enter the owner's real products and photos together. Remove demo products |
| 5 | **Training (30 minutes)** and the one-page guide. Final regression pass |
| 6 | **Final demo** and handover sign-off. Free support starts |

### Tests

- Unit: area, litres and pack-size calculations, with feet and metres, doors and windows larger than the walls (rejected), and coats from 1 to 3.
- Components: calculator labels and errors, result announced to screen readers, the enquiry link.
- Build: sitemap contains every product, category and brand page.

### Handover checklist

- [ ] All demo products are replaced by the owner's real products.
- [ ] The owner has logged in on his own phone and changed his password.
- [ ] The owner has added a product, changed a price, created an offer and answered an enquiry on his own.
- [ ] The Google Business Profile is live or verification is under way.
- [ ] Search Console shows the sitemap as submitted.
- [ ] The daily backup has run at least 3 days in a row.
- [ ] The owner has the one-page guide.

### Done when

- [ ] Everything in the handover checklist is ticked.
- [ ] The owner signs the handover approval.

---

## 8. Not included (can be added later, quoted separately)

- Marathi / English language switch for the whole site
- Colour shade explorer
- Online orders and payments
- Custom website name (for example shreebalaji.in)
- Staff logins with limited access
- Automatic SMS or WhatsApp replies (needs a paid API)
- Billing software

## 9. Things to buy

Nothing. The free `.netlify.app` address is used, and the owner manages the website from his phone.

## 10. Risks and how we handle them

| Risk | Impact | How we handle it |
|------|--------|------------------|
| Netlify free credits run out | The site pauses until next month | Content edits don't redeploy, images go through the image CDN, production deploys are batched, and usage is checked monthly during support. The next plan is about Rs 800 per month if ever needed |
| Address change confuses customers | Old Vercel links stop working once Vercel is removed | Share the Netlify address on WhatsApp and put it on Google Business Profile, the shop board and visiting cards |
| Google Business verification is slow | Shop not on Maps at handover | Started on day 1 of Sprint 3. Finished during free support if needed |
| Owner forgets the password | Can't update the site | Reset through the developer during support, with a new password set by the owner |
| Product list arrives late | Demo products still live at handover | Owner adds the rest himself after training. Demo products are hidden, not left live |
| New requests during the build | Delay | "Later" list, quoted separately |

## 11. After handover

- **First month: free support.** Fixes, small adjustments and questions on WhatsApp or phone.
- **After that: optional yearly support.** Small changes, help, dependency updates, backup and usage checks.

## 12. Sign-off

| Sprint | Approved by owner (name / date) | Notes |
|--------|----------------------------------|-------|
| Sprint 1 - Hosting, login and products | | |
| Sprint 2 - Offers, gallery and enquiries | | |
| Sprint 3 - Calculator, Google and handover | | |
