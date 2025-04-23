import { Server } from "socket.io";
import { CustomSocket, FriendRequestData } from "../../types/socket.types";
import { getUserSocketId } from "../../utils/socket/userStatus";

export const setupFriendHandlers = (io: Server, socket: CustomSocket) => {
  const userId = socket.userId;

  if (!userId) return;

  // 'register' olayını dinle - eski sistemle uyumluluk için
  socket.on("register", (registeredUserId) => {
    console.log(`Socket register event: User ${registeredUserId} registered`);

    // Eğer ID'ler eşleşmiyorsa düzelt
    if (registeredUserId !== userId) {
      console.log(
        `Socket register warning: userId mismatch, token: ${userId}, register: ${registeredUserId}`
      );
      socket.userId = registeredUserId;
    }
  });

  // Friend request handlers
  socket.on("send_friend_request", (data: FriendRequestData) => {
    const { targetUserId } = data;
    console.log(
      `Socket event: send_friend_request from ${userId} to ${targetUserId}`
    );

    const targetSocketId = getUserSocketId(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("friend_request_received", {
        fromUserId: userId,
        message: "Yeni bir arkadaşlık isteği aldınız",
      });
    }
  });

  socket.on("accept_friend_request", (data: FriendRequestData) => {
    const { targetUserId } = data;
    console.log(
      `Socket event: accept_friend_request from ${userId} to ${targetUserId}`
    );

    const targetSocketId = getUserSocketId(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("friend_request_accepted", {
        fromUserId: userId,
        message: "Arkadaşlık isteğiniz kabul edildi",
      });
    }
  });
};
