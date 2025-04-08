import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Box, IconButton, Rating } from '@mui/material';
import { Favorite, BookmarkAdd, PlayCircleOutline } from '@mui/icons-material';
import { Movie } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

interface MovieCardProps {
  movie: Movie;
  inWatchlist?: boolean;
  inWishlist?: boolean;
  inLibrary?: boolean;
  onAddToWatchlist?: (movie: Movie) => void;
  onAddToWishlist?: (movie: Movie) => void;
  onAddToLibrary?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  inWatchlist = false,
  inWishlist = false,
  inLibrary = false,
  onAddToWatchlist,
  onAddToWishlist,
  onAddToLibrary,
}) => {
  const { isAuthenticated } = useAuth();
  
  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    if (onAddToWatchlist) {
      onAddToWatchlist(movie);
    } else {
      await userService.addToWatchlist(movie.id);
    }
  };
  
  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (onAddToWishlist) {
      onAddToWishlist(movie);
    } else {
      await userService.addToWishlist(movie.id);
    }
  };
  
  const handleAddToLibrary = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (onAddToLibrary) {
      onAddToLibrary(movie);
    } else {
      await userService.addToLibrary(movie.id);
    }
  };

  return (
    <Link to={`/movies/${movie.id}`} style={{ textDecoration: 'none' }}>
      <Card className="movie-card">
        <CardMedia
          component="img"
          className="movie-poster"
          image={movie.posterImage || '/placeholder-poster.jpg'}
          alt={movie.title}
        />
        
        <CardContent className="movie-info">
          <Typography variant="h6" className="movie-title" noWrap>
            {movie.title}
          </Typography>
          
          <Box className="movie-meta" display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {movie.releaseYear}
            </Typography>
            
            <Box className="movie-rating" display="flex" alignItems="center">
              <Rating 
                value={movie.rating / 2} 
                precision={0.5} 
                size="small" 
                readOnly 
              />
              <Typography variant="body2" ml={0.5}>
                {movie.rating.toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        <Box className="movie-actions" display="flex" justifyContent="space-between" px={1} pb={1}>
          <IconButton 
            size="small" 
            color={inWishlist ? "secondary" : "default"} 
            onClick={handleAddToWishlist}
          >
            <Favorite />
          </IconButton>
          
          <IconButton 
            size="small" 
            color={inWatchlist ? "primary" : "default"} 
            onClick={handleAddToWatchlist}
          >
            <BookmarkAdd />
          </IconButton>
          
          <IconButton 
            size="small" 
            color={inLibrary ? "success" : "default"} 
            onClick={handleAddToLibrary}
          >
            <PlayCircleOutline />
          </IconButton>
        </Box>
      </Card>
    </Link>
  );
};

export default MovieCard; 