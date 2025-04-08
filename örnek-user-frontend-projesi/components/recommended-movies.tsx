import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Plus } from "lucide-react"

export function RecommendedMovies() {
  const movies = [
    {
      id: 1,
      title: "Inception",
      releaseYear: 2010,
      director: "Christopher Nolan",
      rating: 4.8,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genre: "Sci-Fi",
    },
    {
      id: 2,
      title: "The Matrix",
      releaseYear: 1999,
      director: "The Wachowskis",
      rating: 4.7,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genre: "Sci-Fi",
    },
    {
      id: 3,
      title: "Interstellar",
      releaseYear: 2014,
      director: "Christopher Nolan",
      rating: 4.8,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genre: "Sci-Fi",
    },
    {
      id: 4,
      title: "The Prestige",
      releaseYear: 2006,
      director: "Christopher Nolan",
      rating: 4.6,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genre: "Mystery",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recommended For You</CardTitle>
          <CardDescription>Based on your watch history.</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="group relative overflow-hidden rounded-lg border">
              <div className="aspect-[2/3] overflow-hidden">
                <img
                  src={movie.posterImage || "/placeholder.svg"}
                  alt={movie.title}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="font-medium text-white">{movie.title}</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs text-white ml-1">{movie.rating}</span>
                  <span className="mx-2 text-xs text-white">•</span>
                  <span className="text-xs text-white">{movie.releaseYear}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" className="w-full">
                    <Plus className="h-3 w-3 mr-1" /> Watchlist
                  </Button>
                </div>
              </div>
              <Badge className="absolute top-2 right-2 bg-black/70">{movie.genre}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

