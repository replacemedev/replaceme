import * as z from "zod";

export const baseAuthSchema = {
  role: z.enum(["employer", "worker"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and privacy policy",
  }),
};

export const employerSignUpSchema = z.object({
  ...baseAuthSchema,
  companyName: z.string().min(2, "Company name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const workerSignUpSchema = z.object(baseAuthSchema).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type EmployerSignUpFormValues = z.infer<typeof employerSignUpSchema>;
export type WorkerSignUpFormValues = z.infer<typeof workerSignUpSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  role: z.enum(["employer", "worker"]).optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
