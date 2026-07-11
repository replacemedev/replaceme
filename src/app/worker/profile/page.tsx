import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WorkerProfileEditor } from "@/components/worker/profile/WorkerProfileEditor";
import {
  WorkerProfile,
  WorkerSkillDetailed,
  WorkerProject,
  EmployerTestimonial,
} from "@/types/worker-profile";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function WorkerProfilePage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resolvedSearchParams = await searchParams;
  const targetId = resolvedSearchParams.id || null;

  let workerId = targetId;
  if (!workerId) {
    if (!user) redirect("/signin");
    workerId = user.id;
  }

  const isOwner = user?.id === workerId;

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", workerId)
    .single();

  if (!profileRow || profileRow.role !== "worker") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Profile Not Found</h2>
        <p className="text-xs text-slate-500 font-medium mt-2">
          The requested worker profile could not be found or does not exist.
        </p>
        <Link
          href="/worker/dashboard"
          className="mt-5 inline-flex px-5 py-2.5 text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-xl transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const profile: WorkerProfile = {
    id: profileRow.id,
    first_name: profileRow.first_name,
    middle_name: profileRow.middle_name,
    last_name: profileRow.last_name,
    full_name: profileRow.full_name,
    professional_title: profileRow.professional_title,
    bio: profileRow.bio,
    avatar_url: profileRow.avatar_url,
    hourly_rate: profileRow.hourly_rate,
    salary_currency: profileRow.salary_currency ?? "PHP",
    experience_years: profileRow.experience_years,
    location: profileRow.location,
    region: profileRow.region,
    province: profileRow.province,
    city: profileRow.city,
    address_line_1: profileRow.address_line_1,
    availability: profileRow.availability,
    portfolio_url: profileRow.portfolio_url,
    resume_url: profileRow.resume_url,
    cv_url: profileRow.cv_url,
    birth_date: profileRow.birth_date,
    is_top_rated: profileRow.is_top_rated,
    is_remote: profileRow.is_remote,
    created_at: profileRow.created_at,
    is_verified: Boolean(profileRow.is_verified),
  };

  const { data: skillsRows } = await supabase
    .from("worker_skills")
    .select("*")
    .eq("worker_id", workerId)
    .order("proficiency", { ascending: false });

  const skills: WorkerSkillDetailed[] = (skillsRows || []).map((row) => ({
    id: row.id,
    worker_id: row.worker_id,
    skill_name: row.skill_name,
    proficiency: row.proficiency,
    category: row.category,
    experience_duration: row.experience_duration,
    proficiency_label: row.proficiency_label,
  }));

  const { data: projectsRows } = await supabase
    .from("worker_projects")
    .select("*")
    .eq("worker_id", workerId)
    .order("year", { ascending: false });

  const projects: WorkerProject[] = (projectsRows || []).map((row) => ({
    id: row.id,
    worker_id: row.worker_id,
    title: row.title,
    role: row.role,
    year: row.year,
    description: row.description,
    skills_used: row.skills_used ?? [],
  }));

  const { data: testimonialsRows } = await supabase
    .from("employer_testimonials")
    .select(`
      id,
      worker_id,
      employer_id,
      rating,
      review_text,
      created_at,
      employer:company_profiles!employer_testimonials_employer_id_fkey (
        company_name,
        logo_url,
        profile:profiles!company_profiles_employer_id_fkey (
          first_name,
          middle_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  const testimonials: EmployerTestimonial[] = (testimonialsRows || []).map((row: any) => {
    const comp = Array.isArray(row.employer) ? row.employer[0] : row.employer;
    const prof = Array.isArray(comp?.profile) ? comp?.profile[0] : comp?.profile;

    return {
      id: row.id,
      worker_id: row.worker_id,
      employer_id: row.employer_id,
      rating: Number(row.rating),
      review_text: row.review_text,
      created_at: row.created_at,
      company_name: comp?.company_name || "Employer Partner",
      company_logo: comp?.logo_url || null,
      employer_first_name: prof?.first_name || null,
      employer_middle_name: prof?.middle_name || null,
      employer_last_name: prof?.last_name || null,
      employer_role: "Hiring Manager",
    };
  });

  const reviewCount = testimonials.length;
  const averageRating =
    reviewCount > 0
      ? Number(
          (testimonials.reduce((sum, t) => sum + t.rating, 0) / reviewCount).toFixed(1)
        )
      : 0;

  return (
    <WorkerProfileEditor
      profile={profile}
      skills={skills}
      projects={projects}
      testimonials={testimonials}
      reviewCount={reviewCount}
      averageRating={averageRating}
      isOwner={isOwner}
    />
  );
}
