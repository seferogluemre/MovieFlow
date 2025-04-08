import { Card, CardActionArea, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster: string;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <Card 
      className="h-full overflow-hidden transition-shadow hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardActionArea onClick={handleClick}>
        <div className="relative">
          <CardMedia
            component="img"
            height="450"
            image={movie.poster}
            alt={movie.title}
            className="h-64 object-cover transition-transform duration-300"
            sx={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          <Box 
            className="absolute top-2 right-2 rounded p-1"
            sx={{ 
              bgcolor: 'rgba(0, 0, 0, 0.6)', 
              display: 'flex', 
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
          >
            <StarIcon sx={{ color: '#FFD700', fontSize: '16px', marginRight: '4px' }} />
            <Typography variant="body2" component="span" sx={{ color: 'white', fontWeight: 'bold' }}>
              {movie.rating.toFixed(1)}
            </Typography>
          </Box>
        </div>

        <CardContent>
          <Typography gutterBottom variant="h6" component="div" className="font-bold line-clamp-1" title={movie.title}>
            {movie.title}
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {movie.year}
            </Typography>
            <Chip 
              label="Action" 
              size="small" 
              className="bg-accent/50 text-xs"
              sx={{ height: '20px' }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
} 