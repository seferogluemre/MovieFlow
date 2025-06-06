import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "../handlers/socket";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";
import { sendNotificationToUser } from "../services/socket/notification.service";
import { CustomSocket } from "../types/socket.types";
import { getOnlineUsers, isUserOnline } from "../utils/socket/userStatus";

let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: CustomSocket) => {
    registerSocketHandlers(io!, socket);
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

export { getOnlineUsers, isUserOnline };

export const sendNotification = (
  targetUserId: number,
  type: string,
  message: string,
  fromUserId: number,
  metadata: any = {},
  saveToDatabase: boolean = false
) => {
  const socketIo = getIO();
  return sendNotificationToUser(
    socketIo,
    targetUserId,
    type,
    message,
    fromUserId,
    metadata,
    saveToDatabase
  );
};
