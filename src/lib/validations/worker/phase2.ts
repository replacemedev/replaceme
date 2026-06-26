import { z } from "zod";

export const updateWorkerProfileSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    professionalTitle: z.string().min(2).max(120),
    bio: z.string().max(2000).optional(),
    location: z.string().max(120).optional(),
    portfolioUrl: z.string().url().optional().or(z.literal("")),
    resumeUrl: z.string().url().optional().or(z.literal("")),
    cvUrl: z.string().url().optional().or(z.literal("")),
  })
  .strict();

export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>;

export const updateWorkerSettingsSchema = z
  .object({
    availability: z.enum(["Full-time", "Part-time", "Contract", "Not available"]),
    hourlyRate: z.number().min(0).max(500),
    isRemote: z.boolean(),
  })
  .strict();

export const jobAlertSchema = z
  .object({
    label: z.string().min(2).max(80),
    searchQuery: z.string().min(2).max(200),
    frequency: z.enum(["instant", "daily", "weekly"]),
  })
  .strict();

export const reportEmployerSchema = z
  .object({
    title: z.string().min(5).max(120),
    description: z.string().min(10).max(2000),
    employerId: z.string().uuid().optional(),
    jobId: z.string().uuid().optional(),
  })
  .strict();

export const contractResponseSchema = z
  .object({
    contractId: z.string().uuid(),
    action: z.enum(["accept", "decline"]),
  })
  .strict();

export interface WorkerProjectRow {
  id: string;
  title: string;
  role: string;
  year: number;
  description: string;
}

export interface WorkerContractRow {
  id: string;
  employerId: string;
  companyName: string;
  jobTitle: string | null;
  hourlyRate: number;
  weeklyHours: number;
  status: string;
  startDate: string;
  employmentType: string;
}

export interface WorkerInterviewRow {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: string;
  status: string;
}

export interface SkillAssessmentRow {
  id: string;
  title: string;
  description: string | null;
  skillName: string;
  durationMinutes: number;
}

export interface WorkerJobAlertRow {
  id: string;
  label: string;
  searchQuery: string;
  frequency: string;
  isActive: boolean;
  createdAt: string;
}
