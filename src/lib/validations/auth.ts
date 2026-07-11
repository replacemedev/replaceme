import * as z from "zod";

const termsSchema = z
  .boolean()
  .refine((value) => value === true, {
    message: "You must accept the terms and privacy policy",
  });

const signUpSharedFields = {
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  firstName: z.string().min(1, "First name is required").max(80),
  middleName: z.string().max(80).optional(),
  lastName: z.string().min(1, "Last name is required").max(80),
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

export const baseAuthSchema = {
  role: z.enum(["employer", "worker"]),
  ...signUpSharedFields,
};

export const workerSignUpSchema = z
  .object({
    role: z.literal("worker"),
    ...signUpSharedFields,
    turnstileToken: z.string().optional(),
  })
  .refine(passwordMatchRefine.refine, {
    message: passwordMatchRefine.message,
    path: [...passwordMatchRefine.path],
  });

export const employerSignUpSchema = z
  .object({
    role: z.literal("employer"),
    ...signUpSharedFields,
    turnstileToken: z.string().optional(),
  })
  .refine(passwordMatchRefine.refine, {
    message: passwordMatchRefine.message,
    path: [...passwordMatchRefine.path],
  });

export type WorkerSignUpFormValues = z.infer<typeof workerSignUpSchema>;
export type EmployerSignUpFormValues = z.infer<typeof employerSignUpSchema>;
export type SignUpFormValues = WorkerSignUpFormValues | EmployerSignUpFormValues;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  turnstileToken: z.string().optional(),
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
    turnstileToken: z.string().optional(),
    callbackUrl: z.string().optional(),
  })
  .strict();

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export const loginSchema = loginCredentialsSchema;
export type LoginFormValues = LoginCredentials;
