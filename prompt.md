# Feature Implementation Prompt Template (Modular)

**How to use this file:** Read **Core** (including **Repository File Map** + **Agent Skills Index** + **Auto-Profile Classifier** + **Always-On Invariants**) first. The agent **must** auto-detect the profile, apply escalations, read applicable **agent skills**, then read **only** the resulting sections. Token savings come from the **File Map** + skipping unused section *modules* — not from skipping architecture guardrails or installed skills.

---

## Core (always read)

### Operating rules
1. **File map first** — Use **Repository File Map** below (auto-synced from workspace). Do **not** broad-scan or `explore` the repo unless the map is stale or the user reports a novel area. After add/rename/delete/move under `src/` or `supabase/migrations/`, run `npm run prompt:sync`.
2. **Skills second** — Read **Agent Skills Index** below. Load every skill listed for your profile (full `SKILL.md` at the path). **Ponytail is always-on** (default: `full`).
3. **Auto-classify** the request (classifier below) → state profile + escalations + why.
4. Fill **Feature Spec** + **Always-On Invariants** + sections for the **final** profile (after escalations).
5. Generate a **scoped Execution Checklist** (applicable rows only).
6. **STOP** and ask for **explicit approval** before application code.
7. During build: update checklist live (`Done` / `Missed` / `Lacking/Incomplete`).
8. After build: emit **Post-Build Report** (checklist with Done/Missed/Lacking per success criterion). If you added/renamed/deleted/moved files under `src/` or `supabase/migrations/`, run **`npm run prompt:sync`** before finishing.

<!-- PROMPT_SYNC:BEGIN -->
### Repository File Map (auto-generated from workspace)

**Last synced:** 2026-06-26T03:49:46.217Z · **Git:** `4429790`
**Regenerate:** `npm run prompt:sync` after any add, rename, delete, or move under `src/`, `supabase/migrations/`, or root entry files.

**Agent rule:** Use this map + **Task → Files**. Do not broad-scan the repo. If a path is missing here, run `npm run prompt:sync` (or ask the user to).

#### Repo root (non-src)

```txt
prompt.md  # This guide (auto-synced file map)
AGENTS.md
.cursorrules
src/proxy.ts
.env.example
package.json
supabase/migrations/*.sql  # 30 migration file(s)
```

#### `src/app/` — routes (App Router) — 100 route files

```txt
src/app/(public)/contact/loading.tsx
src/app/(public)/contact/page.tsx
src/app/(public)/layout.tsx
src/app/(public)/loading.tsx
src/app/(public)/page.tsx
src/app/(public)/privacy-policy/loading.tsx
src/app/(public)/privacy-policy/page.tsx
src/app/(public)/terms-of-service/loading.tsx
src/app/(public)/terms-of-service/page.tsx
src/app/403/page.tsx
src/app/admin/(shell)/audit-log/loading.tsx
src/app/admin/(shell)/audit-log/page.tsx
src/app/admin/(shell)/dashboard/loading.tsx
src/app/admin/(shell)/dashboard/page.tsx
src/app/admin/(shell)/disputes/loading.tsx
src/app/admin/(shell)/disputes/page.tsx
src/app/admin/(shell)/identity/loading.tsx
src/app/admin/(shell)/identity/page.tsx
src/app/admin/(shell)/jobs/loading.tsx
src/app/admin/(shell)/jobs/page.tsx
src/app/admin/(shell)/layout.tsx
src/app/admin/(shell)/loading.tsx
src/app/admin/(shell)/revenue/loading.tsx
src/app/admin/(shell)/revenue/page.tsx
src/app/admin/(shell)/security/loading.tsx
src/app/admin/(shell)/security/page.tsx
src/app/admin/(shell)/settings/page.tsx
src/app/admin/(shell)/users/loading.tsx
src/app/admin/(shell)/users/page.tsx
src/app/admin/error.tsx
src/app/admin/layout.tsx
src/app/admin/mfa-challenge/layout.tsx
src/app/admin/mfa-challenge/page.tsx
src/app/admin/not-found.tsx
src/app/api/webhooks/stripe/route.ts
src/app/auth/callback/route.ts
src/app/auth/confirm/route.ts
src/app/employer/checkout/[planId]/loading.tsx
src/app/employer/checkout/[planId]/page.tsx
src/app/employer/dashboard/loading.tsx
src/app/employer/dashboard/page.tsx
src/app/employer/hired/loading.tsx
src/app/employer/hired/page.tsx
src/app/employer/jobs/[jobId]/applicants/loading.tsx
src/app/employer/jobs/[jobId]/applicants/page.tsx
src/app/employer/jobs/[jobId]/loading.tsx
src/app/employer/jobs/[jobId]/page.tsx
src/app/employer/jobs/create/loading.tsx
src/app/employer/jobs/create/page.tsx
src/app/employer/jobs/loading.tsx
src/app/employer/jobs/page.tsx
src/app/employer/layout.tsx
src/app/employer/messages/loading.tsx
src/app/employer/messages/page.tsx
src/app/employer/onboarding/page.tsx
src/app/employer/pinned/loading.tsx
src/app/employer/pinned/page.tsx
src/app/employer/pricing/loading.tsx
src/app/employer/pricing/page.tsx
src/app/employer/settings/account/loading.tsx
src/app/employer/settings/account/page.tsx
src/app/employer/settings/company/loading.tsx
src/app/employer/settings/company/page.tsx
src/app/layout.tsx
src/app/login/loading.tsx
src/app/login/page.tsx
src/app/signup/loading.tsx
src/app/signup/page.tsx
src/app/update-password/page.tsx
src/app/worker/applications/[id]/page.tsx
src/app/worker/applications/loading.tsx
src/app/worker/applications/page.tsx
src/app/worker/contracts/page.tsx
src/app/worker/dashboard/loading.tsx
src/app/worker/dashboard/page.tsx
src/app/worker/earnings/page.tsx
src/app/worker/interviews/page.tsx
src/app/worker/job-alerts/page.tsx
src/app/worker/job-search/page.tsx
src/app/worker/jobs/[id]/apply/loading.tsx
src/app/worker/jobs/[id]/apply/page.tsx
src/app/worker/jobs/[id]/loading.tsx
src/app/worker/jobs/[id]/page.tsx
src/app/worker/jobs/loading.tsx
src/app/worker/jobs/page.tsx
src/app/worker/layout.tsx
src/app/worker/messages/loading.tsx
src/app/worker/messages/page.tsx
src/app/worker/notifications/page.tsx
src/app/worker/onboarding/page.tsx
src/app/worker/profile/edit/page.tsx
src/app/worker/profile/loading.tsx
src/app/worker/profile/page.tsx
src/app/worker/saved-jobs/loading.tsx
src/app/worker/saved-jobs/page.tsx
src/app/worker/settings/page.tsx
src/app/worker/skills/edit/page.tsx
src/app/worker/tests/page.tsx
src/app/worker/verification/loading.tsx
src/app/worker/verification/page.tsx
```

#### `src/actions/` — Server Actions (24 files)

```txt
src/actions/admin-actions.ts
src/actions/applications.ts
src/actions/auth.ts
src/actions/employer/applicants.ts
src/actions/employer/billing.ts
src/actions/employer/company.ts
src/actions/employer/dashboard.ts
src/actions/employer/hired.ts
src/actions/employer/jobs.ts
src/actions/employer/pinned.ts
src/actions/employer/pricing.ts
src/actions/employer/stripe.ts
src/actions/job-application.ts
src/actions/messaging.ts
src/actions/notifications.ts
src/actions/onboarding.ts
src/actions/saved-jobs.ts
src/actions/verification.ts
src/actions/worker/applications.ts
src/actions/worker/contracts.ts
src/actions/worker/job-details.ts
src/actions/worker/job-search.ts
src/actions/worker/phase2.ts
src/actions/worker/profile.ts
```

#### `src/lib/` — infra, DAL, validations (30 files)

```txt
src/lib/auth/error-message.ts
src/lib/auth/nav-session.ts
src/lib/auth/role.ts
src/lib/auth/site-url.ts
src/lib/notifications/fetch-initial.ts
src/lib/server/action-result.ts
src/lib/server/auth/middleware.ts
src/lib/server/auth/require-admin.ts
src/lib/server/auth/session.ts
src/lib/server/auth/worker.ts
src/lib/server/dal/applications.ts
src/lib/server/dal/jobs.ts
src/lib/server/dal/profiles.ts
src/lib/server/rate-limit.ts
src/lib/server/stripe/sync-subscription.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/validations/applicants.ts
src/lib/validations/applications.ts
src/lib/validations/auth.ts
src/lib/validations/billing.ts
src/lib/validations/common.ts
src/lib/validations/employer/company.ts
src/lib/validations/employer/jobs.ts
src/lib/validations/messaging.ts
src/lib/validations/onboarding.ts
src/lib/validations/pinned.ts
src/lib/validations/stripe.ts
src/lib/validations/verification.ts
src/lib/validations/worker/phase2.ts
```

#### `src/components/` — UI domains

```txt
src/components/admin/  (17 files)
src/components/auth/  (11 files)
src/components/dashboard/  (0 files)
src/components/employer/  (53 files)
src/components/landing/  (1 files)
src/components/layout/  (8 files)
src/components/shared/
  shared/header/  (3 files)
  shared/legal/  (3 files)
  shared/messaging/  (8 files)
  shared/nav/  (3 files)
  shared/onboarding/  (1 files)
  shared/skeletons/  (12 files)
src/components/ui/  (4 files)
src/components/worker/  (41 files)
```

#### `src/types/` (22) · `src/config/` (3) · `src/hooks/` (1)

```txt
src/types/admin.types.ts
src/types/applications.ts
src/types/database.ts
src/types/employer.ts
src/types/employer/applicants.ts
src/types/employer/billing.ts
src/types/employer/dashboard.ts
src/types/employer/hired.ts
src/types/employer/jobs.ts
src/types/employer/messages.ts
src/types/employer/pinned.ts
src/types/index.ts
src/types/job-application.ts
src/types/job-details.ts
src/types/job-search.ts
src/types/messaging.ts
src/types/nav.ts
src/types/notifications.types.ts
src/types/saved-jobs.ts
src/types/verification.ts
src/types/worker-profile.ts
src/types/worker.ts
src/config/navigation.ts
src/config/onboarding.ts
src/config/workerNav.ts
src/hooks/useNotifications.ts
```

#### Task → Files (patterns resolved at sync — open these first)

| Task area | Paths (existing in workspace) |
|-----------|-------------------------------|
| **Headers (bell, avatar, sign out)** | src/components/admin/layout/AdminDropdown.tsx, src/components/admin/layout/AdminHeader.tsx, src/components/employer/layout/EmployerDropdown.tsx, src/components/employer/layout/EmployerHeader.tsx, src/components/layout/PublicHeader.tsx, … (+6 more) |
| **Password reset** | src/actions/auth.ts, src/app/auth/callback/route.ts, src/app/auth/confirm/route.ts, src/app/update-password/page.tsx, src/components/auth/ForgotPasswordForm.tsx, … (+4 more) |
| **Login / signup** | src/actions/auth.ts, src/app/login/loading.tsx, src/app/login/page.tsx, src/app/signup/loading.tsx, src/app/signup/page.tsx, … (+3 more) |
| **Onboarding** | src/actions/onboarding.ts, src/app/employer/onboarding/page.tsx, src/app/worker/onboarding/page.tsx, src/components/employer/onboarding/EmployerOnboardingWizard.tsx, src/components/shared/onboarding/SkillPicker.tsx, … (+4 more) |
| **Worker jobs** | src/actions/worker/job-details.ts, src/actions/worker/job-search.ts, src/app/worker/job-search/page.tsx, src/app/worker/jobs/[id]/apply/loading.tsx, src/app/worker/jobs/[id]/apply/page.tsx, … (+16 more) |
| **Employer jobs** | src/actions/employer/jobs.ts, src/app/employer/jobs/[jobId]/applicants/loading.tsx, src/app/employer/jobs/[jobId]/applicants/page.tsx, src/app/employer/jobs/[jobId]/loading.tsx, src/app/employer/jobs/[jobId]/page.tsx, … (+15 more) |
| **Messaging** | src/actions/messaging.ts, src/app/employer/messages/loading.tsx, src/app/employer/messages/page.tsx, src/app/worker/messages/loading.tsx, src/app/worker/messages/page.tsx, … (+10 more) |
| **Notifications** | src/actions/notifications.ts, src/hooks/useNotifications.ts, src/lib/notifications/fetch-initial.ts, src/types/notifications.types.ts |
| **Admin moderation** | src/actions/admin-actions.ts, src/app/admin/(shell)/audit-log/loading.tsx, src/app/admin/(shell)/audit-log/page.tsx, src/app/admin/(shell)/dashboard/loading.tsx, src/app/admin/(shell)/dashboard/page.tsx, … (+39 more) |
| **Stripe / billing** | src/actions/employer/billing.ts, src/actions/employer/stripe.ts, src/app/api/webhooks/stripe/route.ts, src/app/employer/checkout/[planId]/loading.tsx, src/app/employer/checkout/[planId]/page.tsx, … (+5 more) |
| **RLS / schema** | src/types/database.ts, supabase/migrations/0000_complete_monolithic_schema.sql, supabase/migrations/00_initial_schema.sql, supabase/migrations/20260621000000_create_messaging_schema.sql, supabase/migrations/20260621000100_create_applicants_schema.sql, … (+26 more) |
| **RBAC / middleware** | src/lib/server/auth/middleware.ts, src/lib/server/auth/require-admin.ts, src/lib/server/auth/session.ts, src/proxy.ts |

#### Role home paths (from `src/config/navigation.ts`)

| Role | Home after login |
|------|------------------|
| Worker | `/worker/job-search` |
| Employer | `/employer/dashboard` |
| Admin | `/admin/dashboard` |
| Public | `/` |
<!-- PROMPT_SYNC:END -->

### Always-On Invariants (every profile — never skip)

These prevent spaghetti and debug loops regardless of profile:

| Invariant | Rule |
|-----------|------|
| **Stack** | Next.js 16 App Router · React 19 · Tailwind v4 · TypeScript strict · Supabase |
| **Routes** | Worker `src/app/worker/*` · Employer `src/app/employer/*` · Admin `src/app/admin/*` |
| **No mock data** | No hardcoded arrays, seeders, or fake stats in UI |
| **DB access** | Reads/writes only via DAL (`src/lib/server/dal/**`, `server-only`) — never in components |
| **Mutations** | Server Actions only; Zod + RBAC + `{ success, data, error }` on every action touched |
| **Types** | `src/types/database.ts` — no `any`; regen after any schema change |
| **UI split** | RSC for pages/layouts; client components only at interaction leaves |
| **Shared UI** | Reuse `src/components/shared/**` before creating role-specific duplicates |
| **Ponytail** | Lazy senior dev: shortest working diff, YAGNI, reuse before write, root-cause fixes — see **Agent Skills Index** + `.agents/skills/ponytail/SKILL.md`. DOM: flat tree, no wrapper soup, composition over boolean props (`.cursorrules`) |
| **Cache** | `revalidatePath` after mutations that affect rendered views |
| **RLS** | New/changed tables must have explicit policies before UI ships |
| **Pre-flight** | Use **Task → Files** + mirror 1–2 paths from File Map — no broad repo scan |

**If a task violates an invariant, escalate the profile** (see Escalation Rules) — do not “save tokens” by breaking architecture.

---

### Agent Skills Index (installed in `.agents/skills/`)

**Agent rule:** When a skill applies, **read the full `SKILL.md`** at the path below before implementing. Skills are local to this workspace (`SKILLS/skills-lock.json`). For Vercel skills, also use the companion `AGENTS.md` in the same folder for rule-level detail. Do not substitute memory for the skill file.

#### Always-on (every profile — read first)

| Skill | Path | Purpose |
|-------|------|---------|
| **Ponytail** | `.agents/skills/ponytail/SKILL.md` | **Default intensity: `full`.** Lazy senior dev ladder — YAGNI → reuse codebase → stdlib → existing deps → minimum code. Root-cause bug fixes (one guard in shared function, not N callers). Shortest diff after understanding the flow. Mark deliberate shortcuts with `// ponytail: …` |
| **Workflow** | `AGENTS.md` | Plan → Build → Fix; file map first; approval gate |
| **Stack invariants** | `.cursorrules` | Next.js App Router, Supabase, zero mock data, role routes, Ponytail DOM |

**Ponytail intensity:** `lite` \| `full` (default) \| `ultra`. Off only when user says **“stop ponytail”** / **“normal mode”**.

**Never simplify away (Ponytail + marketplace):** Zod + RBAC on mutations, RLS, auth inside Server Actions, `{ success, error }` returns, validation at trust boundaries, accessibility basics, anything explicitly requested.

**Ponytail DOM doctrine** (`.cursorrules` + composition skill):

- Shallow DOM — no div soup; use Tailwind `grid` / `flex` / `gap-*`, not margin hacks
- RSC for pages/layouts; `'use client'` only at interaction leaves
- No boolean prop proliferation — compound components + explicit variants (see composition skill)
- Reuse `src/components/shared/**` before role-specific duplicates

#### Profile → skills (read full `SKILL.md` for each)

| Profile | Skills to read |
|---------|----------------|
| **A — UI** | `ponytail`, `vercel-composition-patterns`, `ui-principles`, `ui-design-system`, `web-design-guidelines` |
| **B — Backend** | `ponytail`, `vercel-react-best-practices`, `api-rest`, `database-design` |
| **C — Full-stack** | `ponytail`, `nextjs-typescript-tailwindcss-supabase`, `vercel-composition-patterns`, `vercel-react-best-practices`, `database-design`, `architecture-decision-records` |
| **D — Database** | `ponytail`, `database-design`, `db-postgres` |
| **E — Design / docs** | `ponytail`, `drawio-skill`, `ux-enhancer`, `architecture-decision-records` |
| **F — Bug fix** | `ponytail` (root cause), `vercel-react-best-practices` (only rules relevant to the bug — e.g. `server-*`, `async-*`) |

After escalation (e.g. A→C), merge skill lists from **both** profiles.

#### Task area → skills (use with **Task → Files** map)

| Task area | Skills |
|-----------|--------|
| Headers, onboarding, forms, dashboards | `ponytail`, `vercel-composition-patterns`, `ui-principles` |
| Auth, password reset, RBAC | `ponytail`, `vercel-react-best-practices` (`server-authenticate-actions`) |
| Worker/employer jobs, messaging | `ponytail`, `vercel-react-best-practices` (`async-*`, `server-parallel-*`) |
| Stripe / billing | `ponytail`, `api-rest`, `nextjs-typescript-tailwindcss-supabase` |
| RLS / schema / migrations | `ponytail`, `database-design`, `db-postgres` |
| Admin moderation | `ponytail`, `vercel-react-best-practices`, `absolute` (security sections if touching auth) |
| New feature / architecture | `improve-codebase-architecture`, `architecture-decision-records` |
| Page transitions / navigation UX | `vercel-react-view-transitions` |
| Whimsical / diagrams | `drawio-skill` |
| UX audit / empty states | `ux-enhancer` |
| shadcn / UI primitives | `shadcn` |

#### Ponytail ladder (quick reference — full rules in skill file)

1. Does this need to exist? (YAGNI)
2. Already in this codebase? Reuse it.
3. Stdlib / native platform?
4. Already-installed dependency?
5. One line?
6. Minimum code that works.

**Bug fix:** grep all callers; fix once at the shared choke point. **Output:** code first; at most three lines on what was skipped and when to add it.

#### Other installed skills (use when explicitly needed)

**Marketplace / stack (prefer these):**

```txt
.agents/skills/absolute/SKILL.md
.agents/skills/api-rest/SKILL.md
.agents/skills/architecture-decision-records/SKILL.md
.agents/skills/database-design/SKILL.md
.agents/skills/db-postgres/SKILL.md
.agents/skills/drawio-skill/SKILL.md
.agents/skills/improve/SKILL.md
.agents/skills/improve-codebase-architecture/SKILL.md
.agents/skills/nextjs-16/SKILL.md
.agents/skills/nextjs-typescript-tailwindcss-supabase/SKILL.md
.agents/skills/onboarding-guide/SKILL.md
.agents/skills/ponytail/SKILL.md
.agents/skills/shadcn/SKILL.md
.agents/skills/supastarter-nextjs-skill/SKILL.md
.agents/skills/ui-design-system/SKILL.md
.agents/skills/ui-principles/SKILL.md
.agents/skills/ux-enhancer/SKILL.md
.agents/skills/vercel-composition-patterns/SKILL.md
.agents/skills/vercel-react-best-practices/SKILL.md
.agents/skills/vercel-react-view-transitions/SKILL.md
.agents/skills/web-design-guidelines/SKILL.md
```

**General / tooling (optional):** `code-reviewer`, `find-docs`, `context7-mcp`, `context7-cli`, `deploy-service`, `file-indexer`, `markdown-formatter`, `state-tanstack` — under `.agents/skills/<name>/SKILL.md`.

Discover more: `.agents/skills/find-skills/SKILL.md` · Full inventory: `ls .agents/skills/` · Lock file: `SKILLS/skills-lock.json`

**Agent must output in the plan:** **Skills read:** list of `SKILL.md` paths for detected profile + task area.

---

### Auto-Profile Classifier (agent runs this every time)

Answer each question in order. First match wins unless an **escalation** fires later.

```
START
│
├─ User asks only for Whimsical / Figma / ERD / wireframes / architecture docs?
│     └─ YES → Profile E
│
├─ User reports a bug / error / regression with no new feature intent?
│     └─ YES → Profile F  (then run Escalation Rules)
│
├─ User asks for migration / RLS / schema / SQL only (no UI)?
│     └─ YES → Profile D  (then run Escalation Rules)
│
├─ User asks for Server Actions / API / webhooks / DAL only (no new pages)?
│     └─ YES → Profile B  (then run Escalation Rules)
│
├─ Request touches ANY of: new table/column/enum/RLS, new route, new mutation, multi-role?
│     └─ YES → Profile C
│
├─ Request is UI-only (styling, layout, component, empty state) on existing data paths?
│     └─ YES → Profile A  (then run Escalation Rules)
│
└─ Ambiguous / multi-sentence feature spec?
      └─ Default → Profile C (safest — full plan, still skip unread section modules)
```

**Agent must output in the plan (before approval):**
- **Detected profile:** `A | B | C | D | E | F`
- **Escalations applied:** `none` or `A→C because …`
- **Sections to read:** e.g. `Core, 3, 4, 5, 6, 7, 9`
- **Files to open (from File Map):** explicit paths — no broad scan

---

### Escalation Rules (upgrade profile — never downgrade)

| Signal detected | Upgrade to | Also read sections |
|-----------------|------------|-------------------|
| Profile **A** but needs new/edited Server Action | **C** | 4, 5, 7 |
| Profile **A** but needs new DAL query (not existing) | **C** | 5 (+ 4 if mutation) |
| Profile **A** but new route under `src/app/<role>/` | **C** | 3, 4, 5, 7 |
| Profile **B** but needs new UI route or component | **C** | 3, 6 |
| Profile **B** or **F** but schema/RLS change needed | **C** or **D** | 2 (+ 8-Whimsical if ERD) |
| Profile **F** but root cause is auth/RBAC/RLS | **B** or **C** | 4, 5 |
| Profile **F** but touches 3+ files across layers | **C** | all applicable |
| Any profile + cross-role feature (worker + employer + admin) | **C** | 8 (both if UI) |
| User says “new feature”, “build”, “implement”, “add flow” | **C** | all applicable |
| Design-only request but user also says “implement in code” | **C** | 8 + full stack |

**Rule:** When escalated, use the **higher** profile’s checklist rows and Definition of Done gates.

---

### Section Router (base profiles — before escalation)

| Profile | Base trigger | Section modules to read | Skills to read (see **Agent Skills Index**) |
|---------|--------------|-------------------------|---------------------------------------------|
| **A — UI only** | Visual/UX on existing data paths | **File Map**, **3**, **6**, **8-Figma** (if wireframes), scoped **9** | `ponytail`, `vercel-composition-patterns`, `ui-principles`, `ui-design-system`, `web-design-guidelines` |
| **B — Backend only** | Actions/DAL/validation, no new pages | **File Map**, **4**, **5**, **7**, scoped **9** | `ponytail`, `vercel-react-best-practices`, `api-rest`, `database-design` |
| **C — Full-stack** | DB + UI + mutations and/or multi-role | **File Map**, **2**, **3**, **4**, **5**, **6**, **7**, **8**, **9** | `ponytail`, `nextjs-typescript-tailwindcss-supabase`, `vercel-composition-patterns`, `vercel-react-best-practices`, `database-design`, `architecture-decision-records` |
| **D — Database** | Migrations/RLS/types only | **File Map**, **2**, **8-Whimsical**, scoped **9** | `ponytail`, `database-design`, `db-postgres` |
| **E — Design / docs** | Whimsical/Figma/architecture only | **File Map**, **8**, scoped **9** | `ponytail`, `drawio-skill`, `ux-enhancer`, `architecture-decision-records` |
| **F — Bug fix** | Localized fix, same feature surface | **File Map**, **Task → Files** row, scoped **9** | `ponytail`, `vercel-react-best-practices` (targeted rules only) |

**Agent rule:** Read **Core (incl. File Map + Skills) + listed modules only**. Do not read unlisted section modules. Do not `explore` the repo if **Task → Files** covers the request.

---

### Loop-Proof Debug Protocol (Profile F and escalated fixes)

When fixing bugs, **Phase 3 only** — no re-architecture:

1. **Reproduce** — exact route, role, action, error message.
2. **Locate** — use **Task → Files**; max 5 files; list in checklist before editing.
3. **Fix** — minimal diff; do not refactor unrelated code.
4. **Verify** — `tsc` + the specific user flow; one targeted grep if mock-data risk.
5. **Stop** — if fix requires new schema or new routes → **stop**, escalate to **C**, get approval.

**Forbidden in Profile F:** new abstractions, renaming unrelated files, “while I’m here” cleanup, full-system reanalysis.

---

### Feature Spec (fill every time)

| Field | Value |
|-------|-------|
| **Feature** | `<NAME>` |
| **Detected profile** | `<A–F>` |
| **Escalations** | `<none \| A→C because …>` |
| **Sections to read** | `<Core, 3, 4, …>` |
| **Skills read** | `<paths under .agents/skills/ — ponytail always>` |
| **Primary role(s)** | `<worker \| employer \| admin \| multi-role \| public>` |
| **Success criteria** | `<measurable outcomes>` |
| **Non-goals** | `<out of scope>` |
| **Routes (exact URLs)** | `<...>` |
| **Reads** | `<DAL queries per page>` |
| **Mutations** | `<Server Actions>` |
| **RBAC** | `<who can do what>` |
| **DB changes** | `<none \| tables/RLS/indexes>` |
| **Design artifacts** | `<none \| Whimsical \| Figma \| both>` |
| **Similar patterns** | `<paths from File Map only>` |

### Definition of Done (final profile after escalation)

| Gate | Profiles |
|------|----------|
| Always-On Invariants satisfied | **All** |
| DB migrated + advisors clean | C, D |
| Types regen | C, D |
| Zod + RBAC + safe return on touched actions | B, C, F (if action touched) |
| Server/Client split | A, C, F (if UI touched) |
| Empty states, no mock data | A, C |
| `npx tsc --noEmit` + scoped greps | All except E |
| Whimsical updated | C, D, E (when in scope) |
| Figma updated | A, C, E (when in scope) |

### Scoped Execution Checklist

Status: `[ ] Done` · `[ ] Missed` · `[ ] Lacking/Incomplete`

| Area | Profiles | Notes / files |
|------|----------|---------------|
| Auto-profile + escalations stated | **All** | in plan before code |
| Always-On Invariants checked | **All** | |
| Similar patterns located | **All** except E | file paths |
| Database + RLS | C, D | `supabase/migrations/...` |
| Types regen | C, D | `src/types/database.ts` |
| DAL | B, C | `src/lib/server/dal/...` |
| Server Actions | B, C | `src/actions/...` |
| Frontend | A, C, F | `src/app/...`, `src/components/...` |
| Cache sync | B, C | `revalidatePath` |
| Quality gates | All except E | `tsc`, greps, manual test |
| Whimsical | C, D, E | board sections |
| Figma | A, C, E | frames / captures |

**Per-file rule:** Every touched path must be listed. Missing path = `Lacking/Incomplete`.

### STOP — Approval gate

Reply with:
1. **Feature Spec** including **Detected profile**, **Escalations**, **Sections to read**
2. Scoped checklist (applicable rows only)
3. Exact phrase: **“Approved to implement”**

No application code until approval.

### Post-Build Report (mandatory after every build — including Profile F)

Emit this table in the final reply. Map rows to the user's **success criteria**, not only generic gates.

| Criterion | Status | Notes |
|-----------|--------|-------|
| `<user-facing requirement 1>` | Done / Missed / Lacking | |
| `<requirement 2>` | … | |
| `npx tsc --noEmit` | Done / Lacking | |
| Manual test | Done / Lacking | route + role |

If code shipped without prior approval, still emit this report retroactively.

---

## 2) Database & Type Alignment

*Read if: **C**, **D**, or escalated from A/B/F*

### Schema changes
- **Tables**: `[ ]` `<table>` — columns, FKs, constraints
- **Enums**: `[ ]` `<enum>` — values
- **RLS**: `[ ]` `<table>` — SELECT/INSERT/UPDATE/DELETE rules
- **Indexes**: `[ ]` `<index>` — why

### Types
- Source: `src/types/database.ts` (regen after migration)
- Validation: `src/lib/validations/**` (Zod, no `any`)

### DB invariants
- FORCE RLS on `public` tables
- Messaging: `chat_threads`, `chat_messages`
- Billing RPCs: `service_role`-gated where required

---

## 3) Directory & File Architecture

*Read if: **A**, **C**, **F** — or when adding new routes/files*

**Do not invent paths.** Extend **Repository File Map** when creating:

```txt
src/app/<role>/<feature>/page.tsx
src/actions/<domain>.ts
src/lib/server/dal/<feature>.ts
src/lib/validations/<feature>.ts
src/components/<role|shared>/<feature>/*
```

After adding a new top-level folder or route namespace, run **`npm run prompt:sync`** to refresh the File Map in this file.

---

## 4) Backend & Validation

*Read if: **B**, **C**, or escalated from A/F*

Zod → RBAC → DAL → `{ success, data, error }`.

```ts
export async function doThing(input: unknown): Promise<
  | { success: true; data: unknown }
  | { success: false; error: string }
> { /* ... */ }
```

---

## 5) Data Access Layer

*Read if: **B**, **C**, or escalated from A/F*

- `src/lib/server/dal/**` + `import "server-only"`
- No Supabase in UI
- List `fetchX` / `mutateY` signatures

---

## 6) Frontend Architecture

*Read if: **A**, **C***

- RSC: pages, layouts, data orchestration
- Client: forms, tables, Stripe — smallest leaf only
- `loading.tsx` / `error.tsx` / `<EmptyState />` as needed

---

## 7) Cache & State Sync

*Read if: **B**, **C**, or escalated from A*

- `revalidatePath("<route>")` after mutations
- `revalidateTag()` only if tags exist

---

## 8) Design Planning Tools

*Read if: **A**, **C**, **D**, **E** — subsection only as needed*

### 8-Whimsical
- **Board**: ReplaceMe Master Full-Stack Architecture
- **URL**: `https://whimsical.com/FtNA62DRJqmnaHHoZJxTqY`
- Overwrite or append per user instruction

### 8-Figma
- **File**: ReplaceMe Current UI State · fileKey `G5wYzRzlop5X3r9AuAi9XF`
- One collaborative file; local capture: `?figma_capture=1`

### Free-tier lockdown
1. Check (user URL → use it) → 2. Update in place → 3. Create once if missing

---

## 9) Full checklist (Profile C only)

For **C** after escalations. Other profiles use **Scoped Execution Checklist** in Core.

- [ ] Pre-flight: patterns + design files located
- [ ] DB: migration, advisors, types
- [ ] Backend: validations, DAL, actions, revalidate
- [ ] Frontend: routes, components, empty states
- [ ] Quality: `tsc`, zero-mock grep, manual test
- [ ] Design: Whimsical / Figma per spec

---

## Quick reference (once per session)

- **Roadmap index:** `docs/PRODUCT_READINESS_ROADMAP.md` — attach **hub + active** `docs/roadmap/phase-N.md` only
- **Architecture & design:** `docs/roadmap/ARCHITECTURE.md` · **QA:** `docs/roadmap/QA-GATE.md`
- Next.js `16.2.9` · React `19.2.4` · Zod `^4.4.3` · Supabase · Tailwind v4
- **File Map** (Core) — routes, actions, DAL, components; use **Task → Files** first
- Actions: `src/actions/**` · DAL: `src/lib/server/dal/**` · Auth: `src/lib/server/auth/**` + `src/lib/auth/**`
- Shared: `src/components/shared/**` · Types: `src/types/database.ts`
- Middleware: `proxy.ts` → `src/lib/server/auth/middleware.ts`
- Env: `NEXT_PUBLIC_SITE_URL`, Supabase keys, Stripe keys (see `.env.example`)

---

## User prompt starter (copy into every feature request)

```
Using prompt.md:
- Feature: <one-line description>
- Role(s): <worker|employer|admin|...>
- Area (optional): <pick from Task → Files table, e.g. Headers, Password reset>
- (optional) Ponytail: <full|lite|ultra|off> — default full
- (optional) I think this is profile: <A-F> — confirm or correct via Auto-Profile Classifier
```

The agent **must** confirm or correct the profile using the classifier — never blindly trust the user's guess if escalations apply. The agent **must** read **Agent Skills Index** skills for the final profile ( **`ponytail` always** ) and list **Skills read** in the plan. The agent **must** list files from **Task → Files** / **File Map** in the plan — not run a broad repo search first.
