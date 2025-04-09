import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to get a new token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = response.data;

        // Save the new token
        localStorage.setItem("accessToken", accessToken);

        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        // Refresh token is invalid or expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  logout: async (refreshToken: string) => {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  },
};

export const userService = {
  getCurrentUser: async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("User ID not found");

    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  getUserStats: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const libraryService = {
  getUserLibrary: async (userId: number) => {
    const response = await api.get(`/library/user/${userId}`);
    return response.data;
  },
};

export const watchlistService = {
  getUserWatchlist: async (userId: number) => {
    const response = await api.get(`/watchlist/user/${userId}`);
    return response.data;
  },
};

export const reviewService = {
  getUserReviews: async (userId: number) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
};

export const friendshipService = {
  getUserFriends: async (userId: number) => {
    const response = await api.get(`/friendships/user/${userId}`);
    return response.data;
  },
};

export default api;
