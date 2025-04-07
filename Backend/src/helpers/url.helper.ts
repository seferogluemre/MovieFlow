export const getFullPosterUrl = (posterImage: string | null): string | null => {
  if (!posterImage) return null;
  return `http://localhost:3000/posters/${posterImage}`;
};

export const getFullProfileImageUrl = (
  profileImage: string | null
): string | null => {
  if (!profileImage) return null;
  return `http://localhost:3000/uploads/${profileImage}`;
};

export const getFullActorPhotoUrl = (photo: string | null): string | null => {
  if (!photo) return null;
  return `http://localhost:3000/uploads/${photo}`;
};
