import { Server } from "socket.io";
import { CustomSocket } from "../../types/socket.types";
import {
  addOnlineUser,
  removeOnlineUser,
  updateUserOnlineStatus,
} from "../../utils/socket/userStatus";

export const handleConnection = (io: Server, socket: CustomSocket) => {
  try {
    const userId = socket.userId;

    if (!userId) {
      console.error("Socket bağlantısı: userId bulunamadı");
      socket.disconnect();
      return;
    }

    console.log(`User connected: ${userId}`);

    // Update user's online status to true in the database
    updateUserOnlineStatus(userId, true);

    // Store the user's socket id in the map
    addOnlineUser(userId, socket.id);

    // Kullanıcıya bağlantı onayı gönder
    socket.emit("connected", { userId, status: "online" });

    // Tüm kullanıcılara bu kullanıcının online olduğunu bildir
    io.emit("user_status_changed", { userId, isOnline: true });

    // Handle disconnect event
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);

      // Update user's online status to false in the database
      updateUserOnlineStatus(userId, false);

      // Remove the user from the online users map
      removeOnlineUser(userId);

      // Tüm kullanıcılara bu kullanıcının offline olduğunu bildir
      io.emit("user_status_changed", { userId, isOnline: false });
    });
  } catch (error) {
    console.error("Socket connection error:", error);
  }
};
