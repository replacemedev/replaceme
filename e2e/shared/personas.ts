/**
 * Layer 5B persona credentials — mirrors scripts/e2e-fixtures/manifest.mjs
 * Pricing tiers: Discovery $0 · Starter $19 · Growth $39 · Scale $79
 */

export const E2E_PERSONAS = {
  workers: {
    maya: {
      email: "e2e-worker-1@replaceme.test",
      passwordEnv: "E2E_WORKER_1_PASSWORD",
    },
    james: {
      email: "e2e-worker-2@replaceme.test",
      passwordEnv: "E2E_WORKER_2_PASSWORD",
    },
    sofia: {
      email: "e2e-worker-3@replaceme.test",
      passwordEnv: "E2E_WORKER_3_PASSWORD",
    },
  },
  employers: {
    discovery: {
      email: "e2e-employer-discovery@replaceme.test",
      passwordEnv: "E2E_EMPLOYER_DISCOVERY_PASSWORD",
      plan: "discovery",
    },
    starter: {
      email: "e2e-employer-starter@replaceme.test",
      passwordEnv: "E2E_EMPLOYER_STARTER_PASSWORD",
      plan: "starter",
    },
    growth: {
      email: "e2e-employer-growth@replaceme.test",
      passwordEnv: "E2E_EMPLOYER_GROWTH_PASSWORD",
      plan: "growth",
    },
    scale: {
      email: "e2e-employer-scale@replaceme.test",
      passwordEnv: "E2E_EMPLOYER_SCALE_PASSWORD",
      plan: "scale",
    },
  },
  admins: {
    moderator: {
      email: "e2e-admin@replaceme.test",
      passwordEnv: "E2E_ADMIN_PASSWORD",
    },
    superadmin: {
      email: "e2e-superadmin@replaceme.test",
      passwordEnv: "E2E_SUPERADMIN_PASSWORD",
    },
  },
} as const;

/** Matches scripts/e2e-fixtures/shared.mjs default when persona env is unset. */
const E2E_DEFAULT_PASSWORD = "E2eFixture!2026";

export function personaPassword(envKey: string): string {
  return process.env[envKey] ?? E2E_DEFAULT_PASSWORD;
}
