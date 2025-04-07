import { PrismaClient, Movie } from "@prisma/client";
import {
  CreateActorType,
  UpdateActorType,
} from "../validators/actor.validation";
import { getFullPosterUrl } from "../helpers/url.helper";
import { BASE_URL } from "./user.service";
import path from "path";
import fs from "fs";

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
      profileImage: actor.photo ? getFullPosterUrl(actor.photo) : null,
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
        name: data.name,
        biography: data.biography,
        birthYear: data.birthYear,
        nationality: data.nationality,
        photo: data.photo,
      },
      select: {
        id: true,
        name: true,
        biography: true,
        birthYear: true,
        nationality: true,
        photo: true,
      },
    });

    return {
      ...actor,
      profileImage: actor.photo ? getFullPosterUrl(actor.photo) : null,
    };
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

    return actors.map((actor) => ({
      ...actor,
      movies: actor.movies.map((movieActor) => ({
        ...movieActor,
        movie: movieActor.movie
          ? {
              ...movieActor.movie,
              posterImage: getFullPosterUrl(movieActor.movie.posterImage),
            }
          : null,
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

    if (actor) {
      actor.movies = actor.movies.map((movieActor) => ({
        ...movieActor,
        movie: movieActor.movie
          ? {
              ...movieActor.movie,
              posterImage: getFullPosterUrl(movieActor.movie.posterImage),
            }
          : null,
      }));
    }

    return actor;
  }

  static async update(id: number, data: UpdateActorType) {
    const actor = await prisma.actor.update({
      where: { id },
      data: {
        name: data.name,
        biography: data.biography,
        birthYear: data.birthYear,
        nationality: data.nationality,
        photo: data.photo,
      },
      select: {
        id: true,
        name: true,
        biography: true,
        birthYear: true,
        nationality: true,
        photo: true,
      },
    });

    return {
      ...actor,
      profileImage: actor.photo ? getFullPosterUrl(actor.photo) : null,
    };
  }

  static async delete(id: number) {
    const actor = await prisma.actor.findUnique({
      where: { id },
      select: { photo: true },
    });

    if (actor?.photo) {
      const photoPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        actor.photo
      );
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    return await prisma.actor.delete({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
