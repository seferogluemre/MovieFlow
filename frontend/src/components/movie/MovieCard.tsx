import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  Rating, 
  CardActionArea, 
  Chip 
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  BookmarkAdd as BookmarkAddIcon,
  Favorite as FavoriteIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  showRemoveButton?: boolean;
  showAddToWatchlistButton?: boolean;
  showAddToWishlistButton?: boolean;
  onRemove?: () => void;
  onAddToWatchlist?: () => void;
  onAddToWishlist?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  showRemoveButton = false,
  showAddToWatchlistButton = false,
  showAddToWishlistButton = false,
  onRemove,
  onAddToWatchlist,
  onAddToWishlist
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/movies/${movie.id}`);
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };
  
  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToWatchlist) onAddToWatchlist();
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToWishlist) onAddToWishlist();
  };
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          image={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '/placeholder-poster.jpg'}
          alt={movie.title}
          sx={{ height: 0, paddingTop: '150%', position: 'relative' }} // 2:3 aspect ratio
        />
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h6" component="div" noWrap title={movie.title}>
            {movie.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {new Date(movie.releaseDate).getFullYear()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
            <Rating
              value={movie.voteAverage / 2}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {movie.voteAverage.toFixed(1)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      {(showRemoveButton || showAddToWatchlistButton || showAddToWishlistButton) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          {showRemoveButton && (
            <IconButton 
              size="small" 
              onClick={handleRemove}
              title="Kaldır"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
          
          {showAddToWatchlistButton && (
            <IconButton 
              size="small" 
              onClick={handleAddToWatchlist}
              title="İzleme Listesine Ekle"
              color="primary"
            >
              <BookmarkAddIcon />
            </IconButton>
          )}
          
          {showAddToWishlistButton && (
            <IconButton 
              size="small" 
              onClick={handleAddToWishlist}
              title="Favorilere Ekle"
              color="secondary"
            >
              <FavoriteIcon />
            </IconButton>
          )}
        </Box>
      )}
    </Card>
  );
};

export default MovieCard; 