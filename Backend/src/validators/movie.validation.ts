import { AgeRating } from "@prisma/client";
import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createMovieSchema = BaseSchema.extend({
    title: z.string().min(3, "Movie Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    releaseYear: z.number().min(1000).max(9999),
    duration: z.number().min(5).max(300).optional(),
    posterImage: z.string().optional(),
    director: z.string(),
    ageRating: z.enum([AgeRating.GENERAL, AgeRating.PARENTAL_GUIDANCE, AgeRating.TEEN, AgeRating.MATURE, AgeRating.ADULT]).default(AgeRating.GENERAL),
})

export const updateMovieSchema = BaseSchema.extend({
    title: z.string().min(3, "Movie Title must be at least 3 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    releaseYear: z.number().min(1000).max(9999).optional(),
    duration: z.number().min(5).max(300).optional(),
    posterImage: z.string().optional(),
    director: z.string().min(3, "Director's name must be at least 3 characters").optional(),
    ageRating: z.enum([AgeRating.GENERAL, AgeRating.PARENTAL_GUIDANCE, AgeRating.TEEN, AgeRating.MATURE, AgeRating.ADULT]).optional(),
});


export type CreateMovieType = z.infer<typeof createMovieSchema>;
export type UpdateMovieType = z.infer<typeof updateMovieSchema>;