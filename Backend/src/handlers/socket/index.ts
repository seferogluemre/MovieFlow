import { Server } from "socket.io";
import { CustomSocket } from "../../types/socket.types";
import { handleConnection } from "./connection.handler";
import { setupFriendHandlers } from "./friend.handler";
import { setupUserStatusHandlers } from "./userStatus.handler";

export const registerSocketHandlers = (io: Server, socket: CustomSocket) => {
  // Handle connection (includes disconnect handling)
  handleConnection(io, socket);

  // Setup event handlers
  setupFriendHandlers(io, socket);
  setupUserStatusHandlers(socket);
};
