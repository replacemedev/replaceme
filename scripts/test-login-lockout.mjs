#!/usr/bin/env node
/**
 * Phase 1 smoke test: progressive lockout policy (no Playwright, no Redis).
 * Run: npx tsx scripts/test-login-lockout.mjs
 */
import assert from "node:assert/strict";
import {
  LOCKOUT_FREE_ATTEMPTS,
  LOCKOUT_MAX_SECONDS,
  lockoutSecondsForFailures,
  normalizeLockoutAccountKey,
} from "../src/lib/security/login-lockout-policy.ts";

assert.equal(normalizeLockoutAccountKey("  Foo@Bar.COM "), "foo@bar.com");

for (let i = 0; i < LOCKOUT_FREE_ATTEMPTS; i++) {
  assert.equal(
    lockoutSecondsForFailures(i),
    0,
    `failures=${i} should be free`
  );
}

// Cognito-style: 2^(n-5) capped at 15m
assert.equal(lockoutSecondsForFailures(5), 1);
assert.equal(lockoutSecondsForFailures(6), 2);
assert.equal(lockoutSecondsForFailures(7), 4);
assert.equal(lockoutSecondsForFailures(8), 8);
assert.equal(lockoutSecondsForFailures(9), 16);
assert.equal(lockoutSecondsForFailures(10), 32);
assert.equal(lockoutSecondsForFailures(14), 512);
assert.equal(lockoutSecondsForFailures(20), LOCKOUT_MAX_SECONDS);
assert.equal(lockoutSecondsForFailures(100), LOCKOUT_MAX_SECONDS);

console.log("Phase 1 PASS: progressive lockout policy");
