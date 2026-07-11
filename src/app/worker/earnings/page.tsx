import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { getWorkerFinancials } from "@/lib/worker/mock-earnings";
import { EarningsDashboardClient } from "@/components/worker/earnings/EarningsDashboardClient";

export const metadata = {
  title: "Earnings | ReplaceMe",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    range?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function WorkerEarningsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Await searchParams in Next.js 16.
  const resolvedParams = await searchParams;

  // Retrieve the worker's profile currency (defaults to PHP)
  const { data: profile } = await supabase
    .from("profiles")
    .select("salary_currency")
    .eq("id", user.id)
    .single();

  const currency = profile?.salary_currency ?? "PHP";

  // Fetch filtered and paginated financials data
  const financials = await getWorkerFinancials(user.id, currency, {
    search: resolvedParams.search,
    range: resolvedParams.range,
    status: resolvedParams.status,
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
    limit: 5, // 5 transactions per page for clean visual pagination
  });

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Earnings"
        subhead="Track your financial metrics, contract payouts, and processing invoices."
      />
      
      <EarningsDashboardClient
        initialFinancials={financials}
        profileCurrency={currency}
      />
    </WorkerPageShell>
  );
}
