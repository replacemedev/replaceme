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
