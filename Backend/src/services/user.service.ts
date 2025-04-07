import { PrismaClient } from "@prisma/client";
import { CreateUserType, UpdateUserType } from "../validators/user.validation";
import { getFullProfileImageUrl } from "../helpers/url.helper";
import { USER_WHERE_CLAUSE } from "src/constants/user.constant";
import { UserQueryProps } from "src/types/types";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export class UserService {
  static async index(query: UserQueryProps) {
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      where: USER_WHERE_CLAUSE(query),
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isAdmin: true,
        password: true,
        profileImage: true,
        createdAt: true,
      },
    });
    await prisma.$disconnect();

    return users.map((user) => ({
      ...user,
      profileImage: getFullProfileImageUrl(user.profileImage),
    }));
  }

  static async create(data: CreateUserType) {
    const prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: {
        ...data,
        profileImage: data.profileImage
          ? getFullProfileImageUrl(data.profileImage)
          : null,
      },
    });
    await prisma.$disconnect();
    return user;
  }

  static async get(id?: number) {
    if (!id) {
      return { message: "Incorrect id or email submission" };
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        profileImage: true,
        isAdmin: true,
        friends: true,
        friendsOf: true,
        library: true,
        reviews: true,
        ratings: true,
        wishlist: true,
        watchlist: true,
        createdAt: true,
      },
    });
    await prisma.$disconnect();

    if (user) {
      return {
        ...user,
        profileImage: getFullProfileImageUrl(user.profileImage),
      };
    }

    return user;
  }

  static async getUserByEmail(email?: string) {
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        profileImage: true,
        password: true,
        isAdmin: true,
        friends: true,
        friendsOf: true,
        library: true,
        reviews: true,
        ratings: true,
        wishlist: true,
        watchlist: true,
        createdAt: true,
      },
    });
    await prisma.$disconnect();

    if (user) {
      return {
        ...user,
        profileImage: getFullProfileImageUrl(user.profileImage),
      };
    }

    return user;
  }

  static async update(id: number, data: UpdateUserType) {
    if (!id) {
      return { message: "ID is required" };
    }

    const prisma = new PrismaClient();
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name: data.name,
        username: data.username,
        password: data.password,
        email: data.email,
        profileImage: data.profileImage
          ? getFullProfileImageUrl(data.profileImage)
          : undefined,
      },
    });
    await prisma.$disconnect();

    return {
      ...user,
      profileImage: getFullProfileImageUrl(user.profileImage),
    };
  }

  static async delete(id: number) {
    if (!id) {
      return { message: "ID is required" };
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.delete({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        profileImage: true,
      },
    });
    await prisma.$disconnect();

    return {
      ...user,
      profileImage: getFullProfileImageUrl(user.profileImage),
    };
  }
}
