---
description: Supabase development — RLS security checklist, Data API exposure, auth traps, SECURITY DEFINER risks, CLI workflow, and schema change patterns.
alwaysApply: true
---

## Supabase

**CRITICAL — Verify First:** Supabase changes frequently. Fetch `https://supabase.com/changelog.md` before implementing. Use MCP `search_docs` or append `.md` to any docs URL. Always run a test query after every fix. After 2–3 failed attempts, stop and reconsider — don't retry the same approach.

**CRITICAL — Data API Exposure:** New tables are not auto-exposed to the REST API. Grant access explicitly with `GRANT` SQL. Always pair public access grants with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.

**CRITICAL — RLS Rules:**
- Enable RLS on every table in exposed schemas (`public` by default)
- `auth.role()` is deprecated — use `TO authenticated`/`TO anon` in policy definitions
- `TO authenticated` alone is BOLA/IDOR — always add `USING ( (select auth.uid()) = user_id )`
- `UPDATE` policies need both `USING` and `WITH CHECK` (without `WITH CHECK`, users can reassign rows)
- `UPDATE` without a `SELECT` policy silently returns 0 rows
- Views bypass RLS — use `security_invoker = true` (Postgres 15+) or revoke access

**CRITICAL — Auth:**
- Never use `raw_user_meta_data` for authorization — it's user-editable; use `raw_app_meta_data`
- Deleting a user does not invalidate tokens — sign out or revoke sessions first
- Never expose `service_role` key in `NEXT_PUBLIC_` env vars

**CRITICAL — SECURITY DEFINER:**
- Never add to resolve a permission error — it bypasses all RLS
- All functions in `public` are callable by `anon`/`authenticated` by default (Postgres grants EXECUTE to PUBLIC)
- If genuinely needed: non-exposed schema + `auth.uid()` check in body + run `supabase db advisors`

**HIGH — Schema Changes:** Iterate with `execute_sql` (MCP) or `supabase db query` (CLI v2.79.0+). Never use `apply_migration` during iteration. Commit: advisors → security review → `supabase db pull <name> --local --yes` → verify.

**HIGH — CLI:** Always use `--help` to discover commands. `db advisors` requires CLI v2.81.3+. Always `supabase migration new <name>` to create migration files.

### Correct RLS Policy Pattern

```sql
-- Full ownership policy: select, update (both USING + WITH CHECK)
create policy "users see own rows" on table_name
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "users update own rows" on table_name
  for update to authenticated
  using  ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );
```
