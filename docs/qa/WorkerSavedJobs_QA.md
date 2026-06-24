# Worker Saved Jobs QA

## Scope

Premium worker saved jobs list at `/worker/saved-jobs` with URL-driven search/sort, skeleton loading, and employer marketplace bridge.

## Database relationship integrity

| Layer | Connection |
|-------|------------|
| Junction | `worker_saved_jobs` (`saved_jobs` view alias) |
| Worker FK | `worker_id` → `profiles.id` |
| Job FK | `job_id` → `jobs.id` ON DELETE CASCADE |
| Employer content | `job_posts` view = `jobs` LEFT JOIN `company_profiles` |

### Query path

```
worker_saved_jobs
  INNER JOIN job_posts ON job_id = job_posts.id
  WHERE worker_id = auth worker
  AND job_posts.status = 'Active'
```

- Deleted jobs: CASCADE removes bookmark rows automatically
- Inactive jobs: filtered out by `status = 'Active'` (no broken cards)
- `unsaveJob` verifies bookmark exists; cleans orphan if job post missing

## Zero mock data policy

- [x] Server page fetches authenticated worker's saved rows only
- [x] Company name/logo from `job_posts` JOIN (company_profiles)
- [x] Salary/type/location from live job post fields
- [x] `hasApplied` from real `applications` lookup
- [x] Empty state when zero bookmarks (or zero search matches)

## URL-based state (no filter useState)

| Param | Purpose |
|-------|---------|
| `?q=` | Search title, company, location, employment type |
| `?sort=` | `date_saved_newest` (default), oldest, salary, title |

- `SavedJobsHeader` updates URL via `router.replace` (debounced search)
- `page.tsx` reads `searchParams` server-side; filter/sort in `getSavedJobs`

## Component architecture (ponytail)

| Component | Client? | Role |
|-----------|---------|------|
| `SavedJobsHeader` | Yes | URL search/sort only |
| `SavedJobCard` | Yes | Unsave mutation + CTAs |
| `SavedJobsSkeleton` | No | Pulse layout mirror |
| Page | No | Auth, fetch, list/empty |

DOM: `div` → `header` + `ul`/`EmptyState`. No wrapper soup.

## Typography tweak

- [x] Page title uses `font-medium` — **not** bold/black

## Skeleton fidelity

- [x] `loading.tsx` renders `SavedJobsSkeleton`
- [x] Mirrors: title block, search + sort bars, 4 horizontal card placeholders

## Responsive audit

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Stacked card; pills below title; actions full width |
| `md+` | Horizontal card; pills inline; actions right-aligned |
| `sm` | Action buttons row |

## Manual test checklist

1. Save job from `/worker/jobs` → appears on `/worker/saved-jobs`
2. Unsave from card → row removed; job search bookmark cleared
3. `?q=designer` filters list; `?sort=salary_high` reorders
4. Empty state links to `/worker/jobs`
5. Apply Now → `/worker/jobs/[id]/apply`; after apply → View Details
6. Delete job in Supabase → bookmark row gone (CASCADE)

## MCP / schema

Migration `saved_jobs_view_alias`: view `saved_jobs` → `worker_saved_jobs`. Canonical table unchanged with existing RLS.
