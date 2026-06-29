import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Award, Briefcase, Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileSidebar } from "@/components/worker/profile/ProfileSidebar";
import { AboutSection } from "@/components/worker/profile/AboutSection";
import { SkillProgressBar } from "@/components/worker/profile/SkillProgressBar";
import { ProjectHighlightItem } from "@/components/worker/profile/ProjectHighlightItem";
import { TestimonialCard } from "@/components/worker/profile/TestimonialCard";
import { WorkerProfile, WorkerSkillDetailed, WorkerProject, EmployerTestimonial } from "@/types/worker-profile";
import { WorkerPageShell, WorkerBreadcrumb } from "@/components/worker/layout";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function WorkerProfilePage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Await search params in Next 15/16
  const resolvedSearchParams = await searchParams;
  const targetId = resolvedSearchParams.id || null;

  // Determine which worker profile to load
  let workerId = targetId;
  if (!workerId) {
    if (!user) {
      redirect("/signin");
    }
    workerId = user.id;
  }

  const isOwner = user?.id === workerId;

  // 1. Fetch worker profile details
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
    last_name: profileRow.last_name,
    full_name: profileRow.full_name,
    professional_title: profileRow.professional_title,
    bio: profileRow.bio,
    avatar_url: profileRow.avatar_url,
    hourly_rate: profileRow.hourly_rate,
    experience_years: profileRow.experience_years,
    location: profileRow.location,
    availability: profileRow.availability,
    portfolio_url: profileRow.portfolio_url,
    birth_year: profileRow.birth_year,
    is_top_rated: profileRow.is_top_rated,
    is_remote: profileRow.is_remote,
    created_at: profileRow.created_at,
    is_verified: Boolean(profileRow.is_verified),
  };

  // 2. Fetch detailed worker skills
  const { data: skillsRows } = await supabase
    .from("worker_skills")
    .select("*")
    .eq("worker_id", workerId)
    .order("proficiency", { ascending: false });

  const skills: WorkerSkillDetailed[] = (skillsRows || []).map(row => ({
    id: row.id,
    worker_id: row.worker_id,
    skill_name: row.skill_name,
    proficiency: row.proficiency,
    category: row.category,
    experience_duration: row.experience_duration,
    proficiency_label: row.proficiency_label,
  }));

  // 3. Fetch portfolio projects
  const { data: projectsRows } = await supabase
    .from("worker_projects")
    .select("*")
    .eq("worker_id", workerId)
    .order("year", { ascending: false });

  const projects: WorkerProject[] = (projectsRows || []).map(row => ({
    id: row.id,
    worker_id: row.worker_id,
    title: row.title,
    role: row.role,
    year: row.year,
    description: row.description,
  }));

  // 4. Fetch employer testimonials linked to company profiles (Marketplace Join)
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
          last_name,
          avatar_url
        )
      )
    `)
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  const testimonials: EmployerTestimonial[] = (testimonialsRows || []).map((row: any) => {
    const comp = row.employer;
    const prof = comp?.profile;

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
      employer_last_name: prof?.last_name || null,
      employer_role: "Hiring Manager",
    };
  });

  // Calculate review aggregation
  const reviewCount = testimonials.length;
  const averageRating = reviewCount > 0
    ? Number((testimonials.reduce((sum, t) => sum + t.rating, 0) / reviewCount).toFixed(1))
    : 0.0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <WorkerPageShell width="wide" className="py-4">
        <WorkerBreadcrumb
          items={[
            { label: "Dashboard", href: "/worker/dashboard" },
            { label: isOwner ? "My profile" : "Profile" },
          ]}
        />
      </WorkerPageShell>
      
      {/* Decorative top header banner */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-[#0a4a29] to-[#006e2f] select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute -left-1/4 -top-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Main asymmetric grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2/3 width) - About, Skills, Projects, Testimonials */}
        <div className="lg:col-span-2 space-y-8 pt-8 lg:pt-12 order-2 lg:order-1">
          
          {/* About Me Section */}
          <AboutSection bio={profile.bio} />

          {/* Top Skills Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
                  <Award size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  Top Skills
                </h3>
              </div>
              {isOwner && (
                <Link
                  href="/worker/skills/edit"
                  className="text-xs font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
                >
                  Manage Skills
                </Link>
              )}
            </div>

            {skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill) => (
                  <SkillProgressBar key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 font-semibold text-sm italic">
                No skills listed yet. Add skills to showcase your proficiency.
              </div>
            )}
          </div>

          {/* Project Highlights Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
                  <Briefcase size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  Project Highlights
                </h3>
              </div>
              {isOwner && (
                <Link
                  href="/worker/profile/edit"
                  className="text-xs font-bold text-[#006e2f] hover:text-[#005321] flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  Add Project
                </Link>
              )}
            </div>

            {projects.length > 0 ? (
              <div className="space-y-6 divide-y divide-slate-100">
                {projects.map((project, idx) => (
                  <div key={project.id} className={idx > 0 ? "pt-6" : ""}>
                    <ProjectHighlightItem project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 font-semibold text-sm italic">
                No projects showcased yet. Click Add Project to showcase your portfolio.
              </div>
            )}
          </div>

          {/* Testimonial Gallery Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
                  <Star size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  Employer Testimonial Gallery
                </h3>
              </div>

              {reviewCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Star size={14} className="text-[#006e2f] fill-[#006e2f]" />
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-slate-400">({reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 font-semibold text-sm italic">
                No testimonials yet. Feedback from employer partners will display here.
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1/3 width) - Sidebar Overlap */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <ProfileSidebar profile={profile} isOwner={isOwner} />
        </div>

      </div>
    </div>
  );
}
