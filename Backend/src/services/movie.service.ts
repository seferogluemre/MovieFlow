import { PrismaClient } from "@prisma/client";
import {
  CreateMovieType,
  UpdateMovieType,
} from "../validators/movie.validation";
import { getFullPosterUrl, getFullActorPhotoUrl } from "../helpers/url.helper";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const prisma = new PrismaClient();

export class MovieService {
  static async create(data: CreateMovieType) {
    const movie = await prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        releaseYear: data.releaseYear,
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

    return await prisma.movie.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  }
}
