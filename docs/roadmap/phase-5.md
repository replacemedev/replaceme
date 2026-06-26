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

- [ ] `e2e/employer/contracts-lifecycle.spec.ts`
- [ ] `e2e/employer/credits-ledger.spec.ts`
- [ ] `e2e/worker/notifications-preferences.spec.ts`
- [ ] `e2e/employer/reviews.spec.ts`
- [ ] CLI: `npm run test:e2e` (cross-role)
- [ ] MCP: hire → contract → notification → review
- [ ] Artifacts: `e2e/debug/phase-5/`
