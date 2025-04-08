import { apiService } from './api';
import { 
  User, 
  ApiResponse, 
  Watchlist, 
  Wishlist, 
  Library, 
  Friendship, 
  Notification 
} from '../types';

export const userService = {
  // Oturum açma
  login: async (email: string, password: string) => {
    return apiService.post<{ token: string; user: User }>('/auth/login', { email, password });
  },

  // Oturum kapatma
  logout: async () => {
    return apiService.post<boolean>('/auth/logout');
  },

  // Kullanıcı kayıt
  register: async (userData: { email: string; username: string; password: string; name?: string }) => {
    return apiService.post<User>('/users', userData);
  },

  // Mevcut kullanıcı bilgileri
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'No token found' } as ApiResponse<User>;
    }
    
    return apiService.get<User>('/auth/me');
  },

  // Kullanıcı profil resmi yükleme
  uploadProfileImage: async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    return apiService.upload<User>(`/users/upload/${userId}`, formData);
  },

  // Kullanıcı bilgilerini güncelleme
  updateUser: async (userId: number, userData: Partial<User>) => {
    return apiService.patch<User>(`/users/${userId}`, userData);
  },

  // İzleme listesi
  getWatchlist: async () => {
    return apiService.get<Watchlist[]>('/watchlist');
  },

  addToWatchlist: async (movieId: number) => {
    return apiService.post<Watchlist>('/watchlist', { movieId });
  },

  removeFromWatchlist: async (watchlistId: number) => {
    return apiService.delete<boolean>(`/watchlist/${watchlistId}`);
  },

  // İstek listesi
  getWishlist: async () => {
    return apiService.get<Wishlist[]>('/wishlist');
  },

  addToWishlist: async (movieId: number) => {
    return apiService.post<Wishlist>('/wishlist', { movieId });
  },

  removeFromWishlist: async (wishlistId: number) => {
    return apiService.delete<boolean>(`/wishlist/${wishlistId}`);
  },

  // Kütüphane
  getLibrary: async () => {
    return apiService.get<Library[]>('/library');
  },

  addToLibrary: async (movieId: number) => {
    return apiService.post<Library>('/library', { movieId });
  },

  updateLibraryItem: async (libraryId: number, data: { lastWatched?: string }) => {
    return apiService.patch<Library>(`/library/${libraryId}`, data);
  },

  removeFromLibrary: async (libraryId: number) => {
    return apiService.delete<boolean>(`/library/${libraryId}`);
  },

  // Arkadaşlık
  getFriends: async () => {
    return apiService.get<Friendship[]>('/friendship');
  },

  sendFriendRequest: async (friendId: number) => {
    return apiService.post<Friendship>('/friendship', { friendId });
  },

  acceptFriendRequest: async (friendshipId: number) => {
    return apiService.patch<Friendship>(`/friendship/${friendshipId}`, { status: 'ACCEPTED' });
  },

  rejectFriendRequest: async (friendshipId: number) => {
    return apiService.delete<boolean>(`/friendship/${friendshipId}`);
  },

  // Bildirimler
  getNotifications: async () => {
    return apiService.get<Notification[]>('/notification');
  },

  markNotificationAsRead: async (notificationId: number) => {
    return apiService.patch<Notification>(`/notification/${notificationId}`, { isRead: true });
  },

  // Kullanıcı arama
  searchUsers: async (query: string) => {
    return apiService.get<User[]>('/users', { query });
  },
};

export default userService; 