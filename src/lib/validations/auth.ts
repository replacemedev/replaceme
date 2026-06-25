import * as z from "zod";

const termsSchema = z
  .boolean()
  .refine((value) => value === true, {
    message: "You must accept the terms and privacy policy",
  });

export const baseAuthSchema = {
  role: z.enum(["employer", "worker"]),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: termsSchema,
};

const passwordMatchRefine = {
  refine: (data: { password: string; confirmPassword: string }) =>
    data.password === data.confirmPassword,
  message: "Passwords do not match" as const,
  path: ["confirmPassword"] as const,
};

export const employerSignUpSchema = z
  .object({
    ...baseAuthSchema,
    companyName: z.string().min(2, "Company name is required"),
  })
  .refine(passwordMatchRefine.refine, {
    message: passwordMatchRefine.message,
    path: [...passwordMatchRefine.path],
  });

export const workerSignUpSchema = z
  .object({ ...baseAuthSchema })
  .refine(passwordMatchRefine.refine, {
    message: passwordMatchRefine.message,
    path: [...passwordMatchRefine.path],
  });

export type EmployerSignUpFormValues = z.infer<typeof employerSignUpSchema>;
export type WorkerSignUpFormValues = z.infer<typeof workerSignUpSchema>;
export type SignUpFormValues = EmployerSignUpFormValues | WorkerSignUpFormValues;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const loginCredentialsSchema = z
  .object({
    email: z.string().min(3, "Please enter a valid email or username"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .strict();

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export const loginSchema = loginCredentialsSchema;
export type LoginFormValues = LoginCredentials;
