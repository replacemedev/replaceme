import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  getMessagingJobRoles,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ threadId?: string }>;
}

export default async function WorkerMessagesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  const { threadId } = await searchParams;
  const [threads, availableJobRoles] = await Promise.all([
    getMessagingThreads("worker"),
    getMessagingJobRoles("worker"),
  ]);
  const initialMessages = threadId
    ? await getMessagingMessages(threadId)
    : [];

  return (
    <MessagingClient
      role="worker"
      basePath="/worker/messages"
      threads={threads}
      availableJobRoles={availableJobRoles}
      initialMessages={initialMessages}
      selectedThreadId={threadId ?? null}
      currentUserId={profile.id}
    />
  );
}
