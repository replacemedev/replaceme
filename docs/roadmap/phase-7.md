# Phase 7 — Fix weak entry points & broken pipeline navigation

> Employer applicant pipeline routing gaps only (no new features).

**Credentials:** `replacemedev@gmail.com` / `replacemedev123` · `npm run test:e2e:employer` on `:3100`

**Last run:** 2026-06-26 — 3 passed, 1 skipped (no pinned workers in DB)

---

## 1. Job detail → pipeline

- [x] `/employer/jobs/{jobId}` shows **View Pipeline** linking to `/employer/jobs/{jobId}/applicants`
- [x] Click navigates to Applicant Pipeline with correct job title

## 2. Performance card

- [x] **View Candidates** href is `/employer/jobs/{jobId}/applicants` (not `/dashboard?filter=...`)
- [x] Link resolves to pipeline page (200, pipeline UI visible)

## 3. Job cards & dashboard

- [x] Job card **APPLICANTS** link goes directly to applicants pipeline
- [x] **ActiveJobs** **Manage** routes to `/employer/jobs/{jobId}/applicants`

## 4. Pinned talent

- [x] **View Profile** uses `/employer/candidates/{id}?jobId=...` (code + `contextJobId` from applications)
- [x] E2E skipped when no pinned workers — route pattern verified in `WorkerCard.tsx`

## QA

- [x] `e2e/employer/pipeline-navigation.spec.ts`
- [x] CLI: `npm run test:e2e:employer` (pipeline spec)
- [x] Artifacts: `e2e/debug/phase-7/`
