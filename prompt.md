# Feature Implementation Prompt Template (Modular)

**How to use this file:** Read **Core** (including **Auto-Profile Classifier** + **Always-On Invariants**) first. The agent **must** auto-detect the profile, apply escalations, then read **only** the resulting sections. Token savings come from skipping unused section *modules* — not from skipping architecture guardrails.

---

## Core (always read)

### Operating rules
1. **Auto-classify** the request (classifier below) → state profile + escalations + why.
2. Fill **Feature Spec** + **Always-On Invariants** + sections for the **final** profile (after escalations).
3. Generate a **scoped Execution Checklist** (applicable rows only).
4. **STOP** and ask for **explicit approval** before application code.
5. During build: update checklist live (`Done` / `Missed` / `Lacking/Incomplete`).
6. After build: run **Definition of Done** for final profile + any escalated gates.

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
| **Ponytail** | Flat DOM, no wrapper soup, composition over boolean props |
| **Cache** | `revalidatePath` after mutations that affect rendered views |
| **RLS** | New/changed tables must have explicit policies before UI ships |
| **Pre-flight** | Locate 1–2 similar existing patterns in repo before writing new code |

**If a task violates an invariant, escalate the profile** (see Escalation Rules) — do not “save tokens” by breaking architecture.

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
- **Similar patterns found:** `<file paths>`

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

| Profile | Base trigger | Section modules to read |
|---------|--------------|-------------------------|
| **A — UI only** | Visual/UX on existing data paths | **3**, **6**, **8-Figma** (if wireframes), scoped **9** |
| **B — Backend only** | Actions/DAL/validation, no new pages | **4**, **5**, **7**, scoped **9** |
| **C — Full-stack** | DB + UI + mutations and/or multi-role | **2**, **3**, **4**, **5**, **6**, **7**, **8**, **9** |
| **D — Database** | Migrations/RLS/types only | **2**, **8-Whimsical**, scoped **9** |
| **E — Design / docs** | Whimsical/Figma/architecture only | **8**, scoped **9** |
| **F — Bug fix** | Localized fix, same feature surface | **3** (touched paths), scoped **9** |

**Agent rule:** Read **Core + Always-On Invariants + listed modules only**. Do not read unlisted section modules.

---

### Loop-Proof Debug Protocol (Profile F and escalated fixes)

When fixing bugs, **Phase 3 only** — no re-architecture:

1. **Reproduce** — exact route, role, action, error message.
2. **Locate** — max 5 files; list them in checklist before editing.
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
| **Primary role(s)** | `<worker \| employer \| admin \| multi-role \| public>` |
| **Success criteria** | `<measurable outcomes>` |
| **Non-goals** | `<out of scope>` |
| **Routes (exact URLs)** | `<...>` |
| **Reads** | `<DAL queries per page>` |
| **Mutations** | `<Server Actions>` |
| **RBAC** | `<who can do what>` |
| **DB changes** | `<none \| tables/RLS/indexes>` |
| **Design artifacts** | `<none \| Whimsical \| Figma \| both>` |
| **Similar patterns** | `<existing file paths to mirror>` |

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

*Read if: **A**, **C**, **F***

List **only** paths this feature creates or modifies:

```txt
src/app/<role>/<feature>/page.tsx
src/actions/<domain>.ts
src/lib/server/dal/<feature>.ts
src/lib/validations/<feature>.ts
src/components/<role|shared>/<feature>/*
```

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

- Next.js `16.2.9` · React `19.2.4` · Zod `^4.4.3` · Supabase · Tailwind v4
- Actions: `src/actions/**` · DAL: `src/lib/server/dal/**` · Auth: `src/lib/server/auth/**`
- Shared: `src/components/shared/**` · Types: `src/types/database.ts`

---

## User prompt starter (copy into every feature request)

```
Using prompt.md:
- Feature: <one-line description>
- Role(s): <worker|employer|admin|...>
- (optional) I think this is profile: <A-F> — confirm or correct via Auto-Profile Classifier
```

The agent **must** confirm or correct the profile using the classifier — never blindly trust the user's guess if escalations apply.
