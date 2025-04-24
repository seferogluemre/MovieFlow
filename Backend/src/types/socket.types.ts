import { Socket } from "socket.io";

// Extended socket type to include userId
export interface CustomSocket extends Socket {
  userId?: number;
}

// Types for socket events
export interface FriendRequestData {
  targetUserId: number;
  requestId?: number; // Arkadaşlık isteği ID'si
}

// Friendship işlemleri için response tipi
export interface FriendshipResult {
  id?: number;
  userId?: number;
  friendId?: number;
  status?: string;
  createdAt?: Date;
  error?: string;
  success?: boolean;
}

export interface NotificationData {
  type: string;
  message: string;
  fromUserId: number;
  metadata?: any;
  timestamp?: number;
}
