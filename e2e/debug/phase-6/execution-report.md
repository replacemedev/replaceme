# Phase 6 — Execution log

**Suite:** `npm run test:e2e:worker`  
**Status:** Complete (2026-06-25)

## Final run

```
39 passed
6 skipped
0 failed
Duration: ~3.8m
```

### Skipped tests

| Spec | Reason |
|------|--------|
| `jobs-discovery.spec.ts` (keyword filter) | No jobs in database |
| `jobs-discovery.spec.ts` (detail from list) | No jobs in database |
| `job-detail.spec.ts` | No jobs / already applied |
| `job-apply.spec.ts` | No jobs in database |
| `saved-jobs.spec.ts` | No jobs in database |
| `onboarding.spec.ts` | Worker already onboarded |

### Code fix applied

**Profile save:** Postgres error `column "full_name" can only be updated to DEFAULT` — `full_name` is `GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED`. Removed from `updateWorkerProfile` in `src/actions/worker/profile.ts`.

## Runs

| Time | Spec | Result | Notes |
|------|------|--------|-------|
| 2026-06-25 | `npm run test:e2e:worker` | 39 pass / 6 skip | After `full_name` fix |
| 2026-06-25 | `npm run test:e2e:reuse --project=employer` | 29 pass / 1 skip | Cross-role regression |
