import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek kesicisi - her istekte token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt kesicisi - başarılı ve hatalı yanıtları işler
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return {
      success: true,
      data: response.data,
    } as ApiResponse<any>;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server yanıtı hata kodu ile döndü
      if (error.response.status === 401) {
        // Yetkilendirme hatası, token'i temizle
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        success: false,
        error: error.response.data.message || 'Bir hata oluştu',
        status: error.response.status,
      });
    } else if (error.request) {
      // İstek yapıldı ancak yanıt alınamadı
      return Promise.reject({
        success: false,
        error: 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.',
      });
    } else {
      // İstek oluşturulurken bir şeyler yanlış gitti
      return Promise.reject({
        success: false,
        error: 'İstek gönderilirken bir hata oluştu.',
      });
    }
  }
);

export const apiService = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await api.get(url, config);
    } catch (error) {
      return { success: false, error: (error as any).error } as ApiResponse<T>;
    }
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      return { success: false, error: (error as any).error } as ApiResponse<T>;
    }
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      return { success: false, error: (error as any).error } as ApiResponse<T>;
    }
  },

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      return { success: false, error: (error as any).error } as ApiResponse<T>;
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await api.delete(url, config);
    } catch (error) {
      return { success: false, error: (error as any).error } as ApiResponse<T>;
    }
  },

  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const uploadConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      };
      return await api.post(url, formData, uploadConfig);
    } catch (error) {
      return { success: false, error: (error as any).error } as ApiResponse<T>;
    }
  },
}; 