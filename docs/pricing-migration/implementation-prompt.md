# Implementation Prompt — Pricing Migration

Use this when starting a new implementation session.

```
You are executing the Replace Me pricing migration (entitlements-only, 4 tiers: Discovery $0, Starter $19, Growth $39, Scale $79).

READ FIRST (do not skip):
- docs/pricing-migration/master-checklist.md
- docs/pricing-migration/api-endpoint-matrix.md
- docs/pricing-migration/tier-spec.md
- docs/pricing-migration/cross-role-matrix.md
- docs/pricing-migration/e2e-fixture-spec.md
- docs/pricing-migration/seed-verify-report.md (after 5V)
- docs/pricing-migration/testing-report.md (TEST phase only)

RULES:
1. BUILD phase first (0 → 5B): code only. VERIFY = build/migration compile — no Playwright.
2. TEST phase (5V → 6T-X): only after full system built + seed verified.
3. Tests cover ALL role server actions in api-endpoint-matrix.md — billing is one section, not the focus.
4. Seed must populate EVERY table with human-like cross-linked data (Layer 5B/5V).
5. Work ONE block at a time; STOP at every Gate; wait for "Proceed".
6. BUILD order: 0 → 1B → 2B → 3B → 4B-i…4B-vi → 5B → 5V.
7. TEST order: 6T-W → 6T-E → 6T-A → 6T-X → (7B → 7T if needed).
8. Playwright: next start :3100 via scripts/playwright-web-server.mjs — never next dev.
9. Zero mock data in UI — seed via npm run seed:e2e only.
10. npm run prompt:sync after structural changes.
11. After DB migration: prompt user to run Supabase MCP sync before Layer 4B.

CURRENT BLOCK: [e.g. Layer 1B BUILD]

Execute ONLY the current block. STOP at the gate.
```
