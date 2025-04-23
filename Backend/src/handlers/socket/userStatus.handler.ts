import { CustomSocket } from "../../types/socket.types";
import { getOnlineUsers } from "../../utils/socket/userStatus";

export const setupUserStatusHandlers = (socket: CustomSocket) => {
  const userId = socket.userId;

  if (!userId) return;

  // Get online users list event
  socket.on("get_online_users", () => {
    socket.emit("online_users_list", getOnlineUsers());
  });
};
