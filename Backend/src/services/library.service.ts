import { PrismaClient } from "@prisma/client";
import {
  CreateLibraryType,
  UpdateLibraryType,
} from "../validators/library.validation";
import { getFullPosterUrl } from "src/utils/url/url.helper";

const prisma = new PrismaClient();

export class LibraryService {
  static async create(userId: number, data: CreateLibraryType) {
    const library = await prisma.library.create({
      data: {
        userId,
        movieId: data.movieId,
      },
      include: {
        movie: true,
      },
    });

    if (library.movie) {
      library.movie.posterImage = getFullPosterUrl(library.movie.posterImage);
    }

    return library;
  }

  static async getAll(userId: number) {
    const libraries = await prisma.library.findMany({
      where: { userId },
      include: {
        movie: true,
      },
    });

    return libraries.map((library) => ({
      ...library,
      movie: library.movie
        ? {
            ...library.movie,
            posterImage: getFullPosterUrl(library.movie.posterImage),
          }
        : null,
    }));
  }

  static async getById(id: number) {
    const library = await prisma.library.findUnique({
      where: { id },
      include: {
        movie: true,
      },
    });

    if (library && library.movie) {
      library.movie.posterImage = getFullPosterUrl(library.movie.posterImage);
    }

    return library;
  }

  static async update(id: number, data: UpdateLibraryType) {
    const library = await prisma.library.update({
      where: { id },
      data: {
        lastWatched: data.lastWatched,
      },
      include: {
        movie: true,
      },
    });

    if (library.movie) {
      library.movie.posterImage = getFullPosterUrl(library.movie.posterImage);
    }

    return library;
  }

  static async delete(id: number) {
    return prisma.library.delete({
      where: { id },
    });
  }

  static async getByUserAndMovie(userId: number, movieId: number) {
    const library = await prisma.library.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
      include: {
        movie: true,
      },
    });

    if (library && library.movie) {
      library.movie.posterImage = getFullPosterUrl(library.movie.posterImage);
    }

    return library;
  }
}
