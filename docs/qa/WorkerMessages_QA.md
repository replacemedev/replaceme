# QA Verification & Audit: Worker Messages Center

This document verifies the visual layout, structural integrity, database relationship schema, and data flows of the Premium Worker Messages Center (`/worker/messages`).

---

## 1. Relational Database Bridge Integrity

The messaging system is built around the `chat_threads` and `chat_messages` tables. Rather than isolating conversations in a sandbox, they directly join the profiles of the Worker and the Company Profile of the Employer.

### Key Relations & Schema Details:
- **`chat_threads`**:
  - `worker_id` points to `profiles(id)` (Strict foreign key).
  - `company_profile_id` points to `company_profiles(id)` (Strict foreign key).
  - `job_id` points to `jobs(id)` (Optional context foreign key).
- **`chat_messages`**:
  - `thread_id` points to `chat_threads(id)`.
  - `sender_id` points to `profiles(id)`.

By structuring the foreign keys this way, a worker and employer are bridged seamlessly. In Next.js, fetches execute a multi-table JOIN across:
```sql
chat_threads -> company_profiles -> profiles (Employer owner)
             -> jobs (Job post context)
             -> chat_messages (Last message)
```

---

## 2. Component Architecture & Flat DOM Audit

We audited the UI layers to enforce the Ponytail Zero-Spaghetti doctrine, minimizing "div soup" and maintaining clean CSS Flex/Grid styling.

| Component | Target File | DOM Wrap Level | Primary Layout Utilities |
| :--- | :--- | :--- | :--- |
| **Main Page Route** | `src/app/worker/messages/page.tsx` | 0 (Server only) | Next.js dynamic rendering & page redirectors |
| **Messaging Coordinator** | `src/components/worker/messages/MessagingClient.tsx` | 1 | `flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50` |
| **Inbox Sidebar** | `src/components/worker/messages/InboxSidebar.tsx` | 2 | `w-full md:w-80 border-r flex flex-col h-full bg-white` |
| **Thread List Item** | `src/components/worker/messages/InboxThreadItem.tsx` | 1 | `flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer` |
| **Active Conversation** | `src/components/worker/messages/ChatArea.tsx` | 1 | `flex-1 flex flex-col h-full bg-[#f8fafd]/40` |
| **Message Bubble** | `src/components/worker/messages/MessageBubble.tsx` | 1 | `flex flex-col max-w-[85%] sm:max-w-[70%]` |
| **Chat Input Area** | `src/components/worker/messages/ChatInputArea.tsx` | 1 | `shrink-0 p-4 border-t bg-white flex flex-col gap-2` |

### Spacing & Overflow Handling:
- The screen viewport is fixed height (`h-[calc(100vh-64px)]`).
- The Sidebar listing and Message History area are configured with `overflow-y-auto min-h-0` to scroll independently while headers and input bars remain sticky.

---

## 3. Zero-Seeding & No-Mock-Data Compliance

- **No Hardcoded Arrays**: The page fetches data from Supabase.
- **Empty States**: If `threads` contains 0 items, a beautiful `<EmptyState />` is rendered. If a thread has no messages, a call-to-action placeholder is shown.
- **No SQL Seeding Functions**: We have avoided using mock/fake PL/pgSQL injection procedures.

---

## 4. Manual Verification & User Testing Guide

To test the messaging center features end-to-end, follow these steps:

### Test Case 1: Active Thread URL Hydration
1. Log in as a worker and navigate to `/worker/messages`.
2. Select any thread on the left inbox sidebar.
3. Verify that the URL parameter updates dynamically to `?threadId=[UUID]` and the active thread is highlighted with a green left border.

### Test Case 2: Sending Messages & Optimistic Rendering
1. Inside the active chat area, type a message in the input box.
2. Press `Enter` or click the green **Send** icon.
3. Verify that the message instantly appends to the conversation list (optimistic UI) and persists inside the database under the `chat_messages` table with your `sender_id`.

### Test Case 3: Thread Pinning
1. Select a thread.
2. Click the **Pin** icon (pushpin) in the top-right header action bar.
3. Verify that the thread is marked as pinned (`is_pinned = true`), updates its location on the sidebar, and can be filtered using the "Pinned" tab toggle.
