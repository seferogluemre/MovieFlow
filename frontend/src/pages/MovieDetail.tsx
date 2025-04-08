import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  Box,
  Grid,
  Button,
  Rating,
  Divider,
  Chip,
  Paper,
  Avatar,
  TextField,
  CircularProgress,
  Container,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  PlayCircleOutline,
  AccessTime,
  Star,
  Add,
} from '@mui/icons-material';
import { movieService } from '../services/movieService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Review, Movie, Actor, Genre } from '../types';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [reviewContent, setReviewContent] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [inLibrary, setInLibrary] = useState<boolean>(false);

  // Film detaylarını getir
  const { data: movieData, isLoading: isMovieLoading, error: movieError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovieById(parseInt(id || '0')),
    enabled: !!id,
  });

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => movieService.getReviews(parseInt(id || '0')),
    enabled: !!id,
  });

  const { data: actorsData, isLoading: isActorsLoading } = useQuery({
    queryKey: ['actors', id],
    queryFn: () => movieService.getMovieActors(parseInt(id || '0')),
    enabled: !!id,
  });

  const movie = movieData?.data;
  const reviews = reviewsData?.data;
  const actors = actorsData?.data;

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated || !id) return;
    await userService.addToWatchlist(parseInt(id));
    // Başarılı mesajı gösterebiliriz
  };

  // Favorilere ekle
  const handleAddToWishlist = async () => {
    if (!isAuthenticated || !id) return;
    await userService.addToWishlist(parseInt(id));
    // Başarılı mesajı gösterebiliriz
  };

  // Kütüphaneye ekle
  const handleAddToLibrary = async () => {
    if (!isAuthenticated || !id) return;
    await userService.addToLibrary(parseInt(id));
    // Başarılı mesajı gösterebiliriz
  };

  // Yorum ekle
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !id || !reviewContent.trim()) return;

    await movieService.addReview(parseInt(id), reviewContent);
    setReviewContent('');
    refetchReviews();
  };

  // Film puanla
  const handleRate = async (value: number | null) => {
    if (!isAuthenticated || !id || !value) return;
    setUserRating(value);
    await movieService.rateMovie(parseInt(id), value);
    // Başarılı mesajı gösterebiliriz
  };

  const toggleWatchlist = () => {
    setInWatchlist(!inWatchlist);
    // Burada API ile watchlist güncelleme yapılabilir
  };

  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
    // Burada API ile wishlist güncelleme yapılabilir
  };

  const toggleLibrary = () => {
    setInLibrary(!inLibrary);
    // Burada API ile library güncelleme yapılabilir
  };

  // Yükleniyor durumu
  if (isMovieLoading || isActorsLoading || isReviewsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (movieError || !movie) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h5" color="error">
          Film yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </Typography>
      </Box>
    );
  }

  return (
    <Container className="fade-in">
      <Grid container spacing={4}>
        {/* Sol Kolon - Film Posteri */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
            <CardMedia
              component="img"
              image={movie.posterImage || '/placeholder-poster.jpg'}
              alt={movie.title}
              sx={{ aspectRatio: '2/3', objectFit: 'cover' }}
            />
          </Card>

          {/* Film Aksiyonları */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<FavoriteBorder />}
              onClick={toggleWishlist}
              disabled={!isAuthenticated}
            >
              {inWishlist ? 'İstek Listemden Çıkar' : 'İstek Listeme Ekle'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<BookmarkBorder />}
              onClick={toggleWatchlist}
              disabled={!isAuthenticated}
            >
              {inWatchlist ? 'İzleme Listemden Çıkar' : 'İzleme Listeme Ekle'}
            </Button>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayCircleOutline />}
            onClick={toggleLibrary}
            disabled={!isAuthenticated}
            sx={{ mb: 3 }}
          >
            {inLibrary ? 'Kütüphanemden Çıkar' : 'Kütüphaneme Ekle'}
          </Button>

          {/* Film Detayları */}
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Film Detayları
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Yönetmen:</Typography>
              <Typography variant="body2">{movie.director}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Yayın Yılı:</Typography>
              <Typography variant="body2">{movie.releaseYear}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Süre:</Typography>
              <Typography variant="body2">
                <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {movie.duration} dakika
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Puan:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star sx={{ color: 'gold', mr: 0.5 }} fontSize="small" />
                <Typography variant="body2">{movie.rating.toFixed(1)}/5</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Yaş Sınırı:</Typography>
              <Typography variant="body2">{movie.ageRating}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Kolon - Film Bilgileri */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {movie.title}
          </Typography>

          {/* Türler */}
          <Box sx={{ mb: 3 }}>
            {movie.genres?.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
                component={Link}
                to={`/genres/${genre.id}`}
                clickable
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          {/* Puanlama */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" mr={2}>
              Sizin Puanınız:
            </Typography>
            <Rating
              value={userRating}
              onChange={(_, newValue) => handleRate(newValue)}
              disabled={!isAuthenticated}
            />
            {!isAuthenticated && (
              <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                Puanlamak için <Link to="/login">giriş yapın</Link>
              </Typography>
            )}
          </Box>

          {/* Film Açıklaması */}
          <Typography variant="body1" paragraph>
            {movie.description}
          </Typography>

          {/* Oyuncular */}
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Oyuncular
          </Typography>
          {isActorsLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {actors?.map((actor) => (
                <Box
                  key={actor.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 100,
                  }}
                >
                  <Avatar
                    src={actor.photo || undefined}
                    alt={actor.name}
                    sx={{ width: 80, height: 80, mb: 1 }}
                  />
                  <Typography variant="body2" align="center" noWrap>
                    {actor.name}
                  </Typography>
                  {actor.role && (
                    <Typography
                      variant="caption"
                      align="center"
                      color="text.secondary"
                      noWrap
                    >
                      {actor.role}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Yorumlar */}
          <Typography variant="h5" gutterBottom>
            Yorumlar
          </Typography>

          {/* Yorum Formu */}
          {isAuthenticated ? (
            <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Yorumunuz"
                multiline
                rows={3}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!reviewContent.trim()}
              >
                Yorum Ekle
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Yorum yapmak için <Link to="/login">giriş yapın</Link>
            </Typography>
          )}

          {/* Yorum Listesi */}
          {isReviewsLoading ? (
            <CircularProgress size={24} />
          ) : reviews?.length ? (
            reviews.map((review: Review) => (
              <Paper key={review.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={review.user?.profileImage}
                    alt={review.user?.username}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="subtitle2">
                    {review.user?.username || 'Kullanıcı'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 'auto' }}
                  >
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Typography variant="body2">{review.content}</Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Henüz yorum yapılmamış. İlk yorumu siz yapın!
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default MovieDetail; 