import { Request, Response } from "express";
import { GenreService } from "src/services/genre.service";
import { logInfo, logWarn } from "src/utils/logging/logger.util";
import {
  createGenreSchema,
  updateGenreSchema,
} from "src/validators/genre.validation";
import { z } from "zod";
export class GenreController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const genres = await GenreService.getAll();
      logInfo(`List Genres --- Request Received`);

      if (genres.length > 0) {
        res.status(200).json({
          results: genres,
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

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Get Genre --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const genre = await GenreService.getById(Number(id));
      if (!genre) {
        logWarn(`Get Genre --- Genre not found`);
        res.status(404).json({
          error: "Genre not found",
          message: "No genre found with the provided identifier.",
        });
        return;
      }

      logInfo(`Get Genre --- Request Received`);
      res.status(200).json({ data: genre });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the genre.",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const genre = createGenreSchema.parse(req.body);
      const createdGenre = await GenreService.create(genre);
      logInfo(`Create Genre --- Created Genre ${createdGenre}`);

      res.status(201).json({
        status: "Genre Created Successfully",
        data: createdGenre,
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

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const genre = updateGenreSchema.parse(req.body);

      if (!id) {
        logWarn(`Update Genre --- Id Parameter is required`);
        res.status(404).json({
          message: "Id parameter is required",
        });
        return;
      }

      const updatedGenre = await GenreService.update(Number(id), genre);
      logInfo(`Update Genre - Updated Genre ${updatedGenre}`);

      res.status(200).json({
        status: "SUCCESS",
        data: updatedGenre,
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

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Delete Genre --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const deletedGenre = await GenreService.delete(Number(id));
      logInfo(`Delete Genre - Deleted Genre ${deletedGenre}`);

      res.status(200).json({
        message: "Genre Deleted Successfully",
        data: deletedGenre,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the genre.",
      });
    }
  }

  // Movie-Genre ilişkisi için metodlar
  static async addMovie(req: Request, res: Response): Promise<void> {
    try {
      const { genreId, movieId } = req.params;

      if (!genreId || !movieId) {
        logWarn(`Add Movie to Genre --- GenreId and MovieId are required`);
        res.status(400).json({
          message: "GenreId and MovieId are required",
        });
        return;
      }

      const result = await GenreService.addMovieToGenre(
        Number(genreId),
        Number(movieId)
      );
      logInfo(
        `Add Movie to Genre - Added Movie ${movieId} to Genre ${genreId}`
      );

      res.status(200).json({
        message: "Movie added to genre successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while adding movie to genre.",
      });
    }
  }

  static async removeMovie(req: Request, res: Response): Promise<void> {
    try {
      const { genreId, movieId } = req.params;

      if (!genreId || !movieId) {
        logWarn(`Remove Movie from Genre --- GenreId and MovieId are required`);
        res.status(400).json({
          message: "GenreId and MovieId are required",
        });
        return;
      }

      const result = await GenreService.removeMovieFromGenre(
        Number(genreId),
        Number(movieId)
      );
      logInfo(
        `Remove Movie from Genre - Removed Movie ${movieId} from Genre ${genreId}`
      );

      res.status(200).json({
        message: "Movie removed from genre successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message:
          "An unexpected error occurred while removing movie from genre.",
      });
    }
  }

  static async getMovies(req: Request, res: Response): Promise<void> {
    try {
      const { genreId } = req.params;

      if (!genreId) {
        logWarn(`Get Movies by Genre --- GenreId is required`);
        res.status(400).json({
          message: "GenreId is required",
        });
        return;
      }

      const movies = await GenreService.getMoviesByGenre(Number(genreId));
      logInfo(`Get Movies by Genre - Retrieved movies for Genre ${genreId}`);

      res.status(200).json({
        data: movies,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message:
          "An unexpected error occurred while retrieving movies by genre.",
      });
    }
  }
}
