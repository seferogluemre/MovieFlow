import { Star as StarIcon } from "@mui/icons-material";
import { Box, Card, CardMedia, Chip, Typography } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";
import { MovieCardProps } from "../utils/types";

const MovieCard: FC<MovieCardProps> = ({ movie, watchedDate, addedDate }) => {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "1 gün önce";
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "hafta" : "hafta"} önce`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "ay" : "ay"} önce`;
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Card
        component={Link}
        to={`/movie/${movie.id}`}
        sx={{
          display: "flex",
          width: "100%",
          textDecoration: "none",
          bgcolor: "background.paper",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 60, height: 80, objectFit: "cover" }}
          image={
            movie.posterImage ||
            "https://via.placeholder.com/60x80?text=No+Image"
          }
          alt={movie.title}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            px: 2,
            py: 1.5,
            flexGrow: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {movie.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {movie.duration} min • {movie.releaseYear}
            </Typography>
          </Box>
          {movie.rating && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <StarIcon sx={{ color: "warning.main", fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" fontWeight="bold">
                {movie.rating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          {movie.ageRating && (
            <Chip
              label={movie.ageRating.replace("_", " ")}
              size="small"
              sx={{
                bgcolor:
                  movie.ageRating === "GENERAL"
                    ? "success.main"
                    : movie.ageRating === "PARENTAL_GUIDANCE"
                    ? "info.main"
                    : movie.ageRating === "TEEN"
                    ? "warning.main"
                    : "error.main",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.7rem",
                height: 24,
                width: 60,
              }}
            />
          )}
          {watchedDate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              İzlendi {formatRelativeTime(watchedDate)}
            </Typography>
          )}
          {addedDate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Eklendi {formatRelativeTime(addedDate)}
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default MovieCard;
