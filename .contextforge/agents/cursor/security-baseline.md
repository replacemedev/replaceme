---
description: Security baseline — 6-layer review framework for transport, headers, CSP, auth, input handling, secrets, and operations.
alwaysApply: false
---

## Security Baseline

Apply for pre-launch reviews, periodic audits, new site setup, vendor onboarding, or post-incident hardening.

**CRITICAL — Transport:** HTTPS everywhere. TLS 1.2+, disable 1.0/1.1. HSTS `max-age=31536000; includeSubDomains`. Only add `preload` when all subdomains are permanently HTTPS — removal takes weeks. Monitor cert expiry.

**CRITICAL — Response Headers (all required):**
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy` (site-specific — see CSP rules)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (site-specific)

Verify with `securityheaders.com` or `observatory.mozilla.org`.

**CRITICAL — CSP:**
- Nonce-based strict CSP preferred over domain allowlists
- Never `unsafe-inline` or `unsafe-eval` in `script-src`
- No wildcards (`*`)
- No user-content CDNs
- Roll out with `Content-Security-Policy-Report-Only` before enforcing
- Use `frame-ancestors` for clickjacking defense

**HIGH — Auth:** Length-first passwords. Rate limit login. 2FA required for all admin accounts. `HttpOnly + Secure + SameSite` session cookies. Server-side logout. Authorization on every request.

**HIGH — Input:** Server-side validation only. Parameterized queries. Output encoding by context. Rate limit abuse-prone endpoints. CSRF tokens on state-changing requests.

**HIGH — Secrets:** No secrets in repos or baked images. Dedicated secrets manager. Per-environment credentials. Rotation schedule. Per-service scoped credentials.

**MEDIUM — Operations:** Quarterly access review + same-day offboarding. 2FA on all admin systems. Audit logs active. Scanning with remediation. Incident response runbook. Tested backups. `/.well-known/security.txt`.

### Quick Audit Checklist

**High risk, easy fixes (do first):**
- [ ] HSTS header set with `includeSubDomains`
- [ ] `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` present
- [ ] Admin accounts have 2FA
- [ ] TLS 1.0/1.1 disabled

**Medium risk (do next):**
- [ ] CSP in `Report-Only` mode, progressing to enforcing
- [ ] Login endpoints rate limited
- [ ] Secrets in a dedicated manager, not repos

**Low risk (nice-to-have):**
- [ ] `Permissions-Policy` configured
- [ ] `Cross-Origin-Opener-Policy` set
- [ ] `/.well-known/security.txt` published
