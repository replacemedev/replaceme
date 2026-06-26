# Phase 0 — Critical UI routing gaps

> Fix 404s and dead ends. Navigation surgery + minimal scaffolds. **Not** full feature builds (Phase 1+).

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Exit criteria

- [x] Zero broken `href` / `router.push` from link-repair list below
- [x] Every new target route returns HTTP 200
- [x] Job **Edit** from `JobHeader` loads existing data (`?edit=` handler)
- [x] Admin `/admin/disputes` has basic workflow UI shell
- [x] `npm run prompt:sync` after new routes

---

## A. Link repairs (19 files)

- [x] `src/components/employer/dashboard/YourWorkers.tsx` — `/team` → `/employer/hired`
- [x] `src/components/employer/dashboard/RecentMessages.tsx` — `/messages` → `/employer/messages`; `` `/messages/${id}` `` → `` `/employer/messages?threadId=${id}` ``
- [x] `src/components/employer/dashboard/PinnedTalent.tsx` — `/talents` → `/employer/pinned`; `` `/talents/${id}` `` → `` `/worker/profile?id=${id}` ``
- [x] `src/components/employer/dashboard/BillingPlan.tsx` — `/billing` → `/employer/settings/account`; `/billing/plans` → `/employer/pricing`
- [x] `src/components/employer/dashboard/PremiumUpsell.tsx` — `/premium/upgrade` → `/employer/pricing`
- [x] `src/components/employer/dashboard/HiringKit.tsx` — `/premium/hiring-kit/va` → `/help/hiring-guide`; `/premium/hiring-kit/contracts` → `/employer/hired`
- [x] `src/app/employer/dashboard/page.tsx` — `/hiring-guide` → `/help/hiring-guide`; `/messages` → `/employer/messages`; `/hired` → `/employer/hired`
- [x] `src/components/employer/pinned/WorkerCard.tsx` — `` `/workers/${id}` `` → `` `/worker/profile?id=${id}` ``
- [x] `src/components/employer/pinned/PinnedWorkerGrid.tsx` — `/dashboard` → `/employer/dashboard`
- [x] `src/components/employer/hired/UpsellFooter.tsx` — `/dashboard` → `/employer/dashboard`
- [x] `src/app/employer/pricing/page.tsx` — `/settings/account` → `/employer/settings/account`
- [x] `src/components/employer/settings/account/AccountDetailsList.tsx` — `/settings/account` → `/employer/settings/account`
- [x] `src/components/employer/jobs/view/PerformanceMetricsCard.tsx` — `` `/dashboard?filter=...` `` → `` `/employer/jobs/${jobId}/applicants?status=UNDER_REVIEW` ``
- [x] `src/components/employer/jobs/view/JobHeader.tsx` — keep `` `/employer/jobs/create?edit=${jobId}` ``; implement edit handler
- [x] `src/app/worker/dashboard/page.tsx` — `/skills/edit` → `/worker/profile?edit=skills`; `/profile/edit` → `/worker/profile?edit=true`; `/messages` → `/worker/messages`; `/help` → `/help`; `/community` → `/community`
- [x] `src/components/worker/ProveExpertiseCard.tsx` — `/worker/tests` (scaffold)
- [x] `src/app/worker/profile/page.tsx` — `/worker/dashboard/profile` → `/worker/profile`
- [x] `src/components/worker/profile/ProfileSidebar.tsx` — `/worker/dashboard/profile` → `/worker/profile?edit=true`
- [x] `src/components/auth/AuthFooter.tsx` — `/help` (scaffold)

## B. Behavioral wiring

- [x] Applicants `?status=` filter (`applicants/page.tsx` + `ApplicantsClient.tsx`)
- [x] Job edit: `create/page.tsx` + `CreateJobForm` + `updateJobPost`
- [x] Worker profile `?edit=true` / `?edit=skills` (minimum viable)
- [x] Message widgets use `threadId` query param

## C. New scaffold routes

- [x] `src/app/(public)/help/page.tsx` + `loading.tsx`
- [x] `src/app/(public)/help/hiring-guide/page.tsx` + `loading.tsx`
- [x] `src/app/(public)/community/page.tsx` + `loading.tsx`
- [x] `src/app/worker/tests/page.tsx` + `loading.tsx`

## D. Admin disputes (basic workflow UI)

- [x] `disputes` migration + RLS (no seed)
- [x] `src/app/admin/(shell)/disputes/page.tsx`
- [x] `src/components/admin/disputes/DisputesTable.tsx`
- [x] `src/components/admin/disputes/DisputeDetailSheet.tsx`
- [x] `src/actions/admin/disputes.ts` + Zod

## E. QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] Spec: extend `e2e/employer/dashboard.spec.ts` — no 404 on widget CTAs
- [x] Spec: `e2e/worker/dashboard-links.spec.ts`
- [x] Spec: `e2e/employer/jobs-list.spec.ts` + job edit smoke
- [x] Spec: `e2e/admin/disputes.spec.ts`
- [x] CLI: `test:e2e:employer` + `test:e2e:worker` + `test:e2e:admin`
- [ ] MCP: employer dashboard walk (hired, messages, pinned, pricing, metrics → applicants)
- [ ] MCP: worker dashboard walk (profile, messages, help, tests)
- [x] Artifacts: `e2e/debug/phase-0/`

---

## Reference

**Routes that exist (link-only):** `/employer/hired`, `/employer/messages?threadId=`, `/worker/messages`, `/employer/pinned`, `/employer/pricing`, `/employer/settings/account`, `/worker/profile?id=`, `/employer/jobs/[jobId]/applicants`, `/employer/jobs/create`

**Job edit steps:** `create/page.tsx` read `edit` param → `CreateJobForm` mode/edit → `updateJobPost` in `actions/employer/jobs.ts`

**Disputes wireframe:** table + detail sheet; statuses `open` | `under_review` | `resolved` | `closed`

**Non-goals (Phase 1+):** Kanban, interviews, full profile edit, `/employer/talents`, analytics, notification center, employer dispute filing
