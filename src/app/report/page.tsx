import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportIssueForm } from "@/components/shared/reporting/ReportIssueForm";

export const metadata = {
  title: "Report an issue | ReplaceMe",
};

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/report");
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Support
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Report an issue
        </h1>
        <p className="text-sm font-medium text-slate-600">
          This form is authenticated. We attach your account and the page URL
          automatically.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ReportIssueForm />
      </section>
    </main>
  );
}

