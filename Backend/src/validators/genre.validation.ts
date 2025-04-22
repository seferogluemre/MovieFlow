import { BaseSchema } from "@validators/base.schema";
import { z } from "zod";

export const createGenreSchema = BaseSchema.extend({
  name: z.string().min(3, "Genre name must be at least 3 characters"),
});

export const updateGenreSchema = BaseSchema.extend({
  name: z
    .string()
    .min(3, "Genre name must be at least 3 characters")
    .optional(),
});

export type CreateGenreType = z.infer<typeof createGenreSchema>;
export type UpdateGenreType = z.infer<typeof updateGenreSchema>;
