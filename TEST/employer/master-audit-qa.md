# Master QA Audit Guide - Employer Portal Features

This document provides a unified, comprehensive testing framework for validating all features in the **Employer Portal** of the application. It outlines precise verification workflows to check responsiveness, database RLS boundary validations, server-side math calculations, and anonymization algorithms.

---

## 1. Scope of Audit Testing
1. **Company Profile & Settings** (`/settings/company`)
2. **Jobs Posted & View Details** (`/jobs` and `/jobs/[id]`)
3. **Applicants Pipeline & Masking** (`/jobs/[jobId]/applicants`)
4. **Hired Workers & Aggregations** (`/hired`)
5. **Pinned Workers & Optimistic Toggles** (`/pinned`)
6. **Messaging Center & Thread Gating** (`/messages`)
7. **Pricing, Subscriptions & Stripe Flows** (`/pricing` and `/checkout/[planId]`)

---

## 2. Row Level Security (RLS) & IDOR Protection Verification (Crucial)

> [!CAUTION]
> Testing RLS boundaries ensures employer data cannot be accessed or modified by other accounts (zero-trust).

### IDOR Bypass Testing - Job Post View:
1. Log in to the portal as **Employer A**.
2. Navigate to your dashboard, select an active job post, and copy its UUID from the address bar (e.g. `job_id_a`).
3. Log out, and log back in as **Employer B**.
4. Type `/jobs/job_id_a` directly into the browser URL address bar and press Enter.
5. **Verify Access Blocking**:
   - The route must render a Next.js `notFound()` 404 page.
   - Confirm that Employer B cannot view any job description, skills requirements, or performance metrics belonging to Employer A.

### IDOR Bypass Testing - Applicants & Masking:
1. Attempt to navigate directly to `/jobs/job_id_a/applicants` while logged in as **Employer B**.
2. **Verify Access Blocking**:
   - Confirm the page displays a blank or redirect state, or denies authorization securely without exposing candidate details.

### IDOR Bypass Testing - Messaging Center:
1. Identify the UUID of a conversation thread belonging to **Employer A** (e.g. `conv_id_a`).
2. Log in as **Employer B** and attempt to fetch or read messages belonging to `conv_id_a` by typing `/messages?id=conv_id_a` or executing a backend script calling the `getConversations` or `getMessages` Server Actions.
3. **Verify Denial**:
   - Verify that the Server Action returns `null` or throws a permission error.
   - Verify that the SQL function `public.is_conversation_member` rejects the user, ensuring the RLS policy on the `participants` and `messages` tables completely blocks access.

---

## 3. Dynamic Aggregations & Math Calculations Testing

### Hired Workers Payroll & Tenure Calculations:
1. Seed the database with 3 active contracts under **Employer A**:
   - **Sarah Jenkins**: Hourly Rate = `$45`, Weekly Hours = `40`, Start Date = `2023-09-01`.
   - **Marcus Chen**: Hourly Rate = `$55`, Weekly Hours = `40`, Start Date = `2024-01-01`.
   - **Elena Rodriguez**: Hourly Rate = `$60`, Weekly Hours = `25`, Start Date = `2023-11-01`.
2. **Calculate Expected Aggregations** (assuming current date is June 22, 2026):
   - **Total Active Workers**: `3`
   - **Monthly Payroll**:
     - Contract 1: `45 * 40 * 4.3333` = $7,800
     - Contract 2: `55 * 40 * 4.3333` = $9,533
     - Contract 3: `60 * 25 * 4.3333` = $6,500
     - Expected total: `7800 + 9533 + 6500` = **$23,833**
   - **Average Tenure**:
     - Contract 1: 33 months
     - Contract 2: 29 months
     - Contract 3: 31 months
     - Expected average: `(33 + 29 + 31) / 3` = **31 months**
3. Navigate to `/hired`.
4. **Verify UI Cards**:
   - `TOTAL ACTIVE` displays `"3 Workers"`.
   - `MONTHLY PAYROLL` displays `"$23,833"`.
   - `AVERAGE TENURE` displays `"31 Months"`.
5. Update one contract status to `"paused"` in the database. Refresh the page and verify the paused contract's parameters are excluded from all three metric cards.

---

## 4. Candidate PII Masking & Unlocks Verification

### Locked Candidate Profile Anonymization:
1. Log in as **Employer A** on the Discovery (Free) plan.
2. Navigate to a job's applicant pipeline `/jobs/[jobId]/applicants`.
3. Locate a candidate whose profile is **locked** (no credits consumed, not unlocked).
4. **Verify PII Redaction**:
   - Name must display as `"Applicant #XXX"` (e.g. `Applicant #105`).
   - The email, resume link, bio details, and contact buttons must be replaced with a locked visual overlay and a green lightning bolt **"Unlock Profile"** CTA.
5. Click **"Unlock Profile"** and confirm:
   - A dialog asks to spend 1 credit.
   - Accept the prompt, and verify that the page refreshes, the candidate's real name, avatar, bio, and resume become fully visible, and the credits balance decrements by 1.

---

## 5. Stripe Checkout & Upgrade Flows Verification

### Plan Upgrades & Intent Creation:
1. Log in as **Employer A** (on the Discovery plan) and navigate to `/pricing`.
2. Select the **Professional** tier ($99/mo) and click upgrade.
3. Verify that you are redirected to the dedicated checkout screen `/checkout/professional`.
4. Verify that the **Order Summary** side panel displays `"Professional Plan"` and `"$99.00/mo"`.
5. Enter a Stripe test credit card (e.g. `4242 4242 4242 4242`) and complete the payment form.
6. Verify:
   - The payment intent is created successfully on the server side via the `createStripeCheckoutIntent` Server Action.
   - Upon successful payment simulation, you are redirected back to `/settings/account`.
   - The account settings dashboard now displays `"Professional Plan"` with `"Active"` status.

---

## 6. Optimistic UI Interactions Verification

### Bookmarking & Unpinning:
1. Navigate to `/pinned` as an Employer.
2. Locate a worker card and click the bookmark icon button in the top right.
3. **Verify Instant Feedback**:
   - The card must immediately fade out and disappear from the page.
   - The count badge in the page header must immediately decrement.
4. Disable network connectivity or block Supabase API requests, and click the unpin toggle on another worker card.
5. **Verify Reversion State**:
   - The card disappears optimistically, but when the server action fails, it is automatically restored to the grid, the count is corrected, and an error toast is displayed.
