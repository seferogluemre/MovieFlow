/**
 * Resim URL'lerini dönüştüren yardımcı fonksiyonlar
 */

/**
 * Profil resmi için doğru URL'yi oluşturur
 * Eğer resim S3'te ise S3 URL'sini,
 * yerel bir resim ise kendi sunucumuzun URL'sini döndürür
 * @param imageKey Resim anahtarı veya tam URL
 * @returns Erişilebilir resim URL'si
 */
export const getImageUrl = (imageKey: string | null): string | null => {
  if (!imageKey) return null;

  // Eğer zaten tam bir URL ise, olduğu gibi döndür
  if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) {
    return imageKey;
  }

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
};

/**
 * Profil resmi URL'sini JSON response'a ekler
 * @param userData Kullanıcı verisi
 * @returns Profil resim URL'si eklenmiş kullanıcı verisi
 */
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
