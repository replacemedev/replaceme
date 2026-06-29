/**
 * Curated task → path patterns. Resolved at sync time against the workspace.
 * Add a row when a new product domain is introduced (e.g. "Disputes").
 */
export const TASK_INDEX = [
  {
    area: "Headers (bell, avatar, sign out)",
    patterns: [
      "src/lib/auth/nav-session.ts",
      "src/components/shared/header/GlobalHeader.tsx",
      "src/components/shared/header/NotificationBell*.tsx",
      "src/components/shared/nav/RoleNavDropdown.tsx",
      "src/components/shared/nav/AuthenticatedNavActions.tsx",
      "src/components/layout/WorkerHeader.tsx",
      "src/components/layout/PublicHeader.tsx",
      "src/components/employer/layout/EmployerHeader.tsx",
      "src/components/admin/layout/AdminHeader.tsx",
      "src/components/worker/layout/WorkerDropdown.tsx",
      "src/components/employer/layout/EmployerDropdown.tsx",
      "src/components/admin/layout/AdminDropdown.tsx",
    ],
  },
  {
    area: "Password reset",
    patterns: [
      "src/components/auth/ForgotPasswordForm.tsx",
      "src/components/auth/UpdatePasswordForm.tsx",
      "src/components/auth/RecoveryHashHandler.tsx",
      "src/actions/auth.ts",
      "src/app/auth/callback/route.ts",
      "src/app/auth/confirm/route.ts",
      "src/app/update-password/page.tsx",
      "src/lib/auth/site-url.ts",
      "src/lib/validations/auth.ts",
    ],
  },
  {
    area: "Login / signup",
    patterns: [
      "src/app/signin/**",
      "src/app/signup/**",
      "src/components/auth/LoginForm.tsx",
      "src/components/auth/SignUpForm.tsx",
      "src/actions/auth.ts",
      "src/lib/validations/auth.ts",
    ],
  },
  {
    area: "Onboarding",
    patterns: [
      "src/app/worker/onboarding/**",
      "src/app/employer/onboarding/**",
      "src/components/worker/onboarding/**",
      "src/components/employer/onboarding/**",
      "src/components/shared/onboarding/**",
      "src/actions/onboarding.ts",
      "src/lib/validations/onboarding.ts",
      "src/config/onboarding.ts",
      "src/lib/server/auth/middleware.ts",
    ],
  },
  {
    area: "Worker jobs",
    patterns: [
      "src/app/worker/jobs/**",
      "src/app/worker/job-search/**",
      "src/actions/worker/job-search.ts",
      "src/actions/worker/job-details.ts",
      "src/components/worker/jobs/**",
    ],
  },
  {
    area: "Employer jobs",
    patterns: [
      "src/app/employer/jobs/**",
      "src/actions/employer/jobs.ts",
      "src/components/employer/jobs/**",
      "src/lib/validations/employer/jobs.ts",
    ],
  },
  {
    area: "Messaging",
    patterns: [
      "src/app/worker/messages/**",
      "src/app/employer/messages/**",
      "src/actions/messaging.ts",
      "src/lib/validations/messaging.ts",
      "src/components/shared/messaging/**",
      "src/types/messaging.ts",
    ],
  },
  {
    area: "Notifications",
    patterns: [
      "src/components/shared/header/NotificationBell*.tsx",
      "src/actions/notifications.ts",
      "src/hooks/useNotifications.ts",
      "src/lib/notifications/**",
      "src/types/notifications.types.ts",
    ],
  },
  {
    area: "Admin moderation",
    patterns: [
      "src/app/admin/**",
      "src/actions/admin-actions.ts",
      "src/components/admin/**",
      "src/lib/server/auth/require-admin.ts",
      "src/types/admin.types.ts",
    ],
  },
  {
    area: "Stripe / billing",
    patterns: [
      "src/app/api/webhooks/stripe/**",
      "src/app/employer/checkout/**",
      "src/app/employer/pricing/**",
      "src/actions/employer/billing.ts",
      "src/actions/employer/stripe.ts",
      "src/lib/server/stripe/**",
      "src/lib/validations/billing.ts",
      "src/lib/validations/stripe.ts",
    ],
  },
  {
    area: "RLS / schema",
    patterns: ["supabase/migrations/*.sql", "src/types/database.ts"],
  },
  {
    area: "Pricing migration",
    patterns: [
      "docs/pricing-migration/**",
      "scripts/seed-e2e-fixtures.mjs",
      "scripts/e2e-fixtures/**",
      "scripts/verify-e2e-fixtures.mjs",
      "src/lib/server/billing/**",
      "src/actions/employer/billing.ts",
      "src/actions/employer/stripe.ts",
      "src/actions/employer/pricing.ts",
      "src/app/api/webhooks/stripe/**",
    ],
  },
  {
    area: "RBAC / middleware",
    patterns: [
      "src/proxy.ts",
      "src/lib/server/auth/middleware.ts",
      "src/lib/server/auth/session.ts",
      "src/lib/server/auth/require-admin.ts",
    ],
  },
];
