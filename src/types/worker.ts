export interface WorkerSkill {
  id: string;
  worker_id: string;
  skill_name: string;
  proficiency: number;
}

export interface EarningsMonth {
  id: string;
  worker_id: string;
  month_name: string;
  amount: number;
  is_highlighted: boolean;
}

export interface RecommendedJob {
  id: string;
  employer_id: string;
  title: string;
  employment_type: string;
  monthly_salary: number;
  salary_currency?: string | null;
  hours_per_week: number;
  skills: string[];
  company_name: string;
  logo_url: string | null;
  match_score?: number;
}

export interface WorkerStats {
  applied_count: number;
  interviews_count: number;
  hired_count: number;
  profile_strength: number; // e.g. 78
}

export interface WorkerDashboardData {
  stats: WorkerStats;
  recommendedJobs: RecommendedJob[];
  skills: WorkerSkill[];
  earnings: EarningsMonth[];
}

export interface RecentMessage {
  thread_id: string;
  latest_message: string | null;
  latest_message_time: string | null;
  sender_id: string | null;
  other_first_name: string | null;
  other_last_name: string | null;
  other_avatar_url: string | null;
  other_company_name: string | null;
  other_company_logo: string | null;
}

