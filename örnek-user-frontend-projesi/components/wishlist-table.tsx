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
import { MoreHorizontal, Search, Eye, Trash, List, Star } from "lucide-react"

export function WishlistTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const wishlist = [
    {
      id: 1,
      title: "The Godfather",
      releaseYear: 1972,
      director: "Francis Ford Coppola",
      rating: 4.8,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      addedDate: "2023-10-12",
    },
    {
      id: 2,
      title: "Pulp Fiction",
      releaseYear: 1994,
      director: "Quentin Tarantino",
      rating: 4.6,
      ageRating: "ADULT",
      posterImage: "/placeholder.svg",
      addedDate: "2023-10-08",
    },
    {
      id: 3,
      title: "The Shawshank Redemption",
      releaseYear: 1994,
      director: "Frank Darabont",
      rating: 4.9,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      addedDate: "2023-10-05",
    },
    {
      id: 4,
      title: "Forrest Gump",
      releaseYear: 1994,
      director: "Robert Zemeckis",
      rating: 4.5,
      ageRating: "PARENTAL_GUIDANCE",
      posterImage: "/placeholder.svg",
      addedDate: "2023-09-30",
    },
  ]

  const filteredWishlist = wishlist.filter(
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
          placeholder="Search wishlist..."
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
            {filteredWishlist.map((movie) => (
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
                        <List className="mr-2 h-4 w-4" />
                        Add to Watchlist
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

