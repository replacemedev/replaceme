import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { createResendClient } from "@/lib/server/resend/client";
import { ensureResendSegment, type ResendSegmentKey } from "@/lib/server/resend/segments";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];
type TierSlug = "discovery" | "starter" | "growth" | "scale";

function roleSegmentKey(role: UserRole): ResendSegmentKey {
  switch (role) {
    case "employer":
      return "role_employer";
    case "worker":
      return "role_worker";
    case "admin":
      return "role_admin";
  }
}

function tierSegmentKey(tier: TierSlug): ResendSegmentKey {
  switch (tier) {
    case "discovery":
      return "tier_discovery";
    case "starter":
      return "tier_starter";
    case "growth":
      return "tier_growth";
    case "scale":
      return "tier_scale";
  }
}

export async function syncResendContactForUser(input: {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  tierSlug?: TierSlug | null;
  companyName?: string | null;
}): Promise<{ success: true; contactId: string } | { success: false; error: string }> {
  const resend = createResendClient();
  const admin = await createAdminClient();

  const baseProperties: Record<string, string | number | null> = {
    user_id: input.userId,
    role: input.role,
    tier_slug: input.tierSlug ?? null,
    company_name: input.companyName ?? null,
  };

  const segmentIds: string[] = [];
  const roleSeg = await ensureResendSegment(roleSegmentKey(input.role));
  if (roleSeg) segmentIds.push(roleSeg);
  if (input.tierSlug) {
    const tierSeg = await ensureResendSegment(tierSegmentKey(input.tierSlug));
    if (tierSeg) segmentIds.push(tierSeg);
  }

  // Try to create or update contact by email (id may not exist yet).
  const { data: created, error: createError } = await resend.contacts.create({
    email: input.email,
    firstName: input.firstName ?? undefined,
    lastName: input.lastName ?? undefined,
    unsubscribed: false,
    properties: baseProperties,
    segments: segmentIds.map((id) => ({ id })),
  });

  if (createError) {
    // If already exists, update by email.
    const { data: updated, error: updateError } = await resend.contacts.update({
      email: input.email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      properties: baseProperties,
    });

    if (updateError || !updated?.id) {
      safeError("syncResendContactForUser: failed", updateError ?? createError);
      return { success: false, error: (updateError ?? createError).message };
    }

    await persistResendContactId(admin, input.userId, updated.id);
    return { success: true, contactId: updated.id };
  }

  if (!created?.id) {
    return { success: false, error: "Failed to create Resend contact." };
  }

  await persistResendContactId(admin, input.userId, created.id);
  return { success: true, contactId: created.id };
}

async function persistResendContactId(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  userId: string,
  contactId: string
) {
  const { error } = await admin
    .from("profiles")
    .update({ resend_contact_id: contactId })
    .eq("id", userId);

  if (error) {
    safeError("persistResendContactId:", error);
  }
}

