import prisma from "src/config/database";
import { CreateUserType, UpdateUserType } from "src/validators/user.validation";
import bcryptjs from "bcryptjs";
import { USER_WHERE_CLAUSE } from "src/constants/user.constant";
import { UserQueryProps } from "src/types/types";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export class UserService {
  static async index(query: UserQueryProps) {
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

    return users.map((user) => ({
      ...user,
      profileImage: user.profileImage
        ? `${BASE_URL}/uploads/${user.profileImage}`
        : null,
    }));
  }

  static async create(body: CreateUserType) {
    const hashedPassword = await bcryptjs.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        isAdmin: body.isAdmin,
        username: body.username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isAdmin: true,
        password: true,
      },
    });

    return {
      ...user,
      profileImage: user.profileImage
        ? `${BASE_URL}/uploads/${user.profileImage}`
        : null,
    };
  }

  static async get(id?: number) {
    if (!id) {
      return { message: "Incorrect id or email submission" };
    }

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

    if (user) {
      return {
        ...user,
        profileImage: user.profileImage
          ? `${BASE_URL}/uploads/${user.profileImage}`
          : null,
      };
    }

    return user;
  }

  static async getUserByEmail(email?: string) {
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

    if (user) {
      return {
        ...user,
        profileImage: user.profileImage
          ? `${BASE_URL}/uploads/${user.profileImage}`
          : null,
      };
    }

    return user;
  }

  static async update(id: number, body: UpdateUserType) {
    if (!id) {
      return { message: "ID is required" };
    }
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name,
        username: body.username,
        password: body.password,
        email: body.email,
      },
    });

    return {
      ...user,
      profileImage: user.profileImage
        ? `${BASE_URL}/uploads/${user.profileImage}`
        : null,
    };
  }

  static async delete(id: number) {
    if (!id) {
      return { message: "ID is required" };
    }

    return await prisma.user.delete({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });
  }
}
