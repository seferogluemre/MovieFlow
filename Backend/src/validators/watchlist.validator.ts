import { z } from "zod";

export const createWatchlistSchema = z.object({
  movieId: z.number().int().positive(),
});

export const updateWatchlistSchema = z.object({
  movieId: z.number().int().positive().optional(),
});

export type CreateWatchlistInput = z.infer<typeof createWatchlistSchema>;
export type UpdateWatchlistInput = z.infer<typeof updateWatchlistSchema>;
