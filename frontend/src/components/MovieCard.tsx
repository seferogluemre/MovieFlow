import { Movie } from '@store/useMovieStore'

interface MovieCardProps {
  movie: Movie
  onRemove?: () => void
}

export const MovieCard = ({ movie, onRemove }: MovieCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={movie.poster_path}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{movie.overview}</p>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
          >
            Listeden Kaldır
          </button>
        )}
      </div>
    </div>
  )
} 