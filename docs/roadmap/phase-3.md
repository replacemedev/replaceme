# Phase 3 — Admin high-priority UI

> After Phase 2. Platform operations and trust & safety.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Missing UI — Admin

| Missing screen | Status today |
| :--- | :--- |
| **Disputes workflow** | Live queue + status updates (`/admin/disputes`) |
| **Global applications oversight** | `/admin/applications` |
| **Messaging moderation** | `/admin/moderation` (chat threads) |
| **Platform content moderation queue** | Job moderation at `/admin/jobs` (existing) |
| **Billing ops** | `/admin/billing-ops` (usage overrides) |
| **Feature flags / plan config UI** | Settings read-only env |
| **Employer verification / company KYC** | Lighter than worker identity |
| **Analytics drill-downs** | Limited operational tooling |
| **Support / impersonation tools** | Mature SaaS pattern |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] `e2e/admin/disputes-workflow.spec.ts`
- [x] `e2e/admin/applications.spec.ts`
- [x] `e2e/admin/moderation.spec.ts`
- [x] `e2e/admin/billing-ops.spec.ts`
- [x] CLI: `npm run test:e2e:admin`
- [ ] MCP: disputes, moderation, applications drill-down *(skipped — CLI-only gate)*
- [x] Artifacts: `e2e/debug/phase-3/`
