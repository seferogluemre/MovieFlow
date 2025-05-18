export const REDIS_KEYS = {
  ONLINE_USERS: "online_users",
  USER_SESSIONS: (userId: number) => `user_sessions:${userId}`,
  USER: (userId: number) => `user:${userId}`,
  USER_LAST_SEEN: "lastSeen",
};
