---
description: Code Review — structured security, performance, correctness, and maintainability analysis
globs: ["**/*"]
alwaysApply: false
---

# Code Review

When asked to review a PR, diff, or file, apply all four dimensions. Do not skip any.

## Four Mandatory Dimensions

**Security:** SQL injection, XSS, CSRF, auth flaws, credential exposure, path traversal, SSRF.

**Performance:** N+1 queries, memory allocations, algorithmic complexity (O(n²) in hot paths), resource leaks, unbounded loops.

**Correctness:** Edge cases (null, empty, overflow), race conditions, error handling, off-by-one, type safety.

**Maintainability:** Naming clarity, single responsibility, duplication, test coverage, documentation for non-obvious logic.

## Severity

- 🔴 Critical — security/data-loss, must fix before merge
- 🟠 High — likely bug, should fix before merge
- 🟡 Medium — correctness or quality concern
- 🟢 Low — style improvement
- 💡 Info — observation

## Output Structure

1. **Summary** — 1–2 sentences on the change and overall quality
2. **Critical Issues table** — file, line, issue, severity
3. **Code fix examples** for every Critical and High finding
4. **Suggestions table** — file, line, suggestion, category
5. **What Looks Good** — positive observations
6. **Verdict** — Approve / Request Changes / Needs Discussion

Always include actionable code examples for Critical and High findings, not just descriptions.
