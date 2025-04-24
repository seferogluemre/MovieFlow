import { Server } from "socket.io";
import { getUserFriends } from "../../services/friend.service";
import { CustomSocket } from "../../types/socket.types";
import {
  getUserSocketIds,
  removeUserSession,
  setUserOnline,
} from "../../utils/socket/userStatus";

export const handleConnection = async (io: Server, socket: CustomSocket) => {
  try {
    const userId = socket.userId;

    if (!userId) {
      console.log("UserId olmayan socket bağlantısı reddedildi");
      socket.disconnect();
      return;
    }

    // Kullanıcıyı Redis'te online olarak işaretle
    await setUserOnline(userId, socket.id);

    // Kullanıcıya bağlantı onayı gönder
    socket.emit("connected", { userId, status: "online" });

    // Kullanıcının arkadaşlarını getir
    const friendIds = await getUserFriends(userId);

    // Arkadaşlarına kullanıcının online olduğunu bildir
    for (const friendId of friendIds) {
      // Her bir arkadaşın socket ID'lerini getir
      const friendSocketIds = await getUserSocketIds(friendId);

      // Her bir socket'e bildirim gönder
      for (const socketId of friendSocketIds) {
        io.to(socketId).emit("user_status_changed", {
          userId,
          isOnline: true,
          timestamp: Date.now(),
        });
      }
    }

    // Bağlantı kesildiğinde
    socket.on("disconnect", async () => {
      // Kullanıcı oturumunu kapat ve tamamen çıkış yaptıysa true döner
      const isFullyOffline = await removeUserSession(userId, socket.id);

      // Kullanıcı tamamen çıkış yaptıysa (tüm oturumları kapatıldıysa) arkadaşlarına bildir
      if (isFullyOffline) {
        for (const friendId of friendIds) {
          const friendSocketIds = await getUserSocketIds(friendId);

          for (const socketId of friendSocketIds) {
            io.to(socketId).emit("user_status_changed", {
              userId,
              isOnline: false,
              timestamp: Date.now(),
            });
          }
        }
      }
    });
  } catch (error) {
    console.error("Socket bağlantı hatası:", error);
    socket.disconnect();
  }
};
