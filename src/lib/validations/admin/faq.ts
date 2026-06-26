import { z } from "zod";

export const faqEntrySchema = z.object({
  id: z.string().min(1).max(64),
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
});

export const saveFaqPageSchema = z.object({
  slug: z.enum(["employer-faq", "worker-faq"]),
  title: z.string().min(1).max(200),
  items: z.array(faqEntrySchema).max(100),
  isPublished: z.boolean().optional(),
});
