import React from "react";
import { WorkerHeader } from "@/components/layout/WorkerHeader";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, username, avatar_url")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (data) {
      profile = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        avatar_url: data.avatar_url,
      };
    } else {
      // Fallback to user metadata
      profile = {
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        username: user.user_metadata?.username || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };
    }
  }

  return (
    <>
      <WorkerHeader profile={profile} />
      <main className="pt-0 min-h-screen bg-[#f8fafe]">
        {children}
      </main>
      <Footer />
    </>
  );
}

