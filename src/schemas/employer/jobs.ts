import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters").max(100, "Job title must be less than 100 characters"),
  employmentType: z.string().min(1, "Please select an employment type"),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  monthlySalary: z.number().min(100, "Monthly salary must be at least $100"),
  hoursPerWeek: z.number().min(1, "Hours per week must be at least 1").max(168, "Hours per week cannot exceed 168"),
  skills: z.array(z.string()).min(1, "Please select at least 1 skill").max(3, "You can select up to 3 skills"),
  notificationPreference: z.enum(["daily", "immediate"]),
  intent: z.enum(["standard", "premium"]),
}).strict(); // zero-trust strict payload validation

export type CreateJobInput = z.infer<typeof createJobSchema>;

export interface DropdownOption {
  label: string;
  value: string;
}
