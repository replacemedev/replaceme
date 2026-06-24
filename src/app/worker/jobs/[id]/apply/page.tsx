import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApplyJobPageData } from "@/actions/job-application";
import { ApplyJobHero } from "@/components/worker/jobs/apply/ApplyJobHero";
import { ApplicationForm } from "@/components/worker/jobs/apply/ApplicationForm";
import { ApplySidebarCards } from "@/components/worker/jobs/apply/ApplySidebarCards";

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
    <div className="min-h-screen bg-[#f4f7f6]">
      <ApplyJobHero job={pageData.job} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-12 relative z-10">
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
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Edit your profile
          </Link>
        </p>
      </main>
    </div>
  );
}
