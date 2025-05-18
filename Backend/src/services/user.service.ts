import prisma from "@core/prisma";
import { PrismaClient } from "@prisma/client";
import { getFullProfileImageUrl } from "@utils/url/url.helper";
import { CreateUserType, UpdateUserType } from "@validators/user.validation";
import bcrypt from "bcryptjs";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export class UserService {
  static async index() {
    const users = await prisma.user.findMany({
      where: USER_WHERE_CLAUSE(query),
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isAdmin: true,
        isVerified: true,
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
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword, // Hashlenmiş şifreyi kaydet
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
        isVerified: true,
        friends: true,
        friendsOf: true,
        library: true,
        reviews: true,
        ratings: true,
        notifications: true,
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
        isVerified: true,
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

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.email !== undefined) updateData.email = data.email;
    // isPrivate alan güncellemesi
    if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

    if (data.profileImage !== undefined) {
      if (data.profileImage === null) {
        console.log("ProfileImage NULL olarak işleniyor");
        updateData.profileImage = null;
      }
      // string değeri - dosya adı veya tam URL
      else if (typeof data.profileImage === "string") {
        console.log("ProfileImage string olarak işleniyor:", data.profileImage);
        updateData.profileImage = data.profileImage.startsWith("http")
          ? data.profileImage
          : data.profileImage; // zaten dosya adı
      }
    }

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: updateData,
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
