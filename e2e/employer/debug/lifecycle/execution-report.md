# Employer Lifecycle — E2E Execution Report

**Scope:** Login → Onboarding (if needed) → Job Creation → Applicant Pipeline → Dashboard  
**Base URL:** `http://localhost:3000`  
**Test account:** `replacemedev@gmail.com` / `replacemedev123` (username: `replacemedev`)  
**E2E env:** Set `E2E_EMPLOYER_PASSWORD=replacemedev123` in `.env.local` for Playwright runs.  
**Signup:** Intentionally excluded (confirm-password flow not covered by this suite).

---

## Folder layout

```
e2e/
  employer/          # specs + helpers + debug artifacts
  worker/            # worker specs (placeholder)
  admin/             # admin specs (placeholder)
```

---

## Spec files (`e2e/employer/`)

| File | Covers |
|------|--------|
| `login.spec.ts` | Email/username login, invalid credentials |
| `onboarding.spec.ts` | Onboarding gate when `company_profiles` missing |
| `job-creation.spec.ts` | Create job → dashboard |
| `applicants.spec.ts` | Applicant pipeline page |
| `dashboard.spec.ts` | Welcome + job posts section |

**Helpers:** `e2e/employer/helpers/auth.ts`, `e2e/employer/helpers/jobs.ts`

**Run:** Add `E2E_EMPLOYER_PASSWORD` to `.env.local`, then `npm run test:e2e:employer`

---

## Playwright run (2026-06-25, final)

| Spec | Result |
|------|--------|
| `login` (3 tests) | Pass |
| `dashboard` | Pass |
| `job-creation` | Pass |
| `applicants` | Pass |
| `onboarding` | Skipped (account already onboarded) |

**6 passed, 1 skipped** — no signup spec (confirm-password flow excluded by design).

| Phase | Result | Notes |
|-------|--------|-------|
| Home | Pass | `01-home.png` |
| Login | Pass | Landed `/employer/onboarding` |
| Onboarding | Pass | `03-post-onboarding.png` |
| Dashboard | Pass | `04-dashboard.png` |
| Job create form | Pass | `05-job-create-form.png` |
| Job submit | Partial | Stayed on create; post-submit navigated to `/dashboard` (404) — **fixed** `redirectUrl` → `/employer/dashboard` |
| Dashboard re-check | Fail | `ERR_ABORTED` / 404 from bad redirect |

---

## Fixes applied during E2E work

- `createJobPost` redirect: `/dashboard` → `/employer/dashboard`
- Credentials via `E2E_EMPLOYER_PASSWORD` env only (no admin password reset)

---

## Known UI gaps (not blocking specs)

- Dashboard CTA links use `/jobs/create` instead of `/employer/jobs/create`
- `JobCard` links use `/jobs/{id}` not `/employer/jobs/{id}`

Tests navigate directly to `/employer/...` routes.
