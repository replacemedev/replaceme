# QA Test Guide - Employer Job Listing View

This guide is prepared for QA engineers to validate the implementation of the Employer **Job Listing View** (located at `/jobs/[id]`).

---

## 1. UI Layout & Responsiveness Verification

### Step-by-Step Test:
1. Log in to the application as an **Employer** user.
2. Navigate to your employer dashboard (`/dashboard`) and click on an active job posting link.
3. Verify that the URL is structured as `/jobs/[job-uuid-here]`.
4. Verify that the top header displays:
   - The job title (e.g., "Thumbnail Designer") and an uppercase, colored badge status (e.g. `ACTIVE`).
   - The location, job type, and monthly salary metadata row.
   - Action buttons: **Share**, **Edit Job**, and a deactivation button **X**.
5. Verify the left column contains the **Job Description** card (with responsibilities list) and **Requirements & Skills** card (with required skills pill tags).
6. Verify the right sidebar column contains:
   - **Performance** statistics (views, applications with positive trend indicators, and shortlisted candidates).
   - **Compensation** monthly retainer overview.
   - **Hiring Team** assigned manager info and message action button.
7. Scale the browser viewport to tablet and mobile widths:
   - Ensure the layout grid collapses from two columns to a stacked single-column design.
   - Confirm that no text overflows and borders scale properly.

---

## 2. Dynamic Actions & Interactivity Verification

### Share Link Test:
1. Click the **Share** button in the header.
2. Verify that a success toast appears: `"Job post link copied to clipboard!"`.
3. Open a new browser tab, paste the clipboard content, and verify it matches the active job details URL.

### Listing Deactivation Test:
1. Click the red **X** button in the header.
2. Verify that a confirmation modal appears: `"Are you sure you want to deactivate this job listing? It will no longer be visible to candidates."`.
3. Click **Cancel** in the prompt and verify that no changes occur.
4. Click the red **X** button again, and click **OK** in the confirmation dialog.
5. **Verify loading state**:
   - The button should display a loading spinner.
   - A loading toast reading `"Deactivating job post..."` should appear.
6. **Verify success status**:
   - Confirm that a green success toast appears: `"Job post deactivated successfully!"`.
   - Verify that the status badge in the header instantly updates to `Closed` and the red **X** button disappears.

---

## 3. Security Boundary & IDOR Prevention Testing

> [!CAUTION]
> Testing IDOR is critical to ensure employers cannot view or modify listings owned by other employers.

### IDOR Read Check:
1. Identify the UUID of a job listing belonging to **Employer A** (e.g. `job_id_a`).
2. Log out of Employer A's account, and log in to **Employer B's** account.
3. Manually type `/jobs/job_id_a` in the browser URL address bar and press Enter.
4. **Verify Denial**:
   - Confirm that the system blocks access and triggers a Next.js `notFound()` 404 page, preventing Employer B from viewing Employer A's job details.

### IDOR Mutation Check:
1. While logged in as **Employer B**, attempt to trigger a deactivation request targeting `job_id_a` (e.g., executing a console fetch script or mock API call).
2. **Verify Server Rejection**:
   - Confirm that the Server Action returns `{ error: "Failed to deactivate job. Please check ownership and try again." }` or throws a permission error.
   - Check the server console log and verify that the database update query was never executed and no raw metadata leaks occurred.
