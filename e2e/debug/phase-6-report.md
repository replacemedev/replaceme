# Phase 6 — E2E Report

**Completed:** 2026-06-25  
**Web server:** `next start` on `:3100` via `scripts/playwright-web-server.mjs`  
**Credentials:** `worker1` / `worker123`, employer via `E2E_EMPLOYER_PASSWORD`

## Summary

| Suite | Passed | Skipped | Failed |
|-------|--------|---------|--------|
| `npm run test:e2e:worker` | 39 | 6 | 0 |

**Root fix:** Profile save failed because `full_name` is a Postgres `GENERATED ALWAYS` column on `profiles`. Removed it from `updateWorkerProfile` payload in `src/actions/worker/profile.ts`.

## Feature matrix

| Feature | Spec | Status | Notes |
|---------|------|--------|-------|
| Route security | `route-security.spec.ts` | Pass | Unauth redirect + cross-role blocks |
| Primary & account nav | `navigation.spec.ts` | Pass | Desktop + mobile menu |
| Dashboard | `dashboard.spec.ts` | Pass | Greeting and sections |
| Job discovery | `jobs-discovery.spec.ts` | Partial | Page loads; keyword/detail skipped (no jobs in DB) |
| Job detail | `job-detail.spec.ts` | Skip | No active jobs in database |
| Job apply | `job-apply.spec.ts` | Skip | No active jobs in database |
| Saved jobs | `saved-jobs.spec.ts` | Skip | No active jobs in database |
| Profile edit | `profile-edit.spec.ts` | Pass | Bio + portfolio/resume URL save |
| Onboarding | `onboarding.spec.ts` | Skip | `worker1` already onboarded |
| Notifications inbox | `notifications-inbox.spec.ts` | Pass | |
| Notification prefs | `notifications-preferences.spec.ts` | Pass | Save toggles |
| Messages | `messages.spec.ts` | Pass | |
| Earnings | `earnings.spec.ts` | Pass | |
| Job alerts | `job-alerts.spec.ts` | Pass | Create alert form |
| Verification | `verification.spec.ts` | Pass | |
| Skills | `skills.spec.ts` | Pass | |
| Settings | `settings.spec.ts` | Pass | Availability save |
| Applications detail | `applications-detail.spec.ts` | Pass | |
| Interviews | `interviews.spec.ts` | Pass | |
| Contracts | `contracts.spec.ts` | Pass | |
| Skill tests | `tests.spec.ts` | Pass | |
| Full regression | `npm run test:e2e` | Pass | Worker 39 pass; employer 29 pass (1 onboarding skip) |

## Skipped (data-dependent)

Six worker tests skip when the database has no published jobs or when `worker1` is already onboarded. Re-run after employer posts at least one active job to cover discovery, detail, apply, and saved-jobs flows.

**Artifacts:** `e2e/debug/phase-6/execution-report.md`
