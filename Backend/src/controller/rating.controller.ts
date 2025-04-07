import { z } from "zod";
import { Request, Response } from "express";
import {
  createRatingSchema,
  updateRatingSchema,
} from "src/validators/rating.validation";
import { RatingService } from "src/services/rating.service";
import { logInfo, logWarn } from "src/utils/logging/logger.util";

export class RatingController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const ratings = await RatingService.getAll();
      logInfo(`List Ratings --- Request Received`);

      if (ratings.length > 0) {
        res.status(200).json({
          results: ratings,
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
        logWarn(`Get Rating --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const rating = await RatingService.getById(Number(id));
      if (!rating) {
        logWarn(`Get Rating --- Rating not found`);
        res.status(404).json({
          error: "Rating not found",
          message: "No rating found with the provided identifier.",
        });
        return;
      }

      logInfo(`Get Rating --- Request Received`);
      res.status(200).json({ data: rating });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the rating.",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const rating = createRatingSchema.parse(req.body);
      const createdRating = await RatingService.create(userId, rating);
      logInfo(`Create Rating --- Created Rating ${createdRating}`);

      res.status(201).json({
        status: "Rating Created Successfully",
        data: createdRating,
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
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      if (!id) {
        logWarn(`Update Rating --- Id Parameter is required`);
        res.status(404).json({
          message: "Id parameter is required",
        });
        return;
      }

      const rating = updateRatingSchema.parse(req.body);
      const updatedRating = await RatingService.update(Number(id), rating);
      logInfo(`Update Rating - Updated Rating ${updatedRating}`);

      res.status(200).json({
        status: "SUCCESS",
        data: updatedRating,
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
        logWarn(`Delete Rating --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const deletedRating = await RatingService.delete(Number(id));
      logInfo(`Delete Rating - Deleted Rating ${deletedRating}`);

      res.status(200).json({
        message: "Rating Deleted Successfully",
        data: deletedRating,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the rating.",
      });
    }
  }

  static async getMovieRatings(req: Request, res: Response): Promise<void> {
    try {
      const { movieId } = req.params;

      if (!movieId) {
        logWarn(`Get Movie Ratings --- MovieId is required`);
        res.status(400).json({
          message: "MovieId is required",
        });
        return;
      }

      const ratings = await RatingService.getMovieRatings(Number(movieId));
      logInfo(`Get Movie Ratings - Retrieved ratings for Movie ${movieId}`);

      res.status(200).json({
        data: ratings,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving movie ratings.",
      });
    }
  }

  static async getUserRatings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const ratings = await RatingService.getUserRatings(userId);
      logInfo(`Get User Ratings - Retrieved ratings for User ${userId}`);

      res.status(200).json({
        data: ratings,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving user ratings.",
      });
    }
  }

  static async getMovieAverageRating(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { movieId } = req.params;

      if (!movieId) {
        logWarn(`Get Movie Average Rating --- MovieId is required`);
        res.status(400).json({
          message: "MovieId is required",
        });
        return;
      }

      const averageRating = await RatingService.getMovieAverageRating(
        Number(movieId)
      );
      logInfo(
        `Get Movie Average Rating - Retrieved average rating for Movie ${movieId}`
      );

      res.status(200).json({
        data: averageRating,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message:
          "An unexpected error occurred while retrieving movie average rating.",
      });
    }
  }
}
