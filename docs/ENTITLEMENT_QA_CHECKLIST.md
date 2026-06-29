# Employer Entitlement QA Checklist (4 Tiers)

Manual verification guide for **Discovery**, **Starter**, **Growth**, and **Scale** employer accounts. Use one dedicated test employer per tier (Stripe test mode or admin plan override).

## Tier reference

| Tier | Price | Active jobs | Applicants / job | Identity | Approval | Messaging | Priority listing |
|------|-------|-------------|------------------|----------|----------|-----------|------------------|
| Discovery | $0 | 1 | 10 visible | Anonymous preview | ~2 business days | Off | Off |
| Starter | $19 | 3 | 20 visible | Full | Instant | On | Off |
| Growth | $39 | 10 | 50 visible | Full | Instant | On | On (per job `priority_score`) |
| Scale | $79 | Unlimited | Unlimited | Full | Instant | On | On |

---

## Setup (all tiers)

- [ ] Sign in as employer on the target tier; confirm plan on **Account & Billing** (`/employer/settings/account`).
- [ ] **Plan usage strip** shows correct job slots and applicant cap on dashboard and jobs list.
- [ ] Resize browser: **mobile (375px)**, **tablet (768px)**, **desktop (1280px+)** — header, breadcrumbs, dropdowns, and banners do not overflow or clip.

---

## Discovery ($0)

### Job limits & gated UI
- [ ] **Post a New Job** in header works when 0 active jobs.
- [ ] After 1 active job, **Post a New Job** opens upgrade modal (not raw navigation to create).
- [ ] Empty states on **Dashboard**, **Jobs**, **Hired** use gated CTA (modal at limit).
- [ ] **Pricing** → selecting Discovery at job limit shows job-limit modal instead of create page.
- [ ] Direct URL `/employer/jobs/create` at limit is blocked server-side (redirect or error).

### Approval queue
- [ ] New job status is **Pending Review** (not Active immediately).
- [ ] Job detail shows amber **Awaiting manual review** banner with upgrade CTA.
- [ ] Layout readable on mobile (banner stacks; CTA full-width).

### Applicant cap (10)
- [ ] Apply with 11+ workers to one job; employer sees only 10 in pipeline.
- [ ] **Hidden applicants banner** appears on applicants page and performance card when hidden > 0.
- [ ] Cap progress bar uses **visible** count only; hidden count shown in amber text.
- [ ] Upgrade CTA in banner links to pricing/checkout.

### Identity & messaging
- [ ] Applicant names/avatars masked in **Messages** thread list (anonymous preview).
- [ ] Candidate profile shows unlock/masked state (no full PII without upgrade).
- [ ] Advancing to **Under review / Interview / Hired** blocked or gated with upgrade messaging.
- [ ] **Schedule interview** and **Send offer** blocked server-side on Discovery.

### Priority
- [ ] Job cards do **not** show Priority badge.
- [ ] Worker job search: job does **not** show Priority badge; sorts by date among non-priority jobs.

---

## Starter ($19)

### Job limits
- [ ] Can post up to **3** active jobs; 4th attempt shows upgrade modal everywhere (header, empty states, company profile preview, pricing Discovery path if applicable).
- [ ] Gated CTAs are responsive (modal centered, close button reachable on mobile).

### Approval
- [ ] New jobs go **Active** immediately (no pending queue).

### Applicant cap (20)
- [ ] 21st applicant hidden; banner and metrics match Discovery behavior at cap.
- [ ] Kanban **Application status dropdown** opens fully (not clipped) on mobile and desktop.

### Identity & messaging
- [ ] Full candidate names and avatars in messages and applicant views.
- [ ] Messaging enabled; can open threads from applicants.
- [ ] Can advance applications through pipeline stages.

### Priority
- [ ] No Priority badge on employer job cards (plan does not set `priority_score` on new jobs).

---

## Growth ($39)

### Job limits
- [ ] Up to **10** active jobs; 11th blocked with upgrade modal.

### Applicant cap (50)
- [ ] Hidden applicant UX at 51+ applications (banner, performance metrics).

### Priority listing
- [ ] New job receives `priority_score > 0` (check job detail header: **Priority listing** badge).
- [ ] **Performance** card shows **Boosted in search** chip.
- [ ] Employer **Job cards** show Priority badge only on boosted jobs (not all jobs on plan).
- [ ] Worker **Job search** (`/worker/job-search`): boosted jobs show **Priority** badge.
- [ ] Sort **Most relevant** lists priority jobs above others; tie-break by newest.

### Messaging & profiles
- [ ] Full identity and messaging same as Starter.

---

## Scale ($79)

### Unlimited jobs & applicants
- [ ] No job-limit modal on Post Job CTAs (unlimited slots).
- [ ] No applicant cap bar or hidden-applicant banner (unlimited per job).
- [ ] Plan usage strip shows unlimited wording where applicable.

### Priority & support
- [ ] Priority badges on jobs with `priority_score > 0`.
- [ ] Worker search boost behaves like Growth.
- [ ] **Hired** page does not show generic priority-support upgrade banner (Scale perk).

### Account
- [ ] Billing/account shows Scale plan; upgrade paths point to account management for same/lower tiers.

---

## Cross-tier regression (any employer)

### Layout & UX
- [ ] **Employer dropdown** avatar: user photo → company logo → initials fallback chain.
- [ ] **Account settings**: personal profile separate from company profile; password reset sends email.
- [ ] **Notifications** page loads without error; empty state when none.
- [ ] **Job card** header: status, date, and priority badges wrap cleanly on narrow screens.
- [ ] **Breadcrumb** removed where intended; navigation still clear.

### Security (spot check)
- [ ] Discovery employer cannot call advance-application / interview / offer actions via devtools (server rejects).
- [ ] Messaging API does not leak worker real name on Discovery threads.

### Build
- [ ] `npm run build` passes with no TypeScript errors.

---

## Sign-off

| Tier | Tester | Date | Pass / Fail | Notes |
|------|--------|------|-------------|-------|
| Discovery | | | | |
| Starter | | | | |
| Growth | | | | |
| Scale | | | | |
