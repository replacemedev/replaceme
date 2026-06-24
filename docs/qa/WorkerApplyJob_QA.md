# Worker Apply for Job QA

## Scope

Premium worker application form at `/worker/jobs/[id]/apply` — marketplace conversion point linking workers to employer job posts.

## Database relationship integrity

| Query / Mutation | Source |
|------------------|--------|
| Job post | `job_posts` WHERE `id = [id]` AND `status = 'Active'` |
| Company name | `company_profiles` JOIN via `employer_id` |
| Worker profile assets | `profiles.resume_url`, `portfolio_url`, `cv_url`, `email`, `phone_number` |
| Application insert | `applications` (exposed as `job_applications` view) |
| Duplicate guard | `UNIQUE (job_id, candidate_id)` |

### Migration (`20260624020000_job_application_form_schema.sql`)

- `profiles`: `resume_url`, `cv_url`, `phone_number`
- `applications`: `application_subject`, `cover_letter`, `contact_methods` (JSONB)
- View `job_applications` aliases `applications` with `worker_id` column name

## Zero mock data policy

- [x] Server page fetches real job + worker profile from Supabase
- [x] Profile asset buttons reflect actual URLs (disabled “Not set” when null)
- [x] Skills badges from `job_posts.skills`
- [x] Job summary sidebar from live job fields
- [x] Contact methods prepopulated from profile `email` / `phone_number`
- [x] `notFound()` for invalid/inactive jobs
- [x] Redirect if worker already applied

## Form validation (Zod + React Hook Form)

| Field | Rules |
|-------|-------|
| `applicationSubject` | 5–200 chars, trimmed |
| `coverLetter` | 50–5000 chars, trimmed |
| `contactMethods` | 1–5 items; each `type` ∈ email/phone, non-empty `value` |

Server action re-validates with the same Zod schema before INSERT.

## Dynamic contact array

- [x] `useFieldArray` on `contactMethods`
- [x] Add row via “+ Add Contact Method” (max 5)
- [x] Trash icon removes row (min 1 retained)
- [x] Type dropdown: Email / Phone

## Server action security

- [x] Auth session required
- [x] Worker role enforced
- [x] Active job existence verified
- [x] Duplicate application blocked
- [x] `revalidatePath` for worker + employer routes on success

## Component architecture (ponytail)

| Component | Client? | Role |
|-----------|---------|------|
| `ApplyJobHero` | No | Green header + category badge |
| `ApplicationForm` | **Yes** | Only client boundary — form state |
| `ApplySidebarCards` | No | Job summary + message guide |
| Page | No | Auth, fetch, layout grid |

DOM: `div` → `header` + `main` → `grid` → form + sidebar. No wrapper soup.

## Responsive audit

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Hero stacks; form full width; sidebar below |
| `sm` | Profile assets 3-column grid; contact row horizontal |
| `lg` | `grid-cols-3` — form `col-span-2`, sidebar `col-span-1` |

## UX enhancements

- [x] Loading spinner on submit; button disabled during mutation
- [x] Success toast + redirect to `/worker/applications`
- [x] Real-time validation error borders/messages
- [x] Link to `/worker/profile` for asset updates
- [x] Job details “Apply” navigates to apply form (not instant insert)

## Manual test checklist

1. Open active job → Apply → form loads with company/title
2. Submit with empty fields → inline validation errors
3. Valid submit → row in `applications` with subject, cover letter, contacts
4. Revisit apply URL → redirect to `/worker/applications`
5. Employer `/employer/jobs/[id]/applicants` shows new applicant after refresh
6. Profile assets show “Not set” when URLs null in database
