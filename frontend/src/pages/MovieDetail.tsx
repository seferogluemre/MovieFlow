import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMovieStore } from '../store/useMovieStore'
import { getMovieById } from '../services/movieService'

export const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedMovie, setSelectedMovie, setLoading, setError } = useMovieStore()

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return

      try {
        setLoading(true)
        const movie = await getMovieById(id)
        setSelectedMovie(movie)
      } catch (error) {
        setError('Film detayı yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id, setSelectedMovie, setLoading, setError])

  if (!selectedMovie) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Film Posteri */}
        <div className="relative">
          <img
            src={selectedMovie.posterUrl}
            alt={selectedMovie.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Film Detayları */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{selectedMovie.title}</h1>
          
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 mr-2">★</span>
            <span className="text-gray-700">{selectedMovie.rating}/10</span>
            <span className="text-gray-500 ml-4">{selectedMovie.releaseDate}</span>
          </div>

          <p className="text-gray-700 mb-6">{selectedMovie.description}</p>

          {/* TODO: İzleme listesine ekleme butonu */}
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={() => {
              // İzleme listesine ekleme fonksiyonu
            }}
          >
            İzleme Listesine Ekle
          </button>
        </div>
      </div>
    </div>
  )
} 