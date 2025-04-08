import { Movie } from '@store/useMovieStore'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'

export const watchlistService = {
  async getWatchlist(): Promise<Movie[]> {
    const response = await fetch(`${API_URL}/api/watchlist`, {
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist')
    }
    return response.json()
  },

  async addToWatchlist(movieId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ movieId }),
    })
    if (!response.ok) {
      throw new Error('Failed to add movie to watchlist')
    }
  },

  async removeFromWatchlist(movieId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/watchlist/${movieId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to remove movie from watchlist')
    }
  },
} 