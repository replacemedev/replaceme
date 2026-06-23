# Worker Job Search QA

## Scope

Premium worker job search at `/worker/jobs` with employer-posted listings from `job_posts` view.

## Database relationship integrity

| Artifact | Role | Verified |
|----------|------|----------|
| `jobs` | Employer-created postings | MCP `list_tables` |
| `company_profiles` | Company name + logo via `employer_id` | JOIN in view |
| `job_posts` | View: `jobs` LEFT JOIN `company_profiles` | Migration `worker_job_search_schema_v2` |
| `jobs.location` | Location filter field | Added via migration |
| `worker_saved_jobs` | Bookmark persistence | Added via migration + RLS |

**Worker query:** `job_posts` WHERE `status = 'Active'`, ordered by `created_at`.

**Facets:** Employment type counts and skill suggestions computed from fetched rows — no hardcoded filter numbers.

## Zero mock data policy

- [x] `page.tsx` async Server Component fetches from Supabase
- [x] No hardcoded job arrays or fake employment counts
- [x] No PL/pgSQL seed functions on this page
- [x] Empty grid shows `EmptyState` when filters match nothing
- [x] Bookmark state from `worker_saved_jobs` table

## Component architecture

| Component | Path | Role |
|-----------|------|------|
| `JobSearchClient` | `worker/jobs/JobSearchClient.tsx` | Client filter/sort/pagination orchestrator |
| `JobSearchHero` | `worker/jobs/JobSearchHero.tsx` | Gradient hero + floating search pill |
| `JobFilterSidebar` | `worker/jobs/JobFilterSidebar.tsx` | Skills, employment type, salary sliders |
| `JobCardGrid` | `worker/jobs/JobCardGrid.tsx` | Responsive grid + load more |
| `JobCard` | `worker/jobs/JobCard.tsx` | Individual job card + bookmark |

## UI enhancements

- [x] Gradient hero with unified search pill (stacks on mobile)
- [x] Employment type checkboxes with dynamic counts
- [x] Skill pills (max 3 selected)
- [x] Dual salary range sliders
- [x] Job cards: type/salary/location badges, hover border/shadow
- [x] Bookmark with server persistence
- [x] Load more with animated dots loader text
- [x] Mobile filter drawer

## Responsive audit

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Hero stacks inputs; filter drawer; single-column grid |
| `md` | 2-column job grid |
| `lg` | Persistent filter sidebar + main content |

## DOM flatness (ponytail)

- [x] Page → `JobSearchClient` → hero + grid layout (no wrapper soup)
- [x] `JobCard` single `article` with semantic header/footer

## Manual test checklist

1. Log in as worker → `/worker/jobs` → empty state if no Active jobs
2. Employer creates Active job → appears in worker search with company name
3. Employment type counts match real postings
4. Filters reduce results; Clear all resets
5. Bookmark toggles persist after refresh
6. View Details opens `/worker/jobs/[jobId]`
7. Mobile: Filters button opens drawer

## MCP migrations applied

- `worker_job_search_schema_v2` — `jobs.location`, `job_posts` view refresh, `worker_saved_jobs`
