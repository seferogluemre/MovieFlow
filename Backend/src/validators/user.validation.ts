import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";

export const createUserSchema = BaseSchema.extend({
    email: z.string().email('Please Enter a valid email address'),
    username: z.string().min(2),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
    isAdmin: z.boolean(),
})






export type CreateUserType = z.infer<typeof createUserSchema>;