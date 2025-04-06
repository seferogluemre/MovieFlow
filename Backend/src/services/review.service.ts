import prisma from "src/config/database";
import {
  CreateReviewType,
  UpdateReviewType,
} from "src/validators/review.validation";

export class ReviewService {
  static async index() {
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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

    return reviews;
  }

  static async get(id: number) {
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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

    return review;
  }

  static async create(userId: number, body: CreateReviewType) {
    const review = await prisma.review.create({
      data: {
        content: body.content,
        userId,
        movieId: body.movieId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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

    return review;
  }

  static async update(id: number, userId: number, body: UpdateReviewType) {
    const review = await prisma.review.update({
      where: { id },
      data: {
        content: body.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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

    return review;
  }

  static async delete(id: number) {
    return await prisma.review.delete({
      where: { id },
      select: {
        id: true,
        content: true,
      },
    });
  }

  static async getMovieReviews(movieId: number) {
    const reviews = await prisma.review.findMany({
      where: { movieId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return reviews;
  }

  static async getUserReviews(userId: number) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return reviews;
  }
}
