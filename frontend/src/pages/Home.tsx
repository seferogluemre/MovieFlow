import { useEffect } from 'react'
import { useMovieStore } from '../store/useMovieStore'
import { MovieCard } from '../components/common/MovieCard'
import { useNavigate } from 'react-router-dom'
import { getMovies } from '../services/movieService'

export const Home = () => {
  const { movies, setMovies, setLoading, setError } = useMovieStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const movies=await getMovies();
        if(movies){
          setMovies(movies)
        }
      } catch (error) {
        setError('Filmler yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [setMovies, setLoading, setError])

  const handleMovieClick = (movie: any) => {
    navigate(`/movie/${movie.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Popüler Filmler</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie.id}>
            <MovieCard movie={movie} onClick={handleMovieClick} />
          </div>
        ))}
      </div>
    </div>
  )
} 