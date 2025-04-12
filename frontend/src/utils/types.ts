export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  profileImage?: string;
  bio?: string;
  isAdmin: boolean;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
  friends?: Friendship[];
  friendsOf?: Friendship[];
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage?: string;
  director: string;
  rating?: number;
  ageRating: "GENERAL" | "PARENTAL_GUIDANCE" | "TEEN" | "MATURE" | "ADULT";
  createdAt: string;
  updatedAt: string;
  genres?: Genre[];
  actors?: MovieActor[];
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

export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
  createdAt: string;
  user?: User;
  friend?: User;
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
