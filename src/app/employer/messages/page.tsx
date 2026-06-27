import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMessagingThreads,
  getMessagingMessages,
  getMessagingJobRoles,
} from "@/actions/messaging";
import { MessagingClient } from "@/components/shared/messaging/MessagingClient";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { EmployerPageShell } from "@/components/employer/layout/EmployerPageShell";
import { EmployerBreadcrumb } from "@/components/employer/layout/EmployerBreadcrumb";
import { ErrorState } from "@/components/shared/ErrorState";
import type { MessagingJobRole, MessagingThread } from "@/types/messaging";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

export const metadata = {
  title: "Messaging Center | ReplaceMe",
  description: "Connect and chat with candidates.",
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

  const initialMessages = threadId
    ? await getMessagingMessages(threadId)
    : [];

  if (loadError) {
    return (
      <EmployerPageShell width="content">
        <EmployerBreadcrumb
          items={[
            { label: "Dashboard", href: "/employer/dashboard" },
            { label: "Messages" },
          ]}
        />
        <ErrorState description={loadError} retryHref="/employer/messages" />
      </EmployerPageShell>
    );
  }

  return (
    <EmployerPageShell width="wide" className="py-8 gap-4">
      <EmployerBreadcrumb
        items={[
          { label: "Dashboard", href: "/employer/dashboard" },
          { label: "Messages" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Messaging
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Chat with candidates across your active job posts.
        </p>
      </div>
      <MessagingClient
        role="employer"
        basePath="/employer/messages"
        threads={threads}
        availableJobRoles={availableJobRoles}
        initialMessages={initialMessages}
        selectedThreadId={threadId ?? null}
        currentUserId={profile.id}
        messagingEnabled={planUsage?.messagingEnabled ?? false}
        planSlug={planUsage?.planSlug ?? "discovery"}
      />
    </EmployerPageShell>
  );
}
