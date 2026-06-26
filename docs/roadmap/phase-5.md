# Phase 5 — Database-backed UI surfacing

> After Phase 4. UI for schemas/actions not fully surfaced.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Schema → UI gaps

| Area | Gap |
|------|-----|
| **`contracts`** | Hired list only; no create/edit/terminate UI |
| **`notifications`** | Bell dropdown; no prefs/history pages |
| **Reviews/testimonials** | Display only; no post-hire "leave review" |
| **Application status machine** | Dropdown only; no interview/offer screens |
| **Credits / unlock balance** | Balance on applicants; no purchase/history UI |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] `e2e/employer/contracts-lifecycle.spec.ts`
- [x] `e2e/employer/credits-ledger.spec.ts`
- [x] `e2e/worker/notifications-preferences.spec.ts`
- [x] `e2e/employer/reviews.spec.ts`
- [x] CLI: `npm run test:e2e` (cross-role)
- [ ] MCP: hire → contract → notification → review
- [x] Artifacts: `e2e/debug/phase-5/`
