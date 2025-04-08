import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  CircularProgress,
  Pagination,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useParams, useSearchParams } from 'react-router-dom';
import { Genre, Movie } from '../types';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';

const Movies: React.FC = () => {
  const { id: genreId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [selectedGenre, setSelectedGenre] = useState<string>(genreId || '');
  
  useEffect(() => {
    // URL parametrelerini güncelle
    const params: any = {};
    if (page > 1) params.page = page;
    if (search) params.search = search;
    if (sort !== 'popular') params.sort = sort;
    if (selectedGenre) params.genre = selectedGenre;
    
    setSearchParams(params);
  }, [page, search, sort, selectedGenre, setSearchParams]);
  
  useEffect(() => {
    // URL parametrelerini kontrol et
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const genreParam = searchParams.get('genre');
    
    if (pageParam) setPage(parseInt(pageParam));
    if (searchParam) setSearch(searchParam);
    if (sortParam) setSort(sortParam);
    if (genreParam) setSelectedGenre(genreParam);
  }, [searchParams]);
  
  useEffect(() => {
    // Tüm türleri yükle
    const fetchGenres = async () => {
      try {
        const response = await movieService.getGenres();
        if (response.success && response.data) {
          setGenres(response.data);
        }
      } catch (err) {
        console.error('Türler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchGenres();
  }, []);
  
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Aramada her zaman ilk sayfaya dön
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSort(e.target.value);
    setPage(1);
  };
  
  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Filmler
        </Typography>
        
        {/* Filtreler */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Arama */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Film Ara"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* Sıralama */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">Sıralama</InputLabel>
              <Select
                labelId="sort-label"
                value={sort}
                label="Sıralama"
                onChange={handleSortChange as any}
              >
                <MenuItem value="popular">Popülerlik</MenuItem>
                <MenuItem value="rating">En Yüksek Puan</MenuItem>
                <MenuItem value="newest">Yeni Eklenenler</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Tür Filtresi */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="genre-label">Tür</InputLabel>
              <Select
                labelId="genre-label"
                value={selectedGenre}
                label="Tür"
                onChange={handleGenreChange as any}
              >
                <MenuItem value="all">Tüm Türler</MenuItem>
                {genres.map(genre => (
                  <MenuItem key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Film Listesi */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 4 }}>
            {error}
          </Typography>
        ) : movies.length === 0 ? (
          <Typography sx={{ my: 4 }}>
            Arama kriterlerinize uygun film bulunamadı.
          </Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {movies.map(movie => (
                <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard 
                    movie={movie} 
                    showAddToWatchlistButton={true}
                    showAddToWishlistButton={true}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Sayfalama */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Movies; 