import redisClient from "../../config/redis";

const ONLINE_USERS_KEY = "online_users";

// Kullanıcıyı çevrimiçi olarak işaretle
export const setUserOnline = async (
  userId: number,
  socketId: string
): Promise<void> => {
  try {
    // Kullanıcıyı online kullanıcılar kümesine ekle
    await redisClient.sadd(ONLINE_USERS_KEY, userId.toString());

    // Bu socket ID'yi kullanıcının oturumlarına ekle
    await redisClient.sadd(`user_sessions:${userId}`, socketId);

    // Son görülme zamanını güncelle
    await redisClient.hset(`user:${userId}`, "lastSeen", Date.now().toString());

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
    // Kullanıcının oturumlarından bu socket'i çıkar
    await redisClient.srem(`user_sessions:${userId}`, socketId);

    // Kullanıcının kalan oturum sayısını kontrol et
    const remainingSessions = await redisClient.scard(
      `user_sessions:${userId}`
    );

    // Kullanıcının hiç oturumu kalmadıysa, online listesinden çıkar
    if (remainingSessions === 0) {
      await redisClient.srem(ONLINE_USERS_KEY, userId.toString());
      await redisClient.hset(
        `user:${userId}`,
        "lastSeen",
        Date.now().toString()
      );
      console.log(
        `Kullanıcı ${userId} çevrimdışı oldu (tüm oturumlar kapatıldı)`
      );
      return true; // Kullanıcı tamamen çıkış yaptı
    }

    console.log(
      `Kullanıcı ${userId} için bir oturum kapatıldı (${remainingSessions} oturum kaldı)`
    );
    return false;
  } catch (error) {
    console.error(`Kullanıcı ${userId} için oturum kaldırılırken hata:`, error);
    return false;
  }
};

// Kullanıcının online durumunu kontrol et
export const isUserOnline = async (userId: number): Promise<boolean> => {
  try {
    return (
      (await redisClient.sismember(ONLINE_USERS_KEY, userId.toString())) === 1
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
    const onlineUsers = await redisClient.smembers(ONLINE_USERS_KEY);
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
    return await redisClient.smembers(`user_sessions:${userId}`);
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
    const lastSeen = await redisClient.hget(`user:${userId}`, "lastSeen");
    return lastSeen ? parseInt(lastSeen) : null;
  } catch (error) {
    console.error(
      `Kullanıcı ${userId} için son görülme zamanı alınırken hata:`,
      error
    );
    return null;
  }
};
