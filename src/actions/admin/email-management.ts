"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/auth/require-admin";

const statusSchema = z
  .enum([
    "queued",
    "scheduled",
    "sent",
    "delivered",
    "opened",
    "clicked",
    "delayed",
    "bounced",
    "complained",
    "suppressed",
    "failed",
  ])
  .optional();

const listSchema = z.object({
  status: statusSchema,
  kind: z.enum(["transactional", "broadcast"]).optional(),
  role: z.enum(["worker", "employer", "admin"]).optional(),
  tierSlug: z.enum(["discovery", "starter", "growth", "scale"]).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type AdminEmailMessageRow = {
  id: string;
  kind: "transactional" | "broadcast";
  subject: string | null;
  to_email: string | null;
  role: "worker" | "employer" | "admin" | null;
  tier_slug: "discovery" | "starter" | "growth" | "scale" | null;
  status: string;
  provider_message_id: string | null;
  provider_broadcast_id: string | null;
  created_at: string;
  last_event_at: string | null;
};

export type AdminEmailEventRow = {
  id: string;
  message_id: string;
  event_type: string;
  occurred_at: string;
};

export async function listEmailMessages(
  input: z.infer<typeof listSchema>
): Promise<{ messages: AdminEmailMessageRow[] }> {
  await requireAdmin();
  const parsed = listSchema.parse(input);
  const admin = await createAdminClient();

  let query = admin
    .from("email_messages")
    .select(
      "id, kind, subject, to_email, role, tier_slug, status, provider_message_id, provider_broadcast_id, created_at, last_event_at"
    )
    .order("created_at", { ascending: false })
    .limit(parsed.limit);

  if (parsed.status) query = query.eq("status", parsed.status);
  if (parsed.kind) query = query.eq("kind", parsed.kind);
  if (parsed.role) query = query.eq("role", parsed.role);
  if (parsed.tierSlug) query = query.eq("tier_slug", parsed.tierSlug);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return { messages: (data ?? []) as AdminEmailMessageRow[] };
}

export async function listEmailEvents(messageId: string): Promise<{
  events: AdminEmailEventRow[];
}> {
  await requireAdmin();
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("email_events")
    .select("id, message_id, event_type, occurred_at")
    .eq("message_id", messageId)
    .order("occurred_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return { events: (data ?? []) as AdminEmailEventRow[] };
}

