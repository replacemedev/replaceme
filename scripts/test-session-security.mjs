#!/usr/bin/env node
/**
 * Phase 2 smoke test: session revocation wiring (no Playwright).
 * Run: node scripts/test-session-security.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/actions/sessions.ts",
  "src/components/shared/security/SessionSecurityPanel.tsx",
  "src/app/worker/settings/security/page.tsx",
  "src/app/employer/settings/security/page.tsx",
];

for (const rel of requiredFiles) {
  const path = join(root, rel);
  assert.ok(existsSync(path), `missing ${rel}`);
}

const sessions = readFileSync(join(root, "src/actions/sessions.ts"), "utf8");
assert.match(sessions, /scope:\s*["']others["']/);
assert.match(sessions, /scope:\s*["']global["']/);
assert.match(sessions, /revokeOtherSessions/);
assert.match(sessions, /revokeAllSessionsAndSignOut/);

const auth = readFileSync(join(root, "src/actions/auth.ts"), "utf8");
assert.match(auth, /signOut\(\{\s*scope:\s*["']local["']\s*\}\)/);
assert.match(auth, /isLoginLocked/);
assert.match(auth, /recordLoginFailure/);
assert.match(auth, /clearLoginFailures/);

const adminSecurity = readFileSync(
  join(root, "src/app/admin/(shell)/security/page.tsx"),
  "utf8"
);
assert.match(adminSecurity, /SessionSecurityPanel/);

const panel = readFileSync(
  join(root, "src/components/shared/security/SessionSecurityPanel.tsx"),
  "utf8"
);
assert.match(panel, /Sign out other devices/);
assert.match(panel, /Sign out everywhere/);
assert.match(panel, /sm:flex-row/);
assert.match(panel, /w-full/);

console.log("Phase 2 PASS: session revocation actions + UI wired");
