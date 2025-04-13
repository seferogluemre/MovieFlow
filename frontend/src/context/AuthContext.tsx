import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, userService } from "../utils/api";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
  profileImage?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  error: string | null;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => ({
    id: 0,
    username: "",
    email: "",
    createdAt: "",
    updatedAt: "",
  }),
  refreshUser: async () => {},
  error: null,
  checkAuthStatus: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (accessToken && userId) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!accessToken || !userId) {
        console.log("Token veya userId bulunamadı, oturum kapatılıyor");
        setUser(null);
        setLoading(false);
        return false;
      }

      try {
        console.log("User verisi çekiliyor...");
        const userData = await userService.getCurrentUser();
        console.log("User verisi başarıyla alındı:", userData.id);
        setUser(userData);
        setLoading(false);
        return true;
      } catch (err: unknown) {
        console.error("Kullanıcı verisi alınamadı:", err);

        // API hatası, token geçersiz olabilir ama hemen silmiyoruz
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          console.warn("Yetkilendirme hatası, token geçersiz olabilir");
          // Token sorunu ama hemen temizlemiyoruz, refresh token ile yeniden deneyin
          return false;
        }

        // Network hatası veya diğer hatalar
        console.log(
          "Geçici bir hata oluştu, varsayılan kullanıcı verisi kullanılıyor"
        );

        // Basit bir kullanıcı nesnesi oluştur
        const basicUserData: User = {
          id: parseInt(userId),
          username: "User", // API'den alamadığımız için varsayılan değer
          email: "user@example.com", // API'den alamadığımız için varsayılan değer
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(basicUserData);
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.error("CheckAuth genel hatası:", err);
      // Sadece ciddi bir hata durumunda token'ları temizliyoruz
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      setUser(null);
      setError("Oturum doğrulama hatası. Lütfen tekrar giriş yapın.");
      setLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Login initiated for email:", email);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      const response = await authService.login(email, password);
      console.log("Login response received:", response);

      if (!response.accessToken || !response.refreshToken) {
        throw new Error("Invalid response from server - missing tokens");
      }

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userId", response.session.userId.toString());

      console.log(
        "Login successful, tokens stored. User ID:",
        response.session.userId
      );

      // Create basic user data immediately to update UI state
      // This ensures the user is marked as authenticated right away
      const basicUserData: User = {
        id: response.session.userId,
        username: "User", // Will be updated with real data
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(basicUserData);

      try {
        console.log("Fetching full user data...");
        const userData = await userService.getCurrentUser();
        console.log("Full user data received:", userData);
        setUser(userData);
      } catch (fetchErr) {
        console.warn(
          "Could not fetch full user details, using basic data:",
          fetchErr
        );
        // We already set the basic user data, so we can continue
      }

      console.log("Login process complete, user authenticated");
    } catch (err: any) {
      console.error("Login error:", err);
      // Daha detaylı hata mesajı
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      // Since there's no userService.register, redirect to the backend directly
      const response = await fetch(
        `${
          process.env.BACKEND_URL || "http://localhost:3000"
        }/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      const newUser = data.user as User;
      const token = data.token;

      // Save auth data
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", newUser.id.toString());

      // Set user data
      setUser(newUser);
      return newUser;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log("Refreshing user data...");
      const userData = await userService.getCurrentUser();
      console.log("User data refreshed:", userData.id);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      throw err;
    }
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    logout,
    register,
    refreshUser,
    error,
    checkAuthStatus: checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
