# Phase 4 — Public & growth UI

> After Phase 3. Public-facing and SEO/growth screens.

**Prerequisite docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`QA-GATE.md`](./QA-GATE.md)

## Missing UI — Public / growth

| Missing screen | Notes |
| :--- | :--- |
| **Public job board (unauthenticated browse)** | No `/jobs` public catalog |
| **Company directory** | Browse employers |
| **Help center / docs** | `/help` linked but thin/missing |
| **Blog / resources / hiring guide** | `/hiring-guide` content |
| **Pricing comparison (public)** | Employer pricing behind auth |

## QA ([`QA-GATE.md`](./QA-GATE.md))

- [ ] `e2e/public/job-board.spec.ts`
- [ ] `e2e/public/companies.spec.ts`
- [ ] `e2e/public/help.spec.ts`
- [ ] `e2e/public/pricing.spec.ts`
- [ ] CLI: `npm run test:e2e` (public specs or `@public` tag)
- [ ] MCP: landing → public jobs → detail → signup CTA
- [ ] Artifacts: `e2e/debug/phase-4/`
