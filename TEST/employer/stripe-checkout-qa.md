# Stripe Checkout & Applicant Pipeline QA Test Guide

This guide details the validation checklist for testing the Employer Pricing page, the dedicated Stripe Checkout flow, and the credit-based candidate profile unlocking.

---

## 1. Zero Mock Data & Dynamic Plan Verification

Ensure no static fallback values are hardcoded in actions or components.

### Test Steps
1. Open the Supabase Database or run an SQL client.
2. Verify that the tables `public.faqs` and `public.testimonials` are present.
3. Ensure no records exist in both tables initially.
4. Navigate to `/pricing`.
   - **Expected Behavior:** The FAQ list and Testimonials block are hidden or render empty lists `[]` gracefully with no runtime crashes.
5. Seed test records into the tables:
   ```sql
   INSERT INTO public.faqs (question, answer, display_order)
   VALUES ('How do credits work?', 'Each profile unlock deducts 1 credit from your balance.', 1);

   INSERT INTO public.testimonials (quote, author_name, author_title, author_company, display_order)
   VALUES ('Upgrading to Professional completely transformed our hiring pipeline.', 'Sarah Jenkins', 'VP of Talent', 'TechFlow', 1);
   ```
6. Refresh `/pricing`.
   - **Expected Behavior:** The seeded FAQ and testimonial block render matching the design mockup layout.

---

## 2. Dedicated Stripe Checkout Page (`/checkout/[planId]`)

Verify the split layout and Stripe payment intent.

### Test Steps
1. Navigate to `/pricing` and click **Scale Your Team** under the **Professional Plan** ($149.00).
   - **Expected Behavior:** You are redirected to `/checkout/professional`.
2. Inspect the **Left Column (Order Summary)**:
   - Verify the "< Back to pricing" link redirects back to `/pricing`.
   - Brand name ("Replace Me") logo is displayed.
   - Plan details show "SUBSCRIBE TO Professional Plan" and price "$149.00 per month".
   - Key benefits list matches Professional features.
   - Dynamic testimonial block matches database record.
3. Inspect the **Right Column (Payment Details)**:
   - Check input fields: Email Address, Name on Card, Country or Region.
   - Check the embedded Stripe `CardElement` input.

---

## 3. Stripe Payment Validation & Test Cards

Test form validation, processing transitions, and payment outcomes.

### Stripe Test Card Credentials
Use the following Stripe test card credentials (any future date, CVC `123`, ZIP `90210`):

| Card Brand | Card Number | Verification Outcome |
| :--- | :--- | :--- |
| **Visa (Standard)** | `4242 4242 4242 4242` | Successful payment |
| **Visa (3D Secure)** | `4000 0027 6000 3184` | Triggers 3DS popup window |
| **Declined (Ins. Funds)** | `4000 0000 0000 0010` | Payment declines with message |
| **Incorrect CVC** | `4000 0000 0000 0015` | Card check failure error |

### Test Scenarios
1. **Validation Failures:**
   - Submit empty fields (e.g., blank Email or blank Name). Verify standard browser validations prevent submission.
2. **Declined Transaction:**
   - Use card `4000 0000 0000 0010`. Click pay.
   - **Expected Behavior:** Loader turns on, transaction fails, error card is rendered inline at the bottom of the form displaying decline details.
3. **Successful Card Transaction:**
   - Use card `4242 4242 4242 4242`. Click pay.
   - **Expected Behavior:** Loader triggers, payment succeeds, success toast is raised, and you are redirected to `/pricing` with updated subscription metrics.
4. **3D Secure Validation:**
   - Use card `4000 0027 6000 3184`. Click pay.
   - **Expected Behavior:** An iframe overlay prompts authentication. Click **Authorize Test Payment** to succeed or **Fail Test Payment** to decline.

---

## 4. Zero-Trust Security & Candidate PII Scrubbing

Verify that locked candidates do NOT leak PII to the client-side.

### Test Steps
1. Navigate to `/jobs/[jobId]/applicants` as an employer.
2. Identify a candidate card that is **Locked** (has an "Unlock Profile" button).
3. Open browser Developer Tools (`F12` or `Cmd+Option+I`) and navigate to the **Network** tab.
4. Filter by Fetch/XHR or Server Actions.
5. Click refresh or inspect the client component state tree.
6. Look at the `applicants` payload payload returned by the server.
   - **Expected Behavior:** 
     - Candidate name is masked as `Applicant #[Number]` (using the first 3 characters of their ID).
     - Candidate email is `null`.
     - Candidate resumeUrl is `null`.
     - Candidate bio is `null`.
     - Candidate avatarUrl is `null` or blurred.
     - **CRITICAL:** No sensitive PII attributes (real first name, email, biography) exist in the client payload.

---

## 5. Credit-Based Pipeline Unlocking

### Test Steps
1. Click **Unlock Profile** on a locked card.
2. **If credit balance > 0:**
   - Confirmation modal prompts: *"Are you sure you want to unlock Applicant #[Number]? This will deduct 1 credit from your balance."*
   - Click cancel. Verify no credits are deducted and the card remains locked.
   - Click confirm. Verify toast success triggers, credit count decrements by 1, and the card transitions to an unmasked unblurred state showing candidate name and details.
3. **If credit balance = 0:**
   - Modal prompts: *"You have run out of profile unlock credits. Please upgrade your subscription plan..."*
   - Click **Upgrade Plan**. Verify it redirects to `/pricing`.
