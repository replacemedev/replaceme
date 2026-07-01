import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  getMessagingJobRoles,
  ensureMessagingThread,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { EmployerPageShell } from "@/components/employer/layout";
import { ErrorState } from "@/components/shared/ErrorState";
import type { MessagingJobRole, MessagingThread } from "@/types/messaging";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

export const metadata = {
  title: "Messaging Center | ReplaceMe",
  description: "Connect and chat with candidates.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ threadId?: string; jobId?: string; candidateId?: string }>;
}

export default async function EmployerMessagesPage({ searchParams }: PageProps) {
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

  if (!profile || profile.role !== "employer") redirect("/dashboard");

  const { threadId, jobId, candidateId } = await searchParams;

  if (!threadId && jobId && candidateId) {
    const ensured = await ensureMessagingThread({ jobId, candidateId });
    if (ensured.success && ensured.data.threadId) {
      redirect(`/employer/messages?threadId=${ensured.data.threadId}`);
    }
  }

  const resolvedThreadId = threadId;

  let threads: MessagingThread[] = [];
  let availableJobRoles: MessagingJobRole[] = [];
  let planUsage: EmployerPlanUsage | null = null;
  let loadError: string | null = null;

  try {
    [threads, availableJobRoles, planUsage] = await Promise.all([
      getMessagingThreads("employer"),
      getMessagingJobRoles("employer"),
      getEmployerPlanUsage(),
    ]);
  } catch {
    loadError = "We couldn't load your messaging inbox. Please refresh and try again.";
  }

  const initialMessages = resolvedThreadId
    ? await getMessagingMessages(resolvedThreadId)
    : [];

  if (loadError) {
    return (
      <EmployerPageShell width="content">
        <ErrorState description={loadError} retryHref="/employer/messages" />
      </EmployerPageShell>
    );
  }

  return (
    <EmployerPageShell width="wide" className="py-4 md:py-6 gap-0">
      <MessagingClient
        role="employer"
        basePath="/employer/messages"
        threads={threads}
        availableJobRoles={availableJobRoles}
        initialMessages={initialMessages}
        selectedThreadId={resolvedThreadId ?? null}
        currentUserId={profile.id}
        messagingEnabled={planUsage?.messagingEnabled ?? false}
        planSlug={planUsage?.planSlug ?? "discovery"}
      />
    </EmployerPageShell>
  );
}
