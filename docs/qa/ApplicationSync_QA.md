# Application Status Synchronization QA

## Scope

Shared application status state machine across Worker (`/worker/applications`) and Employer (`/employer/jobs/[jobId]/applicants`) domains.

## Single source of truth

| Layer | Artifact |
|-------|----------|
| Database | PostgreSQL enum `application_status` on `public.applications.status` |
| TypeScript | `ApplicationStatus` in `src/types/applications.ts` |
| Employer alias | `ApplicantStatus` re-exports `ApplicationStatus` |
| Mutation | `updateApplicationStatus()` in `src/actions/applications.ts` |

### Canonical status values

| Enum | Worker badge | Employer label |
|------|--------------|----------------|
| `PENDING` | Under Review | Pending |
| `UNDER_REVIEW` | Under Review | Under Review |
| `INTERVIEW_SCHEDULED` | Interview Scheduled | Interview Scheduled |
| `REJECTED` | Declined | Rejected |
| `HIRED` | Hired | Hired |

### Legacy migration map

| Old VARCHAR | New enum |
|-------------|----------|
| `Applied` | `PENDING` |
| `Shortlisted` | `UNDER_REVIEW` |
| `Interviewing` | `INTERVIEW_SCHEDULED` |
| `Rejected` | `REJECTED` |
| `Hired` | `HIRED` |

Migration: `20260624000000_standardize_application_status_enum.sql`

## Security checks (`updateApplicationStatus`)

- [x] Requires authenticated Supabase session
- [x] Requires `profiles.role = 'employer'`
- [x] Loads `applications.job_id` for target row
- [x] IDOR guard: `jobs.employer_id` must match logged-in employer
- [x] Validates status against `APPLICATION_STATUSES` before UPDATE
- [x] Workers have no mutation path in this action

## Cache invalidation

On successful UPDATE, `revalidatePath` is called for:

- `/employer/jobs/[jobId]`
- `/employer/jobs/[jobId]/applicants`
- `/worker/applications`
- `/worker/dashboard`

Worker UI reflects employer changes on next navigation/refresh without optimistic local overrides.

## UI separation of concerns

| Component | Responsibility |
|-----------|----------------|
| `ApplicationStatusDropdown` | Presentation + `useTransition` loading state |
| `updateApplicationStatus` | Auth, ownership, DB mutation, revalidation |
| `ApplicantsClient` | List layout only — no optimistic status state |
| `ApplicantCard` | Embeds dropdown; no inline mutation logic |

## Zero mock data policy

- [x] Dropdown options from `APPLICATION_STATUSES` constant (mirrors DB enum)
- [x] No React-only status simulation — UI updates after server success + `router.refresh()`
- [x] Worker list reads `applications.status` directly from Supabase JOINs

## Manual test checklist

1. Employer opens `/employer/jobs/[jobId]/applicants` → sees real statuses from DB
2. Employer changes status via dropdown → loading spinner, toast, page refreshes
3. Worker opens `/worker/applications` → sees matching status badge
4. Worker dashboard interview/hired counts align with new enum values
5. Attempt status update on unowned application → error toast, no DB change
6. Non-employer session → action rejected

## Known follow-ups

- Legacy `StatusDropdown.tsx` retained but superseded by `ApplicationStatusDropdown`
- `updateApplicantStatus` deprecated wrapper delegates to `updateApplicationStatus`
