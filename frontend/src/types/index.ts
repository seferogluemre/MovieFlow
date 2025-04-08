// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// Yetkilendirme ile ilgili tipler
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Movie Types
export enum AgeRating {
  GENERAL = 'GENERAL',
  PARENTAL_GUIDANCE = 'PARENTAL_GUIDANCE',
  TEEN = 'TEEN',
  MATURE = 'MATURE',
  ADULT = 'ADULT'
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}

// Actor Types
export interface Actor {
  id: number;
  name: string;
  photo?: string;
  role?: string;
}

// Genre Types
export interface Genre {
  id: number;
  name: string;
}

// Review Types
export interface Review {
  id: number;
  content: string;
  user?: User;
  movieId: number;
  createdAt: string;
  updatedAt: string;
}

// Rating Types
export interface Rating {
  id: number;
  score: number;
  createdAt: string;
  userId: number;
  movieId: number;
}

// Watchlist Types
export interface Watchlist {
  id: number;
  userId: number;
  movieId: number;
  movie: Movie;
  createdAt: string;
}

// Wishlist Types
export interface Wishlist {
  id: number;
  userId: number;
  movieId: number;
  movie: Movie;
  createdAt: string;
}

// Library Types
export interface Library {
  id: number;
  userId: number;
  movieId: number;
  movie: Movie;
  watchDate: string;
  createdAt: string;
}

// Friendship Types
export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED'
}

export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  friend: User;
}

// Notification Types
export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REQUEST_REJECTED = 'FRIEND_REQUEST_REJECTED'
}

export interface Notification {
  id: number;
  userId: number;
  type: 'friend_request' | 'friend_accepted' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
  relatedUserId?: number;
  relatedUser?: User;
}

// Session Types
export interface Session {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

// API ile ilgili tipler
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Pagination için tipler
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tema ile ilgili tipler
export interface ThemeState {
  mode: 'light' | 'dark';
}

// Filtre ve sıralama tipleri
export interface MovieFilters {
  genres?: number[];
  year?: number;
  rating?: number;
  search?: string;
}

export interface SortOption {
  label: string;
  value: string;
}

// İzleme listesi tipleri
export interface WatchlistItem {
  id: number;
  movie: Movie;
  addedAt: string;
}

// Film listesi tipleri
export interface MovieList {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: number;
  user?: User;
  movies: Movie[];
  createdAt: string;
  updatedAt: string;
} 