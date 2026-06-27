# API Endpoint Matrix — Server Actions & TEST Coverage

**TEST phase goal:** Every row below must pass via Playwright (Layer 6T-*) after full seed (Gate 5V).  
**Billing** rows are one section inside **6T-E** — not the primary test scope.

Legend: **Spec** = existing `e2e/*.spec.ts` | **NEW** = spec to add in Layer 6 | **—** = internal/admin only  
**Status:** `Built` · `L2B` Stripe · `L3B` entitlements · `L4B` UI/route · `L5B` seed · `L6T` test target

---

## Auth & onboarding (all roles)

| Action | File | Role | Spec | Status |
|--------|------|------|------|--------|
| `signUp` | `auth.ts` | public | `employer/signup.spec.ts` | Built |
| `signIn` / `logIn` | `auth.ts` | all | `employer/login.spec.ts`, worker specs | Built |
| `logOut` | `auth.ts` | all | header nav specs | Built |
| `sendPasswordResetLink` | `auth.ts` | public | — | Built |
| `updatePassword` | `auth.ts` | public | — | Built |
| `completeWorkerOnboarding` | `onboarding.ts` | worker | `worker/onboarding.spec.ts` | Built |
| `completeEmployerOnboarding` | `onboarding.ts` | employer | `employer/onboarding.spec.ts` | Built |

---

## Worker actions (`src/actions/worker/*`)

| Action | File | Route / UI | Spec | Status |
|--------|------|------------|------|--------|
| `getJobSearchData` | `job-search.ts` | `/worker/jobs` | `worker/jobs-discovery.spec.ts` | Built |
| `toggleSavedJob` | `job-search.ts` | job cards | `worker/saved-jobs.spec.ts` | Built |
| `getWorkerJobDetails` | `job-details.ts` | `/worker/jobs/[id]` | `worker/job-detail.spec.ts` | Built |
| `getApplyJobPageData` | `job-application.ts` | `/worker/jobs/[id]/apply` | `worker/job-apply.spec.ts` | Built |
| `submitJobApplication` | `job-application.ts` | apply form | `worker/job-apply.spec.ts` | Built |
| `getWorkerApplications` | `applications.ts` | `/worker/applications` | `worker/applications-detail.spec.ts` | Built |
| `getWorkerApplicationById` | `applications.ts` | `/worker/applications/[id]` | **NEW** `application-detail.spec.ts` | L4B-iv route · L6T |
| `getWorkerApplicationStats` | `applications.ts` | dashboard | `worker/dashboard.spec.ts` | Built |
| `getMessagingThreads` | `messaging.ts` | `/worker/messages` | `worker/messages.spec.ts` | Built |
| `sendMessagingMessage` | `messaging.ts` | messages | `worker/messages.spec.ts`, `cross-role/billing-entitlements.spec.ts` | Built; L3B blocked send |
| `markMessagingThreadRead` | `messaging.ts` | messages | `worker/messages.spec.ts` | Built |
| `getWorkerContracts` | `contracts.ts` | `/worker/contracts` | `worker/contracts.spec.ts` | Built |
| `respondToContractOffer` | `contracts.ts` | contracts | `worker/contracts.spec.ts` | Built |
| `getWorkerInterviews` | `phase2.ts` | `/worker/interviews` | `worker/interviews.spec.ts` | Built (status-based); **L1B** `interviews` table · L4B detail |
| `getSkillAssessments` | `phase2.ts` | `/worker/tests` | `worker/tests.spec.ts` | Built |
| `getWorkerJobAlerts` / `createWorkerJobAlert` | `phase2.ts` | `/worker/job-alerts` | `worker/job-alerts.spec.ts` | Built |
| `reportEmployer` | `phase2.ts` | `/worker/settings` | `worker/settings.spec.ts` | Built |
| `getWorkerEarnings` | `phase2.ts` | `/worker/earnings` | `worker/earnings.spec.ts` | Built |
| `getWorkerProfileForEdit` / `updateWorkerProfile` | `profile.ts` | `/worker/profile/edit` | `worker/profile-edit.spec.ts` | Built; L4B skills CRUD fix |
| `updateWorkerSettings` | `profile.ts` | `/worker/settings` | `worker/settings.spec.ts` | Built |
| `getWorkerProjects` / `addWorkerProject` | `profile.ts` | profile | `worker/skills.spec.ts` | Built |
| `getNotificationPreferences` / `saveNotificationPreferences` | `notification-preferences.ts` | settings | `worker/notifications-preferences.spec.ts` | Built |
| `getWorkerVerificationState` / `uploadVerificationDocument` / `submitVerificationForReview` | `verification.ts` | `/worker/verification` | `worker/verification.spec.ts` | Built |
| `getSavedJobs` / `unsaveJob` | `saved-jobs.ts` | `/worker/saved-jobs` | `worker/saved-jobs.spec.ts` | Built |
| `markNotificationRead` / `markAllNotificationsRead` | `notifications.ts` | `/worker/notifications` | `worker/notifications-inbox.spec.ts` | Built |

**6T-W command:** `npm run test:e2e:worker`

---

## Employer actions (`src/actions/employer/*`)

| Action | File | Route / UI | Spec | Status |
|--------|------|------------|------|--------|
| `getRecentJobs` / `getRecentApplicants` | `dashboard.ts` | `/employer/dashboard` | `employer/dashboard.spec.ts` | Built; L4B-iii wired dashboard |
| `getEmploymentTypes` / `getSkills` | `jobs.ts` | job create | `employer/job-creation.spec.ts` | Built |
| `createJobPost` / `updateJobPost` | `jobs.ts` | `/employer/jobs/create` | `employer/job-creation.spec.ts`, `job-edit.spec.ts` | Built; L3B job limit |
| `getJobForEdit` / `getJobById` / `deactivateJob` | `jobs.ts` | job detail | `employer/jobs-list.spec.ts` | Built |
| `trackJobView` / `trackJobClick` | `jobs.ts` | analytics | **NEW** `analytics.spec.ts` | **L4B-iii** `/employer/analytics` · L6T |
| `getApplicants` / `unlockCandidate` *(deprecate)* | `applicants.ts` | applicants | `employer/tier-entitlements.spec.ts`, `applicants.spec.ts` | Built; **L3B** identity preview vs full |
| `scheduleInterview` / `sendJobOffer` | `hiring.ts` | pipeline | `employer/offer-hire.spec.ts`, `interviews.spec.ts` | Built; L1B `interviews` + stage history |
| `getEmployerInterviews` | `hiring.ts` | `/employer/interviews` | `employer/interviews.spec.ts` | Built; L1B reads `interviews` |
| `getEmployerCandidateProfile` | `hiring.ts` | `/employer/candidates/[id]` | `employer/candidate-profile.spec.ts` | Built (unlock); L3B entitlement identity |
| `getMessagingThreads` (shared) | `messaging.ts` | `/employer/messages` | `employer/messages.spec.ts`, `cross-role/billing-entitlements.spec.ts` | Built; L3B blocked send |
| `getHiredData` | `hired.ts` | `/employer/hired` | `employer/offer-hire.spec.ts` | Built |
| `getEmployerContract` / `updateEmployerContract` / `terminateEmployerContract` | `contracts.ts` | contracts | `employer/contracts-lifecycle.spec.ts` | Built |
| `getPinnedWorkers` / `togglePin` | `pinned.ts` | `/employer/pinned` | `employer/pipeline-navigation.spec.ts` | Built; L3B Discovery soft gate |
| `getReviewableWorkers` / `submitEmployerReview` | `reviews.ts` | `/employer/reviews` | `employer/reviews.spec.ts` | Built; L3B tier gate |
| `getCompanyProfile` / `updateCompanyProfile` / `uploadCompanyLogo` | `company.ts` | settings/company | `employer/onboarding.spec.ts` | Built |
| `getPricingData` / `getPlanDetails` | `pricing.ts` | `/employer/pricing` | `public/pricing.spec.ts` | Built; L4B-ii 4-tier copy |
| **Billing section** | | | | |
| `getAccountSettings` / `createUpgradeCheckout` / `cancelSubscription` | `billing.ts` | `/employer/settings/account` | `employer/billing.spec.ts` | Built (legacy tiers); **L2B** subscriptions |
| `createStripeSubscription` / `createStripeCheckoutIntent` | `stripe.ts` | checkout | `employer/billing.spec.ts` | Built; **L2B** refactor |
| `getEmployerCreditsSummary` *(deprecate)* | `credits.ts` | credits | remove after 4B-i | Built; deprecate 4B-i |
| `updateApplicationStatus` | `applications.ts` | applicants | `employer/applicants.spec.ts` | Built; L1B stage history trigger |
| `getEmployerPlanUsage` *(new)* | `billing.ts` or `entitlements.ts` | dashboard / billing | `employer/tier-entitlements.spec.ts`, `pricing-tiers.spec.ts` | **L3B** · L4B `PlanUsageCard` |
| `searchTalentPool` *(new)* | `talent.ts` | `/employer/talent` | **NEW** `talent-pool.spec.ts` | **L4B-iii** · L6T |
| `logEntitlementDenial` *(new)* | `entitlements.ts` | internal | — | **L3B** |

**6T-E command:** `npm run test:e2e:employer`

---

## Admin actions (`src/actions/admin-actions.ts`, `admin/*`)

| Action | File | Route | Spec | Status |
|--------|------|-------|------|--------|
| `fetchDashboardMetrics` / `fetchRecentAuditLogs` | admin-actions | `/admin/dashboard` | **NEW** `admin/dashboard.spec.ts` | Built actions; L6T |
| `fetchAdminUsersPageData` / `suspendUser` / `unsuspendUser` | admin-actions | `/admin/users` | **NEW** `admin/users.spec.ts` | Built; L6T |
| User drill-down | — | `/admin/users/[id]` | **NEW** `user-drilldown.spec.ts` | **L4B-v** · L6T |
| `fetchAdminJobs` / `approveJobPost` / `rejectJobPost` / `deleteJobPost` | admin-actions | `/admin/jobs` | **NEW** `admin/jobs-moderation.spec.ts` | Built; L6T |
| `fetchAdminApplications` | admin-actions | `/admin/applications` | `admin/applications.spec.ts` | Built |
| `fetchVerificationQueue` / `reviewWorkerVerification` | admin-actions | `/admin/identity` | **NEW** `admin/identity.spec.ts` | Built; L6T |
| `fetchAdminChatThreads` | admin-actions | `/admin/moderation` | `admin/moderation.spec.ts` | Built; L4B-v message body |
| `fetchAdminDisputes` / `updateDisputeStatus` | admin-actions | `/admin/disputes` | `admin/disputes-workflow.spec.ts` | Built; L4B-v `admin_notes` UI |
| `fetchAdminSubscriptions` / `adminOverrideSubscriptionUsage` | admin-actions | `/admin/billing-ops` | `admin/billing-ops.spec.ts` | Built; L1B override columns |
| Contracts list | — | `/admin/contracts` | **NEW** `admin/contracts.spec.ts` | **L4B-v** route · L6T |
| `fetchAuditLogs` | admin-actions | `/admin/audit-log` | **NEW** `admin/audit-log.spec.ts` | Built; L6T |
| `listAdminPageContent` / `upsertPageContent` | `admin/page-content.ts` | settings/pages | — | Built |
| `saveFaqPage` | `admin/faq.ts` | settings/pages/faq | `admin/faq-cms.spec.ts` | Built |
| `requireAdminRole('superadmin')` *(new)* | `admin/auth.ts` | billing-ops overrides | extend `billing-ops.spec.ts` | **L4B-v** · L1B `admin_profiles` |

**6T-A command:** `npm run test:e2e:admin`

---

## Public actions

| Action | File | Route | Spec | Status |
|--------|------|-------|------|--------|
| `getPricingData` | `employer/pricing.ts` | `/pricing` | `public/pricing.spec.ts` | Built; L4B-ii 4 tiers |
| `getPublicJobListings` / `getPublicJobById` | `public/growth.ts` | `/jobs` | `public/job-board.spec.ts` | Built; L4B-ii priority badge |
| `getPublicCompanyDirectory` | `public/growth.ts` | `/companies` | `public/companies.spec.ts` | Built |
| `getPublishedPageContent` | `public/page-content.ts` | help, legal | `public/help.spec.ts`, `faq-pages.spec.ts` | Built |

**6T-X command:** `npm run test:e2e:public` then `npm run test:e2e`

---

## API route (non–server-action)

| Route | File | Tested in | Status |
|-------|------|-----------|--------|
| `POST /api/webhooks/stripe` | `api/webhooks/stripe/route.ts` | 6T-E `billing.spec.ts` + Stripe CLI manual | Built; **L2B** idempotent `stripe_webhook_events` |

---

## Shared components (Layer 4B-vi — no server action row)

| Component | Consumers | Status |
|-----------|-----------|--------|
| `ApplicationTimeline` | worker application detail, employer pipeline | L4B-vi |
| `HiringStageBadge` | kanban, lists | L4B-vi |
| `EntityLink` | admin cross-links | L4B-vi |
| `MessagingThreadStatus` | worker/employer messages | L4B-vi |
| `PlanTierBadge` | billing, admin ops | L4B-vi |

---

## New employer routes (Layer 4B-iii — UI only)

| Route | Purpose | Status |
|-------|---------|--------|
| `/employer/analytics` | Job views/clicks | L4B-iii |
| `/employer/talent` | Talent pool search | L4B-iii |
| `/employer/support` | Priority support entry | L4B-iii |
| `/employer/settings/notifications` | Employer notification prefs | L4B-iii |
| `/employer/settings/security` | Password / sessions | L4B-iii |
