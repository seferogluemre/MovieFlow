import prisma from "@core/prisma";
import { getIO } from "../socket";
import { FriendshipResult } from "../types/socket.types";
import { sendNotificationToUser } from "./socket/notification.service";

/**
 * Kullanıcının arkadaşlarının ID'lerini getirir
 * @param userId Kullanıcı ID'si
 * @returns Arkadaş ID'leri dizisi
 */
export const getUserFriends = async (userId: number): Promise<number[]> => {
  try {
    // İki yönlü arkadaşlık ilişkilerini getir (kullanıcı hem gönderen hem alıcı olabilir)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId, status: "ACCEPTED" },
          { friendId: userId, status: "ACCEPTED" },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    const friendIds = friendships.map((friendship) =>
      friendship.userId === userId ? friendship.friendId : friendship.userId
    );

    return friendIds;
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için arkadaş listesi getirilirken hata:`,
      error
    );
    return [];
  }
};

/**
 * Kullanıcının gelen arkadaşlık isteklerini getirir
 * @param userId Kullanıcı ID'si
 * @returns Arkadaşlık istekleri dizisi
 */
export const getFriendRequests = async (userId: number) => {
  try {
    return await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için arkadaşlık istekleri getirilirken hata:`,
      error
    );
    return [];
  }
};

/**
 * Kullanıcının gönderdiği arkadaşlık isteklerini getirir
 * @param userId Kullanıcı ID'si
 * @returns Gönderilen arkadaşlık istekleri dizisi
 */
export const getSentRequests = async (userId: number) => {
  try {
    return await prisma.friendship.findMany({
      where: {
        userId: userId,
        status: "PENDING",
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için gönderilen arkadaşlık istekleri getirilirken hata:`,
      error
    );
    return [];
  }
};

/**
 * Arkadaşlık isteği gönderir
 * @param userId Gönderen kullanıcı ID'si
 * @param friendId Alıcı kullanıcı ID'si
 * @returns Oluşturulan arkadaşlık isteği
 */
export const sendFriendRequest = async (
  userId: number,
  friendId: number
): Promise<FriendshipResult> => {
  try {
    // Zaten bir istek var mı kontrol et
    const existingRequest = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existingRequest) {
      return {
        error: "Bu kullanıcı ile zaten bir arkadaşlık ilişkiniz bulunmaktadır",
      };
    }

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      return { error: "Kullanıcı bulunamadı" };
    }

    // Yeni istek oluştur
    const result = await prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: "PENDING",
      },
    });

    // Bildirim gönder
    try {
      const io = getIO();
      if (io) {
        await sendNotificationToUser(
          io,
          friendId,
          "FRIEND_REQUEST",
          `${user.username} size arkadaşlık isteği gönderdi.`,
          userId,
          { friendshipId: result.id }
        );
      }
    } catch (error) {
      console.error("Bildirim gönderilirken hata:", error);
    }

    return {
      id: result.id,
      userId: result.userId,
      friendId: result.friendId,
      status: result.status,
      createdAt: result.createdAt,
    };
  } catch (error) {
    console.error(`Arkadaşlık isteği gönderilirken hata:`, error);
    return { error: "Arkadaşlık isteği gönderilirken bir hata oluştu" };
  }
};

/**
 * Arkadaşlık isteğini kabul eder
 * @param requestId Arkadaşlık isteği ID'si
 * @returns Güncellenen arkadaşlık isteği
 */
export const acceptFriendRequest = async (
  requestId: number
): Promise<FriendshipResult> => {
  try {
    // requestId kontrolü
    if (!requestId || isNaN(requestId)) {
      return { error: "Geçersiz arkadaşlık isteği ID'si" };
    }

    // Önce isteği getir
    const request = await prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { username: true } },
        friend: { select: { username: true } },
      },
    });

    if (!request) {
      return { error: "Arkadaşlık isteği bulunamadı" };
    }

    const result = await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    // Bildirim gönder
    try {
      const io = getIO();
      if (io) {
        await sendNotificationToUser(
          io,
          request.userId,
          "FRIEND_REQUEST_ACCEPTED",
          `${request.friend.username} arkadaşlık isteğinizi kabul etti.`,
          request.friendId,
          { friendshipId: result.id }
        );
      }
    } catch (error) {
      console.error("Bildirim gönderilirken hata:", error);
    }

    return {
      id: result.id,
      userId: result.userId,
      friendId: result.friendId,
      status: result.status,
      createdAt: result.createdAt,
      success: true,
    };
  } catch (error) {
    console.error(`Arkadaşlık isteği kabul edilirken hata:`, error);
    return { error: "Arkadaşlık isteği kabul edilirken bir hata oluştu" };
  }
};

/**
 * Arkadaşlık isteğini reddeder
 * @param requestId Arkadaşlık isteği ID'si
 * @returns İşlem sonucu
 */
export const rejectFriendRequest = async (
  requestId: number
): Promise<FriendshipResult> => {
  try {
    // Önce isteği getir
    const request = await prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        friend: { select: { username: true } },
      },
    });

    if (!request) {
      return { error: "Arkadaşlık isteği bulunamadı" };
    }

    await prisma.friendship.delete({
      where: { id: requestId },
    });

    // İsteğe göre bildirim gönderilebilir
    try {
      const io = getIO();
      if (io) {
        await sendNotificationToUser(
          io,
          request.userId,
          "FRIEND_REQUEST_REJECTED",
          `${request.friend.username} arkadaşlık isteğinizi reddetti.`,
          request.friendId
        );
      }
    } catch (error) {
      console.error("Bildirim gönderilirken hata:", error);
    }

    return { success: true };
  } catch (error) {
    console.error(`Arkadaşlık isteği reddedilirken hata:`, error);
    return { error: "Arkadaşlık isteği reddedilirken bir hata oluştu" };
  }
};

/**
 * Arkadaşlık ilişkisini kaldırır
 * @param userId Kullanıcı ID'si
 * @param friendId Arkadaş ID'si
 * @returns İşlem sonucu
 */
export const removeFriend = async (
  userId: number,
  friendId: number
): Promise<FriendshipResult> => {
  try {
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
        status: "ACCEPTED",
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`Arkadaşlık ilişkisi kaldırılırken hata:`, error);
    return { error: "Arkadaşlık ilişkisi kaldırılırken bir hata oluştu" };
  }
};

/**
 * İki kullanıcı arasındaki ilişki durumunu getirir
 * @param userId İstek yapan kullanıcı ID'si
 * @param targetUserId Hedef kullanıcı ID'si
 * @returns İlişki durumu
 */
export const getRelationshipStatus = async (
  userId: number,
  targetUserId: number
) => {
  try {
    // Giden ilişki (userId -> targetUserId)
    const outgoing = await prisma.friendship.findFirst({
      where: {
        userId: userId,
        friendId: targetUserId,
      },
    });

    // Gelen ilişki (targetUserId -> userId)
    const incoming = await prisma.friendship.findFirst({
      where: {
        userId: targetUserId,
        friendId: userId,
      },
    });

    // İlişki durumunu belirle
    if (!outgoing && !incoming) {
      return { type: "NONE" };
    }

    if (outgoing?.status === "ACCEPTED" || incoming?.status === "ACCEPTED") {
      return { type: "FRIENDS", data: outgoing || incoming };
    }

    if (outgoing?.status === "PENDING") {
      return { type: "REQUEST_SENT", data: outgoing };
    }

    if (incoming?.status === "PENDING") {
      return { type: "REQUEST_RECEIVED", data: incoming };
    }

    if (outgoing?.status === "FOLLOWING") {
      return { type: "FOLLOWING", data: outgoing };
    }

    if (incoming?.status === "FOLLOWING") {
      return { type: "FOLLOWER", data: incoming };
    }

    if (outgoing?.status === "BLOCKED") {
      return { type: "BLOCKED", data: outgoing };
    }

    if (incoming?.status === "BLOCKED") {
      return { type: "BLOCKED_BY", data: incoming };
    }

    return { type: "NONE" };
  } catch (error) {
    console.error(`İlişki durumu getirilirken hata:`, error);
    return {
      type: "ERROR",
      error: "İlişki durumu getirilirken bir hata oluştu",
    };
  }
};

/**
 * Kullanıcının ortak arkadaşlarını getirir
 * @param userId Kullanıcı ID'si
 * @param targetUserId Hedef kullanıcı ID'si
 * @returns Ortak arkadaşlar listesi
 */
export const getMutualFriends = async (
  userId: number,
  targetUserId: number
) => {
  try {
    // Kullanıcının arkadaşlarını getir
    const userFriends = await getUserFriends(userId);

    // Hedef kullanıcının arkadaşlarını getir
    const targetFriends = await getUserFriends(targetUserId);

    // Ortak arkadaşları bul
    const mutualFriends = userFriends.filter((id) =>
      targetFriends.includes(id)
    );

    // Ortak arkadaşların detaylarını getir
    if (mutualFriends.length > 0) {
      return await prisma.user.findMany({
        where: {
          id: {
            in: mutualFriends,
          },
        },
        select: {
          id: true,
          username: true,
          profileImage: true,
        },
      });
    }

    return [];
  } catch (error) {
    console.error(`Ortak arkadaşlar getirilirken hata:`, error);
    return [];
  }
};
