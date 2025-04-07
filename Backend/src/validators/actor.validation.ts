import { AgeRating } from "@prisma/client";
import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createActorSchema = BaseSchema.extend({
  name: z.string().min(3, "Actor Name must be at least 3 characters"),
  biography: z
    .string()
    .min(10, "Actor biography must be at least 10 characters")
    .optional(),
  birthYear: z.number().min(1000).max(9999).optional(),
  nationality: z.string().min(3).optional(),
  photo: z.string().optional(),
});

export const updateActorSchema = BaseSchema.extend({
  name: z
    .string()
    .min(3, "Actor Name must be at least 3 characters")
    .optional(),
  biography: z
    .string()
    .min(10, "Actor biography must be at least 10 characters")
    .optional(),
  birthYear: z.number().min(1000).max(9999).optional(),
  nationality: z.string().min(3).optional(),
  photo: z.string().optional(),
});

export type CreateActorType = z.infer<typeof createActorSchema>;
export type UpdateActorType = z.infer<typeof updateActorSchema>;
