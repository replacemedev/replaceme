# Feature Implementation Prompt Template (Blueprint + Execution Checklist)

**MANDATORY OPERATING RULES (read first):**
- Whenever this template is used, the AI **MUST** fill out the entire architectural blueprint (Sections 1–9) **AND** generate the empty Execution Checklist (PHASE4-style).
- The AI must then **STOP** and ask for **explicit approval** before generating a single line of application code.
- Once coding begins, the AI must **continuously update** the Execution Checklist to reflect real-time progress (turn items into **Done**, mark gaps as **Lacking/Incomplete**, and record any misses as **Missed**).
- After implementation is complete, the AI must **update the designated Whimsical board** to reflect the new architecture.

---

## Definition of Done (PHASE4-style, per feature)

This feature is **complete** only when **all** of the following are true:
- [ ] Done **Database + migrations** are applied (if needed), and schema aligns with feature requirements.
- [ ] Done **Types are regenerated** (`src/types/database.ts`) after any DB change.
- [ ] Done **All Server Actions** in scope have Zod validation + RBAC + standardized return shape.
- [ ] Done **Server/Client split** is correct (no client-only libs in Server Components; no DB access in UI).
- [ ] Done **Error handling** is in place (action-result pattern; route `error.tsx` where needed).
- [ ] Done **Empty states** exist (no mock data).
- [ ] Done **Quality gates** pass (`npx tsc --noEmit`, targeted greps, manual test plan).
- [ ] Done **Whimsical board updated** (ERDs + backend flows + architecture maps; append-only).
- [ ] Done **Figma file updated** (UI wireframes / UI specs; design-to-code readiness).

---

## Feature Spec (you fill)

### Feature Name
- **Feature**: `<NAME HERE>`
- **Primary role(s)**: `<worker | employer | admin | multi-role>`
- **Success criteria**: `<measurable outcomes>`
- **Non-goals**: `<explicitly out of scope>`
- **User stories**:
  - `<As a … I want … so that …>`

### Feature Details (required)
- **Screens/routes to add or change (exact URLs)**: `<...>`
- **Reads needed (what each page must query)**: `<...>`
- **Mutations needed (Server Actions list)**: `<...>`
- **RBAC rules (who can do what)**: `<...>`
- **Data model changes (tables/columns/RLS expectations)**: `<...>`
- **Notifications/emails/webhooks (if any)**: `<...>`

---

## 1) Workspace Context, Tools & Docs (Ponytail/Agent Skills)

### Stack (from repo)
- **Next.js**: `16.2.9` (App Router)
- **React**: `19.2.4`
- **Zod**: `^4.4.3`
- **Supabase**: `@supabase/supabase-js` (see `SYSTEM_CONTEXT.md`)

### Existing architecture to integrate with (no spaghetti)
- **Routes**: strict role namespaces under `src/app/worker/*`, `src/app/employer/*`, `src/app/admin/*`
- **Server Actions**: `src/actions/**` (Zod + RBAC via `requireRole()` / `requireAdmin()`)
- **DAL isolation**: `src/lib/server/dal/**` (query helpers; keep DB access out of UI)
- **Auth**: `src/lib/server/auth/**`
- **Shared UI**: `src/components/shared/**` (messaging, StatCard, EmptyState, skeletons)
- **Generated types**: `src/types/database.ts` (**no `any`**)

### Official docs (reference during build)
- **Next.js Server Actions**: `https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions`
- **Next.js App Router**: `https://nextjs.org/docs/app`
- **Supabase RLS**: `https://supabase.com/docs/guides/database/postgres/row-level-security`
- **Supabase Functions**: `https://supabase.com/docs/guides/database/functions`
- **React**: `https://react.dev/reference/react`
- **Zod**: `https://zod.dev/`

### Integration strategy (anti-duplicate / anti-spaghetti)
- **No inline DB queries in UI**: reads via Server Components calling DAL helpers; mutations via Server Actions only.
- **No duplicated UI variants**: shared components go in `src/components/shared/`.
- **No boolean prop soup**: prefer explicit variants/composition.
- **Standardized Server Action return**: `{ success, data, error }` using existing `runAction()` utilities.

---

## 2) Database & Type Alignment

### Current DB foundations (confirmed)
- Supabase Postgres with **FORCE RLS** on `public` tables
- Messaging: `chat_threads`, `chat_messages`
- Billing: webhook-based activation; `service_role`-gated RPCs

### Required schema changes (TO FILL)
- **Tables**:
  - `[ ]` `<table>`: `<columns, constraints, FKs>`
- **Enums**:
  - `[ ]` `<enum>`: `<values>`
- **RLS policies**:
  - `[ ]` `<table>`: `<select/insert/update/delete rules>`
- **Indexes**:
  - `[ ]` `<index>`: `<why>`

### Type inference plan (strict, no any)
- **Source of truth**: `src/types/database.ts` generated from Supabase
- **Derived types**:
  - `type DbX = Database["public"]["Tables"]["x"]["Row"]`
  - `type InsertX = Database["public"]["Tables"]["x"]["Insert"]`
- **Validation**: all external inputs validated with Zod schemas in `src/lib/validations/**`

---

## 3) Directory & File Architecture (Anti‑Spaghetti Protocol)

### New/modified file map (TO FILL)

```txt
src/
├── app/
│   ├── worker/
│   ├── employer/
│   ├── admin/
│   └── api/
├── actions/
│   └── <domain>.ts
├── components/
│   ├── shared/
│   └── <role>/
├── lib/
│   ├── server/
│   │   ├── auth/
│   │   ├── dal/
│   │   └── <domain>/
│   └── validations/
├── hooks/
└── types/
```

---

## 4) Backend & Validation (The Bridge)

### Server Action signatures (TO FILL)
Each mutation must:
- Parse input via Zod
- Enforce RBAC (`requireRole` / `requireAdmin`)
- Use DAL for DB operations
- Return standardized object `{ success, data, error }` (no thrown raw errors)

Example shape:

```ts
export async function doThing(input: unknown): Promise<
  | { success: true; data: unknown }
  | { success: false; error: string }
> {
  // parse -> auth -> DAL -> mutate -> revalidate -> return
  return { success: false, error: "TODO" }
}
```

### Zod schemas (TO FILL)
- File: `src/lib/validations/<feature>.ts`
  - `export const <schemaName> = z.object({ ... })`

---

## 5) Data Access Layer (strict backend isolation)

### DAL rules
- All DB queries live in `src/lib/server/dal/**`
- Each DAL file starts with `import "server-only"`
- DAL exports small, typed functions (no giant “god modules”)
- UI components never call Supabase directly

### DAL additions (TO FILL)
- `src/lib/server/dal/<feature>.ts`
  - `export async function fetchX(...)`
  - `export async function mutateY(...)`

---

## 6) Frontend Architecture

### Server vs Client split (TO FILL)
- **Server Components**: pages/layout shells, data fetch orchestration, streaming boundaries
- **Client Components**: forms, interactive tables, wizards, Stripe Elements, optimistic UI

### Loading / error / empty states
- **Loading**: `loading.tsx` where streaming is desired
- **Errors**: route-level `error.tsx` where needed
- **Empty states**: shared EmptyState patterns (no mock data)

---

## 7) Cache & State Sync

### Revalidation plan (TO FILL)
After each mutation:
- `revalidatePath("<route>")` for pages that must immediately reflect changes
- Use `revalidateTag()` only if tag-based fetches exist for this feature

---

## 8) Design Planning Tools Policy (Free-tier + MCP)

### Whimsical = Logic / Architecture (MCP required)

**Purpose:** DB ERDs, backend/system flows, architecture maps.  
**Rule:** do **not** create new Whimsical files/boards unless explicitly approved.

**Existing master board (CONFIRMED):**
- **Board**: “ReplaceMe Master Full‑Stack Architecture”
- **URL**: `https://whimsical.com/FtNA62DRJqmnaHHoZJxTqY`

**How Whimsical will be updated (TO FILL once feature is specified):**
- **DB ERD**: add/extend entities + RLS notes (append-only)
- **Backend sequence diagram**: `<user action>` → `<server action>` → `<DAL>` → `<DB>` → `revalidatePath` (append-only)
- **Architecture map**: update role routing + module ownership boundaries (append-only)

### Figma = UI Wireframes + Design-to-Code (MCP preferred)

**Is Figma free?** Yes — freemium. Starter plan includes **3 collaborative design files** + unlimited personal drafts.  
**Team rule:** keep UI inside **one main Figma file** with an infinite canvas to avoid free-tier limits.

**Why Figma (vs Whimsical) for UI:**
- **Write to Canvas**: use the official Figma MCP to draw wireframes/frames/components directly on the canvas.
- **Read to Code**: use Figma MCP to read spacing/typography/layout and generate pixel-perfect React + Tailwind.

**How Figma will be updated (TO FILL once feature is specified):**
- Add frames for the feature’s screens (Worker/Employer/Admin)
- Add responsive breakpoints + component notes (Server vs Client boundaries)
- Mark states: loading / empty / error / success
- Add tokens mapping (colors, spacing, typography) where relevant

---

## FREE TIER LOCKDOWN (Fortified — bulletproof conditional logic)

This section exists to prevent the agent from burning through free-tier limits (Whimsical board count, Figma collaborative file count).

### A) Figma Free-tier Lockdown (3 collaborative files)

**Immutable rule:** UI work happens in **exactly one** collaborative Figma file for this project.

**Project UI Figma file (single source of truth):**
- **Figma file URL**: `<PASTE ONCE AND KEEP FOREVER>`
- **File name**: `ReplaceMe UI — Master Canvas` (recommended)

**Bulletproof conditional logic (MUST follow in order):**
- **Check first**
  - If the user provided a Figma URL → treat it as the canonical file and **do not search/create**.
  - Else: search Figma workspace for `ReplaceMe UI`, `ReplaceMe UI — Master Canvas`, `ReplaceMe`, and `UI` (titles first).
  - Else: list recent/available Figma files and pick the best match by title (do not create).
- **If exists → update**
  - Use Figma MCP to **append** new frames/pages inside the existing file.
  - Never create a second “UI file” just to separate screens. Use pages/sections/frames on the infinite canvas.
- **If missing → create once (guarded)**
  - Only if **no** suitable file exists, create **one** new Figma file named `ReplaceMe UI — Master Canvas`.
  - Immediately write the created URL back into this section (the “Figma file URL” line) and treat it as immutable thereafter.
  - After this one-time creation, all future UI work is “exists → update”.

**Absolute prohibitions:**
- Do not create new Figma files for “v2”, “alt layout”, “scratch”, “backup”, or “temp”.
- Do not create separate Figma files per role (Worker/Employer/Admin). Roles are pages/frames inside the single file.
- If you are uncertain which file to use, you must **ask** before creating anything.

### B) Whimsical Free-tier Lockdown (single master board)

**Immutable rule:** Logic/architecture work happens in the **existing** Whimsical master board.

**Project master board (single source of truth):**
- **Whimsical board URL**: `https://whimsical.com/FtNA62DRJqmnaHHoZJxTqY`

**Bulletproof conditional logic (MUST follow in order):**
- **Check first**
  - Search for the board by title: `ReplaceMe Master Full-Stack Architecture`.
- **If exists → update**
  - Fetch the canvas (optionally with image snapshot) to find safe empty space.
  - Append new sections adjacent to existing diagrams. **Never overwrite/delete** ERDs or sequence diagrams.
- **If missing → STOP**
  - Do **not** create a new Whimsical file automatically.
  - Ask for explicit approval and confirm free-tier implications before creating anything.

---

## 9) Implementation Execution Checklist (EMPTY — status tracker)

Use only these statuses:
- `[ ] Done`
- `[ ] Missed`
- `[ ] Lacking/Incomplete`

### Status Table (keep updated during implementation)

| Area | Status | Notes | Files/Migrations |
|------|--------|-------|------------------|
| Scope + UX | [ ] Lacking/Incomplete |  |  |
| Database + RLS | [ ] Lacking/Incomplete |  | `supabase/migrations/...` |
| Types regen | [ ] Lacking/Incomplete |  | `src/types/database.ts` |
| DAL | [ ] Lacking/Incomplete |  | `src/lib/server/dal/...` |
| Server Actions | [ ] Lacking/Incomplete |  | `src/actions/...` |
| Frontend | [ ] Lacking/Incomplete |  | `src/app/...`, `src/components/...` |
| Cache sync | [ ] Lacking/Incomplete |  | `revalidatePath`/`revalidateTag` |
| Quality gates | [ ] Lacking/Incomplete |  | `tsc`, greps, manual tests |
| Whimsical update | [ ] Lacking/Incomplete |  | Board sections/frames |
| Figma update | [ ] Lacking/Incomplete |  | UI wireframes / UI specs |

### Per-file / Per-migration checklist (PHASE4-style — REQUIRED)

**Rule:** every file or migration that is created/modified/deleted for this feature **must** be listed here and checked off.  
If a file is touched but missing from this table, the feature is automatically **Lacking/Incomplete**.

| Path | Type | Status | Purpose | Owner checks |
|------|------|--------|---------|-------------|
| `supabase/migrations/<timestamp>_<feature>.sql` | migration | [ ] Lacking/Incomplete | Schema/RLS changes | advisors rerun, applied |
| `src/types/database.ts` | types | [ ] Lacking/Incomplete | Regenerated Supabase types | `tsc` passes |
| `src/lib/validations/<feature>.ts` | validation | [ ] Lacking/Incomplete | Zod schemas for inputs | no `any` |
| `src/lib/server/dal/<feature>.ts` | dal | [ ] Lacking/Incomplete | Typed DB reads/writes | `server-only` |
| `src/actions/<feature>.ts` | action | [ ] Lacking/Incomplete | Server Actions | Zod + RBAC + safe return |
| `src/app/<role>/<feature>/page.tsx` | route | [ ] Lacking/Incomplete | Server page | RSC correct |
| `src/app/<role>/<feature>/loading.tsx` | route | [ ] Lacking/Incomplete | Loading UI (if needed) | no layout shift abuse |
| `src/app/<role>/<feature>/error.tsx` | route | [ ] Lacking/Incomplete | Error boundary (if needed) | no leaks |
| `src/components/<role>/<feature>/*` | ui | [ ] Lacking/Incomplete | Client UI pieces | minimal state |
| `src/components/shared/<feature>/*` | ui | [ ] Lacking/Incomplete | Shared UI primitives | DRY |

### A) Pre-flight
- [ ] Done `package.json` versions verified (Next 16 / React 19 / Zod)
- [ ] Lacking/Incomplete Locate similar existing feature patterns (list file paths)
- [ ] Done Whimsical board located (no new boards)

### B) Database / migrations
- [ ] Lacking/Incomplete Create migration: `supabase/migrations/<timestamp>_<feature>.sql`
- [ ] Lacking/Incomplete Apply migration to Supabase (remote)
- [ ] Lacking/Incomplete Run Supabase advisors (security + performance) and resolve ERRORs
- [ ] Lacking/Incomplete Regenerate `src/types/database.ts`

### C) Validations
- [ ] Lacking/Incomplete Add `src/lib/validations/<feature>.ts`
- [ ] Lacking/Incomplete Add/adjust shared validation schemas if needed

### D) DAL
- [ ] Lacking/Incomplete Add `src/lib/server/dal/<feature>.ts` (server-only)
- [ ] Lacking/Incomplete Confirm UI does not import Supabase client directly for this feature

### E) Server Actions
- [ ] Lacking/Incomplete Add/modify `src/actions/<feature>.ts`
- [ ] Lacking/Incomplete Ensure every export enforces RBAC + Zod + safe return object
- [ ] Lacking/Incomplete Add `revalidatePath` / `revalidateTag` where required

### F) Routes + UI
- [ ] Lacking/Incomplete Add server page(s): `src/app/<role>/<feature>/page.tsx`
- [ ] Lacking/Incomplete Add loading UI: `src/app/<role>/<feature>/loading.tsx` (if needed)
- [ ] Lacking/Incomplete Add error boundary: `src/app/<role>/<feature>/error.tsx` (if needed)
- [ ] Lacking/Incomplete Add client components: `src/components/<role>/<feature>/**`
- [ ] Lacking/Incomplete Add shared components (if reused): `src/components/shared/<feature>/**`
- [ ] Lacking/Incomplete Add empty states (no mock data)

### G) Quality gates
- [ ] Lacking/Incomplete `npx tsc --noEmit` passes
- [ ] Lacking/Incomplete “Zero mock data” grep passes for feature scope
- [ ] Lacking/Incomplete Manual test plan executed (happy path + auth failures + empty states)

### H) Whimsical update (MANDATORY)
- [ ] Lacking/Incomplete Update the existing Whimsical board with:
  - [ ] Lacking/Incomplete UI wireframes
  - [ ] Lacking/Incomplete Frontend component map
  - [ ] Lacking/Incomplete Backend sequence diagram
  - [ ] Lacking/Incomplete DB ERD updates

---

## STOP — Approval Gate (required)

Reply with:
1) The filled **Feature Spec** at the top of this document, and  
2) The exact phrase: **“Approved to implement”** (only when you’re satisfied).

No application code should be generated until explicit approval is given.

