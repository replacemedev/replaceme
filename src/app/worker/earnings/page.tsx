import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { getWorkerEarningsSummary } from "@/lib/worker/earnings";
import { EarningsDashboardClient } from "@/components/worker/earnings/EarningsDashboardClient";

export const metadata = {
  title: "Earnings | Replaceme",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    range?: string;
    page?: string;
  }>;
}

export default async function WorkerEarningsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const resolvedParams = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("salary_currency")
    .eq("id", user.id)
    .single();

  const currency = profile?.salary_currency ?? "PHP";

  const summary = await getWorkerEarningsSummary(user.id, currency, {
    search: resolvedParams.search,
    range: resolvedParams.range,
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
    limit: 8,
  });

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Earnings"
        subhead="Track your contracted work, agreed rates, and income history."
      />

      <EarningsDashboardClient summary={summary} profileCurrency={currency} />
    </WorkerPageShell>
  );
}
