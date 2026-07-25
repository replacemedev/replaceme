import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  ensureMessagingThread,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { EmployerPageShell } from "@/components/employer/layout";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  extractJobRolesFromThreads,
  MESSAGING_THREADS_PAGE_SIZE,
  type MessagingMessagesPage,
  type MessagingThread,
} from "@/types/messaging";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

export const metadata = {
  title: "Messaging Center | Replaceme",
  description: "Connect and chat with candidates.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    threadId?: string;
    jobId?: string;
    candidateId?: string;
  }>;
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
  let planUsage: EmployerPlanUsage | null = null;
  let companyProfileId: string | null = null;
  let loadError: string | null = null;

  try {
    const [threadList, usage, company] = await Promise.all([
      getMessagingThreads("employer"),
      getEmployerPlanUsage(),
      supabase
        .from("company_profiles")
        .select("id")
        .eq("employer_id", profile.id)
        .maybeSingle(),
    ]);
    threads = threadList;
    planUsage = usage;
    companyProfileId = company.data?.id ?? null;
  } catch {
    loadError =
      "We couldn't load your messaging inbox. Please refresh and try again.";
  }

  const availableJobRoles = extractJobRolesFromThreads(threads);
  const hasMoreThreads = threads.length >= MESSAGING_THREADS_PAGE_SIZE;

  const emptyMessages: MessagingMessagesPage = {
    messages: [],
    hasMore: false,
    nextCursor: null,
  };

  const initialMessagesPage = resolvedThreadId
    ? await getMessagingMessages(resolvedThreadId)
    : emptyMessages;

  if (loadError) {
    return (
      <EmployerPageShell width="content">
        <ErrorState description={loadError} retryHref="/employer/messages" />
      </EmployerPageShell>
    );
  }

  return (
    <EmployerPageShell
      width="wide"
      className="h-[calc(100dvh-4rem)] flex flex-col justify-center py-4"
    >
      <Suspense fallback={null}>
        <MessagingClient
          role="employer"
          basePath="/employer/messages"
          threads={threads}
          availableJobRoles={availableJobRoles}
          initialMessagesPage={initialMessagesPage}
          selectedThreadId={resolvedThreadId ?? null}
          currentUserId={profile.id}
          companyProfileId={companyProfileId}
          initialHasMoreThreads={hasMoreThreads}
          messagingEnabled={planUsage?.messagingEnabled ?? false}
          planSlug={planUsage?.planSlug ?? "discovery"}
        />
      </Suspense>
    </EmployerPageShell>
  );
}
