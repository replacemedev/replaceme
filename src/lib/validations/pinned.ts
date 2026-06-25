import { z } from "zod";
import { uuidSchema } from "./common";

export const togglePinSchema = z.object({
  workerId: uuidSchema,
});
