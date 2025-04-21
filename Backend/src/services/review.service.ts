import { PrismaClient } from "@prisma/client";
import {
  getFullPosterUrl,
  getFullProfileImageUrl,
} from "@utils/url/url.helper";
import {
  CreateReviewType,
  UpdateReviewType,
} from "@validators/review.validation";

const prisma = new PrismaClient();

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
            profileImage: true,
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

    if (review && review.user) {
      review.user.profileImage = getFullProfileImageUrl(
        review.user.profileImage
      );
    }

    return review;
  }

  static async create(userId: number, body: CreateReviewType) {
    const review = await prisma.review.create({
      data: {
        content: body.content,
        userId,
        movieId: body.movieId,
      },
      include: {
        movie: true,
        user: true,
      },
    });

    if (review.movie) {
      review.movie.posterImage = getFullPosterUrl(review.movie.posterImage);
    }

    return review;
  }

  static async update(id: number, userId: number, body: UpdateReviewType) {
    const review = await prisma.review.update({
      where: { id },
      data: {
        content: body.content,
      },
      include: {
        movie: true,
        user: true,
      },
    });

    if (review.movie) {
      review.movie.posterImage = getFullPosterUrl(review.movie.posterImage);
    }

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
            profileImage: true,
          },
        },
      },
    });

    return reviews.map((review) => ({
      ...review,
      user: {
        ...review.user,
        profileImage: getFullProfileImageUrl(review.user.profileImage),
      },
    }));
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

  static async getAll() {
    const reviews = await prisma.review.findMany({
      include: {
        movie: true,
        user: true,
      },
    });

    return reviews.map((review) => ({
      ...review,
      movie: review.movie
        ? {
            ...review.movie,
            posterImage: getFullPosterUrl(review.movie.posterImage),
          }
        : null,
    }));
  }

  static async getById(id: number) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        movie: true,
        user: true,
      },
    });

    if (review && review.movie) {
      review.movie.posterImage = getFullPosterUrl(review.movie.posterImage);
    }

    return review;
  }
}
