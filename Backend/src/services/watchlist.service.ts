import prisma from "@/core/prisma";
import { getFullPosterUrl } from "@utils/url/url.helper";
import {
  CreateWatchlistInput,
  UpdateWatchlistInput,
} from "@validators/watchlist.validator";

export class WatchlistService {
  static async create(userId: number, data: CreateWatchlistInput) {
    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        movieId: data.movieId,
      },
      include: {
        movie: true,
      },
    });

    if (watchlist.movie) {
      watchlist.movie.posterImage = getFullPosterUrl(
        watchlist.movie.posterImage
      );
    }

    return watchlist;
  }

  static async getAll(userId: number) {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: true,
      },
    });

    return watchlists.map((watchlist) => ({
      ...watchlist,
      movie: watchlist.movie
        ? {
            ...watchlist.movie,
            posterImage: getFullPosterUrl(watchlist.movie.posterImage),
          }
        : null,
    }));
  }

  static async getById(userId: number, id: number) {
    const watchlist = await prisma.watchlist.findFirst({
      where: { id, userId },
      include: {
        movie: true,
      },
    });

    if (watchlist && watchlist.movie) {
      watchlist.movie.posterImage = getFullPosterUrl(
        watchlist.movie.posterImage
      );
    }

    return watchlist;
  }

  static async update(userId: number, id: number, data: UpdateWatchlistInput) {
    const watchlist = await prisma.watchlist.update({
      where: { id },
      data: {
        movieId: data.movieId,
      },
      include: {
        movie: true,
      },
    });

    if (watchlist.movie) {
      watchlist.movie.posterImage = getFullPosterUrl(
        watchlist.movie.posterImage
      );
    }

    return watchlist;
  }

  static async delete(userId: number, id: number) {
    return prisma.watchlist.delete({
      where: { id },
    });
  }
}
