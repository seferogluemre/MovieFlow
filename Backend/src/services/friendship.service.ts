import {
  PrismaClient,
  FriendshipStatus,
  NotificationType,
  Friendship,
} from "@prisma/client";
import {
  CreateFriendshipType,
  UpdateFriendshipType,
} from "../validators/friendship.validation";
import {
  RelationshipType,
  RelationshipStatus,
  FriendshipWithUsers,
  EnhancedFriendship,
} from "../types/friendship.types";
import { getFullProfileImageUrl } from "src/utils/url/url.helper";
import { NotificationService } from "./notification.service";
import prisma from "src/config/database";

export class FriendshipService {
  // Helper method to enhance friendship with processed profile images
  private static enhanceFriendship(
    friendship: FriendshipWithUsers | null
  ): EnhancedFriendship | null {
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

  // Helper method to enhance multiple friendships with processed profile images
  private static enhanceFriendships(
    friendships: FriendshipWithUsers[]
  ): (EnhancedFriendship | null)[] {
    return friendships.map((friendship) => this.enhanceFriendship(friendship));
  }

  static async create(userId: number, data: CreateFriendshipType) {
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId: data.friendId,
        status: FriendshipStatus.PENDING,
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
    return this.enhanceFriendship(friendship);
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
    return this.enhanceFriendships(friendships);
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
    return this.enhanceFriendship(friendship);
  }

  static async update(id: number, data: UpdateFriendshipType) {
    const friendship = await prisma.friendship.update({
      where: { id },
      data: {
        status: data.status as FriendshipStatus,
      },
      include: {
        user: true,
        friend: true,
      },
    });

    if (data.status === FriendshipStatus.ACCEPTED) {
      await NotificationService.create(
        friendship.userId,
        friendship.friendId,
        "FRIEND_REQUEST_ACCEPTED",
        `${friendship.friend.username} arkadaşlık isteğinizi kabul etti.`,
        { friendshipId: friendship.id }
      );
    } else if (data.status === FriendshipStatus.BLOCKED) {
      await NotificationService.create(
        friendship.userId,
        friendship.friendId,
        "FRIEND_REQUEST_REJECTED",
        `${friendship.friend.username} arkadaşlık isteğinizi reddetti.`,
        { friendshipId: friendship.id }
      );
    }

    await prisma.$disconnect();
    return this.enhanceFriendship(friendship);
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
    return this.enhanceFriendship(friendship);
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
    return this.enhanceFriendship(friendship);
  }

  static async getPendingRequests(userId: number) {
    const friendships = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        user: true,
        friend: true,
      },
    });
    await prisma.$disconnect();
    return this.enhanceFriendships(friendships);
  }

  static async followUser(userId: number, targetUserId: number) {
    // Check if a friendship already exists
    const existingFriendship = await this.getByUserAndFriend(
      userId,
      targetUserId
    );

    if (existingFriendship) {
      // If it's blocked, don't allow following
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new Error("Cannot follow a blocked user");
      }

      // If it's a pending request from the other user, accept it
      if (
        existingFriendship.status === FriendshipStatus.PENDING &&
        existingFriendship.friendId === userId
      ) {
        return this.update(existingFriendship.id, {
          status: FriendshipStatus.ACCEPTED,
        });
      }

      // If it's already FOLLOWING or ACCEPTED, just return the existing
      if (
        existingFriendship.status === ("FOLLOWING" as FriendshipStatus) ||
        existingFriendship.status === FriendshipStatus.ACCEPTED
      ) {
        return existingFriendship;
      }
    }

    // Create a new following relationship
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId: targetUserId,
        status: "FOLLOWING" as FriendshipStatus,
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
    return this.enhanceFriendship(friendship);
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
    if (friendship.status === FriendshipStatus.ACCEPTED) {
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
          data: { status: "FOLLOWING" as FriendshipStatus },
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
          { userId, status: FriendshipStatus.ACCEPTED },
          { friendId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await prisma.$disconnect();
    return this.enhanceFriendships(mutualFriendships);
  }

  static async getFollowers(userId: number) {
    const followers = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        OR: [
          { status: "FOLLOWING" as FriendshipStatus },
          { status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await prisma.$disconnect();
    return this.enhanceFriendships(followers);
  }

  static async getFollowing(userId: number) {
    const following = await prisma.friendship.findMany({
      where: {
        userId,
        OR: [
          { status: "FOLLOWING" as FriendshipStatus },
          { status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    await prisma.$disconnect();
    return this.enhanceFriendships(following);
  }

  // Helper method to determine relationship type based on status
  private static determineRelationshipType(
    outgoing: Friendship | null,
    incoming: Friendship | null
  ): RelationshipStatus {
    // Default values
    let relationType = RelationshipType.NONE;
    let relationshipId = null;

    if (outgoing && incoming) {
      // Check for mutual friendship (ACCEPTED on both sides)
      if (
        outgoing.status === FriendshipStatus.ACCEPTED &&
        incoming.status === FriendshipStatus.ACCEPTED
      ) {
        relationType = RelationshipType.FRIENDS;
        relationshipId = outgoing.id;
      }
      // Check for mutual follow
      else if (
        outgoing.status === ("FOLLOWING" as FriendshipStatus) &&
        incoming.status === ("FOLLOWING" as FriendshipStatus)
      ) {
        relationType = RelationshipType.MUTUAL_FOLLOW;
        relationshipId = outgoing.id;
      } else if (outgoing.status === ("FOLLOWING" as FriendshipStatus)) {
        relationType = RelationshipType.FOLLOWING;
        relationshipId = outgoing.id;
      } else if (incoming.status === ("FOLLOWING" as FriendshipStatus)) {
        relationType = RelationshipType.FOLLOWER;
        relationshipId = incoming.id;
      }
      // Handle pending requests
      else if (outgoing.status === FriendshipStatus.PENDING) {
        relationType = RelationshipType.PENDING;
        relationshipId = outgoing.id;
      } else if (incoming.status === FriendshipStatus.PENDING) {
        relationType = RelationshipType.PENDING_INCOMING;
        relationshipId = incoming.id;
      }
    }
    // Only outgoing relationship exists
    else if (outgoing) {
      if (outgoing.status === ("FOLLOWING" as FriendshipStatus)) {
        relationType = RelationshipType.FOLLOWING;
      } else if (outgoing.status === FriendshipStatus.PENDING) {
        relationType = RelationshipType.PENDING;
      } else if (outgoing.status === FriendshipStatus.BLOCKED) {
        relationType = RelationshipType.BLOCKED;
      }
      relationshipId = outgoing.id;
    }
    // Only incoming relationship exists
    else if (incoming) {
      if (incoming.status === ("FOLLOWING" as FriendshipStatus)) {
        relationType = RelationshipType.FOLLOWER;
      } else if (incoming.status === FriendshipStatus.PENDING) {
        relationType = RelationshipType.PENDING_INCOMING;
      } else if (incoming.status === FriendshipStatus.BLOCKED) {
        relationType = RelationshipType.BLOCKED_BY_OTHER;
      }
      relationshipId = incoming.id;
    }

    return {
      type: relationType,
      id: relationshipId,
    };
  }

  static async getRelationshipStatus(
    userId: number,
    targetUserId: number
  ): Promise<RelationshipStatus> {
    const outgoingRelationship = await prisma.friendship.findFirst({
      where: {
        userId,
        friendId: targetUserId,
      },
    });

    // Get incoming relationship (target to user)
    const incomingRelationship = await prisma.friendship.findFirst({
      where: {
        userId: targetUserId,
        friendId: userId,
      },
    });

    await prisma.$disconnect();

    // Use helper method to determine relationship type
    return this.determineRelationshipType(
      outgoingRelationship,
      incomingRelationship
    );
  }
}
