import axios from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authService, userService } from "../utils/api";
import { closeSocket, initSocket, isSocketConnected } from "../utils/socket";
import { AuthContextType, User } from "../utils/types";

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
  const socketInitializedRef = useRef(false);

  // Setup socket connection when user is authenticated
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("accessToken");
      if (token && !socketInitializedRef.current) {
        // Initialize socket connection
        console.log("AuthContext: Socket bağlantısı başlatılıyor...");
        initSocket(token);
        socketInitializedRef.current = true;
      }
    } else {
      // No user, close any existing connection
      if (socketInitializedRef.current) {
        closeSocket();
        socketInitializedRef.current = false;
      }
    }

    // Cleanup socket on unmount
    return () => {
      closeSocket();
      socketInitializedRef.current = false;
    };
  }, [user]);

  // Periyodik bağlantı kontrolü
  useEffect(() => {
    if (user) {
      const checkInterval = setInterval(() => {
        const token = localStorage.getItem("accessToken");

        if (token && !isSocketConnected() && socketInitializedRef.current) {
          console.log("AuthContext: Socket bağlantısı kopmuş, yenileniyor...");
          initSocket(token);
        }
      }, 30000); // Her 30 saniyede bir kontrol et

      return () => clearInterval(checkInterval);
    }
  }, [user]);

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
        setUser(null);
        closeSocket();
        socketInitializedRef.current = false;
        setLoading(false);
        return false;
      }

      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);

        // Initialize socket if not already connected
        if (!socketInitializedRef.current) {
          console.log("CheckAuth: Socket bağlantısı başlatılıyor...");
          initSocket(accessToken);
          socketInitializedRef.current = true;
        }

        setLoading(false);
        return true;
      } catch (err: unknown) {
        // API hatası, token geçersiz olabilir ama hemen silmiyoruz
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          closeSocket();
          socketInitializedRef.current = false;
          return false;
        }

        const basicUserData: User = {
          id: parseInt(userId),
          username: "User",
          email: "user@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAdmin: false,
        };

        setUser(basicUserData);

        // Initialize socket if not already connected
        if (!socketInitializedRef.current) {
          console.log("CheckAuth (basic): Socket bağlantısı başlatılıyor...");
          initSocket(accessToken);
          socketInitializedRef.current = true;
        }

        setLoading(false);
        return true;
      }
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      setUser(null);
      closeSocket();
      socketInitializedRef.current = false;
      setError("Oturum doğrulama hatası. Lütfen tekrar giriş yapın.");
      setLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      // Mevcut socket bağlantısını kapat
      closeSocket();
      socketInitializedRef.current = false;

      const response = await authService.login(email, password);
      if (!response.accessToken || !response.refreshToken) {
        throw new Error("Invalid response from server - missing tokens");
      }

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userId", response.session.userId.toString());

      const basicUserData: User = {
        id: response.session.userId,
        username: "User", // Will be updated with real data
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAdmin: false,
      };

      setUser(basicUserData);

      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);

        // Initialize socket connection after successful login
        console.log("Login: Socket bağlantısı başlatılıyor...");
        initSocket(response.accessToken);
        socketInitializedRef.current = true;
      } catch (fetchErr) {
        console.warn(
          "Could not fetch full user details, using basic data:",
          fetchErr
        );

        // Initialize socket with basic data
        console.log("Login (basic): Socket bağlantısı başlatılıyor...");
        initSocket(response.accessToken);
        socketInitializedRef.current = true;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
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

      // Close socket connection on logout
      closeSocket();
      socketInitializedRef.current = false;

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
          : "Kayıt başarısız. Lütfen tekrar deneyin.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Refreshing user data...");
      const userData = await userService.getCurrentUser();
      console.log("Updated user data:", userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Error refreshing user data:", err);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async (): Promise<boolean | User> => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getCurrentUser();
      console.log("Current user data:", userData);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      console.error("Error checking auth status:", err);
      setLoading(false);
      return false;
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
    checkAuthStatus: checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
