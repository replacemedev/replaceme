import * as z from "zod";

export const loginCredentialsSchema = z
  .object({
    email: z.string().min(3, "Please enter a valid email or username"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .strict();

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
