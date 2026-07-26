"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations/common";
import { invalidateUserCache } from "@/lib/server/redis-cache";

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

function revalidateNotificationPaths() {
  revalidatePath("/employer/notifications");
  revalidatePath("/worker/notifications");
  revalidatePath("/admin/notifications");
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
    await invalidateUserCache(userId);
    revalidateNotificationPaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark as read",
    };
  }
}

export async function markNotificationUnread(
  notificationId: string
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.parse({ notificationId });
    const { supabase, userId } = await verifySessionUser();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: false })
      .eq("id", parsed.notificationId)
      .eq("user_id", userId)
      .is("archived_at", null);

    if (error) throw new Error(error.message);
    await invalidateUserCache(userId);
    revalidateNotificationPaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark as unread",
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
      .eq("is_read", false)
      .is("archived_at", null);

    if (error) throw new Error(error.message);
    await invalidateUserCache(userId);
    revalidateNotificationPaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark all as read",
    };
  }
}

export async function archiveNotification(
  notificationId: string
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.parse({ notificationId });
    const { supabase, userId } = await verifySessionUser();

    const { error } = await supabase
      .from("notifications")
      .update({ archived_at: new Date().toISOString(), is_read: true })
      .eq("id", parsed.notificationId)
      .eq("user_id", userId)
      .is("archived_at", null);

    if (error) throw new Error(error.message);
    await invalidateUserCache(userId);
    revalidateNotificationPaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to archive notification",
    };
  }
}

export async function unarchiveNotification(
  notificationId: string
): Promise<ActionResult> {
  try {
    const parsed = notificationIdSchema.parse({ notificationId });
    const { supabase, userId } = await verifySessionUser();

    const { error } = await supabase
      .from("notifications")
      .update({ archived_at: null })
      .eq("id", parsed.notificationId)
      .eq("user_id", userId)
      .not("archived_at", "is", null);

    if (error) throw new Error(error.message);
    await invalidateUserCache(userId);
    revalidateNotificationPaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to unarchive notification",
    };
  }
}

/** @deprecated Use archiveNotification — hard delete breaks audit retention. */
export async function deleteNotification(
  notificationId: string
): Promise<ActionResult> {
  return archiveNotification(notificationId);
}

export async function revalidateNotificationSurfaces() {
  revalidatePath("/", "layout");
}
