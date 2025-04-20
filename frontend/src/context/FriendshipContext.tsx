import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { friendshipService, notificationService } from "../utils/api";
import { Friendship, Notification } from "../utils/types";
import { useAuth } from "./AuthContext";

interface FriendshipContextType {
  friendships: Friendship[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  notifications: Notification[];
  loadingFriendships: boolean;
  loadingNotifications: boolean;
  error: string | null;
  updateFriendshipsList: () => Promise<void>;
  updateNotificationsList: () => Promise<void>;
  acceptFriendRequest: (friendshipId: number) => Promise<void>;
  rejectFriendRequest: (friendshipId: number) => Promise<void>;
  cancelFriendRequest: (friendshipId: number) => Promise<void>;
  sendFriendRequest: (friendId: number) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const FriendshipContext = createContext<FriendshipContextType | undefined>(
  undefined
);

export const FriendshipProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingFriendships, setLoadingFriendships] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFriendshipsList = async () => {
    if (!isAuthenticated) return;

    setLoadingFriendships(true);
    try {
      // Fetch friends
      const friendshipsResponse = await api.get("/friendships");
      setFriendships(friendshipsResponse.data || []);

      // Fetch pending requests
      const pendingResponse = await api.get("/friendships/pending");
      setPendingRequests(pendingResponse.data || []);

      // Fetch sent requests
      const sentResponse = await api.get("/friendships/sent");
      setSentRequests(sentResponse.data || []);
    } catch (err) {
      console.error("Error fetching friendships:", err);
      setError("Failed to load friendship data");
    } finally {
      setLoadingFriendships(false);
    }
  };

  const updateNotificationsList = async () => {
    if (!isAuthenticated) return;

    setLoadingNotifications(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoadingNotifications(false);
    }
  };

  const acceptFriendRequest = async (friendshipId: number) => {
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      // Update both lists after accepting a request
      await updateFriendshipsList();
      await updateNotificationsList();
    } catch (err) {
      console.error("Error accepting friendship request:", err);
      setError("Failed to accept friend request");
    }
  };

  const rejectFriendRequest = async (friendshipId: number) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId);
      // Update both lists after rejecting a request
      await updateFriendshipsList();
      await updateNotificationsList();
    } catch (err) {
      console.error("Error rejecting friendship request:", err);
      setError("Failed to reject friend request");
    }
  };

  const cancelFriendRequest = async (friendshipId: number) => {
    try {
      await friendshipService.cancelFriendRequest(friendshipId);
      // Update lists after canceling a request
      await updateFriendshipsList();
    } catch (err) {
      console.error("Error canceling friendship request:", err);
      setError("Failed to cancel friend request");
    }
  };

  const sendFriendRequest = async (friendId: number) => {
    try {
      await friendshipService.sendFriendRequest(friendId);
      // Update sent requests list after sending
      await updateFriendshipsList();
    } catch (err) {
      console.error("Error sending friendship request:", err);
      setError("Failed to send friend request");
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      await updateNotificationsList();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read");
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await updateNotificationsList();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all notifications as read");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      updateFriendshipsList();
      updateNotificationsList();
    }
  }, [isAuthenticated]);

  return (
    <FriendshipContext.Provider
      value={{
        friendships,
        pendingRequests,
        sentRequests,
        notifications,
        loadingFriendships,
        loadingNotifications,
        error,
        updateFriendshipsList,
        updateNotificationsList,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        sendFriendRequest,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
};

export const useFriendship = (): FriendshipContextType => {
  const context = useContext(FriendshipContext);
  if (context === undefined) {
    throw new Error("useFriendship must be used within a FriendshipProvider");
  }
  return context;
};
