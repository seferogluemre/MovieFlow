import prisma from "src/config/database";
import {
  CreateRatingType,
  UpdateRatingType,
} from "src/validators/rating.validation";

export class RatingService {
  static async index() {
    const ratings = await prisma.rating.findMany({
      select: {
        id: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return ratings;
  }

  static async get(id: number) {
    const rating = await prisma.rating.findUnique({
      where: { id },
      select: {
        id: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return rating;
  }

  static async create(userId: number, body: CreateRatingType) {
    const rating = await prisma.rating.create({
      data: {
        score: body.score,
        userId,
        movieId: body.movieId,
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return rating;
  }

  static async update(id: number, userId: number, body: UpdateRatingType) {
    const rating = await prisma.rating.update({
      where: { id },
      data: {
        score: body.score,
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return rating;
  }

  static async delete(id: number) {
    return await prisma.rating.delete({
      where: { id },
      select: {
        id: true,
        score: true,
      },
    });
  }

  static async getMovieRatings(movieId: number) {
    const ratings = await prisma.rating.findMany({
      where: { movieId },
      select: {
        id: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return ratings;
  }

  static async getUserRatings(userId: number) {
    const ratings = await prisma.rating.findMany({
      where: { userId },
      select: {
        id: true,
        score: true,
        createdAt: true,
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return ratings;
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
