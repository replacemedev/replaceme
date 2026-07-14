import React from "react";
import { EmployerHeader } from "@/components/employer/layout/EmployerHeader";
import { EmployerLayoutChrome } from "@/components/employer/layout/EmployerLayoutChrome";
import { EmployerBillingStatusBanner } from "@/components/employer/billing/EmployerBillingStatusBanner";
import { Footer } from "@/components/layout/Footer";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { getNavSession } from "@/lib/auth/nav-session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getNavSession();

  let billingStatus: string | null = null;
  let lastPaymentError: string | null = null;

  if (session.userId) {
    const supabase = await createClient();
    const withError = await supabase
      .from("employer_subscriptions")
      .select("status, last_payment_error")
      .eq("employer_id", session.userId)
      .maybeSingle();

    if (
      withError.error &&
      /last_payment_error|does not exist|schema cache/i.test(
        withError.error.message
      )
    ) {
      const fallback = await supabase
        .from("employer_subscriptions")
        .select("status")
        .eq("employer_id", session.userId)
        .maybeSingle();
      billingStatus = fallback.data?.status ?? null;
      lastPaymentError = null;
    } else {
      billingStatus = withError.data?.status ?? null;
      lastPaymentError = withError.data?.last_payment_error ?? null;
    }
  }

  return (
    <>
      <AuthFlashToast />
      <EmployerHeader session={session} />
      {billingStatus ? (
        <EmployerBillingStatusBanner
          status={billingStatus}
          lastPaymentError={lastPaymentError}
        />
      ) : null}
      <main className="pt-0 min-h-screen bg-[#f8fafe] pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <EmployerLayoutChrome unreadMessageCount={session.unreadMessageCount} />
      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}
