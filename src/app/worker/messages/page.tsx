import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  getMessagingJobRoles,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";
import type { MessagingJobRole, MessagingThread } from "@/types/messaging";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { ErrorState } from "@/components/shared/ErrorState";

export const metadata = {
  title: "Messages | ReplaceMe",
  description: "Chat with employers about your applications.",
};

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

  if (authError || !user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/signin");

  const { threadId } = await searchParams;

  let threads: MessagingThread[] = [];
  let availableJobRoles: MessagingJobRole[] = [];
  let loadError: string | null = null;

  try {
    [threads, availableJobRoles] = await Promise.all([
      getMessagingThreads("worker"),
      getMessagingJobRoles("worker"),
    ]);
  } catch {
    loadError = "We couldn't load your messaging inbox. Please refresh and try again.";
  }

  const initialMessages =
    threadId && !loadError ? await getMessagingMessages(threadId) : [];

  if (loadError) {
    return (
      <WorkerPageShell width="wide" className="py-8 gap-4">
        <ErrorState description={loadError} retryHref="/worker/messages" />
      </WorkerPageShell>
    );
  }

  return (
    <WorkerPageShell width="wide" className="h-[calc(100dvh-4rem)] flex flex-col justify-center py-4">
      <MessagingClient
        role="worker"
        basePath="/worker/messages"
        threads={threads}
        availableJobRoles={availableJobRoles}
        initialMessages={initialMessages}
        selectedThreadId={threadId ?? null}
        currentUserId={profile.id}
      />
    </WorkerPageShell>
  );
}
