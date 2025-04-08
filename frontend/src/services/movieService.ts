import { apiService } from './api';
import { Movie, ApiResponse, Genre, Actor, Review, Rating } from '../types';

export const movieService = {
  // Tüm filmleri getir
  getMovies: async () => {
    return apiService.get<Movie[]>('/movies');
  },

  // ID'ye göre film getir
  getMovieById: async (id: number) => {
    return apiService.get<Movie>(`/movies/${id}`);
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

  // Film türüne göre filmleri getir
  getMoviesByGenre: async (genreId: number) => {
    return apiService.get<Movie[]>(`/genres/${genreId}/movies`);
  },

  // Tüm türleri getir
  getGenres: async () => {
    return apiService.get<Genre[]>('/genres');
  },

  // Filmin oyuncularını getir
  getMovieActors: async (movieId: number) => {
    return apiService.get<Actor[]>(`/movies/${movieId}/actors`);
  },

  // Film arama
  searchMovies: async (query: string) => {
    return apiService.get<Movie[]>('/movies', { query });
  },
};

export default movieService; 