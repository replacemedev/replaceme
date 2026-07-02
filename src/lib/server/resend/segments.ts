import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { createResendClient } from "@/lib/server/resend/client";

export type ResendSegmentKey =
  | "role_employer"
  | "role_worker"
  | "role_admin"
  | "tier_discovery"
  | "tier_starter"
  | "tier_growth"
  | "tier_scale";

export async function getResendSegmentId(
  key: ResendSegmentKey
): Promise<string | null> {
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("resend_segments")
    .select("segment_id")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    safeError("getResendSegmentId:", error);
    return null;
  }

  return data?.segment_id ?? null;
}

/**
 * Attempts to create a segment in Resend and persist it in Supabase.
 * If the Resend plan does not allow more segments, it returns null.
 */
export async function ensureResendSegment(
  key: ResendSegmentKey
): Promise<string | null> {
  const existing = await getResendSegmentId(key);
  if (existing) return existing;

  const resend = createResendClient();
  const { data, error } = await resend.segments.create({ name: key });

  if (error || !data?.id) {
    // Typical failure: plan limit (cannot create more segments on current plan).
    if (error) safeError("ensureResendSegment: create failed", error);
    return null;
  }

  const admin = await createAdminClient();
  const { error: upsertError } = await admin
    .from("resend_segments")
    .upsert({ key, segment_id: data.id }, { onConflict: "key" });

  if (upsertError) {
    safeError("ensureResendSegment: upsert failed", upsertError);
  }

  return data.id;
}

