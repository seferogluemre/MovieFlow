import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {
  getFullActorPhotoUrl,
  getFullPosterUrl,
} from "src/utils/url/url.helper";
import {
  CreateMovieType,
  UpdateMovieType,
} from "../validators/movie.validation";

dotenv.config();

const prisma = new PrismaClient();

export class MovieService {
  static async create(data: CreateMovieType) {
    const movie = await prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        releaseYear: Number(data.releaseYear),
        duration: Number(data.duration),
        posterImage: data.posterImage,
        director: data.director,
        ageRating: data.ageRating,
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        actors: {
          include: {
            actor: true,
          },
        },
      },
    });

    movie.posterImage = getFullPosterUrl(movie.posterImage);
    return movie;
  }

  static async getAll() {
    const movies = await prisma.movie.findMany({
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        actors: {
          include: {
            actor: true,
          },
        },
      },
    });

    return movies.map((movie) => ({
      ...movie,
      posterImage: getFullPosterUrl(movie.posterImage),
      actors: movie.actors.map((movieActor) => ({
        ...movieActor,
        actor: {
          ...movieActor.actor,
          photo: getFullActorPhotoUrl(movieActor.actor.photo),
        },
      })),
    }));
  }

  static async getById(id: number) {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        actors: {
          include: {
            actor: true,
          },
        },
      },
    });

    if (movie) {
      movie.posterImage = getFullPosterUrl(movie.posterImage);
      movie.actors = movie.actors.map((movieActor) => ({
        ...movieActor,
        actor: {
          ...movieActor.actor,
          photo: getFullActorPhotoUrl(movieActor.actor.photo),
        },
      }));
    }

    return movie;
  }

  static async update(id: number, data: UpdateMovieType) {
    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        releaseYear: data.releaseYear,
        duration: data.duration,
        posterImage: data.posterImage,
        director: data.director,
        ageRating: data.ageRating,
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        actors: {
          include: {
            actor: true,
          },
        },
      },
    });

    movie.posterImage = getFullPosterUrl(movie.posterImage);
    return movie;
  }

  static async delete(id: number) {
    if (!id) {
      return { message: "ID is required" };
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { posterImage: true },
    });

    if (movie?.posterImage) {
      const posterPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "posters",
        movie.posterImage
      );
      if (fs.existsSync(posterPath)) {
        fs.unlinkSync(posterPath);
      }
    }

    // Implement cascading delete - first delete all dependent records
    await prisma.$transaction(async (tx) => {
      // Delete all movie-genre relationships
      await tx.movieGenre.deleteMany({
        where: { movieId: id },
      });

      // Delete all movie-actor relationships
      await tx.movieActor.deleteMany({
        where: { movieId: id },
      });

      // Delete all reviews for this movie
      await tx.review.deleteMany({
        where: { movieId: id },
      });

      // Delete all ratings for this movie
      await tx.rating.deleteMany({
        where: { movieId: id },
      });

      // Delete all watchlist entries for this movie
      await tx.watchlist.deleteMany({
        where: { movieId: id },
      });

      // Delete all wishlist entries for this movie
      await tx.wishlist.deleteMany({
        where: { movieId: id },
      });

      // Delete all library entries for this movie
      await tx.library.deleteMany({
        where: { movieId: id },
      });

      // Finally delete the movie itself
      await tx.movie.delete({
        where: { id },
      });
    });

    return {
      id,
      message: "Movie and all related records successfully deleted",
    };
  }
}
