import { z } from "zod";
import { basePathSchema, messageContentSchema, uuidSchema } from "./common";

export const sendMessageSchema = z.object({
  threadId: uuidSchema,
  content: messageContentSchema,
  basePath: basePathSchema,
});

export const threadActionSchema = z.object({
  threadId: uuidSchema,
  basePath: basePathSchema,
});

export const togglePinSchema = threadActionSchema.extend({
  isPinned: z.boolean(),
});

export const threadIdSchema = z.object({
  threadId: uuidSchema,
});

export const loadOlderMessagesSchema = z.object({
  threadId: uuidSchema,
  before: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
});

export const loadMoreThreadsSchema = z.object({
  role: z.enum(["worker", "employer"]),
  offset: z.number().int().min(0).max(10_000),
  limit: z.number().int().min(1).max(50).optional(),
});

export const ensureMessagingThreadSchema = z
  .object({
    jobId: uuidSchema,
    candidateId: uuidSchema,
  })
  .strict();
