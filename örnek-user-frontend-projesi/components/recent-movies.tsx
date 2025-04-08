import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentMovies() {
  const movies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      releaseYear: 2023,
      director: "Frank Darabont",
      rating: 4.8,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
    },
    {
      id: 2,
      title: "The Godfather",
      releaseYear: 2023,
      director: "Francis Ford Coppola",
      rating: 4.7,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
    },
    {
      id: 3,
      title: "The Dark Knight",
      releaseYear: 2023,
      director: "Christopher Nolan",
      rating: 4.6,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
    },
    {
      id: 4,
      title: "Pulp Fiction",
      releaseYear: 2023,
      director: "Quentin Tarantino",
      rating: 4.5,
      ageRating: "ADULT",
      posterImage: "/placeholder.svg",
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Movies</CardTitle>
        <CardDescription>Recently added movies to the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movies.map((movie) => (
            <div key={movie.id} className="flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-md">
                <AvatarImage src={movie.posterImage} alt={movie.title} />
                <AvatarFallback className="rounded-md">{movie.title.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{movie.title}</p>
                  <Badge variant="outline">{movie.ageRating}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {movie.director} • {movie.releaseYear}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{movie.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

