import { PrismaClient } from "@prisma/client";
import {
  CreateGenreType,
  UpdateGenreType,
} from "../validators/genre.validation";
import { getFullPosterUrl } from "../helpers/url.helper";

const prisma = new PrismaClient();

export class GenreService {
  static async create(data: CreateGenreType) {
    return prisma.genre.create({
      data: {
        name: data.name,
      },
    });
  }

  static async getAll() {
    const genres = await prisma.genre.findMany({
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    return genres.map((genre) => ({
      ...genre,
      movies: genre.movies.map((movieGenre) => ({
        ...movieGenre,
        movie: movieGenre.movie
          ? {
              ...movieGenre.movie,
              posterImage: getFullPosterUrl(movieGenre.movie.posterImage),
            }
          : null,
      })),
    }));
  }

  static async getById(id: number) {
    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!genre) return null;

    return {
      ...genre,
      movies: genre.movies.map((movieGenre) => ({
        ...movieGenre,
        movie: movieGenre.movie
          ? {
              ...movieGenre.movie,
              posterImage: getFullPosterUrl(movieGenre.movie.posterImage),
            }
          : null,
      })),
    };
  }

  static async update(id: number, data: UpdateGenreType) {
    return prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }

  static async delete(id: number) {
    return prisma.genre.delete({
      where: { id },
    });
  }

  static async addMovieToGenre(genreId: number, movieId: number) {
    const movieGenre = await prisma.movieGenre.create({
      data: {
        genreId,
        movieId,
      },
      include: {
        movie: true,
      },
    });

    if (movieGenre.movie) {
      movieGenre.movie.posterImage = getFullPosterUrl(
        movieGenre.movie.posterImage
      );
    }

    return movieGenre;
  }

  static async removeMovieFromGenre(genreId: number, movieId: number) {
    return prisma.movieGenre.delete({
      where: {
        movieId_genreId: {
          genreId,
          movieId,
        },
      },
    });
  }

  static async getMoviesByGenre(genreId: number) {
    const movies = await prisma.movieGenre.findMany({
      where: { genreId },
      include: {
        movie: true,
      },
    });

    return movies.map((movieGenre) => ({
      ...movieGenre.movie,
      posterImage: movieGenre.movie.posterImage
        ? getFullPosterUrl(movieGenre.movie.posterImage)
        : null,
    }));
  }
}
