import { ReactNode } from "react";

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  profileImage: string;
  bio: string;
  isAdmin: boolean;
  isPrivate: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  friends?: Friendship[];
  friendsOf?: Friendship[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  profileImage?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = "light" | "dark";

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export interface WishlistItem {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
  movie: {
    id: number;
    title: string;
    description: string;
    releaseYear: number;
    duration: number;
    posterImage: string;
    director: string;
    rating: number;
    ageRating: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface WatchlistItem {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
  movie: {
    id: number;
    title: string;
    description: string;
    releaseYear: number;
    duration: number;
    posterImage: string;
    director: string;
    rating: number;
    ageRating: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage: string;
  director: string;
  rating: number;
  ageRating: string;
}

export interface Review {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  movieId: number;
  movie?: Movie;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export enum NotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
  FRIEND_REQUEST_REJECTED = "FRIEND_REQUEST_REJECTED",
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextType {
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

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  action?: ReactNode;
}

export interface MovieCardProps {
  movie: Movie;
  watchedDate?: string;
  addedDate?: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage: string;
  director: string;
  rating: number;
  ageRating: string;
}
export interface MovieDetailsType {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage: string;
  director: string;
  rating: number;
  ageRating: string;
  createdAt: string;
  updatedAt: string;
  genres: {
    movieId: number;
    genreId: number;
    genre: {
      id: number;
      name: string;
    };
  }[];
  actors: {
    movieId: number;
    actorId: number;
    role: string;
    actor: {
      id: number;
      name: string;
      biography: string;
      birthYear: number;
      nationality: string;
      photo: string;
      createdAt: string;
      updatedAt: string;
    };
  }[];
}

export interface Review {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
  };
}

// Koleksiyon öğelerini tanımlayan arayüzler
export interface WatchlistItem {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
}

export interface LibraryItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  lastWatched: string | null;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage: string;
  isVerified?: boolean;
}

export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: string;
  createdAt: string;
  user?: User;
  friend?: User;
}
export interface LibraryItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  lastWatched: string | null;
  movie?: Movie;
}

export interface WatchlistItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  movie?: Movie;
}

export interface UserRelationship {
  userId: number;
  isFriend: boolean;
  isPending: boolean;
  isFollowing: boolean;
  isBlocked: boolean;
}

export interface LibraryItem {
  id: number;
  addedAt: string;
  lastWatched: string | null;
  userId: number;
  movieId: number;
  movie: {
    id: number;
    title: string;
    description: string;
    releaseYear: number;
    duration: number;
    posterImage: string;
    director: string;
    rating: number;
    ageRating: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface WishlistItem {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Actor {
  id: number;
  name: string;
  biography?: string;
  birthYear?: number;
  nationality?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieActor {
  movie: Movie;
  actor: Actor;
  role: string;
}

export interface Review {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  movieId: number;
  user?: User;
  movie?: Movie;
}

export interface Rating {
  id: number;
  score: number;
  createdAt: string;
  userId: number;
  movieId: number;
  user?: User;
  movie?: Movie;
}

export interface Library {
  id: number;
  addedAt: string;
  lastWatched?: string;
  userId: number;
  movieId: number;
  user?: User;
  movie?: Movie;
}

export interface Watchlist {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
  user?: User;
  movie?: Movie;
}

export interface Wishlist {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
  user?: User;
  movie?: Movie;
}

export interface Notification {
  id: number;
  type:
    | "FRIEND_REQUEST"
    | "FRIEND_REQUEST_ACCEPTED"
    | "FRIEND_REQUEST_REJECTED";
  message: string;
  userId: number;
  fromUserId: number;
  metadata?: {
    friendshipId?: number;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
  user?: User;
  fromUser?: User;
}

export interface UserStats {
  moviesWatched: number;
  reviewsCount: number;
  friendsCount: number;
  watchTime: number;
}
