# Phase 0 E2E artifacts

CLI runs on `http://127.0.0.1:3100` via `scripts/playwright-web-server.mjs`.

## Results (2026-06-26)

| Suite | Pass | Fail | Skip | Notes |
|-------|------|------|------|-------|
| employer | 13 | 1 | 1 | Signup duplicate-email flake (pre-Phase 0) |
| worker | 2 | 0 | 0 | Dashboard links + tests scaffold |
| admin | 1 | 0 | 0 | Disputes shell loads |

HTML report: `playwright-report/index.html` after `npm run test:e2e`.
