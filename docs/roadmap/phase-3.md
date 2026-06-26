# Phase 3 — Admin high-priority UI

> After Phase 2. Platform operations and trust & safety.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Missing UI — Admin

| Missing screen | Status today |
| :--- | :--- |
| **Disputes workflow** | Scaffold only |
| **Global applications oversight** | No cross-platform applications view |
| **Messaging moderation** | No admin view of `chat_threads` |
| **Platform content moderation queue** | Beyond jobs |
| **Billing ops** | Refunds, overrides, Stripe disputes |
| **Feature flags / plan config UI** | Settings read-only env |
| **Employer verification / company KYC** | Lighter than worker identity |
| **Analytics drill-downs** | Limited operational tooling |
| **Support / impersonation tools** | Mature SaaS pattern |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [ ] `e2e/admin/disputes-workflow.spec.ts`
- [ ] `e2e/admin/applications.spec.ts`
- [ ] `e2e/admin/moderation.spec.ts`
- [ ] `e2e/admin/billing-ops.spec.ts`
- [ ] CLI: `npm run test:e2e:admin`
- [ ] MCP: disputes, moderation, applications drill-down
- [ ] Artifacts: `e2e/debug/phase-3/`
