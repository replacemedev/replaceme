# Worker Verification QA

## Scope

Worker identity verification at `/worker/verification` with private document storage, fixed stepper, universal badge, and employer trust signals.

## Database & storage integrity

| Layer | Implementation |
|-------|----------------|
| Status | `profiles.verification_status` enum + `is_verified` (synced via trigger) |
| Documents | `verification_documents` → `worker_id` FK, unique per `document_type` |
| Employer view | `worker_profiles` view exposes `verification_status`, `is_verified` |
| Storage | Private bucket `verification-documents`, path `{worker_id}/{type}/{uuid}` |
| RLS | Workers CRUD own rows/files only; employers cannot read ID images |

### MCP migration

`20260624040000_worker_verification_schema.sql` applied via Supabase MCP.

## Zero mock data policy

- [x] Page fetches live `verification_status` + document rows
- [x] Signed preview URLs generated per uploaded file
- [x] Step states derived from profile completeness + document count
- [x] No hardcoded verification step or document state

## Stepper fix (logic)

| Step | Completed when | Active when |
|------|----------------|-------------|
| 1 Personal Info | Profile has name, email, professional title | Otherwise |
| 2 Identity Verification | All 3 docs uploaded or beyond | Personal complete, docs incomplete |
| 3 Professional Review | `approved` | `under_review`, `documents_submitted`, `rejected` |

Connector lines fill green only between completed → completed/active steps. Mobile stacks vertically; desktop horizontal with flex connectors.

## Storage security

- Upload via server action after Zod validation (type, 5 MB max)
- Files stored in private bucket with worker-scoped RLS
- Preview via short-lived signed URLs (1 hour)
- Employers never receive document URLs

## Employer marketplace bridge

| Integration | Behavior |
|-------------|----------|
| `getApplicants` | Fetches `is_verified`; sorts verified first |
| `getPinnedWorkers` | Fetches `is_verified`; sorts verified first |
| `submitJobApplication` | Blocks `is_premium_path` jobs if worker not verified |
| Employer query pattern | `WHERE is_verified = true` on `worker_profiles` / `profiles` |

Approval today: set `verification_status = 'approved'` in Supabase (triggers `is_verified = true`). Admin UI is a future enhancement.

## Universal VerifiedBadge

Rendered when `is_verified === true`:

- Worker profile sidebar (`ProfileSidebar`)
- Worker header dropdown (`WorkerDropdown` avatar + name)
- Employer applicant cards (`ApplicantCard`)
- Employer pinned worker cards (`WorkerCard`)

Component: `src/components/shared/VerifiedBadge.tsx`

## Navigation update

`WorkerDropdown` replaces generic `UserDropdown` in `WorkerHeader`:

- **Verification** link directly below **Profile**
- Verified badge on avatar overlay when approved

## Component architecture (ponytail)

| Component | Client? |
|-----------|---------|
| `VerificationStepper` | No |
| `DocumentDropzone` | Yes (drag/drop upload) |
| `VerificationUploadPanel` | Yes (submit + dropzones) |
| `VerificationSidebar` | No |
| Page | No (orchestrator) |

DOM: `header` + `nav` stepper + `grid` (upload panel + sidebar).

## Skeleton

`loading.tsx` → `VerificationSkeleton` mirrors centered header, stepper row, 3 dropzone cards, 2 sidebar cards.

## Manual test checklist

1. Open `/worker/verification` as worker → stepper reflects profile state
2. Upload ID front/back + selfie → status advances, previews show
3. Submit for review → `under_review`, uploads disabled
4. Approve in Supabase → badge appears in dropdown + profile
5. Apply to premium job unverified → blocked with message
6. Employer applicants list → verified badge + sort priority
