import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  BookmarkAdd as BookmarkAddIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  PlaylistAdd as PlaylistAddIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FC, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { processApiError } from "../utils/api";
import {
  LibraryItem,
  MovieDetailsType,
  Rating,
  Review,
  WatchlistItem,
  WishlistItem,
} from "../utils/types";

const MovieDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuthStatus, user } = useAuth();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const highlightedReviewRef = useRef<HTMLDivElement>(null);
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  const [isInLibrary, setIsInLibrary] = useState<boolean>(false);
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);

  // Koleksiyon öğelerinin ID'lerini saklamak için state'ler
  const [watchlistItemId, setWatchlistItemId] = useState<number | null>(null);
  const [libraryItemId, setLibraryItemId] = useState<number | null>(null);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);

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
        fetchMovieReviews(parseInt(id));
        checkMovieCollections(parseInt(id));
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
      setError(
        "Film detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieReviews = async (movieId: number) => {
    try {
      setLoadingReviews(true);
      const response = await api.get(`/reviews/movie/${movieId}`);
      setReviews(response.data || []);
      setReviewError(null);

      // URL'den reviewId parametresini al
      const searchParams = new URLSearchParams(location.search);
      const reviewId = searchParams.get("reviewId");

      // reviewId varsa, bir sonraki render'da o yoruma kaydır
      if (reviewId) {
        setTimeout(() => {
          const reviewElement = document.getElementById(`review-${reviewId}`);
          if (reviewElement) {
            reviewElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    } catch (err) {
      setReviewError("Film yorumları yüklenirken bir hata oluştu.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkMovieCollections = async (movieId: number) => {
    if (!isAuthenticated || !user) return;

    try {
      // Kullanıcı bilgilerini çek
      const response = await api.get(`/users/${user.id}`);
      const userData = response.data;

      // İzleme listesinde mi?
      const watchlistItem = userData.watchlist?.find(
        (item: WatchlistItem) => item.movieId === movieId
      );
      if (watchlistItem) {
        setIsInWatchlist(true);
        setWatchlistItemId(watchlistItem.id);
      } else {
        setIsInWatchlist(false);
        setWatchlistItemId(null);
      }

      // Kütüphanede mi?
      const libraryItem = userData.library?.find(
        (item: LibraryItem) => item.movieId === movieId
      );
      if (libraryItem) {
        setIsInLibrary(true);
        setLibraryItemId(libraryItem.id);
      } else {
        setIsInLibrary(false);
        setLibraryItemId(null);
      }

      // İstek listesinde mi?
      const wishlistItem = userData.wishlist?.find(
        (item: WishlistItem) => item.movieId === movieId
      );
      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistItemId(wishlistItem.id);
      } else {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } catch (err) {}
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated || !movie) return;

    try {
      await api.post("/watchlist", { movieId: movie.id });
      setSuccessMessage("Film başarıyla izleme listenize eklendi");
      setIsInWatchlist(true);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    if (!isAuthenticated || !movie || watchlistItemId === null) return;

    try {
      await api.delete(`/watchlist/${watchlistItemId}`);
      setSuccessMessage("Film izleme listenizden kaldırıldı");
      setIsInWatchlist(false);
      setWatchlistItemId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
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
      setIsInLibrary(true);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!isAuthenticated || !movie || libraryItemId === null) return;

    try {
      await api.delete(`/library/${libraryItemId}`);
      setSuccessMessage("Film kütüphanenizden kaldırıldı");
      setIsInLibrary(false);
      setLibraryItemId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
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
      setIsInWishlist(true);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!isAuthenticated || !movie || wishlistItemId === null) return;

    try {
      await api.delete(`/wishlist/${wishlistItemId}`);
      setSuccessMessage("Film istek listenizden kaldırıldı");
      setIsInWishlist(false);
      setWishlistItemId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
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

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch (e) {
      return "Geçersiz tarih";
    }
  };

  const getStarColor = (score: number) => {
    if (score >= 4) return "success.main";
    if (score >= 3) return "warning.main";
    if (score >= 2) return "info.main";
    return "error.main";
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
            {isInWatchlist ? (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<PlaylistAddIcon />}
                onClick={handleRemoveFromWatchlist}
              >
                İzleme Listesinden Çıkar
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlaylistAddIcon />}
                onClick={handleAddToWatchlist}
              >
                İzleme Listesine Ekle
              </Button>
            )}

            {isInWishlist ? (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<BookmarkAddIcon />}
                onClick={handleRemoveFromWishlist}
              >
                İstek Listesinden Çıkar
              </Button>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<BookmarkAddIcon />}
                onClick={handleAddToWishlist}
              >
                İstek Listesine Ekle
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            {isInLibrary ? (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<BookmarkAddIcon />}
                onClick={handleRemoveFromLibrary}
              >
                Kütüphaneden Çıkar
              </Button>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<BookmarkAddIcon />}
                onClick={handleAddToLibrary}
              >
                Kütüphaneye Ekle
              </Button>
            )}
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
        </Grid>
      </Grid>

      {/* Actors Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Oyuncular
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {movie.actors && movie.actors.length > 0 ? (
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
                        Uyruk: {actorEntry.actor.nationality}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">Bu film için listelenmiş oyuncu yok.</Alert>
        )}
      </Box>

      {/* Ratings Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Değerlendirmeler
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {movie.ratings && movie.ratings.length > 0 ? (
          <Grid container spacing={2}>
            {movie.ratings.map((rating: Rating) => (
              <Grid item xs={12} sm={6} md={4} key={rating.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={rating.user?.profileImage || undefined}
                        alt={rating.user?.name}
                        sx={{ mr: 1.5 }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {rating.user?.name || "Kullanıcı"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{rating.user?.username} •{" "}
                          {formatDate(rating.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 1,
                        bgcolor:
                          rating.score >= 4
                            ? "success.light"
                            : rating.score >= 3
                            ? "warning.light"
                            : rating.score >= 2
                            ? "info.light"
                            : "error.light",
                        color: "white",
                        borderRadius: 1,
                      }}
                    >
                      <StarIcon sx={{ fontSize: 28, mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {rating.score}/5
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">Bu film için henüz değerlendirme yok.</Alert>
        )}
      </Box>

      {/* Reviews Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          İncelemeler
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {loadingReviews ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : reviewError ? (
          <Alert severity="error">{reviewError}</Alert>
        ) : reviews.length === 0 ? (
          <Alert severity="info">
            Bu filme henüz inceleme yapılmamış. İlk inceleyen siz olun!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {(() => {
              // URL'den reviewId parametresini al
              const searchParams = new URLSearchParams(location.search);
              const reviewId = searchParams.get("reviewId");

              // İncelemeleri en yakın tarihe göre sırala
              const sortedReviews = [...reviews].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );

              return sortedReviews.map((review) => {
                const isHighlighted =
                  reviewId && review.id === Number(reviewId);

                return (
                  <Grid item xs={12} key={review.id}>
                    <Paper
                      elevation={isHighlighted ? 8 : 1}
                      sx={{
                        p: 3,
                        border: isHighlighted ? "2px solid #f50057" : "none",
                        bgcolor: isHighlighted
                          ? "rgba(245, 0, 87, 0.05)"
                          : "background.paper",
                      }}
                      id={`review-${review.id}`}
                      ref={isHighlighted ? highlightedReviewRef : null}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar
                          src={review.user.profileImage || undefined}
                          alt={review.user.name}
                          sx={{ mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{review.user.username} •{" "}
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {review.content}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              });
            })()}
          </Grid>
        )}
      </Box>

      {/* Recommended Movies Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Önerilen Filmler
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {movie?.recommendedMovies && movie.recommendedMovies.length > 0 ? (
          <Grid container spacing={2}>
            {movie.recommendedMovies.map((similarMovie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={similarMovie.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: 6,
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => navigate(`/movie/${similarMovie.id}`)}
                >
                  <CardMedia
                    component="img"
                    image={
                      similarMovie.posterImage ||
                      "https://via.placeholder.com/300x450?text=Afiş+Yok"
                    }
                    alt={similarMovie.title}
                    sx={{ height: 240, objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {similarMovie.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {similarMovie.releaseYear}
                      </Typography>
                      {similarMovie.rating > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StarIcon
                            sx={{
                              color: getStarColor(similarMovie.rating),
                              fontSize: 16,
                              mr: 0.5,
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {similarMovie.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Show movie genres */}
                    {similarMovie.genres && similarMovie.genres.length > 0 && (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {similarMovie.genres
                          .slice(0, 2)
                          .map((genreEntry: any) => (
                            <Chip
                              key={genreEntry.genreId}
                              label={genreEntry.genre.name}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Şu anda bu film için önerilen benzer film bulunmamaktadır. Daha
            fazla film ekleyip kategorileri düzenledikçe öneriler burada
            görünecektir.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default MovieDetails;
