import prisma from "@config/database";
import { Friendship, FriendshipStatus, NotificationType } from "@prisma/client";
import { getFullProfileImageUrl } from "@utils/url/url.helper";
import {
  CreateFriendshipType,
  UpdateFriendshipType,
} from "@validators/friendship.validation";
import {
  EnhancedFriendship,
  FriendshipWithUsers,
  RelationshipStatus,
  RelationshipType,
} from "src/types/types";
import { sendNotificationToUser } from "../services/socket/notification.service";
import { getIO } from "../socket";
import { NotificationService } from "./notification.service";

export class FriendshipService {
  static enhanceFriendship(
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

  static enhanceFriendships(
    friendships: FriendshipWithUsers[]
  ): (EnhancedFriendship | null)[] {
    return friendships.map((friendship) => this.enhanceFriendship(friendship));
  }

  static async create(userId: number, data: CreateFriendshipType) {
    try {
      console.log(
        `Friendship create: ${userId} kullanıcısı ${data.friendId} kullanıcısına istek gönderiyor`
      );

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

      console.log(
        `Friendship create: ${friendship.id} ID'li arkadaşlık isteği oluşturuldu`
      );

      // Create notification in database
      await NotificationService.create(
        data.friendId,
        userId,
        "FRIEND_REQUEST",
        `${friendship.user.username} size arkadaşlık isteği gönderdi.`,
        { friendshipId: friendship.id }
      );

      // Send real-time notification via socket.io
      try {
        const notificationData = {
          type: "FRIEND_REQUEST",
          message: `${friendship.user.username} size arkadaşlık isteği gönderdi.`,
          fromUserId: userId,
          metadata: { friendshipId: friendship.id },
        };

        console.log(
          "Arkadaşlık isteği bildirimi gönderiliyor:",
          notificationData
        );

        await sendNotificationToUser(
          getIO(),
          data.friendId,
          "FRIEND_REQUEST",
          `${friendship.user.username} size arkadaşlık isteği gönderdi.`,
          userId,
          { friendshipId: friendship.id },
          false // Bildirim veritabanına zaten kaydedildi, tekrar kaydetmeye gerek yok
        );
        console.log(
          `Friendship create: ${data.friendId} kullanıcısına gerçek zamanlı bildirim gönderildi`
        );
      } catch (error) {
        console.error(
          `Friendship create: Gerçek zamanlı bildirim gönderilirken hata oluştu:`,
          error
        );
      }

      await prisma.$disconnect();
      return this.enhanceFriendship(friendship);
    } catch (error) {
      console.error(`Friendship create error:`, error);
      throw error;
    }
  }

  static async getAll(userId: number) {
    try {
      console.log(
        `Friendship getAll: ${userId} kullanıcısının arkadaşlıkları getiriliyor`
      );

      // Tüm ilişkileri getir
      const friendships = await prisma.friendship.findMany({
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

      console.log(
        `Friendship getAll: ${friendships.length} arkadaşlık kaydı bulundu`
      );

      // İlişkileri normalize et - her arkadaşlık ilişkisinin tek bir versiyonunu döndür
      const uniqueFriendshipMap = new Map();

      friendships.forEach((friendship) => {
        // İlişkideki diğer kullanıcıyı bul
        const otherUserId =
          friendship.userId === userId
            ? friendship.friendId
            : friendship.userId;

        // Kendi kendine arkadaşlık ilişkisi olma durumunu kontrol et ve atla
        if (otherUserId === userId) {
          console.log(
            `Friendship getAll: Kullanıcının kendisiyle olan ilişki atlanıyor (userId: ${userId})`
          );
          return;
        }

        // Bu ilişkinin görüntülenecek kullanıcısını belirle
        const otherUser =
          friendship.userId === userId ? friendship.friend : friendship.user;

        // Eğer bu diğer kullanıcı için bir ilişki henüz kaydedilmemişse, ekle
        if (!uniqueFriendshipMap.has(otherUserId)) {
          console.log(
            `Friendship getAll: ${otherUserId} kullanıcısı ile ilişki kaydediliyor`
          );
          uniqueFriendshipMap.set(otherUserId, {
            ...friendship,
            displayUser: otherUser, // Görüntülenecek kullanıcıyı ekle
          });
        }
      });

      // Map'ten değerleri geri array'e çevir
      const normalizedFriendships = Array.from(uniqueFriendshipMap.values());

      console.log(
        `Friendship getAll: ${normalizedFriendships.length} benzersiz arkadaşlık kaydı döndürülüyor`
      );

      await prisma.$disconnect();
      return this.enhanceFriendships(normalizedFriendships);
    } catch (error) {
      console.error(`Friendship getAll error:`, error);
      throw error;
    }
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
    try {
      console.log(
        `Friendship update: ${id} ID'li arkadaşlık isteği ${data.status} durumuna güncelleniyor`
      );

      // Önce ilgili arkadaşlık kaydını al
      const existingFriendship = await prisma.friendship.findUnique({
        where: { id },
        include: {
          user: true,
          friend: true,
        },
      });

      if (!existingFriendship) {
        console.error(
          `Friendship update: ${id} ID'li arkadaşlık isteği bulunamadı`
        );
        throw new Error("Friendship not found");
      }

      // Arkadaşlık kaydını güncelle
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

      console.log(
        `Friendship update: ${id} ID'li arkadaşlık isteği ${data.status} durumuna güncellendi`
      );

      // Eğer arkadaşlık kabul edildiyse, ters ilişkiyi kontrol et
      // Artık yeni kayıt oluşturmuyoruz, sadece mevcut bir ters ilişki varsa güncelliyoruz
      if (data.status === FriendshipStatus.ACCEPTED) {
        // Ters ilişkiyi kontrol et
        const reverseRelation = await prisma.friendship.findFirst({
          where: {
            userId: friendship.friendId,
            friendId: friendship.userId,
          },
        });

        if (reverseRelation) {
          // Varsa güncelle
          await prisma.friendship.update({
            where: { id: reverseRelation.id },
            data: {
              status: FriendshipStatus.ACCEPTED,
            },
          });
          console.log(
            `Var olan ters ilişki (ID: ${reverseRelation.id}) ACCEPTED olarak güncellendi`
          );
        }
        // Artık yeni ters ilişki oluşturmuyoruz - bu eski koddu:
        /*
        else {
          // Yoksa oluştur
          await prisma.friendship.create({
            data: {
              userId: friendship.friendId,
              friendId: friendship.userId,
              status: FriendshipStatus.ACCEPTED,
              // İki kayıt arasında tutarlılık sağlamak için aynı createdAt değerini kullan
              createdAt: friendship.createdAt,
            },
          });
        }
        */

        // Create notification in database
        await NotificationService.create(
          friendship.userId,
          friendship.friendId,
          "FRIEND_REQUEST_ACCEPTED",
          `${friendship.friend.username} arkadaşlık isteğinizi kabul etti.`,
          { friendshipId: friendship.id }
        );

        // Send real-time notification via socket.io
        try {
          await sendNotificationToUser(
            getIO(),
            friendship.userId,
            "FRIEND_REQUEST_ACCEPTED",
            `${friendship.friend.username} arkadaşlık isteğinizi kabul etti.`,
            friendship.friendId,
            { friendshipId: friendship.id }
          );
          console.log(
            `Friendship update: ${friendship.userId} kullanıcısına gerçek zamanlı bildirim gönderildi`
          );
        } catch (error) {
          console.error(
            `Friendship update: Gerçek zamanlı bildirim gönderilirken hata oluştu:`,
            error
          );
        }
      } else if (data.status === FriendshipStatus.BLOCKED) {
        // Engelleme durumunda karşılıklı ilişkiyi de güncelle
        const reverseRelation = await prisma.friendship.findFirst({
          where: {
            userId: friendship.friendId,
            friendId: friendship.userId,
          },
        });

        if (reverseRelation) {
          await prisma.friendship.update({
            where: { id: reverseRelation.id },
            data: {
              status: FriendshipStatus.BLOCKED,
            },
          });
        }

        // Create notification in database
        await NotificationService.create(
          friendship.userId,
          friendship.friendId,
          "FRIEND_REQUEST_REJECTED",
          `${friendship.friend.username} arkadaşlık isteğinizi reddetti.`,
          { friendshipId: friendship.id }
        );

        // Send real-time notification via socket.io
        try {
          const notificationData = {
            type: "FRIEND_REQUEST_REJECTED",
            message: `${friendship.friend.username} arkadaşlık isteğinizi reddetti.`,
            fromUserId: friendship.friendId,
            metadata: { friendshipId: friendship.id },
          };

          console.log(
            "Arkadaşlık red bildirimi gönderiliyor:",
            notificationData
          );

          await sendNotificationToUser(
            getIO(),
            friendship.userId,
            "FRIEND_REQUEST_REJECTED",
            `${friendship.friend.username} arkadaşlık isteğinizi reddetti.`,
            friendship.friendId,
            { friendshipId: friendship.id },
            false // Bildirim veritabanına zaten kaydedildi, tekrar kaydetmeye gerek yok
          );
          console.log(
            `Friendship update: ${friendship.userId} kullanıcısına red bildirimi gönderildi`
          );
        } catch (error) {
          console.error(
            `Friendship update: Gerçek zamanlı red bildirimi gönderilirken hata oluştu:`,
            error
          );
        }
      }

      await prisma.$disconnect();
      return this.enhanceFriendship(friendship);
    } catch (error) {
      console.error(`Friendship update error:`, error);
      throw error;
    }
  }

  static async delete(id: number) {
    const friendship = await prisma.friendship.findFirst({
      where: { id },
      include: {
        user: true,
        friend: true,
      },
    });

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    const userId = friendship.userId;
    const friendId = friendship.friendId;

    // Delete any related notifications that have this friendship ID in their metadata
    await prisma.notification.deleteMany({
      where: {
        AND: [
          { type: "FRIEND_REQUEST" as NotificationType },
          {
            metadata: {
              path: ["friendshipId"],
              equals: id,
            },
          },
        ],
      },
    });

    // Now delete the friendship
    await prisma.friendship.delete({
      where: { id },
    });

    // Check for and delete the reciprocal friendship (if it exists)
    // This ensures both users have the relationship removed from their lists
    const reciprocalFriendship = await prisma.friendship.findFirst({
      where: {
        userId: friendId,
        friendId: userId,
      },
    });

    if (reciprocalFriendship) {
      // Delete any related notifications for the reciprocal friendship
      await prisma.notification.deleteMany({
        where: {
          AND: [
            { type: "FRIEND_REQUEST" as NotificationType },
            {
              metadata: {
                path: ["friendshipId"],
                equals: reciprocalFriendship.id,
              },
            },
          ],
        },
      });

      // Delete the reciprocal friendship
      await prisma.friendship.delete({
        where: { id: reciprocalFriendship.id },
      });
    }

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
    try {
      // Get pending requests sent to the user
      const friendships = await prisma.friendship.findMany({
        where: {
          friendId: userId,
          status: FriendshipStatus.PENDING,
          NOT: {
            userId: userId, // Exclude any self-requests
          },
        },
        include: {
          user: true,
          friend: true,
        },
      });

      console.log(
        `Friendship getPendingRequests: ${friendships.length} bekleyen istek bulundu`
      );

      await prisma.$disconnect();
      return this.enhanceFriendships(friendships);
    } catch (error) {
      console.error(`Friendship getPendingRequests error:`, error);
      throw error;
    }
  }

  static async getSentRequests(userId: number) {
    try {
      // Get pending requests sent by the user
      const friendships = await prisma.friendship.findMany({
        where: {
          userId: userId,
          status: FriendshipStatus.PENDING,
          NOT: {
            friendId: userId, // Exclude any self-requests
          },
        },
        include: {
          user: true,
          friend: true,
        },
      });

      console.log(
        `Friendship getSentRequests: ${friendships.length} gönderilmiş istek bulundu`
      );

      await prisma.$disconnect();
      return this.enhanceFriendships(friendships);
    } catch (error) {
      console.error(`Friendship getSentRequests error:`, error);
      throw error;
    }
  }

  static async followUser(userId: number, targetUserId: number) {
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
        // Bu durumda update metodumuz artık karşılıklı ilişkiyi de güncellediği için
        // doğrudan update'i çağırabiliriz
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
    try {
      const mutualFriendships = await prisma.friendship.findMany({
        where: {
          OR: [
            {
              userId,
              status: FriendshipStatus.ACCEPTED,
              NOT: { friendId: userId },
            },
            {
              friendId: userId,
              status: FriendshipStatus.ACCEPTED,
              NOT: { userId: userId },
            },
          ],
        },
        include: {
          user: true,
          friend: true,
        },
      });

      console.log(
        `Friendship getMutualFriends: ${mutualFriendships.length} karşılıklı arkadaşlık bulundu`
      );

      await prisma.$disconnect();
      return this.enhanceFriendships(mutualFriendships);
    } catch (error) {
      console.error(`Friendship getMutualFriends error:`, error);
      throw error;
    }
  }

  static async getFollowers(userId: number) {
    try {
      const followers = await prisma.friendship.findMany({
        where: {
          friendId: userId,
          NOT: { userId: userId }, // Exclude self-follows
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

      console.log(
        `Friendship getFollowers: ${followers.length} takipçi bulundu`
      );

      await prisma.$disconnect();
      return this.enhanceFriendships(followers);
    } catch (error) {
      console.error(`Friendship getFollowers error:`, error);
      throw error;
    }
  }

  static async getFollowing(userId: number) {
    try {
      const following = await prisma.friendship.findMany({
        where: {
          userId,
          NOT: { friendId: userId }, // Exclude self-follows
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

      console.log(
        `Friendship getFollowing: ${following.length} takip edilen kullanıcı bulundu`
      );

      await prisma.$disconnect();
      return this.enhanceFriendships(following);
    } catch (error) {
      console.error(`Friendship getFollowing error:`, error);
      throw error;
    }
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
