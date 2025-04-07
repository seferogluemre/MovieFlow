export const getFullPosterUrl = (posterImage: string | null): string | null => {
  if (!posterImage) return null;
  return `${
    process.env.BASE_URL || "http://localhost:3000"
  }/posters/${posterImage}`;
};
