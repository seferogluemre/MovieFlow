import axios, { AxiosError, AxiosRequestConfig } from "axios";

export const accessKey = "accessToken";
export const refreshKey = "refreshToken";
export const userIdKey = "userId"

const API_URL = "http://localhost:3000/api";

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const userId = localStorage.getItem(userIdKey) || "3";
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      timeout: 5000,
    });

    if (response && response.data) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(accessKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(refreshKey);
        if (!refreshToken) {
          return Promise.reject({
            ...error,
            redirectToLogin: true,
            message: "Session expired. Please login again.",
          });
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (!response.data || !response.data.accessToken) {
          throw new Error("Invalid refresh response");
        }

        const { accessToken } = response.data;
        localStorage.setItem(accessKey, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        return Promise.reject({
          ...error,
          refreshFailed: true,
          message: "Authentication failed. Please login again.",
        });
      }
    }

    if (error.response?.status === 404) {
      return Promise.reject({
        ...error,
        isApiNotFound: true,
        message: `API endpoint not found: ${originalRequest.url}`,
      });
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem(accessKey, response.data.accessToken);
      localStorage.setItem(refreshKey, response.data.refreshToken);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await api.post("/auth/logout", { refreshToken });

      localStorage.removeItem(accessKey);
      localStorage.removeItem(refreshKey);
      localStorage.removeItem(userIdKey);

      return response.data;
    } catch (error) {
      localStorage.removeItem(accessKey);
      localStorage.removeItem(refreshKey);
      localStorage.removeItem(userIdKey);

      throw error;
    }
  },
};

export const userService = {
  getCurrentUser: async () => {
    try {
      const userId = localStorage.getItem(userIdKey);

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await api.get(`/users/${userId}`);

      let userData;
      if (response.data && typeof response.data === "object") {
        userData = response.data.data || response.data;

        if (!userData.id || !userData.username) {
          throw new Error("Invalid user data structure");
        }

        return userData;
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
        } else if (error.request) {
        }
      }

      throw error;
    }
  },
  getUserStats: async (userId: number) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllUsers: async () => {
    try {
      const response = await api.get("/users");
      return response.data && response.data.results
        ? response.data.results
        : [];
    } catch (error) {
      throw error;
    }
  },
  updateProfile: async (
    userId: number,
    userData: {
      name?: string;
      username?: string;
      email?: string;
      profileImage?: string | null;
    }
  ) => {
    try {
      const requestData = { ...userData };
      if (userData.profileImage === null) {
        return;
      }

      const response = await api.patch(`/users/${userId}`, requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadProfileImage: async (userId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem(accessKey)}`,
      };
      const response = await api.patch(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return;
        }

        if (error.code === "ERR_NETWORK") {
          throw new Error(
            "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
          );
        }

        if (error.code === "ECONNABORTED") {
          throw new Error(
            "İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin."
          );
        }
      }

      if (error instanceof Error) {
        throw new Error(`Profil fotoğrafı yüklenemedi: ${error.message}`);
      } else {
        throw new Error(
          "Profil fotoğrafı yüklenemedi. Bilinmeyen bir hata oluştu."
        );
      }
    }
  },
};

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch("/notifications/read-all");
    } catch (error) {
      throw error;
    }
  },

  acceptFriendRequest: async (friendshipId: number): Promise<void> => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "ACCEPTED",
      });
    } catch (error) {
      throw error;
    }
  },

  rejectFriendRequest: async (friendshipId: number): Promise<void> => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "BLOCKED",
      });
    } catch (error) {
      throw error;
    }
  },
};

export const libraryService = {
  getUserLibrary: async (userId: number) => {
    try {
      const response = await api.get(`/library/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const watchlistService = {
  getUserWatchlist: async (userId: number) => {
    try {
      const response = await api.get(`/watchlist/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const reviewService = {
  getUserReviews: async (userId: number) => {
    try {
      const response = await api.get(`/reviews/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const friendshipService = {
  getUserFriends: async (userId: number) => {
    try {
      const response = await api.get(`/friendships/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  acceptFriendRequest: async (friendshipId: number) => {
    try {
      const response = await api.patch(`/friendships/${friendshipId}`, {
        status: "ACCEPTED",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectFriendRequest: async (friendshipId: number) => {
    try {
      const response = await api.patch(`/friendships/${friendshipId}`, {
        status: "BLOCKED",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendFriendRequest: async (userId: number) => {
    try {
      const response = await api.post(`/friendships`, {
        friendId: userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelFriendRequest: async (friendshipId: number) => {
    try {
      const response = await api.delete(`/friendships/${friendshipId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeFriend: async (userId: number) => {
    try {
      const currentUserId = localStorage.getItem(userIdKey);
      if (!currentUserId) {
        throw new Error("User ID not found in localStorage");
      }

      const friendships = await friendshipService.getUserFriends(
        parseInt(currentUserId)
      );
      const friendship = friendships.find(
        (f: any) => f.friendId === userId || f.userId === userId
      );

      if (!friendship) {
        throw new Error("Friendship not found");
      }

      const response = await api.delete(`/friendships/${friendship.id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRelationshipStatus: async (targetUserId: number) => {
    try {
      const response = await api.get(`/friendships/status/${targetUserId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  followUser: async (targetUserId: number) => {
    try {
      const response = await api.post(`/friendships/follow/${targetUserId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unfollowUser: async (targetUserId: number) => {
    try {
      const response = await api.delete(`/friendships/follow/${targetUserId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserFollowers: async (userId: number) => {
    try {
      const response = await api.get(`/friendships/followers/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserFollowing: async (userId: number) => {
    try {
      const response = await api.get(`/friendships/following/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMutualFriends: async (userId: number) => {
    try {
      const response = await api.get(`/friendships/mutual/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const processApiError = (error: any): string => {
  let errorMessage = "An error occurred. Please try again.";

  // Hata detayları varsa
  if (error.response?.data) {
    if (
      error.response.data.message === "Validation Failed" &&
      Array.isArray(error.response.data.errors)
    ) {
      const validationErrors = error.response.data.errors;

      for (const err of validationErrors as {
        field: string;
        errors: string;
      }[]) {
        // Review içeriği için minimum karakter hatası
        if (
          err.field === "content" &&
          err.errors.includes("must be at least 10 characters")
        ) {
          return "Yorum içeriği en az 10 karakter olmalıdır.";
        }
      }

      return validationErrors
        .map((err: { errors: string }) => err.errors)
        .join(", ");
    }

    // Backend direkt olarak message dönüyorsa
    if (typeof error.response.data.message === "string") {
      errorMessage = error.response.data.message;
    }
    else if (error.response.data.error) {
      errorMessage =
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : "Unknown error occurred";
    }

    const prismaErrorCode = error.response.data.code;

    if (prismaErrorCode) {
      switch (prismaErrorCode) {
        case "P2002": // Unique constraint hatası
          const target = error.response.data.meta?.target;
          if (target && Array.isArray(target) && target.length > 0) {
            const field = target[0];
            if (field === "email") {
              return "This email is already in use. Please try a different one.";
            } else if (field === "username") {
              return "This username is already taken. Please choose another one.";
            } else {
              return `A record with this ${field} already exists.`;
            }
          }
          return "This record already exists.";

        case "P2003": // Foreign key constraint hatası
          return "This operation references a record that doesn't exist.";

        case "P2025": // Record not found hatası
          return "The requested record was not found.";

        case "P2000": // Input value is too long
          return "One of the input values is too long.";

        default:
          // Diğer Prisma hataları için genel mesaj
          return "Database operation failed. Please try again.";
      }
    }

    if (
      typeof errorMessage === "string" &&
      (errorMessage.toLowerCase().includes("unique constraint") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("already exists"))
    ) {
      // İşleme göre özgün mesajlar
      if (errorMessage.toLowerCase().includes("watchlist")) {
        return "This movie is already in your watchlist.";
      } else if (errorMessage.toLowerCase().includes("library")) {
        return "This movie is already in your library.";
      } else if (errorMessage.toLowerCase().includes("wishlist")) {
        return "This movie is already in your wishlist.";
      } else if (errorMessage.toLowerCase().includes("email")) {
        return "This email address is already registered.";
      } else if (errorMessage.toLowerCase().includes("username")) {
        return "This username is already taken.";
      } else if (
        errorMessage.toLowerCase().includes("(`userid`,`movieid`)") &&
        errorMessage.toLowerCase().includes("review")
      ) {
        return "Her film için sadece bir yorum oluşturabilirsiniz.";
      }
      // Genel unique constraint mesajı
      return "This item already exists.";
    }
  }

  // Network hatası
  if (error.message === "Network Error") {
    return "Cannot connect to the server. Please check your internet connection.";
  }

  return errorMessage;
};

export default api;
