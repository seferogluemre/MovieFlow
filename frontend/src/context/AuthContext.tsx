import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: { email: string; username: string; password: string; name?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Token değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sayfa yüklendiğinde veya token değiştiğinde kullanıcıyı kontrol et
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setIsLoading(true);
        const response = await userService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  // Giriş fonksiyonu
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await userService.login(email, password);
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const logout = async () => {
    setIsLoading(true);
    try {
      await userService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  // Kayıt fonksiyonu
  const register = async (userData: { email: string; username: string; password: string; name?: string }) => {
    setIsLoading(true);
    try {
      const response = await userService.register(userData);
      return response.success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 