# QA Gate — Build → Test → Fix

Apply after **every** roadmap phase. A phase is not done until this passes.

| Step | Action |
|------|--------|
| **1. Build** | Implement only the active phase scope; `npm run prompt:sync` if routes changed |
| **2. Spec** | Add/extend Playwright specs under `e2e/{employer,worker,admin}/` |
| **3. Test (CLI)** | `npm run test:e2e:employer` · `test:e2e:worker` · `test:e2e:admin` (as applicable) |
| **4. Test (MCP)** | Playwright MCP — walk critical paths; capture screenshot, URL, console on failure |
| **5. Fix** | Root-cause fix in app or spec; no skipping flaky tests without a tracked issue |
| **6. Re-test** | Re-run CLI + MCP; phase closes only when green |

**Env:** `E2E_EMPLOYER_EMAIL` / `E2E_EMPLOYER_PASSWORD` in `.env.local`. Dev: `npm run dev` or Playwright `webServer`.

**Artifacts:** `e2e/debug/phase-N/` + optional `execution-report.md`.

Each phase doc ends with phase-specific spec names and MCP walks.
