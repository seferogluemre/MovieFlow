import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MovieCard } from '../components/movie/MovieCard'
import { useToast } from '../contexts/ToastContext'
import { searchMovies } from '../services/movieService'

export const Search = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSearch = async () => {
    try {
      setLoading(true)
      const results = await searchMovies(query)
      setMovies(results)
    } catch (error) {
      showToast('Arama sırasında bir hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Film Ara</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
} 