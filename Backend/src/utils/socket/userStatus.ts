import { REDIS_KEYS } from "@constants/redisKeys";
import cache from "@core/cache";

export const setUserOnline = async (
  userId: number,
  socketId: string
): Promise<void> => {
  try {
    await cache.addToSet(REDIS_KEYS.ONLINE_USERS, userId.toString());

    await cache.addToSet(REDIS_KEYS.USER_SESSIONS(userId), socketId);

    await cache.setHashField(
      REDIS_KEYS.USER(userId),
      REDIS_KEYS.USER_LAST_SEEN,
      Date.now().toString()
    );

    console.log(`Kullanıcı ${userId} çevrimiçi oldu (Socket: ${socketId})`);
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için çevrimiçi durumu güncellenirken hata:`,
      error
    );
  }
};

export const removeUserSession = async (
  userId: number,
  socketId: string
): Promise<boolean> => {
  try {
    await cache.removeFromSet(REDIS_KEYS.USER_SESSIONS(userId), socketId);

    const remainingSessions = await cache.getSetSize(
      REDIS_KEYS.USER_SESSIONS(userId)
    );

    if (remainingSessions === 0) {
      await cache.removeFromSet(REDIS_KEYS.ONLINE_USERS, userId.toString());
      await cache.setHashField(
        REDIS_KEYS.USER(userId),
        REDIS_KEYS.USER_LAST_SEEN,
        Date.now().toString()
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Kullanıcı ${userId} için oturum kaldırılırken hata:`, error);
    return false;
  }
};

export const isUserOnline = async (userId: number): Promise<boolean> => {
  try {
    return await cache.isMemberOfSet(
      REDIS_KEYS.ONLINE_USERS,
      userId.toString()
    );
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} online durumu kontrol edilirken hata:`,
      error
    );
    return false;
  }
};

export const getOnlineUsers = async (): Promise<number[]> => {
  try {
    const onlineUsers = await cache.getSetMembers(REDIS_KEYS.ONLINE_USERS);
    return onlineUsers.map((id) => parseInt(id));
  } catch (error) {
    console.error("Online kullanıcılar alınırken hata:", error);
    return [];
  }
};

// Çevrimiçi arkadaşları getir
export const getOnlineFriends = async (
  userIds: number[]
): Promise<number[]> => {
  if (!userIds.length) return [];

  try {
    const onlineFriends = [];

    for (const userId of userIds) {
      if (await isUserOnline(userId)) {
        onlineFriends.push(userId);
      }
    }

    return onlineFriends;
  } catch (error) {
    console.error("Online arkadaşlar alınırken hata:", error);
    return [];
  }
};

// Kullanıcının socket ID'sini getir
export const getUserSocketIds = async (userId: number): Promise<string[]> => {
  try {
    return await cache.getSetMembers(REDIS_KEYS.USER_SESSIONS(userId));
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için socket ID'ler alınırken hata:`,
      error
    );
    return [];
  }
};

// Kullanıcının son görülme zamanını getir
export const getUserLastSeen = async (
  userId: number
): Promise<number | null> => {
  try {
    const lastSeen = await cache.getHashField(
      REDIS_KEYS.USER(userId),
      REDIS_KEYS.USER_LAST_SEEN
    );
    return lastSeen ? parseInt(lastSeen) : null;
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için son görülme zamanı alınırken hata:`,
      error
    );
    return null;
  }
};
