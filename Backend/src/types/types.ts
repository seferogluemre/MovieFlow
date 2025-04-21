// User Types
export interface CreateUserProps {
  email: string;
  username: string;
  password: string;
  name: string;
  isAdmin: boolean;
  isPrivate?: boolean;
  profileImage?: string | null;
}
export interface UpdateUserProps {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  isPrivate?: boolean;
  profileImage?: string | null;
}

export interface UserQueryProps {
  username?: string;
  isAdmin?: string | boolean;
}

// Session type
export interface CreateSession {
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Actor types
export interface CreateActorProps {
  biography?: string;
  birthYear?: number;
  name: string;
  nationality?: string;
  actorImage?: string | null;
}

export interface UserWhereConditionProps {
  username?: string;
  isAdmin?: boolean;
}

import { Friendship, FriendshipStatus, User } from "@prisma/client";

// Relationship types as enum for better type safety
export enum RelationshipType {
  NONE = "none",
  FRIENDS = "friends",
  MUTUAL_FOLLOW = "mutualFollow",
  FOLLOWING = "following",
  FOLLOWER = "follower",
  PENDING = "pending",
  PENDING_INCOMING = "pendingIncoming",
  BLOCKED = "blocked",
  BLOCKED_BY_OTHER = "blockedByOther",
}

// Interface for relationship status response
export interface RelationshipStatus {
  type: RelationshipType | string;
  id: number | null;
}

// Interface for friendship with user data and processed profile images
export interface FriendshipWithUsers extends Friendship {
  user: User;
  friend: User;
}

// Interface for enhanced friendship with processed profile images
export interface EnhancedFriendship {
  id: number;
  userId: number;
  friendId: number;
  status: FriendshipStatus;
  createdAt: Date;
  user: any;
  friend: any;
}
