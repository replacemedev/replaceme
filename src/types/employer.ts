export interface JobPost {
  id: string;
  title: string;
  created_at: string;
  applicants_count: number;
  hits_count: number; // mapped to views_count
  status: string;
}

export interface RecentApplicant {
  id: string;
  candidate_id: string;
  name: string;
  applied_role: string; // job title
  created_at: string;
  avatar_url: string | null;
  is_unlocked: boolean;
  job_id: string;
}
