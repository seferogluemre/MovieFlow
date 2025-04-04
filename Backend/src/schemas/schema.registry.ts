import { z } from "zod";

export const userCreateSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(2),
    name: z.string().min(2),
    isAdmin: z.boolean(),
});