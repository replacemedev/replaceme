---
description: Dependency Management — evaluation, pinning, auditing, and supply chain security for third-party packages
globs: ["package.json", "package-lock.json", "requirements*.txt", "Cargo.toml", "pyproject.toml", "*.lock"]
alwaysApply: false
---

# Dependency Management

## Before Adding Any Dependency

1. Does it replace < 20 lines of pure logic? → Write it yourself.
2. Weekly downloads < 10k → high risk. Last commit > 2 years → seek alternative.
3. License: GPL in proprietary → reject. Apache 2.0 → attribution required.
4. Run `npm audit` / `pip-audit` / `npx socket check` before committing.
5. Adding > 50 transitive deps → requires justification.

## Version Pinning

- Production apps: exact versions (`1.2.3`) — no `^`, no `~`, never `*`.
- Published libraries: tilde (`~1.2.3`).
- Dev tooling: caret (`^1.2.3`) acceptable.
- CI: `npm ci` always — never `npm install`.

## Security Rules

- `npm audit fix --force` requires diff review — may break APIs.
- Critical/high advisories in dev deps must be resolved within SLA.
- Lock private scoped packages to internal registry in `.npmrc`.
- Never commit `node_modules`; always commit the lockfile.

## npm Overrides

Only for patching unresolved transitive CVEs. Always run full tests after.

## Peer Dependencies

Never silence peer dependency warnings. Resolve version mismatches — don't use `--legacy-peer-deps` as a first response.

## License Check

```bash
npx license-checker --production --failOn "GPL;AGPL"
```
