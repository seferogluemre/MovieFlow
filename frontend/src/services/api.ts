import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// API temel URL
const API_URL = 'http://localhost:3000/api';

// Axios instance oluşturma
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Hata yakalama
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token süresi dolmuşsa
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API request fonksiyonu
const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api(config);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse<T>;
    }
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
};

// API metodları
export const apiService = {
  get: <T>(url: string, params?: object) =>
    apiRequest<T>({ method: 'GET', url, params }),

  post: <T>(url: string, data?: object) =>
    apiRequest<T>({ method: 'POST', url, data }),

  patch: <T>(url: string, data?: object) =>
    apiRequest<T>({ method: 'PATCH', url, data }),

  delete: <T>(url: string) =>
    apiRequest<T>({ method: 'DELETE', url }),

  upload: <T>(url: string, formData: FormData) =>
    apiRequest<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default api; 