import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConversations, getMessages } from "@/actions/employer/messages";
import { getAccountSettings } from "@/actions/employer/billing";
import { MessagingClient } from "@/components/employer/messages/MessagingClient";

export const metadata = {
  title: "Messaging Center | ReplaceMe",
  description: "Connect and chat with top developer candidates.",
};

interface PageProps {
  searchParams: Promise<{ id?: string; role?: string }>;
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify role is employer
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  // Await search params in Next 15/16
  const resolvedSearchParams = await searchParams;
  const activeId = resolvedSearchParams.id || null;
  const roleFilter = resolvedSearchParams.role || undefined;

  // Parallel fetches for conversations, active messages, and billing status
  const [conversations, initialMessages, billingSettings] = await Promise.all([
    getConversations(roleFilter),
    activeId ? getMessages(activeId) : Promise.resolve([]),
    getAccountSettings(),
  ]);

  const subscriptionTier = billingSettings?.plan || "essential";

  return (
    <div className="max-w-6xl mx-auto px-margin-desktop py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
        <span>Messaging</span>
        <span>&rsaquo;</span>
        <span className="text-slate-500">Inbox</span>
      </div>

      {/* Page Title */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Messaging Center</h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
          Manage conversations with candidates and coordinate hiring schedules.
        </p>
      </div>

      {/* Messaging Dashboard Container */}
      <MessagingClient
        conversations={conversations}
        initialMessages={initialMessages}
        activeId={activeId}
        subscriptionTier={subscriptionTier}
        currentUserId={profile.id}
      />
    </div>
  );
}
