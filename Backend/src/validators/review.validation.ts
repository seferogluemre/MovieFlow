import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createReviewSchema = BaseSchema.extend({
  content: z.string().min(10, "Review content must be at least 10 characters"),
  movieId: z.number(),
});

export const updateReviewSchema = BaseSchema.extend({
  content: z
    .string()
    .min(10, "Review content must be at least 10 characters")
    .optional(),
});

export type CreateReviewType = z.infer<typeof createReviewSchema>;
export type UpdateReviewType = z.infer<typeof updateReviewSchema>;
