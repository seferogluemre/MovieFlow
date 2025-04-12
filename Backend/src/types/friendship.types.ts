import { FriendshipStatus, Friendship, User } from "@prisma/client";

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
