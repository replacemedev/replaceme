import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerVerificationState } from "@/actions/verification";
import { VerificationStepper } from "@/components/worker/verification/VerificationStepper";
import { VerificationUploadPanel } from "@/components/worker/verification/VerificationUploadPanel";
import { VerificationSidebar } from "@/components/worker/verification/VerificationSidebar";
import {
  WorkerPageShell,
  WorkerPageHeader,
  WorkerBreadcrumb,
} from "@/components/worker/layout";

export const metadata = {
  title: "Worker Verification | ReplaceMe",
  description:
    "Verify your identity to unlock premium jobs and build trust with employers.",
};

export const dynamic = "force-dynamic";

export default async function WorkerVerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/signin");

  const state = await getWorkerVerificationState();
  if (!state) redirect("/signin");

  return (
    <WorkerPageShell width="content">
      <WorkerBreadcrumb
        items={[
          { label: "Dashboard", href: "/worker/dashboard" },
          { label: "Verification" },
        ]}
      />
      <WorkerPageHeader
        title="Worker verification"
        subhead="Verify your identity to unlock premium job posts, boost your visibility in employer searches, and display a trusted badge across the platform."
        bordered={false}
        className="text-center sm:text-left"
      />

      <VerificationStepper steps={state.steps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VerificationUploadPanel
            documents={state.documents}
            verificationStatus={state.verificationStatus}
            personalInfoComplete={state.personalInfoComplete}
            canSubmitForReview={state.canSubmitForReview}
          />
        </div>
        <VerificationSidebar />
      </div>
    </WorkerPageShell>
  );
}
