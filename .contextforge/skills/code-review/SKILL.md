# Code Review

## Overview

Review code changes with a structured lens on security, performance, correctness, and maintainability.

**Usage:** Provide a PR URL, file path, or paste a diff. If context would help focus the review ("this is a hot path", "this handles PII"), include it.

## Capabilities

**Standalone (always available)**
- Review pasted diffs, PR URLs, or local file paths
- Security audit (OWASP Top 10, injection, authentication)
- Performance review (N+1, memory leaks, algorithmic complexity)
- Correctness (edge cases, error handling, race conditions)
- Maintainability (naming, structure, readability, test coverage)
- Actionable suggestions with code examples

**When tools are connected**
- Source control tool: pull PR diff automatically from URL, check CI status and test results
- Project tracker tool: link findings to related tickets, verify PR addresses stated requirements
- Knowledge base tool: check changes against team coding standards and style guides

## Review Dimensions

### Security

- SQL injection, XSS, CSRF
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure deserialization
- Path traversal
- SSRF (Server-Side Request Forgery)

### Performance

- N+1 queries
- Unnecessary memory allocations
- Algorithmic complexity (O(n²) or worse in hot paths)
- Missing database indexes
- Unbounded queries or loops
- Resource leaks (file handles, connections, goroutines, event listeners)

### Correctness

- Edge cases (empty input, null, integer overflow, boundary values)
- Race conditions and concurrency issues
- Error handling and propagation
- Off-by-one errors
- Type safety gaps

### Maintainability

- Naming clarity
- Single responsibility
- Duplication
- Test coverage
- Documentation for non-obvious logic

## Severity Levels

| Level | Label | Meaning |
|---|---|---|
| 🔴 | Critical | Security vulnerability or data-loss risk. Must fix before merge. |
| 🟠 | High | Likely bug or significant performance problem. Should fix before merge. |
| 🟡 | Medium | Correctness risk or notable quality issue. Fix soon. |
| 🟢 | Low | Optional improvement. Style, naming, minor duplication. |
| 💡 | Info | Observation or question. No action required. |

## Output Format

```
## Code Review: [PR title or file name]

### Summary
[1–2 sentence overview of the changes and overall quality]

### Critical Issues
| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 1 | auth.ts | 42 | User input passed directly to SQL query without parameterization | 🔴 Critical |

**Issue #1 — SQL Injection (auth.ts:42)**
Current:
```ts
db.query(`SELECT * FROM users WHERE email = '${email}'`)
```
Fix:
```ts
db.query('SELECT * FROM users WHERE email = $1', [email])
```

### Suggestions
| # | File | Line | Suggestion | Category |
|---|------|------|------------|----------|
| 1 | users.ts | 88 | Move N+1 query inside loop to a single batched query | Performance |

### What Looks Good
- [Positive observations — acknowledge what was done well]

### Verdict
[Approve / Request Changes / Needs Discussion]
```

## Tips for Better Reviews

- **Provide context** — "This is a hot path" or "This handles PII" focuses the review on what matters most.
- **Specify concerns** — "Focus on security" or "I'm worried about concurrency" narrows the scope.
- **Include tests** — Test files are reviewed for coverage quality and correctness too.
- **Share the PR description** — Understanding intent improves finding relevance.

## Related Skills

- `systematic-debugging` — When a review finding needs deeper root cause investigation
- `verification-before-completion` — Verify that found issues are actually fixed before marking the review resolved
