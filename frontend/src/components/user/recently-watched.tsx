import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Star, Clock } from "lucide-react";

export function RecentlyWatched() {
  const movies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      releaseYear: 1994,
      director: "Frank Darabont",
      rating: 4.9,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      watchedDate: "2 days ago",
      duration: 142,
    },
    {
      id: 2,
      title: "The Godfather",
      releaseYear: 1972,
      director: "Francis Ford Coppola",
      rating: 4.8,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      watchedDate: "1 week ago",
      duration: 175,
    },
    {
      id: 3,
      title: "The Dark Knight",
      releaseYear: 2008,
      director: "Christopher Nolan",
      rating: 4.7,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      watchedDate: "2 weeks ago",
      duration: 152,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recently Watched</CardTitle>
          <CardDescription>Movies you've watched recently.</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movies.map((movie) => (
            <div key={movie.id} className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-md">
                <AvatarImage src={movie.posterImage} alt={movie.title} />
                <AvatarFallback className="rounded-md">
                  {movie.title.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{movie.title}</p>
                  <Badge variant="outline">{movie.ageRating}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{movie.duration} min</span>
                  <span className="mx-2">•</span>
                  <span>{movie.releaseYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm">{movie.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Watched {movie.watchedDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
