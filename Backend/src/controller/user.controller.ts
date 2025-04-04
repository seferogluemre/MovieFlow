import { createUserSchema, updateUserSchema } from "src/validators/user.validation";
import { Request, Response } from "express";
import { z } from "zod";
import { UserService } from "src/services/user.services";
import { CreateUserProps, UpdateUserProps } from "src/types/types";


export class UserController {

    static async index(req: Request, res: Response): Promise<void> {
        try {
            const { isAdmin, username } = req.params;

            const users = await UserService.index({ isAdmin, username });

            if (users.length > 0) {
                res.status(200).json({
                    results: users
                })
            }
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while retrieving the user.',
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const user = createUserSchema.parse(req.body as CreateUserProps)

            const createdUser = UserService.create(user);

            res.status(201).json({
                status: "SUCCESS",
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

    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await UserService.get(Number(id));
            if (!user) {
                res.status(404).json({
                    "error": "User not found",
                    "message": "No user found with the provided identifier."
                }
                )
            }
            res.status(200).json({ data: user });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while retrieving the user.',
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = updateUserSchema.parse(req.body as UpdateUserProps)

            const updatedUser = await UserService.update(Number(id), user)

            res.status(200).json({
                status: "SUCCESS",
                data: user
            })
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    message: error.errors[0].message
                });
            }

            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while updating the user.',
            });
        }
    }

}