import { Socket } from "socket.io";

// Extended socket type to include userId
export interface CustomSocket extends Socket {
  userId?: number;
}

// Types for socket events
export interface FriendRequestData {
  targetUserId: number;
}

export interface NotificationData {
  type: string;
  message: string;
  fromUserId: number;
  metadata?: any;
}
