import { z } from "zod";

export const createWishlistSchema = z.object({
  movieId: z.number().int().positive(),
});

export const updateWishlistSchema = z.object({
  movieId: z.number().int().positive().optional(),
});

export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type UpdateWishlistInput = z.infer<typeof updateWishlistSchema>;
