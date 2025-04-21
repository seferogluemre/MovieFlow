import { Request, Response } from "express";
import prisma from "src/config/database";
import { MovieService } from "src/services/movie.service";
import { logInfo, logWarn } from "src/utils/logging/logger.util";
import { getS3Url, upload, uploadToS3 } from "src/utils/s3-upload.util";
import { z } from "zod";

export class MovieController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const movies = await MovieService.getAll();

      logInfo(`List movies --- Request Received`);

      if (movies.length > 0) {
        res.status(200).json({
          results: movies,
        });
      } else {
        res.status(200).json({
          results: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      upload.single("poster")(req, res, async (err: any) => {
        if (err) {
          logWarn(`Create Movie - File upload error`);
          return res.status(500).json({
            message: "File upload error",
            error: err.message,
          });
        }

        const { file } = req;
        const body = req.body;

        let posterImage = null;

        if (file) {
          try {
            const s3Key = await uploadToS3(file, "posters");
            posterImage = getS3Url(s3Key);
          } catch (error) {
            return res.status(500).json({
              message: "S3 upload error",
              error: (error as Error).message,
            });
          }
        }

        const movieData = {
          ...body,
          posterImage,
        };

        const createdMovie = await MovieService.create(movieData);

        logInfo(`Create Movie - Created Movie${createdMovie}`);

        res.status(201).json({
          message: "Movie created successfully",
          data: createdMovie,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => {
          return {
            field: err.path.join("."),
            errors: err.message,
          };
        });

        res.status(400).json({
          message: "Validation Failed",
          errors: formattedErrors,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          message: "ID parameter is required",
        });
        return;
      }

      const movie = await MovieService.getById(Number(id));

      if (!movie) {
        res.status(404).json({
          message: "Movie not found",
        });
        return;
      }

      // Get similar movies based on genres
      const similarMovies = await MovieService.getSimilarMovies(Number(id));

      res.status(200).json({
        data: {
          ...movie,
          similarMovies,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the movie.",
      });
    }
  }

  static async getPicture(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user || !user.profileImage) {
        logWarn(`User Get Profile Image --- User or profile image not found`);
        res.status(404).send("User or profile image not found");
        return;
      }

      const imageUrl = getS3Url(user.profileImage);
      logInfo(`User Get Profile Image - Request Received`);

      res.json({ imageUrl });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving profile image");
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Get Movie --- Id Parameter is required`);

        res.status(404).json({
          message: "Id Parameter is required",
        });
      }

      const deletedMovie = await MovieService.delete(Number(id));

      logInfo(`Delete Movie - Deleted Movie ${deletedMovie}`);

      res.status(200).json({
        message: "Movie Deleted Successfully",
        data: deletedMovie,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the user.",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      upload.single("poster")(req, res, async (err: any) => {
        if (err) {
          logWarn(`Update Movie - File upload error`);
          return res.status(500).json({
            message: "File upload error",
            error: err.message,
          });
        }

        const { id } = req.params;
        const { file } = req;
        const body = req.body;

        if (!id) {
          res.status(400).json({
            message: "ID parameter is required",
          });
          return;
        }

        if (file) {
          try {
            const s3Key = await uploadToS3(file, "posters");
            body.posterImage = getS3Url(s3Key);
          } catch (error) {
            return res.status(500).json({
              message: "S3 upload error",
              error: (error as Error).message,
            });
          }
        }

        const updatedMovie = await MovieService.update(Number(id), body);

        logInfo(`Update Movie - Updated Movie ${updatedMovie}`);

        res.status(200).json({
          message: "Movie updated successfully",
          data: updatedMovie,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => {
          return {
            field: err.path.join("."),
            errors: err.message,
          };
        });

        res.status(400).json({
          message: "Validation Failed",
          errors: formattedErrors,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }
}
