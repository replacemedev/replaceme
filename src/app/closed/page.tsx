import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AccountRestrictionNotice } from "@/components/auth/AccountRestrictionNotice";

export const metadata: Metadata = {
  title: "Account Closed",
  description:
    "This Replaceme account has been closed. Contact support to appeal or request retained records.",
  robots: { index: false, follow: false },
};

export default async function ClosedAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AccountRestrictionNotice kind="closed" hasSession={Boolean(user)} />
  );
}
