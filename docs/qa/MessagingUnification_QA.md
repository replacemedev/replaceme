# Messaging Unification QA

## Scope

Unified `/worker/messages` and `/employer/messages` on shared components under `src/components/shared/messaging/` and a single data layer in `src/actions/messaging.ts` backed by `chat_threads` + `chat_messages`.

## Component sharing audit

| Component | Path | Used by |
|-----------|------|---------|
| `MessagingClient` | `shared/messaging/MessagingClient.tsx` | Worker + Employer pages |
| `InboxSidebar` | `shared/messaging/InboxSidebar.tsx` | Via MessagingClient |
| `ChatArea` | `shared/messaging/ChatArea.tsx` | Via MessagingClient |
| `MessagingEmptyState` | `shared/messaging/MessagingEmptyState.tsx` | Via ChatArea |
| `InboxThreadItem` | `shared/messaging/InboxThreadItem.tsx` | Via InboxSidebar |
| `MessageBubble` | `shared/messaging/MessageBubble.tsx` | Via ChatArea |
| `ChatInputArea` | `shared/messaging/ChatInputArea.tsx` | Via ChatArea |

**Pass:** No duplicate JSX in worker/employer route folders. Role differences are data-only (`oppositeParty` name/avatar).

## Database relationship integrity

| Table | FK | Verified via Supabase MCP |
|-------|-----|---------------------------|
| `chat_threads.worker_id` | → `profiles.id` | Yes |
| `chat_threads.company_profile_id` | → `company_profiles.id` | Yes |
| `chat_threads.job_id` | → `jobs.id` (nullable) | Yes |
| `chat_messages.thread_id` | → `chat_threads.id` | Yes |
| `chat_messages.sender_id` | → `profiles.id` | Yes |

**Worker query:** `chat_threads` + `company_profiles` + `jobs` where `worker_id = auth user`.

**Employer query:** `chat_threads` + `profiles!worker_id` + `jobs` where `company_profile_id` matches employer's company.

RLS enabled on both tables. No seed data — empty inbox is valid.

## Zero mock data policy

- [x] `page.tsx` routes are async Server Components fetching from Supabase
- [x] No hardcoded thread arrays
- [x] No PL/pgSQL seed functions
- [x] Empty sidebar shows "No conversations found"
- [x] Empty chat area shows `MessagingEmptyState` card

## Layout & overflow

- [x] Split pane: `w-80` sidebar + fluid `ChatArea`
- [x] Full height: `h-[calc(100vh-64px)]` (header offset)
- [x] Sidebar list: `flex-1 overflow-y-auto`
- [x] Message history: independent scroll in `ChatArea`

## DOM flatness (ponytail)

- [x] Single flex row for split pane (no nested wrapper div soup)
- [x] `ChatArea` uses semantic `<section>` + `<header>`
- [x] Removed employer-only breadcrumbs/title chrome for identical UX

## Manual test checklist

1. Log in as worker → `/worker/messages` → empty states render
2. Log in as employer → `/employer/messages` → same layout, empty states
3. Create a thread in Supabase (via application flow) → appears on both sides with correct opposite party name
4. Select thread → URL updates `?threadId=`
5. Send message → persists, no mock rollback
6. Unread badge clears after opening thread
7. Pin toggle updates `chat_threads.is_pinned`

## Known follow-ups

- Legacy `conversations` / `participants` / `messages` tables still exist but are unused by unified UI
- Orphaned `src/components/worker/messages/*` and `src/components/employer/messages/*` can be deleted in a cleanup pass
