import { Typography, TextField, InputAdornment, Grid, Box, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  // Örnek film verisi
  const movies = [
    { id: 1, title: 'The Shawshank Redemption', year: 1994, rating: 9.3, poster: 'https://via.placeholder.com/300x450?text=Movie+1' },
    { id: 2, title: 'The Godfather', year: 1972, rating: 9.2, poster: 'https://via.placeholder.com/300x450?text=Movie+2' },
    { id: 3, title: 'The Dark Knight', year: 2008, rating: 9.0, poster: 'https://via.placeholder.com/300x450?text=Movie+3' },
    { id: 4, title: 'The Godfather Part II', year: 1974, rating: 9.0, poster: 'https://via.placeholder.com/300x450?text=Movie+4' },
    { id: 5, title: 'Inception', year: 2010, rating: 8.8, poster: 'https://via.placeholder.com/300x450?text=Movie+5' },
    { id: 6, title: 'Interstellar', year: 2014, rating: 8.6, poster: 'https://via.placeholder.com/300x450?text=Movie+6' },
    { id: 7, title: 'Pulp Fiction', year: 1994, rating: 8.9, poster: 'https://via.placeholder.com/300x450?text=Movie+7' },
    { id: 8, title: 'The Matrix', year: 1999, rating: 8.7, poster: 'https://via.placeholder.com/300x450?text=Movie+8' },
    { id: 9, title: 'Parasite', year: 2019, rating: 8.6, poster: 'https://via.placeholder.com/300x450?text=Movie+9' },
    { id: 10, title: 'Joker', year: 2019, rating: 8.4, poster: 'https://via.placeholder.com/300x450?text=Movie+10' },
    { id: 11, title: 'Avengers: Endgame', year: 2019, rating: 8.4, poster: 'https://via.placeholder.com/300x450?text=Movie+11' },
    { id: 12, title: 'The Lord of the Rings', year: 2003, rating: 9.0, poster: 'https://via.placeholder.com/300x450?text=Movie+12' },
  ];

  return (
    <div>
      <Box mb={4}>
        <Typography variant="h4" component="h1" className="mb-6 font-bold">
          Movies
        </Typography>
        
        <Box className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <TextField
            fullWidth
            placeholder="Search movies..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl className="min-w-[200px]">
            <InputLabel id="genre-select-label">Genre</InputLabel>
            <Select
              labelId="genre-select-label"
              id="genre-select"
              label="Genre"
              defaultValue=""
            >
              <MenuItem value="">All Genres</MenuItem>
              <MenuItem value="action">Action</MenuItem>
              <MenuItem value="comedy">Comedy</MenuItem>
              <MenuItem value="drama">Drama</MenuItem>
              <MenuItem value="sci-fi">Sci-Fi</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl className="min-w-[200px]">
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              label="Sort By"
              defaultValue="popularity"
            >
              <MenuItem value="popularity">Popularity</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="year">Release Year</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box mb={3} display="flex" flexWrap="wrap" gap={1}>
        <Typography className="mr-2 font-medium">Active Filters:</Typography>
        <Chip label="Action" size="small" onDelete={() => {}} />
        <Chip label="Rating > 8.0" size="small" onDelete={() => {}} />
      </Box>
      
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
} 