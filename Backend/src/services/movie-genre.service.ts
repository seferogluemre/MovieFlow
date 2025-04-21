import { PrismaClient } from "@prisma/client";
import { getFullPosterUrl } from "@utils/url/url.helper";
import { CreateMovieGenreType } from "@validators/movie-genre.validation";

const prisma = new PrismaClient();

export class MovieGenreService {
  static async create(data: CreateMovieGenreType) {
    const movieGenre = await prisma.movieGenre.create({
      data: {
        movieId: data.movieId,
        genreId: data.genreId,
      },
      include: {
        movie: true,
        genre: true,
      },
    });

    if (movieGenre.movie) {
      movieGenre.movie.posterImage = getFullPosterUrl(
        movieGenre.movie.posterImage
      );
    }

    return movieGenre;
  }

  static async getAll() {
    const movieGenres = await prisma.movieGenre.findMany({
      include: {
        movie: true,
        genre: true,
      },
    });

    return movieGenres.map((movieGenre) => ({
      ...movieGenre,
      movie: movieGenre.movie
        ? {
            ...movieGenre.movie,
            posterImage: getFullPosterUrl(movieGenre.movie.posterImage),
          }
        : null,
    }));
  }

  static async getByMovieId(movieId: number) {
    const movieGenres = await prisma.movieGenre.findMany({
      where: { movieId },
      include: {
        movie: true,
        genre: true,
      },
    });

    return movieGenres.map((movieGenre) => ({
      ...movieGenre,
      movie: movieGenre.movie
        ? {
            ...movieGenre.movie,
            posterImage: getFullPosterUrl(movieGenre.movie.posterImage),
          }
        : null,
    }));
  }

  static async getByGenreId(genreId: number) {
    const movieGenres = await prisma.movieGenre.findMany({
      where: { genreId },
      include: {
        movie: true,
        genre: true,
      },
    });

    return movieGenres.map((movieGenre) => ({
      ...movieGenre,
      movie: movieGenre.movie
        ? {
            ...movieGenre.movie,
            posterImage: getFullPosterUrl(movieGenre.movie.posterImage),
          }
        : null,
    }));
  }

  static async delete(movieId: number, genreId: number) {
    return prisma.movieGenre.delete({
      where: {
        movieId_genreId: {
          movieId,
          genreId,
        },
      },
    });
  }
}
