import { Request, Response } from "express";
import { ReviewService } from "src/services/review.service";
import { logInfo, logWarn } from "src/utils/logging/logger.util";
import {
  createReviewSchema,
  updateReviewSchema,
} from "src/validators/review.validation";
import { z } from "zod";

export class ReviewController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await ReviewService.index();
      logInfo(`List Reviews --- Request Received`);

      if (reviews.length > 0) {
        res.status(200).json({
          results: reviews,
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
        logWarn(`Get Review --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const review = await ReviewService.get(Number(id));
      if (!review) {
        logWarn(`Get Review --- Review not found`);
        res.status(404).json({
          error: "Review not found",
          message: "No review found with the provided identifier.",
        });
        return;
      }

      logInfo(`Get Review --- Request Received`);
      res.status(200).json({ data: review });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the review.",
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

      const review = createReviewSchema.parse(req.body);
      const createdReview = await ReviewService.create(userId, review);
      logInfo(`Create Review --- Created Review ${createdReview}`);

      res.status(201).json({
        status: "Review Created Successfully",
        data: createdReview,
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
        return;
      }

      // Check for Prisma unique constraint error
      const errorMessage = (error as Error).message;
      if (
        errorMessage.includes(
          "Unique constraint failed on the fields: (`userId`,`movieId`)"
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Her film için sadece bir yorum oluşturabilirsiniz.",
        });
        return;
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
        logWarn(`Update Review --- Id Parameter is required`);
        res.status(404).json({
          message: "Id parameter is required",
        });
        return;
      }

      const review = updateReviewSchema.parse(req.body);
      const updatedReview = await ReviewService.update(
        Number(id),
        userId,
        review
      );
      logInfo(`Update Review - Updated Review ${updatedReview}`);

      res.status(200).json({
        status: "SUCCESS",
        data: updatedReview,
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
        logWarn(`Delete Review --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const deletedReview = await ReviewService.delete(Number(id));
      logInfo(`Delete Review - Deleted Review ${deletedReview}`);

      res.status(200).json({
        message: "Review Deleted Successfully",
        data: deletedReview,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the review.",
      });
    }
  }

  static async getMovieReviews(req: Request, res: Response): Promise<void> {
    try {
      const { movieId } = req.params;

      if (!movieId) {
        logWarn(`Get Movie Reviews --- MovieId is required`);
        res.status(400).json({
          message: "MovieId is required",
        });
        return;
      }

      const reviews = await ReviewService.getMovieReviews(Number(movieId));
      logInfo(`Get Movie Reviews - Retrieved reviews for Movie ${movieId}`);

      res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving movie reviews.",
      });
    }
  }

  static async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      const reviews = await ReviewService.getUserReviews(userId);
      logInfo(`Get User Reviews - Retrieved reviews for User ${userId}`);

      res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving user reviews.",
      });
    }
  }
}
