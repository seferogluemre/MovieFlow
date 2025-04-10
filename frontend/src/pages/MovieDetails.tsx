import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Container,
  Card,
  CardMedia,
} from "@mui/material";
import {
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Movie as MovieIcon,
  ArrowBack as ArrowBackIcon,
  BookmarkAdd as BookmarkAddIcon,
  PlaylistAdd as PlaylistAddIcon,
} from "@mui/icons-material";
import api, { processApiError } from "../utils/api";
import { useAuth } from "../context/AuthContext";

interface MovieDetails {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage: string;
  director: string;
  rating: number;
  ageRating: string;
  createdAt: string;
  updatedAt: string;
  genres: {
    movieId: number;
    genreId: number;
    genre: {
      id: number;
      name: string;
    };
  }[];
  actors: {
    movieId: number;
    actorId: number;
    role: string;
    actor: {
      id: number;
      name: string;
      biography: string;
      birthYear: number;
      nationality: string;
      photo: string;
      createdAt: string;
      updatedAt: string;
    };
  }[];
}

const MovieDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(parseInt(id));
    }
  }, [id]);

  const fetchMovieDetails = async (movieId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/movies/${movieId}`);

      // API yanıtındaki data.data yapısına dikkat edelim
      const movieData = response.data.data || response.data;

      setMovie(movieData);
      setError(null);
    } catch (err) {
      console.error("Error fetching movie details:", err);
      setError("Failed to load movie details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated || !movie) return;

    try {
      await api.post("/watchlist", { movieId: movie.id });
      setSuccessMessage("Movie successfully added to your watchlist");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error adding movie to watchlist:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddToLibrary = async () => {
    if (!isAuthenticated || !movie) return;

    try {
      await api.post("/library", { movieId: movie.id });
      setSuccessMessage("Movie successfully added to your library");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error adding movie to library:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Helper function to get age rating color
  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case "GENERAL":
        return "success";
      case "PARENTAL_GUIDANCE":
        return "info";
      case "TEEN":
        return "warning";
      default:
        return "error";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="info">Movie not found</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Movie Poster */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardMedia
              component="img"
              image={
                movie.posterImage ||
                "https://via.placeholder.com/500x750?text=No+Poster"
              }
              alt={movie.title}
              sx={{ height: "auto", maxHeight: 600 }}
            />
          </Card>

          {/* Action Buttons */}
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlaylistAddIcon />}
              onClick={handleAddToWatchlist}
            >
              Add to Watchlist
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BookmarkAddIcon />}
              onClick={handleAddToLibrary}
            >
              Add to Library
            </Button>
          </Box>
        </Grid>

        {/* Movie Details */}
        <Grid item xs={12} md={8}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {movie.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 3 }}>
            {movie.rating > 0 && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <StarIcon sx={{ color: "warning.main", mr: 0.5 }} />
                <Typography variant="h6" fontWeight="bold">
                  {movie.rating.toFixed(1)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccessTimeIcon sx={{ mr: 0.5, color: "text.secondary" }} />
              <Typography>{movie.duration} min</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CalendarTodayIcon sx={{ mr: 0.5, color: "text.secondary" }} />
              <Typography>{movie.releaseYear}</Typography>
            </Box>

            <Chip
              label={
                movie.ageRating ? movie.ageRating.replace("_", " ") : "GENERAL"
              }
              color={getAgeRatingColor(movie.ageRating)}
              size="medium"
            />
          </Box>

          {/* Director */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
              Director:
            </Typography>
            <Typography>{movie.director}</Typography>
          </Box>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Genres
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {movie.genres.map((genreItem) => (
                  <Chip
                    key={genreItem.genreId}
                    label={genreItem.genre.name}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Overview
            </Typography>
            <Typography paragraph>{movie.description}</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Cast */}
          {movie.actors && movie.actors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Cast
              </Typography>
              <List>
                {movie.actors.map((actorItem) => (
                  <ListItem key={actorItem.actorId} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        alt={actorItem.actor.name}
                        src={actorItem.actor.photo || undefined}
                        sx={{ width: 56, height: 56 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {actorItem.actor.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {actorItem.role}
                          </Typography>
                          {actorItem.actor.birthYear && (
                            <Typography variant="body2" color="text.secondary">
                              Born: {actorItem.actor.birthYear} •{" "}
                              {actorItem.actor.nationality}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default MovieDetails;
