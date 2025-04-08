import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Container, 
  CircularProgress,
  Button
} from '@mui/material';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import MovieCard from '../components/ui/MovieCard';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  // Tüm filmleri getir
  const { data: moviesData, isLoading: isMoviesLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: () => movieService.getMovies(),
  });

  // En yüksek puanlı filmleri filtreleme
  const topRatedMovies = moviesData?.data
    ? [...moviesData.data]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
    : [];

  // En son eklenen filmleri filtreleme
  const latestMovies = moviesData?.data
    ? [...moviesData.data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    : [];

  if (isMoviesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container className="fade-in">
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: 6,
          mb: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderRadius: 2,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Typography variant="h3" gutterBottom>
          MovieFlow
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Film tutkunları için en iyi deneyim
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          component={Link}
          to="/movies"
          sx={{ mt: 2 }}
        >
          Filmleri Keşfet
        </Button>
      </Box>

      {/* Top Rated Movies */}
      <Box className="section">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" className="section-title">
            En Çok Puanlanan Filmler
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            component={Link}
            to="/movies/top-rated"
          >
            Tümünü Gör
          </Button>
        </Box>

        <Grid container spacing={3}>
          {topRatedMovies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={2.4}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Latest Movies */}
      <Box className="section">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" className="section-title">
            Son Eklenen Filmler
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            component={Link}
            to="/movies/new-releases"
          >
            Tümünü Gör
          </Button>
        </Box>

        <Box className="movie-slider">
          <Box className="slider-content">
            {latestMovies.map((movie) => (
              <Box key={movie.id} sx={{ width: 200, flexShrink: 0, mr: 2 }}>
                <MovieCard movie={movie} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 