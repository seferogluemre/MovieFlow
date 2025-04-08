import { create } from 'zustand'

export interface Movie {
  id: string
  title: string
  description: string
  posterUrl: string
  releaseDate: string
  rating: number
}

interface MovieState {
  movies: Movie[]
  selectedMovie: Movie | null
  isLoading: boolean
  error: string | null
  setMovies: (movies: Movie[]) => void
  setSelectedMovie: (movie: Movie | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  selectedMovie: null,
  isLoading: false,
  error: null,
  setMovies: (movies) => set({ movies }),
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})) 