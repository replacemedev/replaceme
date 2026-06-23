# Dependency Management

## Overview

Third-party dependencies are simultaneously the most powerful and most dangerous part of modern software. A single mismanaged dependency caused log4shell. Left-pad took down thousands of builds in 11 minutes. Supply chain attacks through dependency confusion hit major enterprises.

This skill covers the full lifecycle: choosing, pinning, auditing, updating, and removing dependencies with production discipline.

## When to Use

**Use for:**
- Deciding whether to add a new dependency
- Version pinning strategy (exact vs range vs lockfile-only)
- Setting up automated update workflows (Renovate, Dependabot)
- Security auditing with npm audit, pip-audit, Snyk, Socket.dev
- License compliance scanning (MIT/Apache/GPL compatibility)
- Generating Software Bills of Materials (SBOM)
- Resolving peer dependency conflicts and npm overrides
- Responding to security advisories and CVEs
- Detecting typosquatting and dependency confusion attacks

**Not for:**
- Internal monorepo package management
- Publishing your own packages to npm, PyPI, crates.io
- Package manager workspace configuration
- Vendoring and air-gapped environments

---

## Core Decision: Should I Add This Dependency?

```
Want to add a dependency?
│
├── How much code does it replace?
│   ├── < 20 lines → Write it yourself
│   ├── 20–200 lines → Trivial to implement correctly?
│   │   ├── Yes, pure logic → Write it yourself
│   │   └── No, edge cases / locale / timezone / crypto → check the package
│   └── > 200 lines → check the package
│
├── Check the package:
│   ├── Weekly downloads?
│   │   ├── < 10k → High risk: low adoption
│   │   ├── 10k–100k → Medium: check actively
│   │   └── > 100k → Continue
│   ├── Actively maintained? (last commit < 2 years)
│   │   └── > 2 years → Consider fork or alternative
│   ├── License compatible?
│   │   └── GPL in proprietary → REJECT
│   ├── npm audit / Socket.dev scan clean?
│   │   └── Unfixed CVEs → REJECT
│   └── Transitive dep count?
│       └── > 50 new deps → Reconsider: high blast radius
│
└── Add with pinned exact version
```

---

## Version Pinning Strategy

### Semver Semantics

```
^1.2.3  = >= 1.2.3, < 2.0.0   (minor + patch updates allowed)
~1.2.3  = >= 1.2.3, < 1.3.0   (patch updates only)
1.2.3   = exactly 1.2.3        (locked)
*       = any version           (never use)
```

### When to Use Each

| Strategy | Where | Reasoning |
|---|---|---|
| Exact pinning (`1.2.3`) | Production apps | Reproducible builds; lockfile provides flexibility |
| Tilde (`~1.2.3`) | Libraries you publish | Patch safety; minor versions may break consumers |
| Caret (`^1.2.3`) | Dev tooling only | Acceptable churn for formatters, linters |
| Lockfile as truth | All production | `npm ci`, `pip install --frozen`, `cargo build` |
| Never `*` | Anywhere | Catastrophic: installs whatever is latest at build time |

### Anti-Pattern: Caret in Production App Dependencies

> "I use `^` so I always get bug fixes automatically. That's safer."

Caret ranges mean any breaking-within-semver change installs without your knowledge. Semver is aspirational, not enforced — packages regularly ship breaking changes in minor versions. Your lockfile prevents this on developer machines, but CI environments that run `npm install` instead of `npm ci` will silently upgrade.

**Fix:** Pin direct dependencies exactly. Let the lockfile manage transitive deps. Review updates deliberately via Renovate or Dependabot PRs.

**Detection:** Check `package.json` for `^` prefixes on runtime dependencies in production apps. Run `npm ci` on a fresh clone and compare the installed tree to your last deployment.

---

## Update Workflow

### Automated Updates

**Dependabot** (GitHub only — simpler setup):

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      dev-dependencies:
        patterns: ["*"]
        dependency-type: "development"
        update-types: ["minor", "patch"]
```

**Renovate Bot** (any platform — more configurable):

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["dependencies"],
      "matchUpdateTypes": ["major"],
      "reviewers": ["team:maintainers"]
    }
  ]
}
```

### Automerge Policy

| Update type | Dep type | Automerge? |
|---|---|---|
| Patch | Dev deps | Yes, with test gate |
| Minor | Dev deps | Yes, with test gate |
| Patch | Prod deps | Optional, with test gate |
| Minor/Major | Prod deps | No — require human review |

### Manual Audit (when no automation)

```bash
npm outdated
pip list --outdated
cargo outdated
```

Schedule: monthly at minimum.

---

## Security Auditing

### The Audit Stack

Run in order from fastest to deepest:

```bash
# 1. npm audit — built-in, free, checks known CVEs
npm audit
npm audit --audit-level=high    # Only high+ severity
npm audit fix                   # Auto-fix where possible
npm audit fix --force           # ⚠️ May break API — review diff first

# 2. pip audit — Python equivalent
pip install pip-audit
pip-audit
pip-audit --fix

# 3. Socket.dev — supply chain analysis beyond CVEs
npx socket check                # Checks for malicious behavior, typosquatting

# 4. Snyk — deeper analysis, CI integration
npx snyk test
npx snyk monitor                # Continuous monitoring

# 5. SBOM generation (compliance)
npx @cyclonedx/cyclonedx-npm --output-format json > sbom.json
# Python: pip install cyclonedx-bom && cyclonedx-py -p
```

### Anti-Pattern: Ignoring Security Advisories

> "The audit shows vulnerabilities but they're in dev dependencies or unused code paths. Not a risk."

Dev dependencies reach production in two ways:
1. Build tools that process production code can be compromised.
2. The advisory may be rated "dev-only" but the package is actually in your production bundle.

**Fix:** Use `npm audit --production` to scope to production-only deps. Check `npm ls <vulnerable-pkg>` to trace the full dependency chain. For genuinely dev-only packages (mocha, jest, eslint), moderate severity advisories can be deferred. Critical/high — even in dev deps — must be resolved within your SLA. "Not a risk" is a documented assessment, not a skip.

---

## Supply Chain Security

### Typosquatting Detection

Common attack patterns:
- `lodash` → `1odash` (digit 1 instead of letter l)
- `express` → `expres` (missing character)
- `react` → `React` (case sensitivity)
- `@org/package` → `org-package` (scope confusion)

```bash
# Socket.dev catches most of these
npx socket check

# Manual: verify before installing
npm view <package-name>              # Check author, description, repo URL
npm view <package-name> repository   # Verify GitHub repo matches official source
```

### Dependency Confusion Attack

An attacker publishes a public package with the same name as your private `@org/package`. The package manager fetches the public one because it has a higher version number.

**Prevention:**

```ini
# .npmrc — lock scope to internal registry
@your-org:registry=https://your-private-registry.example.com
```

```json
// package.json — overrides to lock source
{
  "overrides": {
    "@your-org/internal-package": "npm:@your-org/internal-package@^1.0.0"
  }
}
```

### Lockfile Integrity

```bash
# CI: always npm ci — fails if lockfile doesn't match package.json
npm ci

# Python: pip-compile for deterministic locks
pip install pip-tools
pip-compile requirements.in     # Generates pinned requirements.txt
pip-sync requirements.txt       # Install exactly this
```

Never commit `node_modules`. Always commit the lockfile.

---

## License Compliance

### Compatibility Matrix

| Your project | MIT dep | Apache 2.0 dep | LGPL dep | GPL dep |
|---|---|---|---|---|
| Proprietary | OK | OK (attribution) | OK (dynamic link) | **REJECT** |
| MIT/Apache | OK | OK | OK | Complicated |
| GPL | OK | OK | OK | OK |

```bash
# Scan all licenses, fail on incompatible
npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD"
npx license-checker --production --failOn "GPL;AGPL"

# Python
pip install pip-licenses
pip-licenses --format=markdown --order=license
```

### Anti-Pattern: Excessive Dependencies for Trivial Functionality

> `npm install is-odd` — an actual package with 54M weekly downloads containing one line: `n % 2 !== 0`.

Every production dependency is: a potential CVE vector, a supply chain attack surface, a semver conflict source, and cognitive load. Before adding a package, ask: is the core functionality < 20 lines? For date manipulation, string utilities, and math operations — write the function. For localization, cryptography, protocol parsing — use battle-tested libraries.

**Detection:** Run `npx cost-of-modules`. Packages under 10KB for non-trivial domains are almost always replaceable.

---

## npm Overrides and Resolutions

Use to patch vulnerable transitive dependencies when the direct dependency hasn't updated:

```json
// package.json — npm overrides (npm 8.3+)
{
  "overrides": {
    "semver": ">=7.5.2",
    "lodash": "4.17.21",
    "vulnerable-pkg": {
      "sub-dependency": "^2.0.0"
    }
  }
}

// Yarn / pnpm resolutions
{
  "resolutions": {
    "semver": ">=7.5.2"
  }
}
```

**Caution:** Overrides can break packages that require the older API. Always run the full test suite after adding an override.

---

## Peer Dependencies

```bash
# Check what peer deps a package requires
npm info <package> peerDependencies

# npm 7+ auto-installs peer deps — check for conflict warnings
npm install 2>&1 | grep "peer dep"
npm ls 2>&1 | grep "WARN" | grep "peer"
```

**Rule:** Never silence peer dependency warnings. They indicate version mismatches that cause subtle runtime failures. Resolve by pinning the common peer to a compatible version. `--legacy-peer-deps` is a last resort — document why if used.

---

## Quick Reference

```bash
# Pre-install check
npm view <pkg>                              # Verify package metadata
npx socket check                           # Supply chain scan

# After install
npm audit --audit-level=high               # CVE check
npx license-checker --production           # License scan
npm ls <pkg>                               # Trace dependency chain

# CI
npm ci                                     # Lockfile-strict install (not npm install)

# Maintenance
npm outdated                               # What needs updating
npm audit fix                              # Auto-fix safe vulnerabilities
```
