import { Server } from "socket.io";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
} from "../../services/friend.service";
import { CustomSocket, FriendRequestData } from "../../types/socket.types";
import { getUserSocketIds } from "../../utils/socket/userStatus";

export const setupFriendHandlers = (io: Server, socket: CustomSocket) => {
  const userId = socket.userId;

  if (!userId) return;

  socket.on("register", (registeredUserId) => {
    console.log(`Socket register event: User ${registeredUserId} registered`);

    if (registeredUserId !== userId) {
      console.log(
        `Socket register warning: userId mismatch, token: ${userId}, register: ${registeredUserId}`
      );
      socket.userId = registeredUserId;
    }
  });

  // Arkadaşlık isteği gönderme
  socket.on("send_friend_request", async (data: FriendRequestData) => {
    const { targetUserId } = data;
    console.log(
      `Socket event: send_friend_request from ${userId} to ${targetUserId}`
    );

    try {
      // Veritabanında arkadaşlık isteği oluştur
      const requestResult = await sendFriendRequest(userId, targetUserId);

      if (requestResult.error) {
        // Hata durumunda isteği gönderene bildir
        socket.emit("friend_request_error", {
          error: requestResult.error,
          targetUserId,
        });
        return;
      }

      // Hedef kullanıcının tüm socket ID'lerini getir
      const targetSocketIds = await getUserSocketIds(targetUserId);

      // Her bir cihaza/tarayıcıya bildirim gönder
      if (targetSocketIds.length > 0) {
        for (const socketId of targetSocketIds) {
          io.to(socketId).emit("friend_request_received", {
            fromUserId: userId,
            requestId: requestResult.id,
            message: "Yeni bir arkadaşlık isteği aldınız",
            timestamp: Date.now(),
          });
        }

        // İsteği gönderene bilgi ver
        socket.emit("friend_request_sent", {
          targetUserId,
          requestId: requestResult.id,
          success: true,
        });
      } else {
        // Alıcı kullanıcı çevrimdışı olsa da istek başarılı
        socket.emit("friend_request_sent", {
          targetUserId,
          requestId: requestResult.id,
          success: true,
          message:
            "Arkadaşlık isteği gönderildi. Kullanıcı çevrimiçi olduğunda bildirim alacak.",
        });
      }
    } catch (error) {
      console.error("Arkadaşlık isteği gönderilirken hata:", error);
      socket.emit("friend_request_error", {
        error: "Arkadaşlık isteği gönderilirken bir hata oluştu",
        targetUserId,
      });
    }
  });

  // Arkadaşlık isteği kabul etme
  socket.on("accept_friend_request", async (data: FriendRequestData) => {
    const { requestId, targetUserId } = data;
    console.log(
      `Socket event: accept_friend_request from ${userId}, request #${requestId}`
    );

    try {
      // Veritabanında isteği kabul et
      const acceptResult = await acceptFriendRequest(requestId);

      if (acceptResult.error) {
        socket.emit("friend_request_error", {
          error: acceptResult.error,
          targetUserId,
        });
        return;
      }

      // Hedef kullanıcının socket ID'lerini getir
      const targetSocketIds = await getUserSocketIds(targetUserId);

      // Her bir cihaza/tarayıcıya bildirim gönder
      if (targetSocketIds.length > 0) {
        for (const socketId of targetSocketIds) {
          io.to(socketId).emit("friend_request_accepted", {
            fromUserId: userId,
            message: "Arkadaşlık isteğiniz kabul edildi",
            timestamp: Date.now(),
          });
        }
      }

      // Kabul edene bilgi ver
      socket.emit("friend_request_accept_success", {
        targetUserId,
        success: true,
      });
    } catch (error) {
      console.error("Arkadaşlık isteği kabul edilirken hata:", error);
      socket.emit("friend_request_error", {
        error: "Arkadaşlık isteği kabul edilirken bir hata oluştu",
        targetUserId,
      });
    }
  });

  // Arkadaşlık isteği reddetme
  socket.on("reject_friend_request", async (data: FriendRequestData) => {
    const { requestId, targetUserId } = data;
    console.log(
      `Socket event: reject_friend_request from ${userId}, request #${requestId}`
    );

    try {
      // Veritabanında isteği reddet
      await rejectFriendRequest(requestId);

      // Reddedene bilgi ver
      socket.emit("friend_request_reject_success", {
        targetUserId,
        success: true,
      });
    } catch (error) {
      console.error("Arkadaşlık isteği reddedilirken hata:", error);
      socket.emit("friend_request_error", {
        error: "Arkadaşlık isteği reddedilirken bir hata oluştu",
        targetUserId,
      });
    }
  });
};
