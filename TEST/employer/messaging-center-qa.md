# QA Test Guide - Employer Messaging Center

This guide is prepared for QA engineers to validate the implementation of the Employer **Messaging Center** (located at `/messages`).

---

## 1. UI Layout & Responsiveness Verification

### Step-by-Step Test:
1. Log in to the application as an **Employer** user.
2. Verify that the global header shows the **Messages** link, and it contains an unread message count badge (e.g. `1`) instead of just a generic dot.
3. Click **Messages** in the header or navigate directly to `/messages`.
4. Verify that the breadcrumbs read `Messaging › Inbox`.
5. Verify that the page header shows the title `Messaging Center` and the subtitle `Manage conversations with candidates and coordinate hiring schedules.`.
6. Verify layout responsiveness by scaling the browser viewport:
   - **Desktop View (>= 768px)**:
     - Left column should contain the search box, the **Role Filter Dropdown**, filter tabs (All/Unread/Pinned), and the conversation threads list (scrollable, `320px` wide).
     - Right column should contain either the chat window (if a candidate is selected) or the empty state view ("No Conversation Selected").
   - **Mobile View (< 768px)**:
     - If no conversation is selected (URL has no `id` param), verify that only the thread sidebar is visible, taking up the full width.
     - If a conversation is selected (URL has `id` param, e.g., `/messages?id=alex-mercer-id`), verify that only the chat window is visible, taking up the full width.
     - Verify that a **Back** icon button (ChevronLeft) is visible in the chat header. Clicking it should route back to `/messages`, hiding the chat window and showing the thread list.

---

## 2. Search & Filter Operations

### Step-by-Step Test:
1. Locate the search box in the sidebar:
   - Type `Alex` and verify that only "Alex Mercer" is displayed.
   - Type `React` and verify that matching threads (e.g. Senior React Developer role) are filtered dynamically.
   - Type a random string (e.g., `xyz`) and verify that it shows the empty state: `No messages match search`.
2. Locate the **Role Filter Dropdown** right below the search bar:
   - Click the dropdown and select `Senior React Developer`. Verify that only conversations with developers of that role are displayed.
   - Click the dropdown and select `All Roles`. Verify that the list reverts to showing all conversations.
3. Locate the tab filters:
   - Click the **Unread** tab. Verify that only threads with unread indicators (e.g., Sarah Jenkins) are shown.
   - Click the **Pinned** tab. Verify that only pinned threads are shown.
   - Click the **All** tab. Verify that all conversations are listed.

---

## 3. Chat Messaging & Optimistic Updates

### Step-by-Step Test:
1. Select the thread for **Alex Mercer**.
2. Verify that the chat window header includes action icons in the top right: Mail/Envelope, Pin, Calendar/Schedule, Search, Grid/Layout, and More/Vertical dots.
3. Locate the chat text area at the bottom:
   - Verify that the attachment icon (paperclip), text area, emoji icon (smile), and green send button are all positioned *inside* the rounded border container.
   - Verify that below the input container, the footer displays `"End-to-end encrypted"` on the left (with a lock icon) and `"Press Enter to send"` on the right.
   - Type a test message.
   - Press **Enter** (without Shift) and verify that the form submits the message.
   - Press **Shift + Enter** and verify that it starts a new line in the text area instead of submitting.
4. **Verify Optimistic Updates**:
   - Upon clicking **Send** or pressing Enter, verify that the message bubble appears in the chat scroll container *immediately* (before the server action completes).
   - The message bubble should have a green background (sent by current user) and display a grey checkmark indicator.
   - Once the server action returns successfully, verify that the receipt indicator updates to a read/delivered double checkmark `✓✓` dynamically.
5. **Verify Scroll Container**:
   - Send multiple messages to fill up the screen, and confirm that the chat window automatically scrolls to the bottom so the latest message remains in view.
6. **Verify Quick Replies**:
   - Click one of the quick replies above the input tray (e.g. *"I'll review this"*).
   - Verify that the message is sent immediately and renders at the bottom of the message log.

---

## 4. Subscription Tier Upsell Warning

### Step-by-Step Test:
1. Log in as an employer with the **Essential** or **Discovery** subscription tier.
2. Open a chat thread (e.g. *Alex Mercer*).
3. Verify that a green notice banner appears below the header reading: `"Professional Tier: Unlock priority support and unlimited direct messaging for your team."`.
4. Click the **Upgrade Now** link inside this banner.
5. Verify that it routes you directly to `/settings/account` so you can manage your billing plan.
6. Verify that on the **Professional** tier, this warning banner is hidden.

---

## 5. Security & IDOR Verification

### Step-by-Step Test:
1. Log out as an Employer.
2. Log in as a **Worker** role user.
3. Manually navigate to `/messages` in the browser URL bar.
4. **Verify Unauthorized Redirection**:
   - Confirm that the server component blocks access and redirects you to `/dashboard` immediately.
5. **IDOR Thread Access Protection**:
   - Log in as Employer A.
   - Manually type a URL pointing to a private conversation thread ID that belongs to Employer B (e.g. `/messages?id=<some-unrelated-uuid>`).
   - Verify that the Server Action `getMessages` and `sendMessage` validate the participant profile ID against the session.
   - Confirm that instead of exposing messages, the right pane shows either an empty state, or direct Server Action calls return an access denied error.
