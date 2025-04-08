import { apiService } from './apiService';
import { Movie, ApiResponse, Genre, Actor, Review, Rating } from '../types';

export const movieService = {
  // Film listesini getir (sayfalama ve filtrelerle)
  getMovies: async (page = 1, filters = {}) => {
    return apiService.get<Movie[]>('/movies', { params: { page, ...filters } });
  },

  // Tek bir filmi ID'ye göre getir
  getMovie: async (id: number) => {
    return apiService.get<Movie>(`/movies/${id}`);
  },

  // En çok puanlanan filmleri getir
  getTopRated: async (limit = 10) => {
    return apiService.get<Movie[]>('/movies/top-rated', { params: { limit } });
  },

  // Yeni çıkan filmleri getir
  getNewReleases: async (limit = 10) => {
    return apiService.get<Movie[]>('/movies/new-releases', { params: { limit } });
  },

  // Popüler filmleri getir
  getPopular: async (limit = 10) => {
    return apiService.get<Movie[]>('/movies/popular', { params: { limit } });
  },

  // Film türlerini getir
  getGenres: async () => {
    return apiService.get<Genre[]>('/genres');
  },

  // Belirli bir türe ait filmleri getir
  getMoviesByGenre: async (genreId: number, page = 1) => {
    return apiService.get<Movie[]>(`/genres/${genreId}/movies`, { params: { page } });
  },

  // Film arama
  searchMovies: async (query: string, page = 1) => {
    return apiService.get<Movie[]>('/movies/search', { params: { query, page } });
  },

  // Yeni film ekle (Admin)
  createMovie: async (movieData: Partial<Movie>) => {
    return apiService.post<Movie>('/movies', movieData);
  },

  // Film güncelle (Admin)
  updateMovie: async (id: number, movieData: Partial<Movie>) => {
    return apiService.patch<Movie>(`/movies/${id}`, movieData);
  },

  // Film sil (Admin)
  deleteMovie: async (id: number) => {
    return apiService.delete<boolean>(`/movies/${id}`);
  },

  // Film posteri getir
  getMoviePoster: (id: number) => {
    return `/movies/posters/${id}`;
  },

  // Film için yorum ekle
  addReview: async (movieId: number, content: string) => {
    return apiService.post<Review>('/reviews', { movieId, content });
  },

  // Film için yorumları getir
  getReviews: async (movieId: number) => {
    return apiService.get<Review[]>(`/movies/${movieId}/reviews`);
  },

  // Film puanla
  rateMovie: async (movieId: number, score: number) => {
    return apiService.post<Rating>('/ratings', { movieId, score });
  },

  // Filmin oyuncularını getir
  getMovieActors: async (movieId: number) => {
    return apiService.get<Actor[]>(`/movies/${movieId}/actors`);
  },
};

export default movieService; 