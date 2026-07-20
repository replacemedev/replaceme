export interface PublicCompanyListing {
  id: string;
  employerId: string;
  companyName: string;
  industry: string | null;
  companySize: string | null;
  logoUrl: string | null;
  companyBio: string | null;
  websiteUrl: string | null;
  activeJobCount: number;
}

export interface PublicJobListing {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  employmentType: string;
  location: string;
  monthlySalary: number;
  hoursPerWeek: number;
  hourlyRate: number;
  skills: string[];
  createdAt: string;
  description: string | null;
}

export interface HelpArticleLink {
  href: string;
  title: string;
  description: string;
}
