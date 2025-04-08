import { Card, CardContent, CardMedia, Typography, Rating, Box } from '@mui/material'
import { Movie } from '../../store/useMovieStore'

interface MovieCardProps {
  movie: Movie
  onClick: (movie: Movie) => void
}

export const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  return (
    <Card
      sx={{
        maxWidth: 345,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
      onClick={() => onClick(movie)}
    >
      <CardMedia
        component="img"
        height="400"
        image={movie.posterImage}
        alt={movie.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {movie.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {movie.releaseYear}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {movie.duration}dk
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={movie.rating} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({movie.rating})
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
} 