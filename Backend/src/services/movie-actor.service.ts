import { PrismaClient } from "@prisma/client";
import {
  CreateMovieActorType,
  UpdateMovieActorType,
} from "../validators/movie-actor.validation";
import { getFullPosterUrl, getFullActorPhotoUrl } from "../helpers/url.helper";

export class MovieActorService {
  static async create(data: CreateMovieActorType) {
    const prisma = new PrismaClient();
    const movieActor = await prisma.movieActor.create({
      data,
      include: {
        movie: true,
        actor: true,
      },
    });
    await prisma.$disconnect();
    return {
      ...movieActor,
      movie: {
        ...movieActor.movie,
        posterImage: getFullPosterUrl(movieActor.movie.posterImage),
      },
      actor: {
        ...movieActor.actor,
        photo: getFullActorPhotoUrl(movieActor.actor.photo),
      },
    };
  }

  static async getAll() {
    const prisma = new PrismaClient();
    const movieActors = await prisma.movieActor.findMany({
      include: {
        movie: true,
        actor: true,
      },
    });
    await prisma.$disconnect();
    return movieActors.map((movieActor) => ({
      ...movieActor,
      movie: {
        ...movieActor.movie,
        posterImage: getFullPosterUrl(movieActor.movie.posterImage),
      },
      actor: {
        ...movieActor.actor,
        photo: getFullActorPhotoUrl(movieActor.actor.photo),
      },
    }));
  }

  static async getByMovieId(movieId: number) {
    const prisma = new PrismaClient();
    const movieActors = await prisma.movieActor.findMany({
      where: { movieId },
      include: {
        movie: true,
        actor: true,
      },
    });
    await prisma.$disconnect();
    return movieActors.map((movieActor) => ({
      ...movieActor,
      movie: {
        ...movieActor.movie,
        posterImage: getFullPosterUrl(movieActor.movie.posterImage),
      },
      actor: {
        ...movieActor.actor,
        photo: getFullActorPhotoUrl(movieActor.actor.photo),
      },
    }));
  }

  static async getByActorId(actorId: number) {
    const prisma = new PrismaClient();
    const movieActors = await prisma.movieActor.findMany({
      where: { actorId },
      include: {
        movie: true,
        actor: true,
      },
    });
    await prisma.$disconnect();
    return movieActors.map((movieActor) => ({
      ...movieActor,
      movie: {
        ...movieActor.movie,
        posterImage: getFullPosterUrl(movieActor.movie.posterImage),
      },
      actor: {
        ...movieActor.actor,
        photo: getFullActorPhotoUrl(movieActor.actor.photo),
      },
    }));
  }

  static async update(
    movieId: number,
    actorId: number,
    data: UpdateMovieActorType
  ) {
    const prisma = new PrismaClient();
    const movieActor = await prisma.movieActor.update({
      where: {
        movieId_actorId: {
          movieId,
          actorId,
        },
      },
      data,
      include: {
        movie: true,
        actor: true,
      },
    });
    await prisma.$disconnect();
    return {
      ...movieActor,
      movie: {
        ...movieActor.movie,
        posterImage: getFullPosterUrl(movieActor.movie.posterImage),
      },
      actor: {
        ...movieActor.actor,
        photo: getFullActorPhotoUrl(movieActor.actor.photo),
      },
    };
  }

  static async delete(movieId: number, actorId: number) {
    const prisma = new PrismaClient();
    const movieActor = await prisma.movieActor.delete({
      where: {
        movieId_actorId: {
          movieId,
          actorId,
        },
      },
      include: {
        movie: true,
        actor: true,
      },
    });
    await prisma.$disconnect();
    return {
      ...movieActor,
      movie: {
        ...movieActor.movie,
        posterImage: getFullPosterUrl(movieActor.movie.posterImage),
      },
      actor: {
        ...movieActor.actor,
        photo: getFullActorPhotoUrl(movieActor.actor.photo),
      },
    };
  }
}
