import { PrismaClient } from "@prisma/client";
import {
  CreateWishlistInput,
  UpdateWishlistInput,
} from "../validators/wishlist.validator";
import { getFullPosterUrl } from "../helpers/url.helper";

const prisma = new PrismaClient();

export class WishlistService {
  static async create(userId: number, data: CreateWishlistInput) {
    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        movieId: data.movieId,
      },
      include: {
        movie: true,
      },
    });

    if (wishlist.movie) {
      wishlist.movie.posterImage = getFullPosterUrl(wishlist.movie.posterImage);
    }

    return wishlist;
  }

  static async getAll(userId: number) {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        movie: true,
      },
    });

    return wishlists.map((wishlist) => ({
      ...wishlist,
      movie: wishlist.movie
        ? {
            ...wishlist.movie,
            posterImage: getFullPosterUrl(wishlist.movie.posterImage),
          }
        : null,
    }));
  }

  static async getById(userId: number, id: number) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { id, userId },
      include: {
        movie: true,
      },
    });

    if (wishlist && wishlist.movie) {
      wishlist.movie.posterImage = getFullPosterUrl(wishlist.movie.posterImage);
    }

    return wishlist;
  }

  static async update(userId: number, id: number, data: UpdateWishlistInput) {
    const wishlist = await prisma.wishlist.update({
      where: { id },
      data: {
        movieId: data.movieId,
      },
      include: {
        movie: true,
      },
    });

    if (wishlist.movie) {
      wishlist.movie.posterImage = getFullPosterUrl(wishlist.movie.posterImage);
    }

    return wishlist;
  }

  static async delete(userId: number, id: number) {
    return prisma.wishlist.delete({
      where: { id },
    });
  }
}
