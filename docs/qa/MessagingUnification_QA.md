# Messaging Unification QA

## Scope

Unified `/worker/messages` and `/employer/messages` on shared components under `src/components/shared/messaging/` and a single data layer in `src/actions/messaging.ts` backed by `chat_threads` + `chat_messages` + `jobs` (via `job_posts` view).

## Component sharing audit

| Component | Path | Used by |
|-----------|------|---------|
| `MessagingClient` | `shared/messaging/MessagingClient.tsx` | Worker + Employer pages |
| `InboxSidebar` | `shared/messaging/InboxSidebar.tsx` | Via MessagingClient |
| `InboxThreadItem` | `shared/messaging/InboxThreadItem.tsx` | Via InboxSidebar |
| `ChatArea` | `shared/messaging/ChatArea.tsx` | Via MessagingClient |
| `MessageBubble` | `shared/messaging/MessageBubble.tsx` | Via ChatArea |
| `ChatInputArea` | `shared/messaging/ChatInputArea.tsx` | Via ChatArea |
| `MessagingEmptyState` | `shared/messaging/MessagingEmptyState.tsx` | Via ChatArea |

**Pass:** No duplicate JSX in worker/employer route folders. Role differences are data-only (`oppositeParty` name/avatar). Orphaned `src/components/worker/messages/` and `src/components/employer/messages/` removed.

## Database relationship integrity

| Table / View | FK / Role | Verified |
|--------------|-----------|----------|
| `chat_threads.worker_id` | → `profiles.id` | Migration `20260623000300` |
| `chat_threads.company_profile_id` | → `company_profiles.id` | Migration `20260623000300` |
| `chat_threads.job_id` | → `jobs.id` (nullable) | Migration `20260623000300` |
| `job_posts` | View over `jobs` | Migration `20260623000000` |
| `chat_messages.thread_id` | → `chat_threads.id` | Migration `20260623000300` |
| `chat_messages.sender_id` | → `profiles.id` | Migration `20260623000300` |

**Worker query:** `chat_threads` + `company_profiles` + `jobs` where `worker_id = auth user`.

**Employer query:** `chat_threads` + `profiles!worker_id` + `jobs` where `company_profile_id` matches employer's company.

**Job Role filter hydration:** `getMessagingJobRoles(role)` derives unique `{ id, title }` pairs from active threads via `extractJobRolesFromThreads()` — no hardcoded roles, no seed data.

RLS enabled on both tables. Empty inbox is valid.

## Zero mock data policy

- [x] `page.tsx` routes are async Server Components fetching from Supabase
- [x] No hardcoded thread arrays or fake job role options
- [x] No PL/pgSQL seed functions
- [x] Empty sidebar shows "No conversations found"
- [x] Empty chat area shows `MessagingEmptyState` card
- [x] Job Role dropdown only lists roles from real `chat_threads.job_id` → `jobs.title` joins

## Layout & overflow

- [x] Split pane: `w-[320px]` sidebar + fluid `ChatArea`
- [x] Full height: `h-[calc(100vh-64px)]` (header offset)
- [x] Sidebar list: `flex-1 overflow-y-auto`
- [x] Message history: independent scroll in `ChatArea`

## Visual UI consistency (design reference)

- [x] Search bar with magnifying glass icon
- [x] Job Role `<select>` filter below search ("All Roles" + dynamic options)
- [x] Segmented control: All / Unread / Pinned
- [x] Thread item: green initials avatar, party name, time, snippet, violet job pill
- [x] Active thread: light green background + solid green left border
- [x] Chat header: context title, party name, green Online badge, pin/tag/archive/more icons
- [x] Date separators: "TODAY, 10:42 AM" style per calendar day
- [x] Message bubbles: white card, gray border, structured template blocks
- [x] Timestamp below bubble beside avatar
- [x] Input footer: paperclip, emoji, green send, lock + "End-to-end encrypted", "Press Enter to send"

## DOM flatness (ponytail)

- [x] Single flex row for split pane (no nested wrapper div soup)
- [x] `ChatArea` uses semantic `<section>` + `<header>`
- [x] No role-specific layout wrappers in page routes

## Manual test checklist

1. Log in as worker → `/worker/messages` → empty states render
2. Log in as employer → `/employer/messages` → identical layout and empty states
3. Create a thread in Supabase (via application flow) → appears on both sides with correct `oppositeParty`
4. Job Role dropdown populates only roles tied to active threads
5. Filter by job role → sidebar filters correctly; empty filter shows "No conversations found"
6. Select thread → URL updates `?threadId=`
7. Send message → persists, no mock rollback
8. Unread badge clears after opening thread
9. Pin toggle updates `chat_threads.is_pinned`

## Known follow-ups

- Legacy `conversations` / `participants` / `messages` tables still exist but are unused by unified UI
- Tag and Archive header actions are UI placeholders (no backend yet)
