import { useState, useEffect } from 'react'
import { useAuth } from '@contexts/AuthContext'
import { useToast } from '@contexts/ToastContext'
import { MovieCard } from '@components/common/MovieCard'
import { getWatchlist, removeFromWatchlist } from '@services/watchlistService'

export const Watchlist = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true)
        const data = await getWatchlist()
        setMovies(data)
      } catch (error) {
        showToast('İzleme listesi yüklenirken bir hata oluştu', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [])

  const handleRemove = async (movieId: number) => {
    try {
      setLoading(true)
      await removeFromWatchlist(movieId)
      setMovies(movies.filter((movie) => movie.id !== movieId))
      showToast('Film izleme listesinden kaldırıldı', 'success')
    } catch (error) {
      showToast('Film kaldırılırken bir hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İzleme Listem</h1>
      {movies.length === 0 ? (
        <p className="text-gray-600">İzleme listenizde henüz film bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onRemove={() => handleRemove(movie.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
} 