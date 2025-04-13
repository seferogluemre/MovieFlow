import axios, { AxiosError, AxiosRequestConfig } from "axios";

// Backend API URL'i
// Not: Backend API URL'ini backend'in çalıştığı port'a göre ayarlayın
const API_URL = "http://localhost:3000/api";

// Bu fonksiyon API'nin aktif olup olmadığını kontrol eder
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // API'nin aktif olup olmadığını kontrol etmek için basit bir istek
    console.log("🌐 API sağlık kontrolü yapılıyor...");
    // Sağlık endpointi yerine users endpointini kontrol edelim
    const userId = localStorage.getItem("userId") || "3";
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      timeout: 5000,
    });

    // Eğer response geçerli ise API aktif demektir
    if (response && response.data) {
      console.log("✅ API sağlık kontrolü başarılı:", response.status);
      return true;
    }

    console.warn("⚠️ API sağlık kontrolü başarısız: Geçersiz yanıt formatı");
    return false;
  } catch (error) {
    console.error("❌ API sağlık kontrolü hatası:", error);
    return false;
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CORS credential desteği için
  timeout: 10000, // 10 saniye timeout
});

// İstek interceptor ile auth token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Yanıt interceptor ile hata yönetimi ve token yenileme
api.interceptors.response.use(
  (response) => {
    // API yanıtları data özelliği içinde geliyor, bunu direkt olarak döndür
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 Unauthorized hatası ve daha önce retry yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.log(
            "Refresh token bulunamadı, login sayfasına yönlendiriliyor"
          );
          // Refresh token yoksa login sayfasına yönlendir
          return Promise.reject({
            ...error,
            redirectToLogin: true,
            message: "Session expired. Please login again.",
          });
        }

        // Yeni token alma işlemi
        console.log("Refresh token ile yeni token alınıyor...");
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (!response.data || !response.data.accessToken) {
          throw new Error("Invalid refresh response");
        }

        const { accessToken } = response.data;
        console.log("Yeni access token alındı");

        // Yeni token'ı kaydet
        localStorage.setItem("accessToken", accessToken);

        // Orijinal isteği yeni token ile tekrarla
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        console.error("Token yenileme hatası:", err);
        // Sayfayı yenilemeden önce bir mesaj göster
        // Burada doğrudan logout işlemi yapmıyoruz, sadece hata fırlatıyoruz
        // Ana uygulama bu hatayı yakalayıp uygun işlemi yapacak
        return Promise.reject({
          ...error,
          refreshFailed: true,
          message: "Authentication failed. Please login again.",
        });
      }
    }

    // 404 Not Found hatası - API endpoint mevcut değil
    if (error.response?.status === 404) {
      console.error(`API endpoint not found: ${originalRequest.url}`);
      return Promise.reject({
        ...error,
        isApiNotFound: true,
        message: `API endpoint not found: ${originalRequest.url}`,
      });
    }

    return Promise.reject(error);
  }
);

// Güvenli API çağrı fonksiyonu - hatalar güvenli şekilde yakalanır
const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error("API call failed:", error);
    return fallback;
  }
};

// API servis fonksiyonları
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log(`Attempting login with email: ${email}`);
      const response = await api.post("/auth/login", { email, password });
      console.log("Login successful:", response.data);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
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

      // Token ve kullanıcı bilgilerini temizle
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      return response.data;
    } catch (error) {
      console.error("Logout error:", error);

      // Hata olsa bile local storage'ı temizle
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      throw error;
    }
  },
};

export const userService = {
  getCurrentUser: async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("Kullanıcı ID'si bulunamadı!");
        throw new Error("User ID not found");
      }

      console.log(`Kullanıcı verisi çekiliyor: ID=${userId}`);
      console.log(
        `Authorization header: Bearer ${localStorage
          .getItem("accessToken")
          ?.substring(0, 10)}...`
      );

      const response = await api.get(`/users/${userId}`);

      // API yanıtının yapısını incele
      console.log("Ham API yanıtı:", response);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Response data type:", typeof response.data);
      console.log("Response data:", JSON.stringify(response.data, null, 2));

      // Veri data içinde olabilir
      let userData;
      if (response.data && typeof response.data === "object") {
        // Response objesi içine bak
        console.log(
          "API yanıtı data içeriyor, dönüş şekli:",
          response.data.data ? "İç içe data objesi" : "Düz data objesi"
        );

        // data.data formatı (iç içe) veya düz data formatı
        userData = response.data.data || response.data;

        console.log("İşlenmiş kullanıcı verisi:", userData);

        // Make sure userData contains the expected properties
        if (!userData.id || !userData.username) {
          console.error("User data is missing required fields:", userData);
          throw new Error("Invalid user data structure");
        }

        return userData;
      } else {
        console.error("Geçersiz API yanıt formatı:", response);
        throw new Error("Invalid API response format");
      }
    } catch (error: unknown) {
      console.error("Kullanıcı verisi çekme hatası:", error);

      // If it's an AxiosError, provide more details
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
          console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Error request:", error.request);
        }
      }

      console.error(
        "Error message:",
        error instanceof Error ? error.message : String(error)
      );

      throw error;
    }
  },
  getUserStats: async (userId: number) => {
    try {
      console.log(`Fetching stats for user ID: ${userId}`);
      const response = await api.get(`/users/${userId}`);
      console.log("User stats:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user stats error:", error);
      throw error;
    }
  },
  getAllUsers: async () => {
    try {
      console.log("Fetching all users from the system");
      const response = await api.get("/users");
      console.log("All users data:", response.data);
      return response.data && response.data.results
        ? response.data.results
        : [];
    } catch (error) {
      console.error("Get all users error:", error);
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
      console.log(
        `Profil güncellemesi başlatılıyor (User ID: ${userId})`,
        userData
      );
      console.log("profileImage değeri:", userData.profileImage);
      console.log(
        "profileImage tipi:",
        userData.profileImage === null ? "null" : typeof userData.profileImage
      );

      // profileImage null ise özellikle belirtiyoruz
      const requestData = { ...userData };

      // profileImage değeri hem string hem null olabilir
      if (userData.profileImage === null) {
        console.log("profileImage null olarak gönderiliyor");
      }

      const response = await api.patch(`/users/${userId}`, requestData);
      console.log("Profil güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      throw error;
    }
  },
  uploadProfileImage: async (userId: number, file: File) => {
    try {
      console.log(
        `Profil fotoğrafı yükleme işlemi başlatıldı (User ID: ${userId})`
      );
      console.log("Dosya detayları:", file.name, file.type, file.size);

      // FormData oluştur
      const formData = new FormData();
      formData.append("profileImage", file);

      // FormData içeriğini debug amaçlı kontrol et
      console.log(
        "FormData içeriğini kontrol etme:",
        Array.from(formData.entries())
      );

      // Header bilgisi günlüğe al
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      };
      console.log("İstek başlıkları:", headers);

      // PATCH isteği ile form-data olarak gönder
      const response = await api.patch(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 saniye timeout
      });

      console.log("Profil fotoğrafı yükleme yanıtı:", response);
      console.log("Yanıt verileri:", response.data);
      return response.data;
    } catch (error: unknown) {
      // Hata durumunda daha detaylı bilgi
      console.error("Profil fotoğrafı yükleme hatası:", error);

      // Hata nesnesine erişmek için tip kontrolü
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Hata yanıtı:", error.response);
          console.error("Hata durum kodu:", error.response.status);
          console.error("Hata verileri:", error.response.data);
        }

        // Network hatası durumunda
        if (error.code === "ERR_NETWORK") {
          console.error("Network error details:", error);
          throw new Error(
            "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
          );
        }

        // Timeout hatası durumunda
        if (error.code === "ECONNABORTED") {
          throw new Error(
            "İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin."
          );
        }
      }

      // Genel hata
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

export const libraryService = {
  getUserLibrary: async (userId: number) => {
    try {
      console.log(`Fetching library for user ID: ${userId}`);
      const response = await api.get(`/library/user/${userId}`);
      console.log("Library data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user library error:", error);
      throw error;
    }
  },
};

export const watchlistService = {
  getUserWatchlist: async (userId: number) => {
    try {
      console.log(`Fetching watchlist for user ID: ${userId}`);
      const response = await api.get(`/watchlist/user/${userId}`);
      console.log("Watchlist data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user watchlist error:", error);
      throw error;
    }
  },
};

export const reviewService = {
  getUserReviews: async (userId: number) => {
    try {
      console.log(`Fetching reviews for user ID: ${userId}`);
      const response = await api.get(`/reviews/user/${userId}`);
      console.log("Reviews data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user reviews error:", error);
      throw error;
    }
  },
};

export const friendshipService = {
  getUserFriends: async (userId: number) => {
    try {
      console.log(`Fetching friends for user ID: ${userId}`);
      const response = await api.get(`/friendships/user/${userId}`);
      console.log("Friendship data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user friends error:", error);
      throw error;
    }
  },

  // Arkadaşlık isteğini kabul etme
  acceptFriendRequest: async (friendshipId: number) => {
    try {
      console.log(`Accepting friendship request ID: ${friendshipId}`);
      const response = await api.patch(`/friendships/${friendshipId}`, {
        status: "ACCEPTED",
      });
      console.log("Accept friendship response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Accept friendship error:", error);
      throw error;
    }
  },

  // Arkadaşlık isteğini reddetme
  rejectFriendRequest: async (friendshipId: number) => {
    try {
      console.log(`Rejecting friendship request ID: ${friendshipId}`);
      const response = await api.patch(`/friendships/${friendshipId}`, {
        status: "BLOCKED",
      });
      console.log("Reject friendship response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Reject friendship error:", error);
      throw error;
    }
  },

  // Arkadaşlık isteği gönderme
  sendFriendRequest: async (userId: number) => {
    try {
      console.log(`Sending friendship request to user ID: ${userId}`);
      const response = await api.post(`/friendships`, {
        friendId: userId,
      });
      console.log("Send friendship request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Send friendship request error:", error);
      throw error;
    }
  },

  // Arkadaşlık isteğini iptal etme
  cancelFriendRequest: async (friendshipId: number) => {
    try {
      console.log(`Canceling friendship request ID: ${friendshipId}`);
      const response = await api.delete(`/friendships/${friendshipId}`);
      console.log("Cancel friendship request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Cancel friendship request error:", error);
      throw error;
    }
  },

  // Arkadaşlıktan çıkarma
  removeFriend: async (userId: number) => {
    try {
      console.log(`Removing friendship with user ID: ${userId}`);
      // Önce arkadaşlık ID'sini bulmak için arkadaşlık durumunu sorgula
      const currentUserId = localStorage.getItem("userId");
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

      // Arkadaşlığı kaldır (PATCH isteği veya silme isteği - API'nin tasarımına bağlı)
      const response = await api.delete(`/friendships/${friendship.id}`);
      console.log("Remove friendship response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Remove friendship error:", error);
      throw error;
    }
  },

  // Get relationship status with another user
  getRelationshipStatus: async (targetUserId: number) => {
    try {
      console.log(`Checking relationship status with user ID: ${targetUserId}`);
      const response = await api.get(`/friendships/status/${targetUserId}`);
      console.log("Relationship status:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get relationship status error:", error);
      throw error;
    }
  },

  // Follow a user
  followUser: async (targetUserId: number) => {
    try {
      console.log(`Following user ID: ${targetUserId}`);
      const response = await api.post(`/friendships/follow/${targetUserId}`);
      console.log("Follow user response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Follow user error:", error);
      throw error;
    }
  },

  // Unfollow a user
  unfollowUser: async (targetUserId: number) => {
    try {
      console.log(`Unfollowing user ID: ${targetUserId}`);
      const response = await api.delete(`/friendships/follow/${targetUserId}`);
      console.log("Unfollow user response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Unfollow user error:", error);
      throw error;
    }
  },

  // Get user followers
  getUserFollowers: async (userId: number) => {
    try {
      console.log(`Fetching followers for user ID: ${userId}`);
      const response = await api.get(`/friendships/followers/${userId}`);
      console.log("User followers:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user followers error:", error);
      throw error;
    }
  },

  // Get user following
  getUserFollowing: async (userId: number) => {
    try {
      console.log(`Fetching following for user ID: ${userId}`);
      const response = await api.get(`/friendships/following/${userId}`);
      console.log("User following:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user following error:", error);
      throw error;
    }
  },

  // Get mutual friends
  getMutualFriends: async (userId: number) => {
    try {
      console.log(`Fetching mutual friends for user ID: ${userId}`);
      const response = await api.get(`/friendships/mutual/${userId}`);
      console.log("Mutual friends:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get mutual friends error:", error);
      throw error;
    }
  },
};

// Hata mesajlarını işleme yardımcı fonksiyonu
export const processApiError = (error: any): string => {
  // Varsayılan hata mesajı
  let errorMessage = "An error occurred. Please try again.";

  // Hata detayları varsa
  if (error.response?.data) {
    // Validation errors handling
    if (
      error.response.data.message === "Validation Failed" &&
      Array.isArray(error.response.data.errors)
    ) {
      const validationErrors = error.response.data.errors;

      // Özel hata mesajları için kontrol
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

      // Genel validation hatası
      return validationErrors
        .map((err: { errors: string }) => err.errors)
        .join(", ");
    }

    // Backend direkt olarak message dönüyorsa
    if (typeof error.response.data.message === "string") {
      errorMessage = error.response.data.message;
    }
    // Backend data içinde hata objesi dönüyorsa
    else if (error.response.data.error) {
      errorMessage =
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : "Unknown error occurred";
    }

    // Prisma hata kodlarını kontrol et
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

    // Unique constraint çeşitli hata mesajları
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

  console.error("API Error:", error);
  return errorMessage;
};

export default api;
