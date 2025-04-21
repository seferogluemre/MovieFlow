export const getImageUrl = (imageKey: string | null): string | null => {
  if (!imageKey) return null;

  if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) {
    return imageKey;
  }

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
};

export const addImageUrlToUser = (userData: any): any => {
  if (!userData) return userData;

  return {
    ...userData,
    profileImageUrl: getImageUrl(userData.profileImage),
  };
};

/**
 * Profil resmi URL'sini kullanıcı koleksiyonuna ekler
 * @param users Kullanıcı koleksiyonu
 * @returns Profil resim URL'leri eklenmiş kullanıcı koleksiyonu
 */
export const addImageUrlToUsers = (users: any[]): any[] => {
  if (!users || !Array.isArray(users)) return users;

  return users.map((user) => addImageUrlToUser(user));
};
