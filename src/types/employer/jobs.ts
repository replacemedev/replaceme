export interface JobPerformance {
  totalViews: number;
  viewsTrend: string; // e.g. "+12%"
  totalApplications: number;
  visibleApplications: number;
  hiddenApplications: number;
  applicationsTrend: string; // e.g. "+5%"
  shortlistedCount: number;
}

export interface HiringTeamMember {
  name: string;
  role: string;
  avatarUrl: string | null;
  email: string;
}

export interface JobDetails {
  id: string;
  title: string;
  status: "Active" | "Closed" | "Pending Review";
  location: string;
  employmentType: string;
  monthlySalary: number;
  hoursPerWeek: number;
  description: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  experienceAndEducation: string[];
  performance: JobPerformance;
  hiringTeam: HiringTeamMember;
  priorityScore: number;
}
