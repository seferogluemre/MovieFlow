import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createMovieActorSchema = BaseSchema.extend({
  movieId: z.number().int().positive(),
  actorId: z.number().int().positive(),
  role: z.string().min(1, "Role must be at least 1 character"),
});

export const updateMovieActorSchema = BaseSchema.extend({
  role: z.string().min(1, "Role must be at least 1 character").optional(),
});

export type CreateMovieActorType = z.infer<typeof createMovieActorSchema>;
export type UpdateMovieActorType = z.infer<typeof updateMovieActorSchema>;
