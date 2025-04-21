/**
 * URL yardımcı fonksiyonları
 */
import { getImageUrl } from "../services/image-url.util";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Profil resmi URL'si oluşturur
 * @param profileImage Profil resmi dosya adı veya yolu
 * @returns Tam profil resmi URL'si
 */
export const getFullProfileImageUrl = (
  profileImage: string | null
): string | null => {
  // Yeni S3 fonksiyonunu kullanıyoruz
  return getImageUrl(profileImage);
};

/**
 *
 * @param posterImage Film posteri dosya adı veya yolu
 * @returns Tam poster URL'si
 */
export const getFullPosterUrl = (posterImage: string | null): string | null => {
  return getImageUrl(posterImage);
};

/**
 *
 * @param photo Aktör fotoğrafı dosya adı veya yolu
 * @returns Tam fotoğraf URL'si
 */
export const getFullActorPhotoUrl = (photo: string | null): string | null => {
  // Yeni S3 fonksiyonunu kullanıyoruz
  return getImageUrl(photo);
};
