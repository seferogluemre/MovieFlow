import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

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
          // Refresh token yoksa login sayfasına yönlendir
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Yeni token alma işlemi
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = response.data;

        // Yeni token'ı kaydet
        localStorage.setItem("accessToken", accessToken);

        // Orijinal isteği yeni token ile tekrarla
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        // Refresh token geçersiz veya süresi dolmuş
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // 404 Not Found hatası - API endpoint mevcut değil
    if (error.response?.status === 404) {
      console.error(`API endpoint not found: ${originalRequest.url}`);
      // Özel bir hata objesi döndür
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
      // CORS ayarlarıyla ilgili hatalar için axios yerine api kullanacağız
      const response = await api.post("/auth/login", { email, password });
      console.log("Login successful:", response.data);
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
      const response = await api.get(`/users/${userId}`);

      // API yanıtının yapısını incele
      console.log("Ham API yanıtı:", response);

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
        return userData;
      } else {
        console.error("Geçersiz API yanıt formatı:", response);
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Kullanıcı verisi çekme hatası:", error);
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
};

export default api;
