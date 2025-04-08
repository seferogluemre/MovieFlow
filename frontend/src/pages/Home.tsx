import { Grid, Paper, Typography, Box } from '@mui/material';
import MovieCard from '../components/MovieCard';

export default function Home() {
  // Normalde API'den gelecek, şimdi örnek data
  const trendingMovies = [
    { id: 1, title: 'The Shawshank Redemption', year: 1994, rating: 9.3, poster: 'https://via.placeholder.com/300x450?text=Movie+1' },
    { id: 2, title: 'The Godfather', year: 1972, rating: 9.2, poster: 'https://via.placeholder.com/300x450?text=Movie+2' },
    { id: 3, title: 'The Dark Knight', year: 2008, rating: 9.0, poster: 'https://via.placeholder.com/300x450?text=Movie+3' },
    { id: 4, title: 'The Godfather Part II', year: 1974, rating: 9.0, poster: 'https://via.placeholder.com/300x450?text=Movie+4' },
  ];

  const recentlyWatched = [
    { id: 5, title: 'Inception', year: 2010, rating: 8.8, poster: 'https://via.placeholder.com/300x450?text=Movie+5' },
    { id: 6, title: 'Interstellar', year: 2014, rating: 8.6, poster: 'https://via.placeholder.com/300x450?text=Movie+6' },
    { id: 7, title: 'Pulp Fiction', year: 1994, rating: 8.9, poster: 'https://via.placeholder.com/300x450?text=Movie+7' },
    { id: 8, title: 'The Matrix', year: 1999, rating: 8.7, poster: 'https://via.placeholder.com/300x450?text=Movie+8' },
  ];

  const recommendations = [
    { id: 9, title: 'Parasite', year: 2019, rating: 8.6, poster: 'https://via.placeholder.com/300x450?text=Movie+9' },
    { id: 10, title: 'Joker', year: 2019, rating: 8.4, poster: 'https://via.placeholder.com/300x450?text=Movie+10' },
    { id: 11, title: 'Avengers: Endgame', year: 2019, rating: 8.4, poster: 'https://via.placeholder.com/300x450?text=Movie+11' },
    { id: 12, title: 'The Lord of the Rings', year: 2003, rating: 9.0, poster: 'https://via.placeholder.com/300x450?text=Movie+12' },
  ];

  return (
    <div className="space-y-8">
      <section>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" className="font-bold">
            Trending Movies
          </Typography>
          <Typography variant="body2" color="primary" className="cursor-pointer">
            See all
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {trendingMovies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      </section>

      <section>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" className="font-bold">
            Recently Watched
          </Typography>
          <Typography variant="body2" color="primary" className="cursor-pointer">
            See all
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {recentlyWatched.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      </section>

      <section>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" className="font-bold">
            Recommended For You
          </Typography>
          <Typography variant="body2" color="primary" className="cursor-pointer">
            See all
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {recommendations.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      </section>

      <section>
        <Typography variant="h5" component="h2" className="mb-4 font-bold">
          Friend Activity
        </Typography>
        <Paper className="p-4">
          <Typography variant="body1" className="text-muted-foreground">
            No recent friend activity. Add more friends to see their movie reviews and ratings.
          </Typography>
        </Paper>
      </section>
    </div>
  );
} 