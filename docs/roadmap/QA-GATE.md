# QA Gate — Build → Test → Fix

Apply after **every** roadmap phase. A phase is not done until this passes.

| Step | Action |
|------|--------|
| **1. Build** | Implement only the active phase scope; `npm run prompt:sync` if routes changed |
| **2. Spec** | Add/extend Playwright specs under `e2e/{employer,worker,admin,public}/` |
| **3. Test (CLI)** | `npm run test:e2e:employer` · `test:e2e:worker` · `test:e2e:admin` · `test:e2e:public` (as applicable) |
| **4. Test (MCP)** | Playwright MCP — walk critical paths; capture screenshot, URL, console on failure |
| **5. Fix** | Root-cause fix in app or spec; no skipping flaky tests without a tracked issue |
| **6. Re-test** | Re-run CLI + MCP; phase closes only when green |

## Playwright web server (required)

E2E runs against **production mode only** — not `next dev`.

| Item | Value |
|------|--------|
| **Server** | `next start` on `http://127.0.0.1:3100` |
| **Launcher** | `scripts/playwright-web-server.mjs` (wired in `playwright.config.ts` `webServer`) |
| **Why** | Avoids `next dev` lock / port conflicts when dev is already running |
| **Build** | Script runs `npm run build` automatically if `.next/BUILD_ID` is missing |

Run tests with the default scripts (`npm run test:e2e`, `test:e2e:*`). Playwright starts the web server for you.

**Reuse an already-running server** (optional): start `node scripts/playwright-web-server.mjs` yourself, then `npm run test:e2e:reuse` (`PLAYWRIGHT_SKIP_WEBSERVER=1`, base URL `http://127.0.0.1:3100`).

**Do not** point Playwright at `npm run dev` for phase QA.

**Env:** `E2E_*` credentials in `.env.local` (see `.env.example`). Override base URL with `PLAYWRIGHT_BASE_URL` or port with `PLAYWRIGHT_PORT` if needed.

**Artifacts:** `e2e/debug/phase-N/` + optional `execution-report.md`.

Each phase doc ends with phase-specific spec names and MCP walks.
