import { IDS } from "../manifest.mjs";
import { upsertRows } from "../shared.mjs";

const SKILL_IDS = {
  mayaReact: "e5300001-0001-4001-8001-000000000001",
  mayaTs: "e5300001-0001-4001-8001-000000000002",
  mayaNext: "e5300001-0001-4001-8001-000000000003",
  jamesNode: "e5300001-0001-4001-8001-000000000004",
  jamesPg: "e5300001-0001-4001-8001-000000000005",
  jamesReact: "e5300001-0001-4001-8001-000000000006",
  sofiaFigma: "e5300001-0001-4001-8001-000000000007",
  sofiaUx: "e5300001-0001-4001-8001-000000000008",
  sofiaDs: "e5300001-0001-4001-8001-000000000009",
};

export async function seedWorkerExtras(supabase) {
  console.log("[seed:e2e] worker — skills, projects, saved jobs, alerts, earnings, verification");

  const skills = [
    {
      id: SKILL_IDS.mayaReact,
      worker_id: IDS.users.worker1,
      skill_name: "React",
      proficiency: 92,
      proficiency_label: "Expert",
      verified: true,
      category: "Engineering",
    },
    {
      id: SKILL_IDS.mayaTs,
      worker_id: IDS.users.worker1,
      skill_name: "TypeScript",
      proficiency: 88,
      proficiency_label: "Advanced",
      verified: true,
      category: "Engineering",
    },
    {
      id: SKILL_IDS.mayaNext,
      worker_id: IDS.users.worker1,
      skill_name: "Next.js",
      proficiency: 85,
      proficiency_label: "Advanced",
      verified: true,
      category: "Engineering",
    },
    {
      id: SKILL_IDS.jamesNode,
      worker_id: IDS.users.worker2,
      skill_name: "Node.js",
      proficiency: 90,
      proficiency_label: "Expert",
      verified: true,
      category: "Engineering",
    },
    {
      id: SKILL_IDS.jamesPg,
      worker_id: IDS.users.worker2,
      skill_name: "PostgreSQL",
      proficiency: 84,
      proficiency_label: "Advanced",
      verified: true,
      category: "Engineering",
    },
    {
      id: SKILL_IDS.jamesReact,
      worker_id: IDS.users.worker2,
      skill_name: "React",
      proficiency: 82,
      proficiency_label: "Advanced",
      verified: true,
      category: "Engineering",
    },
    {
      id: SKILL_IDS.sofiaFigma,
      worker_id: IDS.users.worker3,
      skill_name: "Figma",
      proficiency: 91,
      proficiency_label: "Expert",
      verified: false,
      category: "Design",
    },
    {
      id: SKILL_IDS.sofiaUx,
      worker_id: IDS.users.worker3,
      skill_name: "UX Research",
      proficiency: 86,
      proficiency_label: "Advanced",
      verified: false,
      category: "Design",
    },
    {
      id: SKILL_IDS.sofiaDs,
      worker_id: IDS.users.worker3,
      skill_name: "Design Systems",
      proficiency: 83,
      proficiency_label: "Advanced",
      verified: false,
      category: "Design",
    },
  ];

  await upsertRows(supabase, "worker_skills", skills);

  await upsertRows(supabase, "worker_projects", [
    {
      id: "e5400001-0001-4001-8001-000000000001",
      worker_id: IDS.users.worker1,
      title: "Marketplace Dashboard",
      role: "Lead Frontend Engineer",
      description: "Built a multi-role SaaS dashboard with Next.js and Supabase.",
      year: 2024,
    },
    {
      id: "e5400001-0001-4001-8001-000000000002",
      worker_id: IDS.users.worker2,
      title: "Payments Platform",
      role: "Full-Stack Developer",
      description: "Stripe subscriptions and webhook idempotency layer.",
      year: 2023,
    },
    {
      id: "e5400001-0001-4001-8001-000000000003",
      worker_id: IDS.users.worker3,
      title: "Design System",
      role: "Product Designer",
      description: "Component library for a remote hiring product.",
      year: 2024,
    },
  ]);

  await upsertRows(supabase, "worker_saved_jobs", [
    {
      id: "e5600001-0001-4001-8001-000000000001",
      worker_id: IDS.users.worker1,
      job_id: IDS.jobs.growthPriority,
      created_at: new Date().toISOString(),
    },
    {
      id: "e5600001-0001-4001-8001-000000000002",
      worker_id: IDS.users.worker2,
      job_id: IDS.jobs.starterActive1,
      created_at: new Date().toISOString(),
    },
    {
      id: "e5600001-0001-4001-8001-000000000003",
      worker_id: IDS.users.worker3,
      job_id: IDS.jobs.discoveryPending,
      created_at: new Date().toISOString(),
    },
  ]);

  await upsertRows(supabase, "worker_job_alerts", [
    {
      id: "e5700001-0001-4001-8001-000000000001",
      worker_id: IDS.users.worker1,
      label: "Senior React Remote",
      search_query: "react typescript remote",
      frequency: "daily",
      is_active: true,
    },
    {
      id: "e5700001-0001-4001-8001-000000000002",
      worker_id: IDS.users.worker2,
      label: "Full-Stack Fintech",
      search_query: "node react fintech",
      frequency: "weekly",
      is_active: true,
    },
  ]);

  await upsertRows(supabase, "earnings_overview", [
    {
      id: "e5800001-0001-4001-8001-000000000001",
      worker_id: IDS.users.worker1,
      month_name: "May 2026",
      amount: 3200,
      is_highlighted: true,
    },
    {
      id: "e5800001-0001-4001-8001-000000000002",
      worker_id: IDS.users.worker2,
      month_name: "May 2026",
      amount: 2800,
      is_highlighted: false,
    },
  ]);

  await upsertRows(supabase, "verification_documents", [
    {
      id: "e5900001-0001-4001-8001-000000000001",
      worker_id: IDS.users.worker1,
      document_type: "id_front",
      file_name: "maya-chen-id-front.pdf",
      file_size_bytes: 245_000,
      mime_type: "application/pdf",
      storage_path: "e2e/verification/maya-chen-id-front.pdf",
    },
    {
      id: "e5900001-0001-4001-8001-000000000002",
      worker_id: IDS.users.worker3,
      document_type: "id_front",
      file_name: "sofia-rivera-id-front.pdf",
      file_size_bytes: 198_000,
      mime_type: "application/pdf",
      storage_path: "e2e/verification/sofia-rivera-id-front.pdf",
    },
  ]);
}
