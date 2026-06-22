# QA Test Guide - Employer Applicants Management View

This guide is prepared for QA engineers to validate the implementation of the Employer **Applicants Management View** (located at `/jobs/[jobId]/applicants`).

---

## 1. UI Layout & Responsiveness Verification

### Step-by-Step Test:
1. Log in to the application as an **Employer** user.
2. Navigate to one of your active job listings and click **View Applicants** (or navigate manually to `/jobs/senior-react-dev-id/applicants`).
3. Verify that the breadcrumbs read `Job Posts › Senior React Developer` (or the relevant job title).
4. Verify that the page title is `Applicants` and the subtitle is `Manage your shortlist and review top candidates.`.
5. Verify that the right-side tier badge renders: `"Professional Tier NEW" - "Unlock priority support and unlimited direct messaging."`
6. Verify that the credit balance displays: `"Available Profile Unlock Balance: X Credits Remaining"` (the balance should dynamically load from `employer_credits`).
7. Check visual consistency on desktop:
   - The candidates should be displayed in a multi-column grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
   - The status dropdown, match badge, skills list, and action buttons must align perfectly.
8. Verify layout responsiveness by scaling the viewport down to mobile and tablet widths:
   - Ensure the grid stacks into a single-column layout on smaller screens.
   - Verify card elements (skills pills, buttons, text fields) wrap appropriately without clipping or overflow.

---

## 2. Unlocked vs Locked Candidate States

### Step-by-Step Test:
1. Locate the candidate card for **Alex Mercer** (an unlocked profile):
   - Confirm the full name is displayed.
   - Confirm key action buttons are visible: a solid green button **View Profile** (with an eye icon) and a secondary messaging icon button.
   - Verify the match badge reads: `98% MATCH` (high match style).
2. Locate the candidate card for **Samira** (a locked profile):
   - Confirm details are blurred/masked in the background.
   - Verify a lock icon is centered on the card with the text `Unlock Detailed Profile`.
   - Verify the description says: `"Get access to Samira's full resume, portfolio links, and direct contact details."`
   - Verify the main CTA button says: `Unlock with Essential` (with a lightning bolt icon).
   - Verify the footer notice reads: `1 credit will be deducted from your monthly balance.`

---

## 3. Workflow Status Updates

### Step-by-Step Test:
1. Open the status dropdown pill for **Alex Mercer** (currently `Interviewing`).
2. Verify that the available option items appear: `Applied`, `Interviewing`, `Shortlisted`, `Rejected`, `Hired`.
3. Select `Shortlisted`.
4. **Verify Transitions**:
   - The status text should update to `Shortlisted`.
   - A loading spinner icon should briefly appear in place of the text.
   - Once completed, the badge styles should dynamically update (e.g. green background/text for Shortlisted, amber for Interviewing, red for Rejected).
   - A success toast confirming `"Applicant status updated successfully."` should appear.
5. Select the dropdown again and change the status to `Rejected`.
6. Verify that:
   - The card footer CTA buttons update to the rejected layout.
   - The primary button becomes a light-gray outline button `View History`.
   - The secondary button becomes a red/gray outline trash can icon button.

---

## 4. Transactional Profile Unlocks (Credit Deductions)

### Step-by-Step Test:
1. Locate the **Samira** locked candidate card.
2. Note your current remaining credit balance shown in the alert banner (e.g., `5 Credits Remaining`).
3. Click the **Unlock with Essential** button.
4. **Verify Loading State**:
   - The button should display a loading spinner.
   - The button should become disabled to prevent double clicks/submissions.
   - A loading toast saying `"Unlocking detailed profile..."` should appear.
5. **Verify Success State**:
   - A success toast saying `"Profile unlocked successfully!"` should appear.
   - The card background blur should clear, revealing the full profile.
   - The lock overlay should disappear.
   - Verify that your credit balance display decrements by exactly **1 credit** (e.g., updates to `4 Credits Remaining`).

---

## 5. Security & IDOR Penetration Testing (Zero-Trust)

### Step-by-Step Test:
1. **Accessing Unowned Candidate Lists**:
   - Log in as **Employer A**.
   - Attempt to navigate to the applicants URL of a job owned by **Employer B** (e.g. `/jobs/<employer-b-job-uuid>/applicants`).
   - Confirm that the Server Component page blocks access and redirects you to `/jobs` or `/dashboard`.
2. **Accessing Unowned Applicant Details via Server Actions**:
   - Open the browser developer console or a tool to dispatch payloads.
   - Attempt to trigger `getApplicants("<employer-b-job-uuid>")`.
   - Verify that the Server Action returns an error object: `Access denied. You do not own this job posting.`
3. **Triggering Status Mutations for Unowned Applicants**:
   - Attempt to execute `updateApplicantStatus("<unowned-application-uuid>", "Shortlisted")`.
   - Verify that the action catches the IDOR attempt and returns: `Access denied. You do not own the job associated with this applicant.`
4. **Triggering Profile Unlocks for Unowned Candidates**:
   - Attempt to execute `unlockCandidate("<unowned-application-uuid>")`.
   - Verify that the action catches the IDOR attempt, blocks credit balance deductions, and returns: `Access denied. You do not own the job associated with this applicant.`
