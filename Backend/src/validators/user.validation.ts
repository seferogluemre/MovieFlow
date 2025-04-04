import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createUserSchema = BaseSchema.extend({
    email: z.string().email('Please Enter a valid email address'),
    username: z.string().min(2),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
    isAdmin: z.boolean(),
})

export const updateUserSchema = BaseSchema.extend({
    email: z.string().min(6).email('Please Enter a valid email address').optional(),
    username: z.string().min(2, 'Username must be at least 6 characters').optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    name: z.string().min(2, 'Name must be at least 6 characters').optional(),
})



export type CreateUserType = z.infer<typeof createUserSchema>;
export type UpdateUserType = z.infer<typeof updateUserSchema>;