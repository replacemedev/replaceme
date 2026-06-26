# Phase 1 — Employer high-priority UI

> After Phase 0. Employer screens for a credible hiring platform.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Missing UI — Employer

| Missing screen | Why it matters |
| :--- | :--- |
| **Job edit / draft / close lifecycle UI** | Draft → active → closed; create + deactivate only today |
| **Interview scheduling UI** | `INTERVIEW_SCHEDULED` in DB; no calendar/booking |
| **Offer / hire flow UI** | `contracts` + `/employer/hired`; no "Send offer" wizard |
| **Employer view of worker profile** | Dedicated candidate view from applicants/pinned |
| **Talent discovery / browse workers** | `/talents` implied browse; pinned only |
| **Analytics & reporting** | Funnel, time-to-hire, fulfillment % |
| **Team / org management** | Invites, roles/permissions |
| **Billing beyond subscription** | Invoices, payment history, credits ledger |
| **Notification center (full page)** | No `/employer/notifications` inbox |
| **Dispute / report candidate** | Pairs with admin disputes |
| **Company public profile page** | Employer marketing to workers |
| **Interview notes / scorecards** | ATS standard |
| **Bulk applicant actions** | Multi shortlist/reject |
| **True Kanban pipeline** | Cards/table today; need stage columns |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] `e2e/employer/job-edit.spec.ts`
- [x] `e2e/employer/applicants-kanban.spec.ts`
- [x] `e2e/employer/interviews.spec.ts`
- [x] `e2e/employer/offer-hire.spec.ts`
- [x] `e2e/employer/candidate-profile.spec.ts`
- [x] `e2e/employer/notifications.spec.ts`
- [x] CLI: `npm run test:e2e:employer`
- [ ] MCP: job → applicant → interview → offer → hired
- [x] Artifacts: `e2e/debug/phase-1/`
