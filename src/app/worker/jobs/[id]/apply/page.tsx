import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApplyJobPageData } from "@/actions/job-application";
import { ApplyJobHero } from "@/components/worker/jobs/apply/ApplyJobHero";
import { ApplicationForm } from "@/components/worker/jobs/apply/ApplicationForm";
import { ApplySidebarCards } from "@/components/worker/jobs/apply/ApplySidebarCards";
import { WorkerPageShell } from "@/components/worker/layout";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = await getApplyJobPageData(id);
  return {
    title: data
      ? `Apply — ${data.job.title} | ReplaceMe`
      : "Apply | ReplaceMe",
  };
}

export default async function WorkerApplyJobPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  const { id } = await params;
  const pageData = await getApplyJobPageData(id);

  if (!pageData) notFound();

  if (pageData.hasApplied) {
    redirect("/worker/applications");
  }

  return (
    <>
      <ApplyJobHero job={pageData.job} />

      <WorkerPageShell
        width="content"
        className="-mt-12 sm:-mt-16 relative z-10 pb-24 lg:pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ApplicationForm
              job={pageData.job}
              profileAssets={pageData.profileAssets}
              defaultContactMethods={pageData.defaultContactMethods}
            />
          </div>
          <ApplySidebarCards job={pageData.job} />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Need to update your resume or portfolio?{" "}
          <Link
            href="/worker/profile"
            className="font-semibold text-[#006e2f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm"
          >
            Edit your profile
          </Link>
        </p>
      </WorkerPageShell>
    </>
  );
}
