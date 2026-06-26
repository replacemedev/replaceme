# Phase 2 — Worker high-priority UI

> After Phase 1. Worker screens for a credible hiring platform.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Missing UI — Worker

| Missing screen | Why it matters |
| :--- | :--- |
| **Profile edit UI** | View-heavy profile; `/profile/edit`, `/skills/edit` missing |
| **Resume/CV upload & portfolio manager** | Core for marketplaces |
| **Skill assessments (`/worker/tests`)** | Linked from UI; route scaffold only in Phase 0 |
| **Interview invites & calendar** | Worker-side scheduling |
| **Offers / contracts inbox** | Accept/decline, view terms |
| **Earnings / payments dashboard** | Pay-when-done model |
| **Worker account settings** | No `/worker/settings` |
| **Notification center (full page)** | Same as employer |
| **Job alerts / saved search alerts** | Real-time alerts |
| **Application detail page** | Timeline per application |
| **Availability & rate management** | Dedicated settings UX |
| **Dispute / report employer** | Trust & safety |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] `e2e/worker/profile-edit.spec.ts`
- [x] `e2e/worker/applications-detail.spec.ts`
- [x] `e2e/worker/interviews.spec.ts`
- [x] `e2e/worker/contracts.spec.ts`
- [x] `e2e/worker/settings.spec.ts`
- [x] `e2e/worker/tests.spec.ts`
- [x] CLI: `npm run test:e2e:worker`
- [ ] MCP: apply → application detail → interview → accept offer
- [x] Artifacts: `e2e/debug/phase-2/`
