import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerVerificationState } from "@/actions/verification";
import { VerificationStepper } from "@/components/worker/verification/VerificationStepper";
import { VerificationUploadPanel } from "@/components/worker/verification/VerificationUploadPanel";
import { VerificationSidebar } from "@/components/worker/verification/VerificationSidebar";

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

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  const state = await getWorkerVerificationState();
  if (!state) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Worker Verification
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Verify your identity to unlock premium job posts, boost your visibility
            in employer searches, and display a trusted badge across the platform.
          </p>
        </header>

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
      </div>
    </div>
  );
}
