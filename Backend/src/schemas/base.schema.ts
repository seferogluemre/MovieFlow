import { z } from "zod";

export const BaseSchema = z.object({
  id: z.number().int().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
