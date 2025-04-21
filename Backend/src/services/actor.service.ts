import { PrismaClient } from "@prisma/client";
import { getFullActorPhotoUrl, getFullPosterUrl } from "@utils/url/url.helper";
import {
  CreateActorType,
  UpdateActorType,
} from "../validators/actor.validation";

const prisma = new PrismaClient();

export class ActorService {
  static async index() {
    const actors = await prisma.actor.findMany({
      select: {
        id: true,
        name: true,
        biography: true,
        birthYear: true,
        nationality: true,
        photo: true,
      },
    });

    return actors.map((actor) => ({
      ...actor,
      photo: actor.photo ? getFullActorPhotoUrl(actor.photo) : null,
    }));
  }

  static async get(id: number) {
    const actor = await prisma.actor.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!actor) return null;

    return {
      ...actor,
      photo: getFullActorPhotoUrl(actor.photo),
      movies: actor.movies.map((movieActor) => ({
        ...movieActor,
        movie: movieActor.movie
          ? {
              ...movieActor.movie,
              posterImage: getFullPosterUrl(movieActor.movie.posterImage),
            }
          : null,
      })),
    };
  }

  static async create(data: CreateActorType) {
    const actor = await prisma.actor.create({
      data: {
        ...data,
        photo: data.photo ? getFullActorPhotoUrl(data.photo) : null,
      },
    });
    await prisma.$disconnect();
    return actor;
  }

  static async getAll() {
    const actors = await prisma.actor.findMany({
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });
    await prisma.$disconnect();
    return actors.map((actor) => ({
      ...actor,
      photo: getFullActorPhotoUrl(actor.photo),
      movies: actor.movies.map((movieActor) => ({
        ...movieActor,
        movie: {
          ...movieActor.movie,
          posterImage: movieActor.movie.posterImage
            ? `http://localhost:3000/posters/${movieActor.movie.posterImage}`
            : null,
        },
      })),
    }));
  }

  static async getById(id: number) {
    const actor = await prisma.actor.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });
    await prisma.$disconnect();
    if (!actor) return null;
    return {
      ...actor,
      photo: getFullActorPhotoUrl(actor.photo),
      movies: actor.movies.map((movieActor) => ({
        ...movieActor,
        movie: {
          ...movieActor.movie,
          posterImage: movieActor.movie.posterImage
            ? `http://localhost:3000/posters/${movieActor.movie.posterImage}`
            : null,
        },
      })),
    };
  }

  static async update(id: number, data: UpdateActorType) {
    const actor = await prisma.actor.update({
      where: { id },
      data: {
        ...data,
        photo: data.photo ? getFullActorPhotoUrl(data.photo) : undefined,
      },
    });
    await prisma.$disconnect();
    return {
      ...actor,
      photo: getFullActorPhotoUrl(actor.photo),
    };
  }

  static async delete(id: number) {
    const actor = await prisma.actor.delete({
      where: { id },
    });
    await prisma.$disconnect();
    return {
      ...actor,
      photo: getFullActorPhotoUrl(actor.photo),
    };
  }
}
