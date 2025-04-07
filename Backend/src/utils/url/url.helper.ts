export const getFullPosterUrl = (posterImage: string | null): string | null => {
  if (!posterImage) return null;
  if (posterImage.startsWith("http")) return posterImage;
  return `http://localhost:3000/posters/${posterImage}`;
};

export const getFullProfileImageUrl = (
  profileImage: string | null
): string | null => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  return `http://localhost:3000/uploads/${profileImage}`;
};

export const getFullActorPhotoUrl = (photo: string | null): string | null => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo;
  return `http://localhost:3000/uploads/${photo}`;
}; 