import React from "react";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmploymentTypes, getSkills, getJobForEdit } from "@/actions/employer/jobs";
import { CreateJobForm } from "./CreateJobForm";

export const metadata = {
  title: "Create a Job Post | ReplaceMe",
  description: "Create a new remote job post on ReplaceMe and hire specialized talent.",
};

export default async function CreateJobPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const editJobId = params.edit?.trim() || null;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  const employmentTypes = await getEmploymentTypes();
  const skillsOptions = await getSkills();
  const editJob = editJobId ? await getJobForEdit(editJobId) : null;

  if (editJobId && !editJob) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-margin-desktop py-12">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
          {editJob ? "Edit Job Post" : "Create a Job Post"}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
          {editJob
            ? "Update your listing details. Changes apply immediately to active jobs."
            : "Fill out the details below to list your open position and match with verified remote talent."}
        </p>
      </div>

      <CreateJobForm
        employmentTypes={employmentTypes}
        skillsOptions={skillsOptions}
        editJob={editJob}
      />
    </div>
  );
}
