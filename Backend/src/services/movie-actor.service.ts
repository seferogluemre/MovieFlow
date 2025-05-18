import prisma from "@/core/prisma";
import { getFullActorPhotoUrl, getFullPosterUrl } from "@utils/url/url.helper";
import {
  CreateMovieActorType,
  UpdateMovieActorType,
} from "@validators/movie-actor.validation";

export class MovieActorService {
  static async create(data: CreateMovieActorType) {
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
