# Worker Applications QA

## Scope

Premium worker "My Applications" view at `/worker/applications` with shared navigation update in `WorkerHeader` / `MobileMenu`.

## Database relationship integrity

| Table / View | FK / Role | Notes |
|--------------|-----------|-------|
| `applications` | `candidate_id` → `profiles.id` | Worker application records (domain alias: job_applications) |
| `applications` | `job_id` → `jobs.id` | Links to job post |
| `job_posts` | View over `jobs` + `company_profiles` | Supplies `company_name`, `logo_url`, salary fields |

**Worker query:** `applications` JOIN `job_posts` WHERE `candidate_id = auth worker profile`.

**Stats aggregation:** Computed in `getWorkerApplicationStats()` from real rows — no hardcoded counts.

| Stat | Calculation |
|------|-------------|
| Total Sent | `applications.length` |
| Sent this week | `created_at` within last 7 days |
| Under Review | `status IN ('Applied', 'Shortlisted')` |
| Interviews Scheduled | `status = 'Interviewing'` |

RLS: Workers read own applications via `candidate_id = auth.uid()` policy in monolithic schema.

## Zero mock data policy

- [x] `page.tsx` is async Server Component fetching from Supabase
- [x] No hardcoded application arrays or fake stats
- [x] No PL/pgSQL seed functions on this page
- [x] Empty list shows `EmptyState` with link to browse jobs
- [x] Interview badge uses honest copy when no schedule table exists (`"None scheduled"` / `"N active"`)

## Component architecture

| Component | Path | Role |
|-----------|------|------|
| `ApplicationsClient` | `worker/applications/ApplicationsClient.tsx` | Client filter/sort/pagination orchestrator |
| `ApplicationStatCard` | `worker/applications/ApplicationStatCard.tsx` | Top 3 stat cards |
| `ApplicationFilterSidebar` | `worker/applications/ApplicationFilterSidebar.tsx` | Date + status filters |
| `ApplicationRow` | `worker/applications/ApplicationRow.tsx` | Application list row with status badge |
| `WorkerDesktopNav` | `layout/WorkerDesktopNav.tsx` | Active-state desktop nav |
| `WORKER_NAV_ITEMS` | `config/workerNav.ts` | Single source for desktop + mobile nav |

**Pass:** No duplicate page JSX between routes. Page only fetches and passes props.

## UI enhancements (vs dry design reference)

- [x] Color-coded status badges on every row (no click required)
- [x] Hover states: `hover:border-emerald-200 hover:shadow-md` on rows
- [x] Expanded status checkbox filter group
- [x] Sort by: Most Recent, Oldest, Status, Rate High/Low
- [x] Export List generates CSV from filtered real data
- [x] Stat cards with tinted backgrounds, watermark icons, dynamic badges

## Responsive audit

| Breakpoint | Behavior |
|------------|----------|
| Mobile (`< sm`) | Single-column stats; header stacks; filter drawer via button |
| `sm` | 2-column stats grid; header row layout |
| `lg` | 3-column stats; persistent filter sidebar + list split |
| Text | `truncate` on job title / company; row stacks on narrow screens |

## DOM flatness (ponytail)

- [x] Page → `ApplicationsClient` → grid sections (no wrapper soup)
- [x] Filter sidebar: single card, semantic lists for checkboxes
- [x] Application rows: flat `article` with flex, no nested card-in-card

## Navigation update

- [x] `Applications` link added to `WORKER_NAV_ITEMS`
- [x] Active state on `/worker/applications` in desktop nav (`WorkerDesktopNav`)
- [x] Active state in mobile hamburger menu (`MobileMenu`)

## Manual test checklist

1. Log in as worker → `/worker/applications` → empty state if no applications
2. Submit application via job flow → row appears with real company/job/rate
3. Stats cards reflect live counts
4. Filter by status + date → list updates
5. Sort dropdown reorders list
6. Load More reveals additional rows in batches of 10
7. Export List downloads CSV of filtered data
8. Mobile: Filters button opens drawer; desktop: sidebar visible
9. Header "Applications" link shows active green state on this route

## Known follow-ups

- `View Details` links to `/worker/jobs` until a dedicated worker job detail route exists
- Interview stat badge cannot show "Next: Tomorrow, 2 PM" until an interview scheduling table is added
