import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getWorkerProfileForEdit,
  getWorkerProjects,
} from "@/actions/worker/profile";
import { ProfileEditClient } from "@/components/worker/profile/ProfileEditClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";

export const metadata = {
  title: "Edit Profile | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerProfileEditPage() {
  const profile = await getWorkerProfileForEdit();
  if (!profile) redirect("/signin");

  const projects = await getWorkerProjects();

  return (
    <WorkerPageShell width="narrow">
      <WorkerPageHeader
        title="Edit profile"
        subhead="Update your bio, resume links, and portfolio details."
      />
      <ProfileEditClient
        initial={{
          firstName: profile.first_name ?? "",
          lastName: profile.last_name ?? "",
          professionalTitle: profile.professional_title ?? "",
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          portfolioUrl: profile.portfolio_url ?? "",
          resumeUrl: profile.resume_url ?? "",
          cvUrl: profile.cv_url ?? "",
        }}
        projects={projects}
      />
      <Link
        href="/worker/profile"
        className="text-sm font-semibold text-[#006e2f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm"
      >
        Back to profile
      </Link>
    </WorkerPageShell>
  );
}
