import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlaylistAdd as PlaylistAddIcon,
  RemoveCircleOutline as RemoveIcon,
  Search as SearchIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { processApiError } from "../utils/api";

interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage: string;
  director: string;
  rating: number;
  ageRating: string;
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
      photo: string;
    };
  }[];
}

interface WatchlistItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
}

interface LibraryItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  status: string;
}

const BrowseMovies: FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    movieId: number | null;
    action: string;
  }>({
    open: false,
    movieId: null,
    action: "",
  });
  const [userLibrary, setUserLibrary] = useState<LibraryItem[]>([]);
  const [userWatchlist, setUserWatchlist] = useState<WatchlistItem[]>([]);

  const { isAuthenticated, user, checkAuthStatus } = useAuth();

  useEffect(() => {
    const init = async () => {
      // Sayfa ilk yüklendiğinde filmleri çek
      fetchMovies();

      // Kimlik doğrulamasını kontrol et ve yenileme yapılmışsa kullanıcı verilerini getir
      if (!isAuthenticated) {
        const isAuth = await checkAuthStatus();
        if (isAuth && user) {
          fetchUserLibrary();
          fetchUserWatchlist();
        }
      } else if (user) {
        fetchUserLibrary();
        fetchUserWatchlist();
      }
    };

    init();
  }, [isAuthenticated, user, checkAuthStatus]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/movies");
      setMovies(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLibrary = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await api.get(`/library/user/${userId}`);
      setUserLibrary(response.data || []);
    } catch (err) {
      console.error("Error fetching user library:", err);
    }
  };

  const fetchUserWatchlist = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await api.get(`/watchlist/user/${userId}`);
      setUserWatchlist(response.data || []);
    } catch (err) {
      console.error("Error fetching user watchlist:", err);
    }
  };

  const isInLibrary = (
    movieId: number
  ): { inLibrary: boolean; libraryItemId?: number } => {
    const libraryItem = userLibrary.find((item) => item.movieId === movieId);
    return {
      inLibrary: !!libraryItem,
      libraryItemId: libraryItem?.id,
    };
  };

  const isInWatchlist = (
    movieId: number
  ): { inWatchlist: boolean; watchlistItemId?: number } => {
    const watchlistItem = userWatchlist.find(
      (item) => item.movieId === movieId
    );
    return {
      inWatchlist: !!watchlistItem,
      watchlistItemId: watchlistItem?.id,
    };
  };

  const handleAddToWatchlist = async (movieId: number) => {
    if (!isAuthenticated) {
      setConfirmDialog({
        open: true,
        movieId,
        action: "watchlist",
      });
      return;
    }

    try {
      await api.post("/watchlist", { movieId });
      setSuccessMessage(`Movie successfully added to your watchlist`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUserWatchlist(); // Watchlist'i güncelle
    } catch (err) {
      console.error("Error adding movie to watchlist:", err);
      // Geliştirilmiş hata yönetimi
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFromWatchlist = async (watchlistItemId: number) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await api.delete(`/watchlist/${watchlistItemId}`);
      setSuccessMessage(`Movie successfully removed from your watchlist`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUserWatchlist(); // Watchlist'i güncelle
    } catch (err) {
      console.error("Error removing movie from watchlist:", err);
      // Geliştirilmiş hata yönetimi
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddToLibrary = async (movieId: number) => {
    if (!isAuthenticated) {
      setConfirmDialog({
        open: true,
        movieId,
        action: "library",
      });
      return;
    }

    try {
      await api.post("/library", { movieId });
      setSuccessMessage(`Movie successfully added to your library`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUserLibrary(); // Kütüphaneyi güncelle
    } catch (err) {
      console.error("Error adding movie to library:", err);
      // Geliştirilmiş hata yönetimi
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFromLibrary = async (libraryItemId: number) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await api.delete(`/library/${libraryItemId}`);
      setSuccessMessage(`Movie successfully removed from your library`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUserLibrary(); // Kütüphaneyi güncelle
    } catch (err) {
      console.error("Error removing movie from library:", err);
      // Geliştirilmiş hata yönetimi
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, movieId: null, action: "" });
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to get age rating color
  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case "GENERAL":
        return "success.main";
      case "PARENTAL_GUIDANCE":
        return "info.main";
      case "TEEN":
        return "warning.main";
      default:
        return "error.main";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Browse Movies
        </Typography>

        <TextField
          placeholder="Search movies..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredMovies.length === 0 ? (
        <Alert severity="info">No movies found matching your search.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredMovies.map((movie) => {
            // Filmle ilgili durumları kontrol et
            const { inLibrary, libraryItemId } = isInLibrary(movie.id);
            const { inWatchlist, watchlistItemId } = isInWatchlist(movie.id);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                  onMouseEnter={() => setHoveredMovie(movie.id)}
                  onMouseLeave={() => setHoveredMovie(null)}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={
                        movie.posterImage ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={movie.title}
                    />

                    {/* Hover overlay with action buttons */}
                    {hoveredMovie === movie.id && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          bgcolor: "rgba(0,0,0,0.7)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {inWatchlist && watchlistItemId ? (
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<RemoveIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWatchlist(watchlistItemId);
                            }}
                          >
                            Remove from Watchlist
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PlaylistAddIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToWatchlist(movie.id);
                            }}
                          >
                            Add to Watchlist
                          </Button>
                        )}

                        {inLibrary && libraryItemId ? (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromLibrary(libraryItemId);
                            }}
                          >
                            Remove from Library
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToLibrary(movie.id);
                            }}
                          >
                            Add to Library
                          </Button>
                        )}
                      </Box>
                    )}

                    {/* Age rating chip */}
                    <Chip
                      label={
                        movie.ageRating
                          ? movie.ageRating.replace("_", " ")
                          : "GENERAL"
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: getAgeRatingColor(movie.ageRating),
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      {movie.title}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {movie.releaseYear}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {movie.duration} min
                      </Typography>
                    </Box>

                    {movie.rating > 0 && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <StarIcon
                          sx={{ color: "warning.main", fontSize: 16, mr: 0.5 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {movie.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    )}

                    {movie.genres && movie.genres.length > 0 && (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {movie.genres.map((genreItem) => (
                          <Chip
                            key={genreItem.genreId}
                            label={genreItem.genre.name}
                            size="small"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Login Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You need to login to add movies to your {confirmDialog.action}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href="/login"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrowseMovies;
