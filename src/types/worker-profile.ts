export interface WorkerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  professional_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  hourly_rate: number | null;
  experience_years: number | null;
  location: string | null;
  availability: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  cv_url: string | null;
  birth_year: number | null;
  is_top_rated: boolean | null;
  is_remote: boolean | null;
  created_at: string;
  is_verified?: boolean;
}

export interface WorkerSkillDetailed {
  id: string;
  worker_id: string;
  skill_name: string;
  proficiency: number;
  category: string | null;
  experience_duration: string | null;
  proficiency_label: string | null;
}

export interface WorkerProject {
  id: string;
  worker_id: string;
  title: string;
  role: string;
  year: number;
  description: string;
}

export interface EmployerTestimonial {
  id: string;
  worker_id: string;
  employer_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  // Joined fields from company_profiles and profiles
  company_name: string;
  company_logo: string | null;
  employer_first_name: string | null;
  employer_last_name: string | null;
  employer_role: string | null;
}
