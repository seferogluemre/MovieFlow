import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Watchlist as WatchlistType } from '../types';
import { userService } from '../services/userService';
import MovieCard from '../components/movie/MovieCard';

const Watchlist: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await userService.getWatchlist();
        if (response.success && response.data) {
          setWatchlist(response.data);
        } else {
          setError('İzleme listesi yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError('İzleme listesi yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWatchlist();
  }, [isAuthenticated]);
  
  const handleRemoveFromWatchlist = async (watchlistId: number) => {
    try {
      const response = await userService.removeFromWatchlist(watchlistId);
      if (response.success) {
        setWatchlist(prevWatchlist => prevWatchlist.filter(item => item.id !== watchlistId));
      }
    } catch (error) {
      setError('Film izleme listenizden kaldırılırken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        İzleme Listem
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {watchlist.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>
          İzleme listenizde henüz film bulunmuyor. Filmleri keşfederek izleme listenize ekleyebilirsiniz.
        </Alert>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {watchlist.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard 
                movie={item.movie}
                onRemove={() => handleRemoveFromWatchlist(item.id)}
                showRemoveButton
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Watchlist; 