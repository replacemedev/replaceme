export interface WorkerProfile {
  id: string;
  first_name: string | null;
  middle_name?: string | null;
  last_name: string | null;
  suffix?: string | null;
  gender?: string | null;
  spoken_languages?: string[] | null;
  tin_number?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  id_expiration_date?: string | null;
  id_issuing_country?: string | null;
  full_name: string | null;
  professional_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  hourly_rate: number | null;
  salary_currency: string | null;
  experience_years: number | null;
  location: string | null;
  region?: string | null;
  province?: string | null;
  city?: string | null;
  address_line_1?: string | null;
  availability: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  cv_url: string | null;
  birth_date: string | null;
  is_top_rated: boolean | null;
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

export interface JobExperience {
  id: string;
  worker_id: string;
  company_name: string;
  role_title: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills_used: string[];
}

/** @deprecated Use JobExperience — field names changed (company_name, role_title, start_date, end_date). */
export type WorkerProject = JobExperience;

export interface EmployerTestimonial {
  id: string;
  worker_id: string;
  employer_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  company_name: string;
  company_logo: string | null;
  employer_first_name: string | null;
  employer_last_name: string | null;
  employer_role: string | null;
}
