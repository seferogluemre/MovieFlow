import { MovieBrowser } from "@/components/movie-browser"
import { Separator } from "@/components/ui/separator"

export default function MoviesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Browse Movies</h3>
        <p className="text-muted-foreground">Discover new movies to watch.</p>
      </div>
      <Separator />
      <MovieBrowser />
    </div>
  )
}

