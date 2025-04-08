"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Eye, Trash, Clock, Star, Heart } from "lucide-react"

export function WatchlistTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const watchlist = [
    {
      id: 1,
      title: "Dune",
      releaseYear: 2021,
      director: "Denis Villeneuve",
      rating: 4.7,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      addedDate: "2023-10-15",
    },
    {
      id: 2,
      title: "Blade Runner 2049",
      releaseYear: 2017,
      director: "Denis Villeneuve",
      rating: 4.5,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      addedDate: "2023-10-10",
    },
    {
      id: 3,
      title: "The Lord of the Rings: The Fellowship of the Ring",
      releaseYear: 2001,
      director: "Peter Jackson",
      rating: 4.9,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      addedDate: "2023-10-05",
    },
    {
      id: 4,
      title: "Everything Everywhere All at Once",
      releaseYear: 2022,
      director: "Daniel Kwan, Daniel Scheinert",
      rating: 4.8,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      addedDate: "2023-09-28",
    },
    {
      id: 5,
      title: "Parasite",
      releaseYear: 2019,
      director: "Bong Joon-ho",
      rating: 4.6,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      addedDate: "2023-09-20",
    },
  ]

  const filteredWatchlist = watchlist.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.releaseYear.toString().includes(searchTerm),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search watchlist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie</TableHead>
              <TableHead>Director</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Age Rating</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWatchlist.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-md">
                      <AvatarImage src={movie.posterImage} alt={movie.title} />
                      <AvatarFallback className="rounded-md">{movie.title.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{movie.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{movie.director}</TableCell>
                <TableCell>{movie.releaseYear}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                    {movie.rating}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      movie.ageRating === "ADULT"
                        ? "border-red-500 text-red-500"
                        : movie.ageRating === "MATURE"
                          ? "border-orange-500 text-orange-500"
                          : movie.ageRating === "TEEN"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-green-500 text-green-500"
                    }
                  >
                    {movie.ageRating.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{movie.addedDate}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Watched
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="mr-2 h-4 w-4" />
                        Add to Wishlist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

