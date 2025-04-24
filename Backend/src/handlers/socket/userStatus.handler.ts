import { getUserFriends } from "../../services/friend.service";
import { CustomSocket } from "../../types/socket.types";
import {
  getOnlineFriends,
  getOnlineUsers,
} from "../../utils/socket/userStatus";

export const setupUserStatusHandlers = (socket: CustomSocket) => {
  const userId = socket.userId;

  if (!userId) return;

  // Tüm online kullanıcıları getir
  socket.on("get_online_users", async () => {
    const onlineUsers = await getOnlineUsers();
    socket.emit("online_users_list", onlineUsers);
  });

  // Kullanıcının online arkadaşlarını getir
  socket.on("get_online_friends", async () => {
    try {
      // Kullanıcının arkadaşlarını getir
      const friendIds = await getUserFriends(userId);

      // Online olan arkadaşları bul
      const onlineFriendIds = await getOnlineFriends(friendIds);

      socket.emit("online_friends_list", onlineFriendIds);
    } catch (error) {
      console.error("Online arkadaşlar alınırken hata:", error);
      socket.emit("error", {
        message: "Online arkadaşlar alınırken bir hata oluştu",
      });
    }
  });
};
