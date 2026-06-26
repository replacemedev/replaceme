# Architecture — Stack, Routing, Design

**Canonical stack & skills:** [`prompt.md`](../prompt.md) (Always-On Invariants, Agent Skills Index, File Map).  
**Do not duplicate** skill tables here — read `prompt.md` when implementing.

---

## 1. Core tech stack & foundation

* **Framework:** Next.js 16 (App Router strictly enforced).
* **Styling:** Tailwind CSS v4 (utility-first; no custom CSS unless necessary).
* **Components:** RSC by default; `"use client"` only at interaction leaves.
* **Testing:** Playwright in `e2e/` + **Playwright MCP** after every phase → [`QA-GATE.md`](./QA-GATE.md).
* **Database/Auth:** Supabase (PostgreSQL, RLS, Supabase Auth). Types: `src/types/database.ts`. Admin: `admin_profiles` / claims. DAL: `src/lib/server/dal/**`. Mutations: Server Actions + Zod + RBAC. Stripe: `src/app/api/webhooks/stripe/route.ts`. Versions: `prompt.md` Quick reference.

**Profile C (default for roadmap):** Ponytail, `nextjs-typescript-tailwindcss-supabase`, `vercel-composition-patterns`, `vercel-react-best-practices`, `database-design`, `architecture-decision-records`.

---

## 2. Strict directory routing (missing UI targets)

**Employer** (`src/app/employer/*`)

* `jobs/create` — create & draft/edit lifecycle
* `jobs/[jobId]/applicants` — Kanban pipeline
* `interviews` — scheduling & calendar
* `hired` — offer/contract wizard, team
* `settings/account` — billing history, credits, company profile

**Worker** (`src/app/worker/*`)

* `profile`, `profile/edit` — edit, resume/CV
* `interviews` — invites & calendar
* `contracts` — offers inbox & earnings
* `settings` — account, job alerts, rate/availability
* `tests` — skill assessments

**Admin** (`src/app/admin/(shell)/*`)

* `disputes` — resolution workflow
* `moderation` — content queue
* `billing` — ops, refunds, Stripe overrides

**Public** (`src/app/(public)/*`)

* `jobs` — public job board
* `companies` — directory
* `pricing` — public pricing comparison

| Logical area | Path |
|--------------|------|
| Employer | `src/app/employer/*` |
| Worker | `src/app/worker/*` |
| Admin | `src/app/admin/(shell)/*` |
| Public | `src/app/(public)/*` |

Use `[jobId]` not `[id]` for job routes. After route changes: `npm run prompt:sync`.

---

## 3. Frontend design & layout guide

**A. Layout** — Persistent role sidebar (collapsible mobile). Page header: title, breadcrumbs, primary CTA.

**B. Components** — `<EmptyState />` when DB empty. Kanban: `w-80` columns, vertical scroll, DnD cues. Wizards: stepper + `space-y-6` + `bg-white rounded-lg shadow-sm border p-6`. Admin tables dense (`py-2 px-3`); employer/worker cards spacious (`p-6`).

**C. Feedback** — Suspense + skeletons for DB fetches. Toasts on form submit.

**Ponytail** (see `prompt.md`): flat DOM, shared components first, no mock data, `revalidatePath` after mutations.
