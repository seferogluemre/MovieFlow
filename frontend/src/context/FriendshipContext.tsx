import { Alert, Snackbar } from "@mui/material";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api, { notificationService, processApiError } from "../utils/api";
import {
  getSocket,
  initSocket,
  isSocketConnected,
  removeNotificationHandler,
  setupNotificationHandler,
} from "../utils/socket";
import { Friendship, Notification, UserRelationship } from "../utils/types";
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
  updateNotificationsList: () => Promise<Notification[] | null>;
  acceptFriendRequest: (friendshipId: number) => Promise<boolean>;
  rejectFriendRequest: (friendshipId: number) => Promise<boolean>;
  cancelFriendRequest: (friendshipId: number) => Promise<boolean>;
  sendFriendRequest: (targetUserId: number) => Promise<boolean>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  getUserRelationship: (userId: number) => Promise<UserRelationship>;
  showNotification: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
  isUserOnline: (userId: number) => boolean;
  onlineUsers: number[];
}

interface FriendshipProviderProps {
  children: ReactNode;
}

// Initial context value
const defaultContextValue: FriendshipContextType = {
  friendships: [],
  pendingRequests: [],
  sentRequests: [],
  notifications: [],
  loadingFriendships: false,
  loadingNotifications: false,
  error: null,
  updateFriendshipsList: async () => {},
  updateNotificationsList: async () => null,
  acceptFriendRequest: async () => false,
  rejectFriendRequest: async () => false,
  cancelFriendRequest: async () => false,
  sendFriendRequest: async () => false,
  markNotificationAsRead: async () => {},
  markAllNotificationsAsRead: async () => {},
  getUserRelationship: async () => ({
    userId: 0,
    isFriend: false,
    isPending: false,
    isFollowing: false,
    isBlocked: false,
  }),
  showNotification: () => {},
  isUserOnline: () => false,
  onlineUsers: [],
};

const FriendshipContext =
  createContext<FriendshipContextType>(defaultContextValue);

export const FriendshipProvider = ({ children }: FriendshipProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingFriendships, setLoadingFriendships] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for notification toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // Socket olayları için state değişkenleri
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  // Use refs to track if updates are in progress
  const updatingNotificationsRef = useRef(false);
  const updateNotificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Force re-render counter
  const [forceRender, setForceRender] = useState(0);

  // Listen for socket notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // İlk yükleme
      updateFriendshipsList();
      updateNotificationsList();
    }
  }, [isAuthenticated]);

  // Socket bağlantısını kontrol et ve gerekirse yeniden bağlan
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("accessToken");
      if (token && (!getSocket() || !isSocketConnected())) {
        console.log("Socket bağlantısı yeniden kuruluyor...");
        initSocket(token);
      }
    }
  }, [isAuthenticated, user]);

  // Efficient add notification function - outside useEffect to prevent recreation
  const addNotificationToState = useCallback(
    (newNotification: Notification) => {
      console.log("Yeni bildirim ekleniyor:", newNotification);

      // Add notification to state
      setNotifications((prevNotifications) => {
        // Check if notification with same ID already exists
        const exists = prevNotifications.some(
          (n) =>
            n.id === newNotification.id ||
            (n.type === newNotification.type &&
              n.fromUserId === newNotification.fromUserId &&
              Math.abs(
                new Date(n.createdAt).getTime() -
                  new Date(newNotification.createdAt).getTime()
              ) < 5000)
        );

        if (exists) {
          console.log("Bu bildirim zaten mevcut, eklenmiyor");
          return prevNotifications;
        }

        // Add new notification at the beginning
        return [newNotification, ...prevNotifications];
      });

      // Force a re-render
      setForceRender((prev) => prev + 1);
    },
    []
  );

  // Bildirimler için ayrı bir useEffect ekleyelim
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Socket bağlantısını kontrol et
    const socket = getSocket();
    if (!socket || !isSocketConnected()) {
      console.warn(
        "FriendshipContext: Socket bağlantısı mevcut değil veya bağlı değil"
      );
      return;
    }

    console.log("FriendshipContext: Socket event listener'ları ayarlanıyor");

    // Setup notification handler for Socket.io events
    setupNotificationHandler((data) => {
      // Geliştirici test mesajlarını gösterme
      if (data.type === "TEST") {
        console.log("Test bildirimi alındı, gösterilmiyor:", data);
        return;
      }

      console.log("Bildirim alındı:", data);

      // Extract notification data
      const { type, message, fromUserId, metadata } = data;

      // Map notification types to severity levels
      let severity: "success" | "error" | "info" | "warning" = "info";

      switch (type) {
        case "FRIEND_REQUEST":
          severity = "info";
          // Refresh pending requests when a new friend request is received
          fetchPendingRequests();
          break;
        case "FRIEND_REQUEST_ACCEPTED":
          severity = "success";
          // Hemen arkadaşlık listesini güncelle - kabul edildiği için
          fetchFriendships();
          break;
        case "FRIEND_REQUEST_REJECTED":
          severity = "error";
          break;
        default:
          severity = "info";
      }

      // Show notification with the appropriate severity
      console.log(`Toast mesajı gösteriliyor: "${message}" (${severity})`);
      setToastMessage(message);
      setToastSeverity(severity);
      setToastOpen(true);

      // Immediately add the notification to the notifications list
      // Create a temporary notification object with required fields
      const tempNotification: Notification = {
        id: Date.now(), // Temporary ID that will be replaced when we fetch from server
        type: type as any,
        message: message,
        fromUserId: fromUserId,
        userId: user?.id || 0,
        metadata: metadata,
        isRead: false,
        createdAt: new Date().toISOString(),
        fromUser: undefined, // Will be filled when we fetch from server
      };

      // Add notification to state
      addNotificationToState(tempNotification);

      // Schedule update after a short delay, but only if not already updating
      if (!updatingNotificationsRef.current) {
        if (updateNotificationsTimeoutRef.current) {
          clearTimeout(updateNotificationsTimeoutRef.current);
        }

        updateNotificationsTimeoutRef.current = setTimeout(() => {
          updateNotificationsTimeoutRef.current = null;
          updatingNotificationsRef.current = true;

          console.log(
            "Bildirim alındı, bildirimler sunucudan güncelleniyor..."
          );
          updateNotificationsList().finally(() => {
            updatingNotificationsRef.current = false;
          });
        }, 1000);
      }
    });

    // Arkadaşlık istekleriyle ilgili socket olaylarını dinle
    socket.off("friend_request_received");
    socket.on("friend_request_received", (data) => {
      console.log("Socket: friend_request_received", data);
      showNotification(data.message, "info");

      // Arkadaşlık isteği bildirimini hemen ekleyelim
      const tempNotification: Notification = {
        id: Date.now(),
        type: "FRIEND_REQUEST",
        message: data.message,
        fromUserId: data.fromUserId,
        userId: user?.id || 0,
        metadata: data.metadata,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Add notification to state
      addNotificationToState(tempNotification);

      // Update friendship requests
      fetchPendingRequests();
    });

    socket.off("friend_request_accepted");
    socket.on("friend_request_accepted", (data) => {
      console.log("Socket: friend_request_accepted", data);

      // Show toast notification
      showNotification(data.message, "success");

      // Create temporary notification for accepted friend request
      const tempNotification: Notification = {
        id: Date.now(),
        type: "FRIEND_REQUEST_ACCEPTED",
        message: data.message,
        fromUserId: data.fromUserId,
        userId: user?.id || 0,
        metadata: data.metadata,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Add notification to state
      addNotificationToState(tempNotification);

      // Update friendship list
      fetchFriendships();
    });

    // Online kullanıcıları dinle
    socket.off("online_users_list");
    socket.on("online_users_list", (users) => {
      console.log("Socket: online_users_list", users);
      setOnlineUsers(users);
    });

    // Online kullanıcıları sorgula
    socket.emit("get_online_users");

    // Clean up on unmount
    return () => {
      removeNotificationHandler();
      socket.off("friend_request_received");
      socket.off("friend_request_accepted");
      socket.off("online_users_list");

      if (updateNotificationsTimeoutRef.current) {
        clearTimeout(updateNotificationsTimeoutRef.current);
        updateNotificationsTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated, user, addNotificationToState]);

  // Bildirim sayısını izleyen bir useEffect ekleyelim
  useEffect(() => {
    console.log(
      `Bildirim sayısı değişti: ${notifications.length} (${forceRender} kez yenilendi)`
    );
  }, [notifications.length, forceRender]);

  // Function to show notification toast - daha belirgin hale getirelim
  const showNotification = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    // Debug amaçlı olarak yalnızca geliştirme modunda logları göster
    if (process.env.NODE_ENV === "development") {
      console.log(`TOAST BİLDİRİM: "${message}" (${severity})`);
    }

    // Mevcut toast'ı kapat ve yeni toast'ı göster
    setToastOpen(false);
    setTimeout(() => {
      setToastMessage(message);
      setToastSeverity(severity);
      setToastOpen(true);
    }, 100); // Çok kısa bir gecikme ile, önceki toast'ın kapanmasını bekle
  };

  // Handle closing the toast
  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const fetchFriendships = async () => {
    try {
      const response = await api.get("/friendships");
      setFriendships(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching friendships:", err);
      setError("Arkadaşlık verileri alınırken bir hata oluştu.");
      throw err;
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("/friendships/pending");
      setPendingRequests(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError("Bekleyen istekler alınırken bir hata oluştu.");
      throw err;
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await api.get("/friendships/sent");
      setSentRequests(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching sent requests:", err);
      setError("Gönderilen istekler alınırken bir hata oluştu.");
      throw err;
    }
  };

  const updateFriendshipsList = async () => {
    if (!isAuthenticated) return;

    setLoadingFriendships(true);
    setError(null);

    try {
      await Promise.all([
        fetchFriendships(),
        fetchPendingRequests(),
        fetchSentRequests(),
      ]);
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(
        errorMessage || "Arkadaşlık verileri alınırken bir hata oluştu."
      );
    } finally {
      setLoadingFriendships(false);
    }
  };

  const updateNotificationsList = async (): Promise<Notification[] | null> => {
    if (!isAuthenticated) return null;

    // Yüklemeyi başlat
    setLoadingNotifications(true);

    try {
      console.log("Bildirimler getiriliyor...");

      const response = await notificationService.getNotifications();
      console.log("Bildirimler alındı, toplam:", response?.length || 0);

      // Tip hatası düzeltmesi, as operatörü ile tip dönüşümü
      const typedResponse = response as unknown as Notification[];
      setNotifications(typedResponse);

      return typedResponse; // Başarılı sonucu döndür
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      return null;
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Function to accept a friend request
  const acceptFriendRequest = async (
    friendshipId: number
  ): Promise<boolean> => {
    try {
      // Önce friendshipId'den targetUserId'yi çıkar
      const friendship = await api.get(`/friendships/${friendshipId}`);
      const targetUserId = friendship.data.userId;

      // REST API ile istek kabul et
      await api.patch(`/friendships/${friendshipId}`, {
        status: "ACCEPTED",
      });

      // İsteği gönderen kullanıcı adını al (UI geribildirim için)
      const senderUsername = friendship.data?.user?.username || "Kullanıcı";

      // Immediately update the friendship in the local state
      setFriendships((prevFriendships) => [
        ...prevFriendships,
        friendship.data,
      ]);

      // Immediately mark the notification as read in the UI
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.metadata?.friendshipId === friendshipId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // UI'da bildirim göster
      showNotification(
        `${senderUsername} arkadaşlık isteğini kabul ettiniz`,
        "success"
      );

      // Socket ile de bildirim gönder
      if (targetUserId) {
        acceptFriendRequestViaSocket(targetUserId);
      }

      // Hemen bildirimleri ve arkadaşlık listesini güncelle
      console.log("Arkadaşlık kabul edildi, listeler güncelleniyor...");
      await Promise.all([fetchFriendships(), updateNotificationsList()]);

      return true;
    } catch (err) {
      console.error("Error accepting friend request:", err);
      const errorMessage = processApiError(err);
      setError(
        errorMessage || "Arkadaşlık isteği kabul edilirken bir hata oluştu."
      );
      return false;
    }
  };

  // Function to reject a friend request
  const rejectFriendRequest = async (
    friendshipId: number
  ): Promise<boolean> => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "BLOCKED",
      });

      // Update friendship lists after rejection
      updateFriendshipsList();
      updateNotificationsList();
      return true;
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      const errorMessage = processApiError(err);
      setError(
        errorMessage || "Arkadaşlık isteği reddedilirken bir hata oluştu."
      );
      return false;
    }
  };

  // Function to cancel a friend request
  const cancelFriendRequest = async (
    friendshipId: number
  ): Promise<boolean> => {
    try {
      await api.delete(`/friendships/${friendshipId}`);

      // Update sent requests list after cancellation
      updateFriendshipsList();
      return true;
    } catch (err) {
      console.error("Error canceling friend request:", err);
      const errorMessage = processApiError(err);
      setError(
        errorMessage || "Arkadaşlık isteği iptal edilirken bir hata oluştu."
      );
      return false;
    }
  };

  // Function to send a friend request via Socket
  const sendFriendRequestViaSocket = (targetUserId: number) => {
    const socket = getSocket();
    if (socket && isSocketConnected()) {
      console.log(
        `Socket üzerinden ${targetUserId} kullanıcısına arkadaşlık isteği gönderiliyor`
      );
      socket.emit("send_friend_request", { targetUserId });
      return true;
    } else {
      console.error("Socket bağlantısı mevcut değil veya bağlı değil");
      return false;
    }
  };

  // Function to accept a friend request via Socket
  const acceptFriendRequestViaSocket = (targetUserId: number) => {
    const socket = getSocket();
    if (socket && isSocketConnected()) {
      console.log(
        `Socket üzerinden ${targetUserId} kullanıcısının arkadaşlık isteği kabul ediliyor`
      );

      // Socket event'i için retry mekanizması
      const emitWithRetry = (attempt = 0) => {
        socket.emit("accept_friend_request", { targetUserId }, (ack: any) => {
          if (!ack && attempt < 3) {
            console.log(
              `Socket bildirim gönderimi başarısız, yeniden deneniyor (${
                attempt + 1
              }/3)`
            );
            setTimeout(() => emitWithRetry(attempt + 1), 500);
          } else if (ack) {
            console.log("Socket bildirim gönderimi başarılı:", ack);
          } else {
            console.warn("Socket bildirim gönderimi başarısız!");
          }
        });
      };

      // İlk deneme
      emitWithRetry();

      return true;
    } else {
      console.error("Socket bağlantısı mevcut değil veya bağlı değil");
      return false;
    }
  };

  // Update the sendFriendRequest function to also use Socket
  const sendFriendRequest = async (targetUserId: number): Promise<boolean> => {
    try {
      // REST API ile istek at
      await api.post("/friendships", {
        friendId: targetUserId,
      });

      // Socket ile de bildirim gönder
      sendFriendRequestViaSocket(targetUserId);

      // Update sent requests list after sending
      updateFriendshipsList();
      return true;
    } catch (err) {
      console.error("Error sending friend request:", err);
      const errorMessage = processApiError(err);
      setError(
        errorMessage || "Arkadaşlık isteği gönderilirken bir hata oluştu."
      );
      return false;
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

  // Function to get the relationship status with a specific user
  const getUserRelationship = async (
    userId: number
  ): Promise<UserRelationship> => {
    try {
      const response = await api.get(`/friendships/status/${userId}`);

      return {
        userId,
        isFriend: response.data.type === "FRIENDS",
        isPending: response.data.type === "PENDING",
        isFollowing:
          response.data.type === "FOLLOWING" ||
          response.data.type === "MUTUAL_FOLLOW",
        isBlocked:
          response.data.type === "BLOCKED" ||
          response.data.type === "BLOCKED_BY_OTHER",
      };
    } catch (err) {
      console.error("Error fetching user relationship:", err);
      return {
        userId,
        isFriend: false,
        isPending: false,
        isFollowing: false,
        isBlocked: false,
      };
    }
  };

  // Kullanıcının online olup olmadığını kontrol et
  const isUserOnline = (userId: number): boolean => {
    return onlineUsers.includes(userId);
  };

  // Context value to be provided
  const contextValue: FriendshipContextType = {
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
    getUserRelationship,
    showNotification,
    isUserOnline,
    onlineUsers,
  };

  return (
    <FriendshipContext.Provider value={contextValue}>
      {children}
      {/* Toast/Snackbar for notifications */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          zIndex: 99999, // Çok yüksek z-index
          marginTop: "70px", // Üst menü altında görünsün
          width: "80%", // Genişlik
          maxWidth: "600px", // Maksimum genişlik
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{
            width: "100%",
            boxShadow: 5,
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </FriendshipContext.Provider>
  );
};

export const useFriendship = () => useContext(FriendshipContext);

export default FriendshipContext;
