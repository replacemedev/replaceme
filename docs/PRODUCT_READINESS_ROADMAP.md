# ReplaceMe — Product Readiness Roadmap (index)

**Principle:** No mock data — real rows or `<EmptyState />`.  
**Last updated:** 2026-06-25

> **Token-efficient usage:** `@` this file + **only the active phase doc**. Stack, skills, and file map live in [`prompt.md`](../prompt.md).

---

## How to use (agents & humans)

| Need | Read |
|------|------|
| Stack, skills, invariants, file map | [`prompt.md`](../prompt.md) |
| Routing targets & UI design rules | [`roadmap/ARCHITECTURE.md`](./roadmap/ARCHITECTURE.md) |
| Build → Test → Fix loop | [`roadmap/QA-GATE.md`](./roadmap/QA-GATE.md) |
| **Active work** | [`roadmap/phase-N.md`](./roadmap/) (one file) |
| Full-scale buckets | [`roadmap/FULL-SCALE.md`](./roadmap/FULL-SCALE.md) |

Say **“Proceed with Phase N”** to implement. Complete [`QA-GATE.md`](./roadmap/QA-GATE.md) before the next phase.

---

## Platform readiness verdict

- [x] **Auth & role separation** — Strong (`prompt.md` routes)
- [ ] **Job post + apply loop** — Mostly there
- [ ] **Applicant pipeline** — Partial (dropdown, not full ATS)
- [ ] **Hire → contract** — Schema exists; UX incomplete
- [ ] **Billing** — Subscription/checkout; ops/history thin
- [ ] **Admin oversight** — Users/jobs/identity; disputes/messaging weak
- [ ] **Navigation polish** — Many 404 links remain

**Overall:** MVP+ / beta — not full-scale yet.

---

## Phases

| Phase | Name | Doc | E2E gate | Status |
|-------|------|-----|----------|--------|
| **0** | Routing & dead-end fixes | [phase-0.md](./roadmap/phase-0.md) | employer + worker + admin smoke | **Active** |
| **1** | Employer UI | [phase-1.md](./roadmap/phase-1.md) | `test:e2e:employer` | Planned |
| **2** | Worker UI | [phase-2.md](./roadmap/phase-2.md) | `test:e2e:worker` | Planned |
| **3** | Admin UI | [phase-3.md](./roadmap/phase-3.md) | `test:e2e:admin` | Planned |
| **4** | Public & growth | [phase-4.md](./roadmap/phase-4.md) | public specs | Planned |
| **5** | DB-backed UI | [phase-5.md](./roadmap/phase-5.md) | full cross-role suite | Planned |

**Rule:** [QA-GATE.md](./roadmap/QA-GATE.md) must pass for the active phase before advancing.

---

## Quick links

- Architecture: [`roadmap/ARCHITECTURE.md`](./roadmap/ARCHITECTURE.md)
- QA gate: [`roadmap/QA-GATE.md`](./roadmap/QA-GATE.md)
- Full-scale checklist: [`roadmap/FULL-SCALE.md`](./roadmap/FULL-SCALE.md)
