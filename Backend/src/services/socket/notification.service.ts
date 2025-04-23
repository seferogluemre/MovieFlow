import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { getUserSocketId } from "../../utils/socket/userStatus";

const prisma = new PrismaClient();

// Send a notification to a specific user
export const sendNotificationToUser = async (
  io: Server,
  targetUserId: number,
  type: string,
  message: string,
  fromUserId: number,
  metadata: any = {},
  saveToDatabase: boolean = false
) => {
  try {
    console.log(
      `Bildirim gönderiliyor - Hedef: ${targetUserId}, Tip: ${type}, İleti: "${message}"`
    );

    // Check if the target user is online
    const targetSocketId = getUserSocketId(targetUserId);
    console.log(
      `Hedef kullanıcı online mi? ${targetUserId}: ${
        targetSocketId ? "Evet" : "Hayır"
      }`
    );

    if (targetSocketId) {
      // Send the notification to the target user
      io.to(targetSocketId).emit("notification", {
        type,
        message,
        fromUserId,
        metadata,
      });
      console.log(
        `Bildirim socket üzerinden gönderildi - Socket ID: ${targetSocketId}`
      );
    } else {
      console.log(
        `Hedef kullanıcı ${targetUserId} online değil veya socket bulunamadı`
      );
    }

    // Only store the notification in the database if saveToDatabase is true
    if (saveToDatabase) {
      // Also store the notification in the database
      const notification = await prisma.notification.create({
        data: {
          type: type as any,
          message,
          userId: targetUserId,
          fromUserId,
          metadata: metadata,
        },
      });

      console.log(`Bildirim veritabanına kaydedildi, ID: ${notification.id}`);
      return notification;
    }

    return { success: true, socketSent: !!targetSocketId };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};
