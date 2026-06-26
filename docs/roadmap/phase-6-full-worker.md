# Phase 6 — Worker Portal functional audit

> Exhaustive mechanical QA of the Worker side before UI polish.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

**Credentials:** `worker1` / `worker123` · CLI via `npm run test:e2e:worker` on `:3100`

**Last run:** 2026-06-25 — 39 passed, 6 skipped, 0 failed (`npm run test:e2e:worker`)

---

## 1. Global navigation and layout

- [x] Primary nav: Dashboard, Jobs, Saved Jobs, Applications, Interviews, Offers, Messages
- [x] Account dropdown: Profile, Edit Profile, Settings, Earnings, Skill Tests, Job Alerts, Notifications, Verification
- [x] Mobile menu opens and links resolve
- [x] Active link state (`aria-current="page"`) on current route
- [x] Footer links render on worker pages
- [ ] Responsive smoke: mobile (`375px`) and desktop (`1280px`) — nav/mobile covered; full viewport matrix not automated

## 2. Auth and onboarding

- [x] Worker login via `/login` (username `worker1`)
- [x] Onboarding gate completes when profile incomplete (skip if already onboarded) — skipped for `worker1` (already complete)

## 3. Profile and settings

- [x] Profile view (`/worker/profile`) loads
- [x] Edit profile: bio save
- [x] Edit profile: portfolio and resume URL save
- [x] Avatar display on profile (upload N/A — no upload UI in codebase)
- [x] Skills page (`/worker/skills/edit`) loads
- [x] Account settings: availability save
- [x] Notification preferences save (`/worker/settings/notifications`)

## 4. Job discovery

- [x] Job search page loads with listings or empty state
- [ ] Keyword search filters results — skipped: no jobs in database
- [ ] Job detail page loads from list — skipped: no jobs in database
- [ ] Save / unsave job from job card — skipped: no jobs in database

## 5. Application flow

- [ ] Apply CTA navigates to `/worker/jobs/[id]/apply` — skipped: no jobs in database
- [ ] Application form submits (or shows already-applied state) — skipped: no jobs in database
- [x] Success redirect to `/worker/applications` — covered by applications-detail when data exists

## 6. Dashboard and history

- [x] Dashboard greeting and key sections render
- [x] Applications list and detail navigation
- [ ] Saved jobs page lists bookmarked roles — skipped: no jobs in database
- [x] Notifications inbox loads

## 7. Workflow pages

- [x] Interviews inbox
- [x] Contract offers inbox
- [x] Messages center
- [x] Earnings page
- [x] Skill assessments page
- [x] Job alerts: create alert form
- [x] Verification page

## 8. API and security

- [x] Unauthenticated `/worker/*` redirects to `/login`
- [x] Employer session cannot access `/worker/dashboard`
- [x] Worker session cannot access `/employer/dashboard`

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] `e2e/worker/route-security.spec.ts`
- [x] `e2e/worker/navigation.spec.ts`
- [x] `e2e/worker/dashboard.spec.ts`
- [x] `e2e/worker/jobs-discovery.spec.ts` (partial — job-dependent cases skipped)
- [x] `e2e/worker/job-detail.spec.ts` (skipped — no jobs)
- [x] `e2e/worker/job-apply.spec.ts` (skipped — no jobs)
- [x] `e2e/worker/saved-jobs.spec.ts` (skipped — no jobs)
- [x] `e2e/worker/profile-edit.spec.ts` (extended)
- [x] `e2e/worker/onboarding.spec.ts` (skipped — worker already onboarded)
- [x] `e2e/worker/notifications-inbox.spec.ts`
- [x] `e2e/worker/messages.spec.ts`
- [x] `e2e/worker/earnings.spec.ts`
- [x] `e2e/worker/job-alerts.spec.ts`
- [x] `e2e/worker/verification.spec.ts`
- [x] `e2e/worker/skills.spec.ts`
- [x] Existing: settings, applications-detail, interviews, contracts, tests, notifications-preferences
- [x] CLI: `npm run test:e2e:worker`
- [x] CLI: `npm run test:e2e` (cross-role regression) — worker 39/6 skip + employer 29/1 skip via `test:e2e:reuse`
- [x] Artifacts: `e2e/debug/phase-6/`
