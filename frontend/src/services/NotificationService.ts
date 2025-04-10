import api from "../utils/api";
import { Notification } from "../utils/types";

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch("/notifications/read-all");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  // Handle friendship requests via the friendship service
  acceptFriendRequest: async (friendshipId: number): Promise<void> => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "ACCEPTED",
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  },

  rejectFriendRequest: async (friendshipId: number): Promise<void> => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "BLOCKED",
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw error;
    }
  },
};
