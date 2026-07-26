# Admin Access Control Policy

Internal artifact supporting RA 10173 / NPC Circular No. 2023-06 access-control expectations and GDPR accountability for Replaceme staff portal access.

## Roles

| Role | Who grants | Scope |
|------|------------|--------|
| **Super admin** | Existing super admin (last-active protection) | Full portal: team invites, email broadcasts, all modules |
| **Moderator** | Super admin via invite / Edit access | Only granted **module capabilities** |

Platform identity remains JWT `app_metadata.role = admin` + MFA (AAL2). Tier and capabilities live on `admin_profiles`.

## Module capabilities

| Capability | Default moderator | Notes |
|------------|-------------------|--------|
| `dashboard` | On | Always granted to moderators |
| `users`, `applications`, `jobs` | Off | Operations |
| `identity`, `reports`, `moderation`, `disputes`, `notifications` | On | Trust & Safety need-to-know |
| `billing` | Off | Revenue |
| `audit_log`, `security` | Off | Platform — audit_log is read + CSV export only; rows are append-only |
| `settings` | On | Self profile (photo, contact) + account security |
| `team`, `email` | Never | Super admin only |

## Staff profile & passwords

- Every signed-in admin with `settings` can update **their own** photo (with crop), name, department, phone, timezone, bio, and password (in-app change or email reset).
- Staff photos live in `profile-avatars` and are dual-written to `profiles` / `admin_profiles` for shell identity.
- **Public directory:** opt-in via `admin_profiles.directory_public`. Publishes name, photo, department, timezone, and bio on `/team` only. Email/phone never published.
- Admin-internal directory: `/admin/settings/directory` (all active staff, settings capability).
- Super admins reset **other** admins via Team email reset only — no plaintext teammate passwords.

## Lifecycle

1. Super admin **invites** by work email (7-day expiry); no shared temporary password.
2. Invitee sets password via recovery link, then completes MFA.
3. Super admin may **edit access**, **resend invite**, **suspend** (ban + status), or **revoke** pending invites.
4. Denied capability probes are audit-logged as `capability_denied`.

## Enforcement

- Nav filter + page redirects (`requireAdminPageCapability`)
- Server Actions (`requireAdminCapability` / `requireSuperAdmin`)
- SQL helper `has_admin_capability(cap)` for future RLS tightening

## Review

Re-review this matrix when adding admin routes or sensitive Server Actions.
