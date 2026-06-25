# System Context & Architecture Directory

This document serves as the comprehensive technical directory and system context for the **ReplaceMe** remote hiring platform. It maps out the design, stack, codebase organization, database schema, payment flow, and security configurations.

---

## 1. System Overview

**ReplaceMe** is a modern SaaS recruitment marketplace connecting businesses/employers with remote workers across key domains, including:
* Content Creation & Copywriting
* UI/UX & Graphic Design
* Virtual Assistance & Admin Support
* Social Media & Community Management

The architecture is built around a split-role design (Employers vs. Workers and also the Admin) using Next.js App Router Server Actions for backend tasks and Supabase as the primary database, auth, and storage provider.

---

## 2. Technology Stack

### Frontend & Core Layout
* **Framework:** Next.js `16.2.9` (App Router)
* **Runtime Library:** React `19.2.4`
* **Language:** TypeScript `^5`
* **Styling:** Tailwind CSS `^4` (using PostCSS `^4`)
* **Icons:** Lucide React `^1.21.0`
* **Notifications:** Sonner `^2.0.7` (toast alerts)

### Backend, Auth & Storage
* **Database & Auth Provider:** Supabase
* **Client Library:** `@supabase/supabase-js` `^2.108.2`
* **SSR Integration:** `@supabase/ssr` `^0.12.0` (handling cookie storage and server client instantiation)

### State Management & Forms
* **Form Handling:** React Hook Form `^7.80.0`
* **Validation Schema:** Zod `^4.4.3`
* **Resolvers:** `@hookform/resolvers` `^5.4.0`

### Payments & Billing
* **Payment Processor:** Stripe `^22.2.2`

---

## 3. Codebase Structure

Three-role routing (`/worker/*`, `/employer/*`, `/admin/*`) with shared messaging and Stripe webhook billing.

```
src/
├── app/
│   ├── worker/                 # Worker dashboard, jobs, applications, messages, onboarding
│   ├── employer/               # Employer dashboard, jobs, applicants, billing, onboarding
│   ├── admin/                  # Admin shell (MFA-gated), disputes scaffold, audit-log
│   └── api/webhooks/stripe/    # Signature-verified Stripe webhooks
├── actions/                    # Server Actions (Zod + RBAC)
│   ├── applications.ts         # Cross-role application status mutations
│   ├── messaging.ts            # chat_threads / chat_messages
│   ├── admin-actions.ts        # Admin moderation & metrics
│   ├── onboarding.ts           # Worker/employer first-login wizards
│   └── employer/               # jobs, applicants, stripe, billing, pinned, …
├── components/
│   ├── shared/                 # StatCard, messaging, EmptyState, skeletons
│   ├── worker/ | employer/ | admin/
├── lib/
│   ├── server/
│   │   ├── action-result.ts    # runAction + safe errors
│   │   ├── auth/
│   │   │   ├── session.ts      # requireAuth / requireRole
│   │   │   ├── require-admin.ts
│   │   │   └── middleware.ts   # Session + onboarding redirects
│   │   ├── dal/                # Typed Supabase query helpers
│   │   │   ├── profiles.ts
│   │   │   ├── jobs.ts
│   │   │   └── applications.ts
│   │   └── stripe/sync-subscription.ts
│   ├── validations/            # Zod schemas (auth, jobs, stripe, messaging, …)
│   └── supabase/               # createClient, createAdminClient
├── types/database.ts           # Generated Supabase types
└── proxy.ts                    # Next.js middleware entry → updateSession
```

**Key conventions**
- Mutations: `requireRole()` or `requireAdmin()` + Zod + `runAction()` where applicable.
- Billing activation: **only** via `POST /api/webhooks/stripe` or server-side `reconcilePaymentIntent` (Stripe API verify).
- Messaging: `chat_threads` + `chat_messages` (legacy `conversations` tables removed).

---

## 4. Database Schema (PostgreSQL)

Supabase PostgreSQL with **FORCE ROW LEVEL SECURITY** on all `public` tables.

### Core bridge tables
| Domain | Tables |
|--------|--------|
| Identity | `profiles`, `company_profiles` |
| Jobs | `jobs`, `applications`, `worker_saved_jobs` |
| Messaging | `chat_threads`, `chat_messages` |
| Billing | `billing_plans`, `employer_subscriptions`, `employer_credits`, `unlocked_profiles` |
| Admin | `audit_logs`, `verification_documents` |

### Enums
- `user_role`: `employer` \| `worker` \| `admin`
- `application_status`: `PENDING` \| `UNDER_REVIEW` \| `INTERVIEW_SCHEDULED` \| `REJECTED` \| `HIRED`
- `verification_status`: worker KYC pipeline states

### Views (security invoker)
- `job_posts`, `job_applications`, `saved_jobs`, `worker_profiles`

### Recent migrations (Phase 3–4)
- `20260624130000_security_hardening_phase3.sql` — RLS tightening, RPC lockdown
- `20260624140000_drop_legacy_messaging_tables.sql` — removed `conversations` / `messages` / `participants`
- `20260624150000_security_hotfixes_phase4.sql` — FORCE RLS, subscription write guard, unique email index

---

## 5. Security

### Application layer
- HTTP headers + CSP in `next.config.ts`
- Admin `error.tsx` / `not-found.tsx` (no stack traces to UI)
- Password reset: rate-limited + enumeration-safe messaging
- `get_platform_metrics()` — `service_role` only; admin UI uses `createAdminClient()`

### Database layer
- RLS on every tenant table; employers cannot mutate subscription `status` / `plan_id` (trigger + service-role writes)
- `profiles.email` unique (case-insensitive) when not null
- Webhook idempotency: `audit_logs` rows with `action_type = stripe_payment_processed`

### Supabase advisors (remaining WARN — next sprint)
- Revoke `anon` EXECUTE on trigger/helper SECURITY DEFINER functions
- Set `search_path` on legacy functions (`handle_updated_at`, compat triggers, …)
- Enable [leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) in Auth settings

---

## 6. Subscription & Payment (Stripe)

1. Employer selects plan → `createStripeSubscription` creates PaymentIntent (server).
2. Client confirms payment via Stripe Elements → `reconcilePaymentIntent` verifies status with Stripe API.
3. **Authoritative sync:** `POST /api/webhooks/stripe` on `payment_intent.succeeded` → `syncEmployerSubscription`.
4. Cancellation: `customer.subscription.deleted` webhook sets subscription `canceled`.

**Required env (server-only):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

**Stripe Dashboard webhook events:** `payment_intent.succeeded`, `customer.subscription.deleted`

---

## 7. Whimsical Architecture Board

[ReplaceMe Master Full-Stack Architecture](https://whimsical.com/replaceme-master-full-stack-architecture-FtNA62DRJqmnaHHoZJxTqY)
