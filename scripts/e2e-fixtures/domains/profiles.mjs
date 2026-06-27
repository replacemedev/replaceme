import { IDS, PERSONAS } from "../manifest.mjs";
import { upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

export async function seedProfiles(supabase, ctx) {
  console.log("[seed:e2e] profiles — workers, employers, companies, admins");

  const workerProfiles = PERSONAS.workers.map((w) => ({
    id: w.id,
    role: "worker",
    email: w.email,
    username: w.username,
    first_name: w.firstName,
    last_name: w.lastName,
    professional_title: w.title,
    location: w.location,
    bio: `E2E fixture worker — ${w.title}.`,
    experience_years: w.experienceYears,
    expected_salary_min: w.salaryMin,
    expected_salary_max: w.salaryMax,
    salary_currency: "USD",
    skills: w.skills,
    is_verified: w.verification === "approved",
    verification_status: w.verification,
    account_status: "active",
    profile_visibility: "public",
    onboarding_completed_at: now,
    updated_at: now,
  }));

  const fillerProfiles = PERSONAS.fillerWorkers.map((f) => ({
    id: f.id,
    role: "worker",
    email: `e2e-filler-${f.suffix}@replaceme.test`,
    username: `e2e_filler_${f.suffix}`,
    first_name: "Filler",
    last_name: `Applicant ${f.suffix}`,
    professional_title: "Remote Specialist",
    location: "Remote",
    experience_years: 3,
    expected_salary_min: 2000,
    expected_salary_max: 2600,
    salary_currency: "USD",
    skills: ["Remote Work"],
    verification_status: "unverified",
    account_status: "active",
    profile_visibility: "public",
    onboarding_completed_at: now,
    updated_at: now,
  }));

  const employerProfiles = PERSONAS.employers.map((e) => ({
    id: e.id,
    role: "employer",
    email: e.email,
    username: e.username,
    first_name: e.companyName,
    last_name: "E2E",
    skills: ["Hiring", "Remote Teams"],
    salary_currency: "USD",
    verification_status: "unverified",
    account_status: "active",
    profile_visibility: "public",
    onboarding_completed_at: now,
    updated_at: now,
  }));

  const adminProfiles = PERSONAS.admins.map((a) => ({
    id: a.id,
    role: "admin",
    email: a.email,
    username: a.username,
    first_name: a.firstName,
    last_name: a.lastName,
    salary_currency: "USD",
    verification_status: "unverified",
    account_status: "active",
    profile_visibility: "public",
    onboarding_completed_at: now,
    updated_at: now,
  }));

  await upsertRows(supabase, "profiles", [
    ...workerProfiles,
    ...fillerProfiles,
    ...employerProfiles,
    ...adminProfiles,
  ]);

  const companies = PERSONAS.employers.map((e) => ({
    id: e.companyId,
    employer_id: e.id,
    company_name: e.companyName,
    industry: e.industry,
    company_size: "11–50 employees",
    company_verification_status: "verified",
    company_bio: `${e.companyName} — E2E employer on ${e.planSlug} plan.`,
    website_url: `https://${e.username}.example.com`,
    verified_at: now,
    updated_at: now,
  }));

  await upsertRows(supabase, "company_profiles", companies);

  const adminProfilesRows = PERSONAS.admins.map((a) => ({
    user_id: a.id,
    admin_role: a.adminRole,
    display_name: a.displayName,
    department: "Platform Operations",
    updated_at: now,
  }));

  await upsertRows(supabase, "admin_profiles", adminProfilesRows, "user_id");

  ctx.companies = Object.fromEntries(
    PERSONAS.employers.map((e) => [e.planSlug, e.companyId])
  );
}
