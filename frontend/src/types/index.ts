// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  profileImage?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
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
  description: string;
  releaseYear: number;
  duration: number;
  posterImage?: string;
  director: string;
  rating: number;
  ageRating: AgeRating;
  createdAt: string;
  updatedAt: string;
  genres?: Genre[];
  actors?: Actor[];
}

// Actor Types
export interface Actor {
  id: number;
  name: string;
  biography?: string;
  birthYear?: number;
  nationality?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  role?: string; // MovieActor ilişkisi için
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
  createdAt: string;
  updatedAt: string;
  userId: number;
  movieId: number;
  user?: User;
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
  addedAt: string;
  userId: number;
  movieId: number;
  movie?: Movie;
}

// Wishlist Types
export interface Wishlist {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  movie?: Movie;
}

// Library Types
export interface Library {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  lastWatched?: string;
  movie?: Movie;
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
  status: FriendshipStatus;
  createdAt: string;
  friend?: User;
}

// Notification Types
export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REQUEST_REJECTED = 'FRIEND_REQUEST_REJECTED'
}

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  userId: number;
  fromUserId: number;
  isRead: boolean;
  createdAt: string;
  fromUser?: User;
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 