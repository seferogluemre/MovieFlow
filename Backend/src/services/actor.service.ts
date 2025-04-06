import prisma from "src/config/database";
import { CreateActorType } from "src/validators/actor.validation";
import { BASE_URL } from "./user.service";
import path from "path";
import fs from "fs";

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
      profileImage: actor.photo ? `${BASE_URL}/uploads/${actor.photo}` : null,
    }));
  }

  static async get(id: number) {
    const actor = await prisma.actor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        biography: true,
        birthYear: true,
        nationality: true,
        photo: true,
        movies: true,
      },
    });

    if (!actor) {
      return null;
    }

    return {
      ...actor,
      profileImage: actor.photo ? `${BASE_URL}/uploads/${actor.photo}` : null,
    };
  }

  static async create(body: CreateActorType) {
    const actor = await prisma.actor.create({
      data: {
        name: body.name,
        biography: body.biography,
        birthYear: body.birthYear,
        nationality: body.nationality,
        photo: body.actorImage,
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
      profileImage: actor.photo ? `${BASE_URL}/uploads/${actor.photo}` : null,
    };
  }

  static async update(id: number, body: CreateActorType) {
    const actor = await prisma.actor.update({
      where: { id },
      data: {
        name: body.name,
        biography: body.biography,
        birthYear: body.birthYear,
        nationality: body.nationality,
        photo: body.actorImage,
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
      profileImage: actor.photo ? `${BASE_URL}/uploads/${actor.photo}` : null,
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
