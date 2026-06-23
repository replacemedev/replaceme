# Worker Job Details QA

## Scope

Premium worker job details at `/worker/jobs/[id]` with overlapping hero layout and employer marketplace bridge.

## Database relationship integrity

| Query | Source |
|-------|--------|
| Job post | `job_posts` WHERE `id = [id]` AND `status = 'Active'` |
| Company | `company_profiles` WHERE `employer_id = job.employer_id` |
| Active posts count | `COUNT(job_posts)` WHERE `employer_id` matches AND `status = 'Active'` |
| Saved state | `worker_saved_jobs` for authenticated worker |
| Applied state | `applications` for authenticated worker |

No mock company stats or hardcoded post counts.

## Zero mock data policy

- [x] Server Component fetches single job by URL `id`
- [x] `notFound()` when job missing or inactive
- [x] Employer active posts count from Supabase aggregation
- [x] Member since from `company_profiles.created_at`
- [x] Apply inserts real `applications` row (`PENDING`)

## Component architecture

| Component | Path | Role |
|-----------|------|------|
| `JobDetailsHero` | `details/JobDetailsHero.tsx` | Green banner, back/report, title meta |
| `ApplyActionButtons` | `details/ApplyActionButtons.tsx` | Client Apply + Save with server actions |
| `JobOverviewCard` | `details/JobOverviewCard.tsx` | Parsed description + compensation box |
| `JobSidebarCards` | `details/JobSidebarCards.tsx` | Job details + employer info |
| Page | `app/worker/jobs/[id]/page.tsx` | Server orchestrator |

## UI enhancements

- [x] Deep green hero with white typography
- [x] Overlapping main content (`-mt-12 sm:-mt-16`)
- [x] Custom list icons: check / star / arrow in blue circles
- [x] Violet compensation highlight box
- [x] Apply button with green glow; Save outline button
- [x] `lg:grid-cols-3` with overview `col-span-2`

## Responsive audit

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Hero stacks; single column cards |
| `lg` | Two-column grid (2/3 overview + 1/3 sidebar) |

## DOM flatness (ponytail)

- [x] Page: hero + single `main` grid (no wrapper soup)
- [x] Server page has zero client boundary except action buttons in hero

## Manual test checklist

1. Open active job from `/worker/jobs` → details render with company name
2. Invalid id → 404
3. Apply → creates application, button shows Applied
4. Save toggles bookmark and persists on refresh
5. Employer active post count matches Supabase count
6. Description sections parse when employer uses Responsibilities/Requirements headers

## MCP / schema

Uses existing `job_posts` view + `company_profiles` FK via `employer_id`. No new migration required for this page.
