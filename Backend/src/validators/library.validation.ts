import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createLibrarySchema = BaseSchema.extend({
  movieId: z.number().int().positive(),
});

export const updateLibrarySchema = BaseSchema.extend({
  lastWatched: z.date().optional(),
});

export type CreateLibraryType = z.infer<typeof createLibrarySchema>;
export type UpdateLibraryType = z.infer<typeof updateLibrarySchema>;
