import { IDS } from "../manifest.mjs";
import { upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

export async function seedJobs(supabase, ctx) {
  console.log("[seed:e2e] jobs — 8 posts across tier personas");

  const base = {
    employment_type: "Full-time",
    description:
      "E2E fixture job post for pricing-tier Playwright scenarios. Remote-first role with structured hiring pipeline.",
    monthly_salary: 3200,
    hours_per_week: 40,
    skills: ["React", "TypeScript"],
    location: "Remote",
    clicks_count: 12,
    views_count: 48,
    updated_at: now,
  };

  const rows = [
    {
      id: IDS.jobs.discoveryPending,
      employer_id: IDS.users.employerDiscovery,
      title: "Discovery — Virtual Assistant (Pending Review)",
      status: "Pending Review",
      priority_score: 0,
      is_premium_path: false,
      submitted_for_review_at: now,
      visible_applicant_count: 10,
      ...base,
    },
    {
      id: IDS.jobs.starterActive1,
      employer_id: IDS.users.employerStarter,
      title: "Starter — Senior React Developer",
      status: "Active",
      priority_score: 0,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 3,
      ...base,
    },
    {
      id: IDS.jobs.starterActive2,
      employer_id: IDS.users.employerStarter,
      title: "Starter — Customer Success Lead",
      status: "Active",
      priority_score: 0,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 2,
      ...base,
      monthly_salary: 2800,
    },
    {
      id: IDS.jobs.growthPriority,
      employer_id: IDS.users.employerGrowth,
      title: "Growth — Full-Stack Engineer (Priority Listing)",
      status: "Active",
      priority_score: 100,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 35,
      ...base,
      skills: ["Node.js", "React", "PostgreSQL"],
    },
    {
      id: IDS.jobs.scale1,
      employer_id: IDS.users.employerScale,
      title: "Scale — Engineering Manager",
      status: "Active",
      priority_score: 100,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 8,
      ...base,
    },
    {
      id: IDS.jobs.scale2,
      employer_id: IDS.users.employerScale,
      title: "Scale — DevOps Specialist",
      status: "Active",
      priority_score: 100,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 6,
      ...base,
      skills: ["AWS", "Terraform", "CI/CD"],
    },
    {
      id: IDS.jobs.scale3,
      employer_id: IDS.users.employerScale,
      title: "Scale — Product Designer",
      status: "Active",
      priority_score: 100,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 4,
      ...base,
      skills: ["Figma", "UX"],
    },
    {
      id: IDS.jobs.scale4,
      employer_id: IDS.users.employerScale,
      title: "Scale — Data Analyst",
      status: "Active",
      priority_score: 100,
      is_premium_path: false,
      approved_at: now,
      visible_applicant_count: 5,
      ...base,
      skills: ["SQL", "Python"],
    },
  ];

  await upsertRows(supabase, "jobs", rows);
  ctx.jobIds = IDS.jobs;
}
