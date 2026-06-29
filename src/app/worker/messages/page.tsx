import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  getMessagingJobRoles,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";
import {
  WorkerPageShell,
  WorkerBreadcrumb,
  WorkerPageHeader,
} from "@/components/worker/layout";

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
  const [threads, availableJobRoles] = await Promise.all([
    getMessagingThreads("worker"),
    getMessagingJobRoles("worker"),
  ]);
  const initialMessages = threadId
    ? await getMessagingMessages(threadId)
    : [];

  return (
    <WorkerPageShell width="wide" className="py-8 gap-4">
      <WorkerBreadcrumb
        items={[
          { label: "Dashboard", href: "/worker/dashboard" },
          { label: "Messages" },
        ]}
      />
      <div>
        <WorkerPageHeader
          title="Messages"
          subhead="Conversations with employers about your applications."
          bordered={false}
        />
      </div>
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
