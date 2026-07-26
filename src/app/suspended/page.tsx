import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { profileIdFilter } from "@/lib/auth/role";
import { AccountRestrictionNotice } from "@/components/auth/AccountRestrictionNotice";

export const metadata: Metadata = {
  title: "Account Suspended",
  description:
    "Your Replaceme account is suspended. Contact support to appeal or learn next steps.",
  robots: { index: false, follow: false },
};

export default async function SuspendedAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let suspensionEndsAt: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("suspension_ends_at")
      .or(profileIdFilter(user.id))
      .maybeSingle();
    suspensionEndsAt = profile?.suspension_ends_at ?? null;
  }

  return (
    <AccountRestrictionNotice
      kind="suspended"
      hasSession={Boolean(user)}
      suspensionEndsAt={suspensionEndsAt}
    />
  );
}
