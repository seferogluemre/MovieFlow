import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createRatingSchema = BaseSchema.extend({
  score: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  movieId: z.number(),
});

export const updateRatingSchema = BaseSchema.extend({
  score: z.number().min(1).max(5, "Rating must be between 1 and 5").optional(),
});

export type CreateRatingType = z.infer<typeof createRatingSchema>;
export type UpdateRatingType = z.infer<typeof updateRatingSchema>;
