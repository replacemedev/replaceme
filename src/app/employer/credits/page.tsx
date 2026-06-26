import { getEmployerCreditsSummary } from "@/actions/employer/credits";
import { CreditsClient } from "@/components/employer/credits/CreditsClient";

export const metadata = { title: "Credits | ReplaceMe" };
export const dynamic = "force-dynamic";

export default async function EmployerCreditsPage() {
  const summary = await getEmployerCreditsSummary();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Credits</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Profile unlock balance, purchase packs, and usage history.
      </p>
      <CreditsClient summary={summary} />
    </div>
  );
}
