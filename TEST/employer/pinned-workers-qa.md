# QA Test Guide - Employer Pinned Workers

This guide is prepared for QA engineers to validate the implementation of the Employer **Pinned Workers** management page (located at `/pinned`).

---

## 1. UI Layout & Responsiveness Verification

### Step-by-Step Test:
1. Log in to the application as an **Employer** user.
2. Verify that the global header contains the **Pinned** link next to **Pricing**.
3. Click the **Pinned** link and verify you are navigated to `/pinned`.
4. Verify that the page header displays:
   - The title `"Pinned Workers"`.
   - A colored count badge representing the total number of pinned workers (e.g. `0` or `3`).
   - A subtitle: `"Review and organize top candidates bookmarked during your talent search."`
5. Verify the presentational grid layout:
   - Resizes correctly from 1 column on mobile, 2 columns on tablet, to 4 columns on desktop viewports.
   - Fits nicely within the page containers with proper padding.
6. Verify the **Worker Card** components display:
   - Candidate's avatar (or initials in a green round card fallback if no avatar exists).
   - A colored online status indicator dot (green for online, grey for offline).
   - Candidate's full name and professional role.
   - Stats section showing hourly rate (e.g. `$45.00/hr`) and years of experience (e.g. `5 yrs`).
   - Up to 3 skills pills (with a count tag like `+2 more` if they have more than 3).
   - A bookmark/pin toggle button in the top right.
   - An active `"View Profile"` button and a chat icon button.

---

## 2. Dynamic Actions & Optimistic UI Verification

### Optimistic Un-pinning Test:
1. Locate a worker card in the pinned workers grid.
2. Click the bookmark icon button in the top right of the card.
3. **Verify Optimistic Removal**:
   - The card must instantly disappear from the grid without waiting for the server response.
   - The count badge in the page header must immediately decrement.
4. **Verify Backend Update & Toast**:
   - A green success toast reading `"Worker unpinned successfully."` should appear.
   - Refresh the page and confirm that the card remains removed from the list.

### Un-pin Failure & Revert Test:
1. Emulate a network disconnect or force the Server Action `togglePin` to fail (e.g. temporarily disconnect internet or block requests to `/pinned`).
2. Click the bookmark icon button on a worker card.
3. **Verify Reversion**:
   - The card disappears from the grid immediately.
   - The server response returns an error.
   - An error toast reading `"Failed to unpin worker."` (or appropriate error message) appears.
   - The card is automatically restored to the grid, and the header count badge is restored to its original value.

### Search Filtering Test:
1. Input a candidate name (e.g. `"Marcus"`) into the search bar.
2. Verify the grid instantly filters to show only cards matching the name.
3. Input a skill tag (e.g. `"React"`) into the search bar.
4. Verify the grid filters to display cards containing that skill.
5. Input a random string that doesn't match any candidates.
6. Verify that a beautiful empty state appears:
   - Shows a bookmark icon.
   - Displays the message `"No pinned workers found"`.
   - Explains that no results match the search terms.

---

## 3. Subscription Gating & Upgrade Banner Verification

### Upgrade Banner Visibility:
1. Log in with an employer account on the **Discovery** (Free) or **Essential** plan.
2. Navigate to `/pinned`.
3. Verify that the **Upgrade to Professional Plan** banner is displayed below the page header.
4. Click the `"Upgrade Now"` button in the banner.
5. Verify it redirects you to the pricing page `/pricing`.
6. Log in with an employer account on the **Professional** plan.
7. Navigate to `/pinned`.
8. Verify that the upgrade banner is **NOT** displayed.

---

## 4. Security & Role-Based Access Control (RBAC)

> [!CAUTION]
> Testing security boundaries ensures worker profiles and bookmarks remain private and secure.

### Direct Access Check:
1. Log out of the employer account.
2. Attempt to navigate directly to `/pinned`.
3. Verify that the middleware blocks access and redirects you to the login page `/login`.
4. Log in as a **Worker** user.
5. Attempt to navigate to `/pinned`.
6. Verify that the middleware or router blocks access, redirecting you to `/dashboard` (or appropriate worker landing page).

### IDOR Action Mutation Check:
1. While logged in as **Employer B**, attempt to run a console script calling `togglePin` for a candidate profile.
2. Verify that the server action rejects the mutation with an authentication/role error, or ensures the bookmarking row is only written using the caller's verified `employer_id` (derived securely via `auth.uid()` on the server).
