import { AgeRating } from "@prisma/client";
import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createActorSchema = BaseSchema.extend({
    name: z.string().min(3, "Actor Name must be at least 3 characters"),
    biography: z.string().min(10, "Actor biography must be at least 10 characters").optional(),
    birthYear: z.number().min(1000).max(9999).optional(),
    nationality: z.string().min(3).optional(),
    actorImage: z.string().optional(),
});

export const updateActorSchema = BaseSchema.extend({
    title: z
        .string()
        .min(3, "Movie Title must be at least 3 characters")
        .optional(),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .optional(),
    releaseYear: z.number().min(1000).max(9999).optional(),
    duration: z.number().min(5).max(300).optional(),
    posterImage: z.string().optional(),
    director: z
        .string()
        .min(3, "Director's name must be at least 3 characters")
        .optional(),
    ageRating: z
        .enum([
            AgeRating.GENERAL,
            AgeRating.PARENTAL_GUIDANCE,
            AgeRating.TEEN,
            AgeRating.MATURE,
            AgeRating.ADULT,
        ])
        .optional(),
});

export type CreateActorType = z.infer<typeof createActorSchema>;
export type UpdateActorType = z.infer<typeof updateActorSchema>;