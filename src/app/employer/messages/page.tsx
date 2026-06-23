import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  getMessagingJobRoles,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";

export const metadata = {
  title: "Messaging Center | ReplaceMe",
  description: "Connect and chat with candidates and employers.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ threadId?: string }>;
}

export default async function EmployerMessagesPage({ searchParams }: PageProps) {
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

  if (!profile || profile.role !== "employer") redirect("/dashboard");

  const { threadId } = await searchParams;
  const [threads, availableJobRoles] = await Promise.all([
    getMessagingThreads("employer"),
    getMessagingJobRoles("employer"),
  ]);
  const initialMessages = threadId
    ? await getMessagingMessages(threadId)
    : [];

  return (
    <MessagingClient
      role="employer"
      basePath="/employer/messages"
      threads={threads}
      availableJobRoles={availableJobRoles}
      initialMessages={initialMessages}
      selectedThreadId={threadId ?? null}
      currentUserId={profile.id}
    />
  );
}
