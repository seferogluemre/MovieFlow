import { createUserSchema, updateUserSchema } from "src/validators/user.validation";
import { Request, Response } from "express";
import { z } from "zod";
import { UserService } from "src/services/user.service";
import { CreateUserProps, UpdateUserProps } from "src/types/types";
import { logInfo, logWarn } from "src/utils/logger.util";
import prisma from "src/config/database";
import path from 'path'


export class UserController {

    static async index(req: Request, res: Response): Promise<void> {
        try {
            const { isAdmin, username } = req.params;
            const users = await UserService.index({ isAdmin, username });
            logInfo(`List Users --- Request Received`)
            if (users.length > 0) {
                res.status(200).json({
                    results: users
                })
            } else {
                res.status(200).json({
                    results: []
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
            logInfo(`Create User --- Created User ${createdUser}`)

            res.status(201).json({
                status: "User Created Successfully",
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

            if (!id) {
                logWarn(`Get User --- Id Parameter is required`)
                res.status(404).json({
                    message: "Id Parameter is required"
                })
            }

            const user = await UserService.get(Number(id));
            if (!user) {
                logWarn(`Get User --- User not found`)
                res.status(404).json({
                    "error": "User not found",
                    "message": "No user found with the provided identifier."
                }
                )
            }
            logInfo(`Get User --- Request Received`)
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

            if (!id) {
                logWarn(`Get User --- Id Parameter is required`)
                res.status(404).json({
                    message: "Id parameter is required"
                })
            }

            const updatedUser = await UserService.update(Number(id), user)
            logInfo(`Update User - Updated User ${updatedUser}`)

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

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                logWarn(`Get User --- Id Parameter is required`)

                res.status(404).json({
                    message: "Id Parameter is required"
                })
            }

            const deletedUser = await UserService.delete(Number(id))

            logInfo(`Delete User - Deleted User ${deletedUser}`)

            res.status(200).json({
                message: "User Deleted Successfully",
                data: deletedUser
            })
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while deleting the user.',
            });
        }
    }

    static async upload(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { file } = req;

        if (!file) {
            logWarn(`User Upload Image --- No file uploaded`)
            res.status(400).send('No file uploaded');
        }

        try {
            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id) },
                data: { profileImage: file?.filename },
            });

            logInfo(`User Upload Image - Request Received`)

            res.status(200).send(`Profile image updated for user ${updatedUser.username}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating user profile image');
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });

            if (!user || !user.profileImage) {
                logWarn(`User Get Profile Image --- User or profile image not found`)
                res.status(404).send('User or profile image not found');
                return;
            }

            const imageUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/posters/${user.profileImage}`;
            logInfo(`User Get Profile Image - Request Received`);

            res.json({ imageUrl });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error retrieving profile image');
        }
    }
}