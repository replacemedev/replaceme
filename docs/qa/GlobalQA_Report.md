# Global QA Report — Marketplace Skeleton & Data Policy

## Scope

Platform-wide skeleton loading strategy, unified types, zero-mock-data enforcement, and layout fidelity across all primary routes.

## Global skeleton strategy

### Primitives (`src/components/shared/skeletons/primitives.tsx`)

| Primitive | Purpose |
|-----------|---------|
| `SkeletonBlock` | Base `bg-gray-200 animate-pulse` block |
| `TextLineSkeleton` | Body text placeholder |
| `TitleSkeleton` | H1/H2 sizing (`sm`–`xl`) |
| `CardSkeleton` | White bordered card shell |
| `StatCardSkeleton` | Dashboard metric card |
| `PageHeaderSkeleton` | Greeting + optional CTA |
| `ListRowSkeleton` | Applicant/message row |
| `GridCardSkeleton` | 2/3/4-column grids |

### Screen composites

Reusable twins: `WorkerDashboardSkeleton`, `EmployerDashboardSkeleton`, `ApplicationsPageSkeleton`, `JobSearchPageSkeleton`, `MessagingPageSkeleton`, `AuthPageSkeleton`, `LandingPageSkeleton`, `ProfilePageSkeleton`, `JobDetailPageSkeleton`, `FormPageSkeleton`, `SettingsPageSkeleton`, `GridListingPageSkeleton`.

### Layout segment behavior

- **Worker/Employer routes:** `layout.tsx` renders header + footer; `loading.tsx` skeletons **main content only** (no duplicate chrome).
- **Public routes (landing, auth, legal):** `loading.tsx` includes full-page shell where `page.tsx` does.

### Zero-shift rule

Skeletons mirror final pages on: `max-w-*`, `px/py`, grid columns (`lg:grid-cols-3`), card `min-h`, and negative overlap (`-mt-12`) on job detail/apply flows.

## Route coverage (`loading.tsx` inventory)

| Route | Skeleton | Status |
|-------|----------|--------|
| `/` | `LandingPageSkeleton` | Added |
| `/login` | `AuthPageSkeleton` | Added |
| `/signup` | `AuthPageSkeleton` | Added |
| `/terms-of-service` | `LegalPageSkeleton` | Existing |
| `/privacy-policy` | `LegalPageSkeleton` | Existing |
| `/worker/dashboard` | `WorkerDashboardSkeleton` | Added |
| `/worker/jobs` | `JobSearchPageSkeleton` | Added |
| `/worker/jobs/[id]` | `JobDetailPageSkeleton` | Added |
| `/worker/jobs/[id]/apply` | `FormPageSkeleton` | Added |
| `/worker/applications` | `ApplicationsPageSkeleton` | Added |
| `/worker/messages` | `MessagingPageSkeleton` | Added |
| `/worker/profile` | `ProfilePageSkeleton` | Added |
| `/worker/saved-jobs` | `SavedJobsSkeleton` | Existing |
| `/worker/verification` | `VerificationSkeleton` | Existing |
| `/employer/dashboard` | `EmployerDashboardSkeleton` | Added |
| `/employer/pinned` | `GridListingPageSkeleton` | Added |
| `/employer/pricing` | `SettingsPageSkeleton` | Added |
| `/employer/messages` | `MessagingPageSkeleton` | Added |
| `/employer/hired` | `GridListingPageSkeleton` | Added |
| `/employer/jobs/create` | `SettingsPageSkeleton` | Added |
| `/employer/jobs/[jobId]` | `JobDetailPageSkeleton` | Added |
| `/employer/jobs/[jobId]/applicants` | `GridListingPageSkeleton` | Added |
| `/employer/checkout/[planId]` | `SettingsPageSkeleton` | Added |
| `/employer/settings/account` | `SettingsPageSkeleton` | Added |
| `/employer/settings/company` | `SettingsPageSkeleton` | Added |

**25/25 primary routes** have `loading.tsx` twins.

## Unified types (`src/types/index.ts`)

Barrel re-exports for Applications, Jobs, Job Details, Job Application, Saved Jobs, Verification, Worker Profile, Employer Applicants/Pinned, and Messaging — single import surface for cross-domain features.

## Zero mock data & no seeding

| Action | Detail |
|--------|--------|
| Removed | `seed_worker_dashboard_data` RPC call from worker dashboard |
| Policy | All list pages use Supabase queries; 0 rows → `EmptyState` |
| Forbidden | PL/pgSQL seed functions, hardcoded job/applicant arrays in pages |

### Known remaining stubs (out of skeleton scope)

- Stripe mock secrets in dev checkout flow
- `resumeUrl` stub in employer applicants when unlocked
- Landing page marketing carousel (static marketing content, not DB entities)

## Database (MCP)

Core marketplace schema already applied via prior migrations:

- `profiles`, `jobs`, `job_posts` view, `company_profiles`
- `applications`, `worker_saved_jobs` / `saved_jobs` view
- `verification_documents`, `worker_profiles` view

No new seeding migrations added.

## DOM flatness (ponytail)

- Skeleton primitives are leaf components — no wrapper soup
- Screen skeletons use semantic `div` + grid only where layout requires
- `loading.tsx` files are one-line delegates to shared composites

## Route architecture note

Explicit App Router segments are retained (`/worker/jobs/[id]`, etc.) instead of catch-all `[...slug]` routes to preserve stable URLs, SEO, and typed `params`. Functionally equivalent to the requested structure with better maintainability.

## Global authenticated navigation

### Architecture

| Layer | File | Responsibility |
|-------|------|----------------|
| Session resolver | `src/lib/auth/nav-session.ts` | Server-only `getNavSession()` — profile JOIN `company_profiles`, unread messages, role home path |
| Role routing config | `src/config/navigation.ts` | `ROLE_HOME_PATH`: worker → `/worker/job-search`, employer → `/employer/dashboard`, admin → `/admin/dashboard` |
| Public shell | `src/components/layout/PublicHeader.tsx` | Async server wrapper → client `Header` with `NavSession` |
| Auth actions | `src/components/shared/nav/AuthenticatedNavActions.tsx` | Notifications bell + role-specific profile dropdown |
| Smart brand | `src/components/shared/nav/NavBrand.tsx` | Logo links to `session.homeHref` |

### Smart logo routing verification

| Role | `homeHref` | Notes |
|------|------------|-------|
| Guest | `/` | Landing |
| Worker | `/worker/job-search` | Alias redirects to `/worker/jobs` |
| Employer | `/employer/dashboard` | |
| Admin | `/admin/dashboard` | Live Supabase counts, no mock stats |

### Screens with dynamic auth header

- `/` — `PublicHeader` (server session)
- `/terms-of-service`, `/privacy-policy` — `LegalPageLayout` → `PublicHeader`
- `/worker/*` — `WorkerHeader` via `getNavSession()`
- `/employer/*` — `EmployerHeader` via `getNavSession()`
- `/admin/*` — `AdminHeader` via `getNavSession()`

Authenticated users on public/legal pages see **Notifications** + **Profile dropdown**; marketing nav links are hidden.

### Middleware role guards (`src/utils/supabase/middleware.ts`)

- Unauthenticated → blocked from `/worker`, `/employer`, `/admin`
- Logged-in on `/login` or `/signup` → redirect to role home
- Cross-role access blocked (worker cannot hit employer/admin routes, etc.)

## Manual verification checklist

1. Navigate each primary route — brief skeleton flash before content
2. Compare skeleton grid columns to loaded page at `lg` breakpoint
3. Empty DB → dashboards show zero counts / `EmptyState`, not mock rows
4. Worker dashboard loads without calling seed RPC
5. Log in as worker — visit `/` and `/privacy-policy` — bell + dropdown visible; logo → `/worker/job-search`
6. Log in as employer — logo → `/employer/dashboard`; worker routes redirect
7. Admin route `/admin/dashboard` shows live counts from Supabase (0 when empty)
