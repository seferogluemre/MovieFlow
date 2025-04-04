import { userCreateSchema } from "src/schemas/schema.registry";
import { createUserSchema, CreateUserType } from "src/validators/user.validation";
import { Request, Response } from "express";
import { unknown, z, ZodError } from "zod";
import { UserService } from "src/services/user.services";


export class UserController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const user = createUserSchema.parse(req.body as CreateUserType)

            const createdUser = UserService.create(user);

            res.status(200).json({
                message: "User Created Successfully",
                data: user
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.errors.map((err) => {
                    return {
                        field: err.path.join('.'),
                        errors: err.message
                    }
                })

                res.status(400).json({
                    message: "Validation Failed",
                    errors: formattedErrors
                })
            }
            res.status(500).json({
                message: 'Internal server error',
                error: (error as Error).message,
            });
        }
    }
}