import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Star } from "lucide-react";

export function WatchlistPreview() {
  const watchlist = [
    {
      id: 1,
      title: "Dune",
      releaseYear: 2021,
      director: "Denis Villeneuve",
      rating: 4.7,
      posterImage: "/placeholder.svg",
      addedDate: "3 days ago",
    },
    {
      id: 2,
      title: "Blade Runner 2049",
      releaseYear: 2017,
      director: "Denis Villeneuve",
      rating: 4.5,
      posterImage: "/placeholder.svg",
      addedDate: "1 week ago",
    },
    {
      id: 3,
      title: "The Lord of the Rings: The Fellowship of the Ring",
      releaseYear: 2001,
      director: "Peter Jackson",
      rating: 4.9,
      posterImage: "/placeholder.svg",
      addedDate: "2 weeks ago",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Movies you want to watch.</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {watchlist.map((movie) => (
            <div key={movie.id} className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-md">
                <AvatarImage src={movie.posterImage} alt={movie.title} />
                <AvatarFallback className="rounded-md">
                  {movie.title.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 min-w-0">
                <p className="font-medium truncate">{movie.title}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{movie.releaseYear}</span>
                  <span className="mx-2">•</span>
                  <Star className="h-3 w-3 mr-1" />
                  <span>{movie.rating}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                Added {movie.addedDate}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
