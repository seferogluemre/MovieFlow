import {
  PrismaClient,
  FriendshipStatus,
  NotificationType,
} from "@prisma/client";
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

  static async followUser(userId: number, targetUserId: number) {
    // Check if a friendship already exists
    const existingFriendship = await this.getByUserAndFriend(
      userId,
      targetUserId
    );

    if (existingFriendship) {
      // If it's blocked, don't allow following
      if (existingFriendship.status === "BLOCKED") {
        throw new Error("Cannot follow a blocked user");
      }

      // If it's a pending request from the other user, accept it
      if (
        existingFriendship.status === "PENDING" &&
        existingFriendship.friendId === userId
      ) {
        return this.update(existingFriendship.id, { status: "ACCEPTED" });
      }

      // If it's already FOLLOWING or ACCEPTED, just return the existing
      if (
        existingFriendship.status === FriendshipStatus.FOLLOWING ||
        existingFriendship.status === "ACCEPTED"
      ) {
        return existingFriendship;
      }
    }

    // Create a new following relationship
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId: targetUserId,
        status: FriendshipStatus.FOLLOWING,
      },
      include: {
        user: true,
        friend: true,
      },
    });

    // Create notification
    await NotificationService.create(
      targetUserId,
      userId,
      "FOLLOW" as NotificationType,
      `${friendship.user.username} sizi takip etmeye başladı.`,
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

  static async unfollowUser(userId: number, targetUserId: number) {
    // Find the friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        userId,
        friendId: targetUserId,
      },
      include: {
        user: true,
        friend: true,
      },
    });

    if (!friendship) {
      throw new Error("Relationship not found");
    }

    // If it's ACCEPTED (mutual following), downgrade to FOLLOWING for the other user
    if (friendship.status === "ACCEPTED") {
      // Check if there's a reverse relationship
      const reverseRelationship = await prisma.friendship.findFirst({
        where: {
          userId: targetUserId,
          friendId: userId,
        },
      });

      if (reverseRelationship) {
        // Update the reverse relationship to FOLLOWING
        await prisma.friendship.update({
          where: { id: reverseRelationship.id },
          data: { status: FriendshipStatus.FOLLOWING },
        });
      }
    }

    // Delete the relationship
    await prisma.friendship.delete({
      where: { id: friendship.id },
    });

    // Create notification
    await NotificationService.create(
      targetUserId,
      userId,
      "UNFOLLOW" as NotificationType,
      `${friendship.user.username} sizi takip etmeyi bıraktı.`,
      {}
    );

    await prisma.$disconnect();
    return { success: true };
  }

  static async getMutualFriends(userId: number) {
    const mutualFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: "ACCEPTED" },
          { friendId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await prisma.$disconnect();
    return mutualFriendships.map((friendship) => ({
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

  static async getFollowers(userId: number) {
    const followers = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        OR: [{ status: FriendshipStatus.FOLLOWING }, { status: "ACCEPTED" }],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await prisma.$disconnect();
    return followers.map((friendship) => ({
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

  static async getFollowing(userId: number) {
    const following = await prisma.friendship.findMany({
      where: {
        userId,
        OR: [{ status: FriendshipStatus.FOLLOWING }, { status: "ACCEPTED" }],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await prisma.$disconnect();
    return following.map((friendship) => ({
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

  static async getRelationshipStatus(userId: number, targetUserId: number) {
    const outgoingRelationship = await prisma.friendship.findFirst({
      where: {
        userId,
        friendId: targetUserId,
      },
    });

    const incomingRelationship = await prisma.friendship.findFirst({
      where: {
        userId: targetUserId,
        friendId: userId,
      },
    });

    await prisma.$disconnect();

    // Determine relationship type
    let relationshipType = "none";
    let relationshipId = null;

    if (outgoingRelationship && incomingRelationship) {
      if (
        outgoingRelationship.status === "ACCEPTED" &&
        incomingRelationship.status === "ACCEPTED"
      ) {
        relationshipType = "friends";
        relationshipId = outgoingRelationship.id;
      } else if (
        outgoingRelationship.status === FriendshipStatus.FOLLOWING &&
        incomingRelationship.status === FriendshipStatus.FOLLOWING
      ) {
        relationshipType = "mutualFollow";
        relationshipId = outgoingRelationship.id;
      } else if (outgoingRelationship.status === FriendshipStatus.FOLLOWING) {
        relationshipType = "following";
        relationshipId = outgoingRelationship.id;
      } else if (incomingRelationship.status === FriendshipStatus.FOLLOWING) {
        relationshipType = "follower";
        relationshipId = incomingRelationship.id;
      } else if (outgoingRelationship.status === "PENDING") {
        relationshipType = "pending";
        relationshipId = outgoingRelationship.id;
      } else if (incomingRelationship.status === "PENDING") {
        relationshipType = "pendingIncoming";
        relationshipId = incomingRelationship.id;
      }
    } else if (outgoingRelationship) {
      if (outgoingRelationship.status === FriendshipStatus.FOLLOWING) {
        relationshipType = "following";
        relationshipId = outgoingRelationship.id;
      } else if (outgoingRelationship.status === "PENDING") {
        relationshipType = "pending";
        relationshipId = outgoingRelationship.id;
      } else if (outgoingRelationship.status === "BLOCKED") {
        relationshipType = "blocked";
        relationshipId = outgoingRelationship.id;
      }
    } else if (incomingRelationship) {
      if (incomingRelationship.status === FriendshipStatus.FOLLOWING) {
        relationshipType = "follower";
        relationshipId = incomingRelationship.id;
      } else if (incomingRelationship.status === "PENDING") {
        relationshipType = "pendingIncoming";
        relationshipId = incomingRelationship.id;
      } else if (incomingRelationship.status === "BLOCKED") {
        relationshipType = "blockedByOther";
        relationshipId = incomingRelationship.id;
      }
    }

    return {
      type: relationshipType,
      id: relationshipId,
    };
  }
}
