import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid ID format.");

export const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, "This field is required.");

export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(5000, "Message is too long.");

export const basePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (p) => p.startsWith("/worker") || p.startsWith("/employer"),
    "Invalid messaging base path."
  );
