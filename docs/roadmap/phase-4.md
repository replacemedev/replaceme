# Phase 4 — Public & growth UI

> After Phase 3. Public-facing and SEO/growth screens.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Missing UI — Public / growth

| Missing screen | Notes |
| :--- | :--- |
| **Public job board (unauthenticated browse)** | `/jobs` public catalog |
| **Company directory** | Browse employers at `/companies` |
| **Help center / docs** | `/help` + CMS-backed content |
| **Blog / resources / hiring guide** | `/help/hiring-guide` |
| **Pricing comparison (public)** | `/pricing` (dynamic plans + CMS hero) |
| **CMS for legal/info pages** | Admin `/admin/settings/pages` → `page_content` table |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [x] `e2e/public/job-board.spec.ts`
- [x] `e2e/public/companies.spec.ts`
- [x] `e2e/public/help.spec.ts`
- [x] `e2e/public/pricing.spec.ts`
- [x] MCP: landing → public jobs → detail → signup CTA (covered by job-board E2E)
- [x] Artifacts: `e2e/debug/phase-4/`
