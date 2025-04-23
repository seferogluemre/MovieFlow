import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Store the online users with their socket ids
const onlineUsers = new Map<number, string>(); // userId -> socketId

// Helper function to update user's online status
export const updateUserOnlineStatus = async (
  userId: number,
  isOnline: boolean
) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: isOnline },
    });
    console.log(`Kullanıcı ${userId} online durumu: ${isOnline}`);
  } catch (error) {
    console.error(`Error updating online status for user ${userId}:`, error);
  }
};

// Store user's socket id in the map
export const addOnlineUser = (userId: number, socketId: string) => {
  onlineUsers.set(userId, socketId);
  console.log(`Aktif kullanıcılar: ${Array.from(onlineUsers.keys())}`);
};

// Remove user from online users map
export const removeOnlineUser = (userId: number) => {
  onlineUsers.delete(userId);
  console.log(`Güncel aktif kullanıcılar: ${Array.from(onlineUsers.keys())}`);
};

// Get online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Check if a user is online
export const isUserOnline = (userId: number) => {
  return onlineUsers.has(userId);
};

// Get user's socket id
export const getUserSocketId = (userId: number) => {
  return onlineUsers.get(userId);
};

// Get the entire online users map
export const getOnlineUsersMap = () => {
  return onlineUsers;
};
