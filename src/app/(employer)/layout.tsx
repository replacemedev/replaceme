import React from "react";
import { Header } from "@/components/dashboard/EmployerHeader";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { getUnreadMessageCount } from "@/actions/employer/messages";
export const dynamic = "force-dynamic";

export default async function EmployerLayout({
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
      .select(`
        first_name,
        last_name,
        avatar_url,
        company_profiles (
          company_name
        )
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      const companyProfilesObj = data.company_profiles as any;
      const companyName = Array.isArray(companyProfilesObj)
        ? companyProfilesObj[0]?.company_name
        : companyProfilesObj?.company_name;

      profile = {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
        company_name: companyName || user.user_metadata?.company_name || null,
      };
    } else {
      // Fallback to user metadata
      profile = {
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        company_name: user.user_metadata?.company_name || null,
      };
    }
  }

  const unreadMessageCount = await getUnreadMessageCount();

  return (
    <>
      <Header profile={profile} unreadMessageCount={unreadMessageCount} />
      <main className="pt-0 min-h-screen bg-[#f8fafe]">
        {children}
      </main>
      <Footer />
    </>
  );
}

