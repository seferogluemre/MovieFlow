import { PrismaClient } from "@prisma/client";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";

const prisma = new PrismaClient();

// Extended socket type to include userId
interface CustomSocket extends Socket {
  userId?: number;
}

// Store the online users with their socket ids
const onlineUsers = new Map<number, string>(); // userId -> socketId

// Global instance for Socket.io
let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Daha güvenilir bağlantı için ping timeout ve interval değerleri
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("Socket auth: Token sağlanmadı");
        return next(new Error("Authentication error: Token not provided"));
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: number;
      };

      if (!decoded || !decoded.userId) {
        console.log("Socket auth: Geçersiz token", decoded);
        return next(new Error("Authentication error: Invalid token"));
      }

      // Attach the userId to the socket
      socket.data.userId = decoded.userId;
      console.log(
        `Socket auth: Kullanıcı ${decoded.userId} için token doğrulandı`
      );

      // Find the user in the database to verify they exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true },
      });

      if (!user) {
        console.log(`Socket auth: Kullanıcı ${decoded.userId} bulunamadı`);
        return next(new Error("Authentication error: User not found"));
      }

      // Socket nesnesine doğrudan userId ekle
      socket.userId = decoded.userId;
      console.log(
        `Socket auth: Kullanıcı ${decoded.userId} için socket veri objesine userId eklendi`
      );

      next();
    } catch (error) {
      console.log("Socket auth error:", error);
      return next(
        new Error(`Authentication error: ${(error as Error).message}`)
      );
    }
  });

  // Handle connections
  io.on("connection", async (socket: CustomSocket) => {
    try {
      // Socket.data yerine doğrudan socket.userId kullan
      const userId = socket.userId;

      if (!userId) {
        console.error("Socket bağlantısı: userId bulunamadı");
        socket.disconnect();
        return;
      }

      console.log(`User connected: ${userId}`);

      // Update user's online status to true in the database
      await updateUserOnlineStatus(userId, true);

      // Store the user's socket id in the map
      onlineUsers.set(userId, socket.id);
      console.log(`Aktif kullanıcılar: ${Array.from(onlineUsers.keys())}`);

      // Kullanıcıya bağlantı onayı gönder
      socket.emit("connected", { userId, status: "online" });

      // Tüm kullanıcılara bu kullanıcının online olduğunu bildir
      if (io) {
        io.emit("user_status_changed", { userId, isOnline: true });
      }

      // 'register' olayını dinle - eski sistemle uyumluluk için
      socket.on("register", (registeredUserId) => {
        console.log(
          `Socket register event: User ${registeredUserId} registered`
        );

        // Eğer ID'ler eşleşmiyorsa düzelt
        if (registeredUserId !== userId) {
          console.log(
            `Socket register warning: userId mismatch, token: ${userId}, register: ${registeredUserId}`
          );
          socket.userId = registeredUserId;
          onlineUsers.set(registeredUserId, socket.id);
        }
      });

      // Arkadaşlık istekleri olaylarını dinle
      socket.on("send_friend_request", async (data) => {
        const { targetUserId } = data;
        console.log(
          `Socket event: send_friend_request from ${userId} to ${targetUserId}`
        );

        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId && io) {
          io.to(targetSocketId).emit("friend_request_received", {
            fromUserId: userId,
            message: "Yeni bir arkadaşlık isteği aldınız",
          });
        }
      });

      socket.on("accept_friend_request", async (data) => {
        const { targetUserId } = data;
        console.log(
          `Socket event: accept_friend_request from ${userId} to ${targetUserId}`
        );

        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId && io) {
          io.to(targetSocketId).emit("friend_request_accepted", {
            fromUserId: userId,
            message: "Arkadaşlık isteğiniz kabul edildi",
          });
        }
      });

      // Get online users list event
      socket.on("get_online_users", () => {
        socket.emit("online_users_list", Array.from(onlineUsers.keys()));
      });

      // Listen for disconnection
      socket.on("disconnect", async () => {
        console.log(`User disconnected: ${userId}`);

        // Update user's online status to false in the database
        await updateUserOnlineStatus(userId, false);

        // Remove the user from the online users map
        onlineUsers.delete(userId);
        console.log(
          `Güncel aktif kullanıcılar: ${Array.from(onlineUsers.keys())}`
        );

        // Tüm kullanıcılara bu kullanıcının offline olduğunu bildir
        if (io) {
          io.emit("user_status_changed", { userId, isOnline: false });
        }
      });
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  });

  return io;
};

// Get the socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

// Helper function to update user's online status
const updateUserOnlineStatus = async (userId: number, isOnline: boolean) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: isOnline },
    });
    console.log(`Kullanıcı ${userId} online durumu: ${isOnline}`);
  } catch (error) {
    console.error(`Error updating online status for user ${userId}:`, error);
  }
};

// Get online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Check if a user is online
export const isUserOnline = (userId: number) => {
  return onlineUsers.has(userId);
};

// Send a notification to a specific user
export const sendNotificationToUser = async (
  targetUserId: number,
  type: string,
  message: string,
  fromUserId: number,
  metadata: any = {},
  saveToDatabase: boolean = false // Veritabanına kaydetmeyi opsiyonel hale getir
) => {
  try {
    console.log(
      `Bildirim gönderiliyor - Hedef: ${targetUserId}, Tip: ${type}, İleti: "${message}"`
    );

    // Check if the target user is online
    const targetSocketId = onlineUsers.get(targetUserId);
    console.log(
      `Hedef kullanıcı online mi? ${targetUserId}: ${
        targetSocketId ? "Evet" : "Hayır"
      }`
    );

    if (targetSocketId && io) {
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
