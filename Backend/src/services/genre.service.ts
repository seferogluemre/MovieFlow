import prisma from "src/config/database";
import {
  CreateGenreType,
  UpdateGenreType,
} from "src/validators/genre.validation";
import { BASE_URL } from "./user.service";

export class GenreService {
  static async index() {
    const genres = await prisma.genre.findMany({
      select: {
        id: true,
        name: true,
        movies: {
          select: {
            movie: {
              select: {
                id: true,
                title: true,
                posterImage: true,
              },
            },
          },
        },
      },
    });

    return genres.map((genre) => ({
      ...genre,
      movies: genre.movies.map((movie) => ({
        ...movie.movie,
        posterImage: movie.movie.posterImage
          ? `${BASE_URL}/posters/${movie.movie.posterImage}`
          : null,
      })),
    }));
  }

  static async get(id: number) {
    const genre = await prisma.genre.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        movies: {
          select: {
            movie: {
              select: {
                id: true,
                title: true,
                posterImage: true,
              },
            },
          },
        },
      },
    });

    if (!genre) {
      return null;
    }

    return {
      ...genre,
      movies: genre.movies.map((movie) => movie.movie),
    };
  }

  static async create(body: CreateGenreType) {
    const genre = await prisma.genre.create({
      data: {
        name: body.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return genre;
  }

  static async update(id: number, body: UpdateGenreType) {
    const genre = await prisma.genre.update({
      where: { id },
      data: {
        name: body.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return genre;
  }

  static async delete(id: number) {
    await prisma.movieGenre.deleteMany({
      where: { genreId: id },
    });
    return await prisma.genre.delete({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  }

  static async addMovieToGenre(genreId: number, movieId: number) {
    return await prisma.movieGenre.create({
      data: {
        genreId,
        movieId,
      },
      select: {
        genre: {
          select: {
            id: true,
            name: true,
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
  }

  static async removeMovieFromGenre(genreId: number, movieId: number) {
    return await prisma.movieGenre.delete({
      where: {
        movieId_genreId: {
          genreId,
          movieId,
        },
      },
      select: {
        genre: {
          select: {
            id: true,
            name: true,
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
  }

  static async getMoviesByGenre(genreId: number) {
    const movies = await prisma.movieGenre.findMany({
      where: { genreId },
      select: {
        movie: {
          select: {
            id: true,
            title: true,
            posterImage: true,
          },
        },
      },
    });

    return movies.map((movie) => ({
      ...movie.movie,
      posterImage: movie.movie.posterImage
        ? `${BASE_URL}/posters/${movie.movie.posterImage}`
        : null,
    }));
  }
}
