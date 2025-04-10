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
import { tr } from "date-fns/locale";

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
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (id) {
        // Kimlik doğrulamasını kontrol et
        if (!isAuthenticated) {
          const isAuth = await checkAuthStatus();
          if (!isAuth) {
            navigate("/login");
            return;
          }
        }
        fetchMovieDetails(parseInt(id));
      }
    };

    init();
  }, [id, isAuthenticated, navigate, checkAuthStatus]);

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
      setError(
        "Film detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated || !movie) return;

    try {
      await api.post("/watchlist", { movieId: movie.id });
      setSuccessMessage("Film başarıyla izleme listenize eklendi");
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
      setSuccessMessage("Film başarıyla kütüphanenize eklendi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error adding movie to library:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated || !movie) return;

    try {
      await api.post("/wishlist", { movieId: movie.id });
      setSuccessMessage("Film başarıyla istek listenize eklendi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error adding movie to wishlist:", err);
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

  // Yaş sınırı etiketlerini Türkçe karşılıklarına çevir
  const translateAgeRating = (rating: string) => {
    switch (rating) {
      case "GENERAL":
        return "GENEL";
      case "PARENTAL_GUIDANCE":
        return "EBEVEYN REHBERLİĞİ";
      case "TEEN":
        return "GENÇ";
      case "MATURE":
        return "YETİŞKİN";
      case "ADULT":
        return "18+";
      default:
        return rating;
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
          Geri
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
          Geri
        </Button>
        <Alert severity="info">Film bulunamadı</Alert>
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
        Geri
      </Button>

      <Grid container spacing={4}>
        {/* Movie Poster */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardMedia
              component="img"
              image={
                movie.posterImage ||
                "https://via.placeholder.com/500x750?text=Afiş+Yok"
              }
              alt={movie.title}
              sx={{ height: "auto", maxHeight: 600 }}
            />
          </Card>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlaylistAddIcon />}
              onClick={handleAddToWatchlist}
            >
              İzleme Listesine Ekle
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BookmarkAddIcon />}
              onClick={handleAddToWishlist}
            >
              İstek Listesine Ekle
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BookmarkAddIcon />}
              onClick={handleAddToLibrary}
            >
              Kütüphaneye Ekle
            </Button>
          </Box>
        </Grid>

        {/* Movie Info */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {movie.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            {/* Duration */}
            <Chip
              icon={<AccessTimeIcon />}
              label={`${movie.duration} dakika`}
              size="small"
              variant="outlined"
            />

            {/* Release Year */}
            <Chip
              icon={<CalendarTodayIcon />}
              label={movie.releaseYear}
              size="small"
              variant="outlined"
            />

            {/* Age Rating */}
            <Chip
              label={translateAgeRating(movie.ageRating)}
              size="small"
              color={getAgeRatingColor(movie.ageRating)}
            />

            {/* Rating */}
            {movie.rating > 0 && (
              <Chip
                icon={<StarIcon sx={{ color: "warning.main" }} />}
                label={movie.rating.toFixed(1)}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            )}
          </Box>

          {/* Director */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="body1">
              <strong>Yönetmen:</strong> {movie.director}
            </Typography>
          </Box>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                Türler:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {movie.genres.map((genreEntry) => (
                  <Chip
                    key={genreEntry.genreId}
                    label={genreEntry.genre.name}
                    size="small"
                    variant="filled"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Açıklama:
            </Typography>
            <Typography variant="body1" paragraph>
              {movie.description}
            </Typography>
          </Box>

          {/* Cast */}
          {movie.actors && movie.actors.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Oyuncular
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {movie.actors.map((actorEntry) => (
                  <ListItem key={actorEntry.actorId} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        src={
                          actorEntry.actor.photo ||
                          "https://via.placeholder.com/100?text=Foto+Yok"
                        }
                        alt={actorEntry.actor.name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={actorEntry.actor.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Rol: {actorEntry.role}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Doğum Yılı: {actorEntry.actor.birthYear}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Uyruk: {actorEntry.actor.nationality}
                          </Typography>
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
