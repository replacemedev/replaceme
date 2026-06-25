"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations/common";

const notificationIdSchema = z.object({ notificationId: uuidSchema }).strict();

type ActionResult = { success: true } | { success: false; error: string };

async function verifySessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { supabase, userId: user.id };
}

export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.parse({ notificationId });
    const { supabase, userId } = await verifySessionUser();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", parsed.notificationId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark as read",
    };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const { supabase, userId } = await verifySessionUser();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark all as read",
    };
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.parse({ notificationId });
    const { supabase, userId } = await verifySessionUser();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", parsed.notificationId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete notification",
    };
  }
}

export async function revalidateNotificationSurfaces() {
  revalidatePath("/", "layout");
}
