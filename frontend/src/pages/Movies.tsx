import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Container, 
  CircularProgress,
  Pagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import MovieCard from '../components/ui/MovieCard';
import { Movie, Genre } from '../types';

const MoviesPage: React.FC = () => {
  const { id: genreId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('releaseYear');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 12;

  // Tüm filmleri getir
  const { data: moviesData, isLoading: isMoviesLoading } = useQuery({
    queryKey: ['movies', genreId, searchQuery],
    queryFn: async () => {
      if (genreId) {
        return movieService.getMoviesByGenre(parseInt(genreId));
      } else if (searchQuery) {
        return movieService.searchMovies(searchQuery);
      } else {
        return movieService.getMovies();
      }
    },
  });

  // Türleri getir
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => movieService.getGenres(),
  });

  // Mevcut tür ismini bul
  const currentGenre = genresData?.data?.find(
    (genre) => genre.id === parseInt(genreId || '0')
  );

  // Filmleri filtrele ve sırala
  const filteredAndSortedMovies = React.useMemo(() => {
    if (!moviesData?.data) return [];

    const filtered = [...moviesData.data];

    // Sıralama
    return filtered.sort((a, b) => {
      // @ts-ignore - Dynamic property access
      const valueA = a[sortBy];
      // @ts-ignore - Dynamic property access
      const valueB = b[sortBy];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [moviesData?.data, sortBy, sortOrder]);

  // Sayfalama
  const paginatedMovies = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMovies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMovies, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedMovies.length / itemsPerPage);

  // Sayfa değiştirme
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sıralama değiştirme
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  // Sıralama yönü değiştirme
  const handleOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value);
  };

  if (isMoviesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container className="fade-in">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {searchQuery
            ? `"${searchQuery}" için Arama Sonuçları`
            : genreId
            ? `${currentGenre?.name || 'Kategori'} Filmleri`
            : 'Tüm Filmler'}
        </Typography>

        {/* Filtreler */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sıralama</InputLabel>
            <Select
              value={sortBy}
              label="Sıralama"
              onChange={handleSortChange}
            >
              <MenuItem value="title">Film Adı</MenuItem>
              <MenuItem value="releaseYear">Yayın Yılı</MenuItem>
              <MenuItem value="rating">Puan</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sıralama Yönü</InputLabel>
            <Select
              value={sortOrder}
              label="Sıralama Yönü"
              onChange={handleOrderChange}
            >
              <MenuItem value="asc">Artan</MenuItem>
              <MenuItem value="desc">Azalan</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Film Listesi */}
      {paginatedMovies.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {paginatedMovies.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            Film bulunamadı
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MoviesPage; 