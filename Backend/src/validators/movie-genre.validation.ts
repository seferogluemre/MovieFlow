import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createMovieGenreSchema = BaseSchema.extend({
  movieId: z.number().int().positive(),
  genreId: z.number().int().positive(),
});

export type CreateMovieGenreType = z.infer<typeof createMovieGenreSchema>;
