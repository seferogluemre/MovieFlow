import { PrismaClient } from "@prisma/client";
import {
  CreateRatingType,
  UpdateRatingType,
} from "src/validators/rating.validation";
import {
  getFullPosterUrl,
  getFullProfileImageUrl,
} from "../helpers/url.helper";

const prisma = new PrismaClient();

export class RatingService {
  static async create(userId: number, data: CreateRatingType) {
    const rating = await prisma.rating.create({
      data: {
        score: data.score,
        userId,
        movieId: data.movieId,
      },
      include: {
        movie: true,
        user: true,
      },
    });

    if (rating.movie) {
      rating.movie.posterImage = getFullPosterUrl(rating.movie.posterImage);
    }

    return rating;
  }

  static async getAll() {
    const ratings = await prisma.rating.findMany({
      include: {
        movie: true,
        user: true,
      },
    });

    return ratings.map((rating) => ({
      ...rating,
      movie: rating.movie
        ? {
            ...rating.movie,
            posterImage: getFullPosterUrl(rating.movie.posterImage),
          }
        : null,
    }));
  }

  static async getById(id: number) {
    const rating = await prisma.rating.findUnique({
      where: { id },
      include: {
        movie: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    if (rating) {
      if (rating.movie) {
        rating.movie.posterImage = getFullPosterUrl(rating.movie.posterImage);
      }
      if (rating.user) {
        rating.user.profileImage = getFullProfileImageUrl(
          rating.user.profileImage
        );
      }
    }

    return rating;
  }

  static async update(id: number, data: UpdateRatingType) {
    const rating = await prisma.rating.update({
      where: { id },
      data: {
        score: data.score,
      },
      include: {
        movie: true,
        user: true,
      },
    });

    if (rating.movie) {
      rating.movie.posterImage = getFullPosterUrl(rating.movie.posterImage);
    }

    return rating;
  }

  static async delete(id: number) {
    return prisma.rating.delete({
      where: { id },
    });
  }

  static async getMovieRatings(movieId: number) {
    const ratings = await prisma.rating.findMany({
      where: { movieId },
      include: {
        user: true,
      },
    });

    return ratings;
  }

  static async getUserRatings(userId: number) {
    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        movie: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    return ratings.map((rating) => ({
      ...rating,
      movie: rating.movie
        ? {
            ...rating.movie,
            posterImage: getFullPosterUrl(rating.movie.posterImage),
          }
        : null,
      user: rating.user
        ? {
            ...rating.user,
            profileImage: getFullProfileImageUrl(rating.user.profileImage),
          }
        : null,
    }));
  }

  static async getMovieAverageRating(movieId: number) {
    const result = await prisma.rating.aggregate({
      where: { movieId },
      _avg: {
        score: true,
      },
      _count: {
        score: true,
      },
    });

    return {
      average: result._avg.score || 0,
      count: result._count.score,
    };
  }
}
