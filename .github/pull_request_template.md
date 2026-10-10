## What changed

## How it was tested

## Review checklist

- [ ] `npm run check` passes (lint, typecheck, unit tests, build)
- [ ] New or changed logic has unit tests, and a bug fix has a test that failed before the fix
- [ ] Existing features still work: home, products with filters, product detail, enquiry, WhatsApp links
- [ ] Stays simple: no option, step or screen the owner or a visitor doesn't need, and existing behaviour is unchanged unless the change is the point
- [ ] Reused existing pieces (`ui/`, `hooks/`, `lib/`, `icons.ts`) instead of duplicating UI or logic
- [ ] Data comes through `src/services`, API paths through `endpoints.ts`, HTTP calls through `httpClient`
- [ ] Page links come from `ROUTES` in `src/lib/routes.ts`; no query strings or hash links for pages
- [ ] Destructive actions use `useConfirm()`, and forms use `useUnsavedChanges(isDirty)`
- [ ] No comments that restate code, no commented-out code, no `any`
- [ ] Inputs have labels, and errors are linked with `aria-describedby`
- [ ] No secrets, personal data or hard-coded shop details
- [ ] `README.md`, `AGENTS.md` and `docs/` updated if structure or behaviour changed
