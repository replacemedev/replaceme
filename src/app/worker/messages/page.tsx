import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerThreads, getThreadMessages } from "@/actions/worker/messages";
import { MessagingClient } from "@/components/worker/messages/MessagingClient";
import { ChatMessage } from "@/types/messaging";

export const dynamic = "force-dynamic";

interface WorkerMessagesPageProps {
  searchParams: Promise<{
    threadId?: string;
  }>;
}

export default async function WorkerMessagesPage({ searchParams }: WorkerMessagesPageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Double check worker role eligibility
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "worker") {
    redirect("/login");
  }

  // Fetch threads joining company profiles and job details
  const threads = await getWorkerThreads();

  // Resolve searchParams promise
  const resolvedParams = await searchParams;
  const activeThreadId = resolvedParams.threadId || null;

  let initialMessages: ChatMessage[] = [];
  if (activeThreadId) {
    initialMessages = await getThreadMessages(activeThreadId);
  }

  return (
    <MessagingClient
      threads={threads}
      initialMessages={initialMessages}
      selectedThreadId={activeThreadId}
      currentUserId={profile.id}
    />
  );
}
