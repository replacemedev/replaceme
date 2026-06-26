import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getWorkerProfileForEdit,
  getWorkerProjects,
} from "@/actions/worker/profile";
import { ProfileEditClient } from "@/components/worker/profile/ProfileEditClient";

export const metadata = {
  title: "Edit Profile | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerProfileEditPage() {
  const profile = await getWorkerProfileForEdit();
  if (!profile) redirect("/login");

  const projects = await getWorkerProjects();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-400 mb-1">
          <Link href="/worker/profile" className="hover:text-slate-600">
            Profile
          </Link>
          <span> &rsaquo; Edit</span>
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your bio, resume links, and portfolio details.
        </p>
      </div>
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
    </div>
  );
}
