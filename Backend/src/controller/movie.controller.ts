import { z } from "zod";
import { Request, Response } from "express";
import multer from "multer";
import { MovieService } from "src/services/movie.service";
import { storage, postersStorage } from 'src/config/multer';
import { logInfo, logWarn } from "src/utils/logger.util";
import prisma from "src/config/database";

const uploadGeneral = multer({ storage }).single('file');
const uploadPoster = multer({ storage: postersStorage }).single('poster');

export class MovieController {
    static async index(req: Request, res: Response): Promise<void> {
        try {
            const movies = await MovieService.index();

            logInfo(`List movies --- Request Received`)

            if (movies.length > 0) {
                res.status(200).json({
                    results: movies
                })
            } else {
                res.status(200).json({
                    results: []
                })
            }
        } catch (error) {
            res.status(500).json({
                message: 'Internal server error',
                error: (error as Error).message,
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const upload = req.file ? uploadGeneral : uploadPoster;

            upload(req, res, async (err: any) => {
                if (err) {
                    logWarn(`Create Movie - File upload error`)
                    return res.status(500).json({
                        message: 'File upload error',
                        error: err.message,
                    });
                }

                const { file } = req;
                const body = req.body;

                const posterImage = file ? file.filename : null;

                const movieData = {
                    ...body,
                    posterImage,
                };

                const createdMovie = await MovieService.create(movieData);

                logInfo(`Create Movie - Created Movie${createdMovie}`)

                res.status(201).json({
                    message: 'Movie created successfully',
                    data: createdMovie
                });
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
                res.status(400).json({
                    message: "ID parameter is required"
                });
                return;
            }

            const movie = await MovieService.get(Number(id));

            if (!movie) {
                res.status(404).json({
                    message: "Movie not found"
                });
                return;
            }

            res.status(200).json({
                data: {
                    ...movie,
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while retrieving the movie.'
            });
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // id parametresini almak
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });

            if (!user || !user.profileImage) {
                logWarn(`User Get Profile Image --- User or profile image not found`)
                res.status(404).send('User or profile image not found');
                return;
            }

            const imageUrl = `http://localhost:3000/uploads/posters/${user.profileImage}`;
            logInfo(`User Get Profile Image - Request Received`);

            res.json({ imageUrl });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error retrieving profile image');
        }
    }

}