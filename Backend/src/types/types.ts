// User Types
export interface CreateUserProps {
  email: string;
  username: string;
  password: string;
  name: string;
  isAdmin: boolean;
  profileImage?: string | null;
}
export interface UpdateUserProps {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
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