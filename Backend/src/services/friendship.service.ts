import { PrismaClient } from "@prisma/client";
import {
  CreateFriendshipType,
  UpdateFriendshipType,
} from "../validators/friendship.validation";
import { getFullProfileImageUrl } from "src/utils/url/url.helper";
import { NotificationService } from "./notification.service";
import prisma from "src/config/database";

export class FriendshipService {
  static async create(userId: number, data: CreateFriendshipType) {
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId: data.friendId,
        status: "PENDING",
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await NotificationService.create(
      data.friendId,
      userId,
      "FRIEND_REQUEST",
      `${friendship.user.username} size arkadaşlık isteği gönderdi.`,
      { friendshipId: friendship.id }
    );

    await prisma.$disconnect();
    return {
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    };
  }

  static async getAll(userId: number) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: true,
        friend: true,
      },
    });
    await prisma.$disconnect();
    return friendships.map((friendship) => ({
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    }));
  }

  static async getById(id: number) {
    const friendship = await prisma.friendship.findUnique({
      where: { id },
      include: {
        user: true,
        friend: true,
      },
    });
    await prisma.$disconnect();
    if (!friendship) return null;
    return {
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    };
  }

  static async update(id: number, data: UpdateFriendshipType) {
    const friendship = await prisma.friendship.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        user: true,
        friend: true,
      },
    });

    if (data.status === "ACCEPTED") {
      await NotificationService.create(
        friendship.userId,
        friendship.friendId,
        "FRIEND_REQUEST_ACCEPTED",
        `${friendship.friend.username} arkadaşlık isteğinizi kabul etti.`,
        { friendshipId: friendship.id }
      );
    } else if (data.status === "BLOCKED") {
      await NotificationService.create(
        friendship.userId,
        friendship.friendId,
        "FRIEND_REQUEST_REJECTED",
        `${friendship.friend.username} arkadaşlık isteğinizi reddetti.`,
        { friendshipId: friendship.id }
      );
    }

    await prisma.$disconnect();
    return {
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    };
  }

  static async delete(id: number) {
    const friendship = await prisma.friendship.delete({
      where: { id },
      include: {
        user: true,
        friend: true,
      },
    });
    await prisma.$disconnect();
    return {
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    };
  }

  static async getByUserAndFriend(userId: number, friendId: number) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });
    await prisma.$disconnect();
    if (!friendship) return null;
    return {
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    };
  }

  static async getPendingRequests(userId: number) {
    const friendships = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: "PENDING",
      },
      include: {
        user: true,
        friend: true,
      },
    });
    await prisma.$disconnect();
    return friendships.map((friendship) => ({
      ...friendship,
      user: {
        ...friendship.user,
        profileImage: getFullProfileImageUrl(friendship.user.profileImage),
      },
      friend: {
        ...friendship.friend,
        profileImage: getFullProfileImageUrl(friendship.friend.profileImage),
      },
    }));
  }
}
