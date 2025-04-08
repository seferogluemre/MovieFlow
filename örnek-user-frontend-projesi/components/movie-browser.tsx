"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Plus, Heart, List, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MovieBrowser() {
  const [searchTerm, setSearchTerm] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [ageRatingFilter, setAgeRatingFilter] = useState("all")

  const movies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      releaseYear: 1994,
      director: "Frank Darabont",
      rating: 4.9,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      genres: ["Drama"],
    },
    {
      id: 2,
      title: "The Godfather",
      releaseYear: 1972,
      director: "Francis Ford Coppola",
      rating: 4.8,
      ageRating: "MATURE",
      posterImage: "/placeholder.svg",
      genres: ["Crime", "Drama"],
    },
    {
      id: 3,
      title: "The Dark Knight",
      releaseYear: 2008,
      director: "Christopher Nolan",
      rating: 4.7,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genres: ["Action", "Crime", "Drama"],
    },
    {
      id: 4,
      title: "Pulp Fiction",
      releaseYear: 1994,
      director: "Quentin Tarantino",
      rating: 4.6,
      ageRating: "ADULT",
      posterImage: "/placeholder.svg",
      genres: ["Crime", "Drama"],
    },
    {
      id: 5,
      title: "Forrest Gump",
      releaseYear: 1994,
      director: "Robert Zemeckis",
      rating: 4.5,
      ageRating: "PARENTAL_GUIDANCE",
      posterImage: "/placeholder.svg",
      genres: ["Drama", "Romance"],
    },
    {
      id: 6,
      title: "Inception",
      releaseYear: 2010,
      director: "Christopher Nolan",
      rating: 4.8,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genres: ["Action", "Adventure", "Sci-Fi"],
    },
    {
      id: 7,
      title: "The Matrix",
      releaseYear: 1999,
      director: "The Wachowskis",
      rating: 4.7,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genres: ["Action", "Sci-Fi"],
    },
    {
      id: 8,
      title: "Interstellar",
      releaseYear: 2014,
      director: "Christopher Nolan",
      rating: 4.8,
      ageRating: "TEEN",
      posterImage: "/placeholder.svg",
      genres: ["Adventure", "Drama", "Sci-Fi"],
    },
  ]

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (genreFilter === "all" || movie.genres.includes(genreFilter)) &&
      (yearFilter === "all" || movie.releaseYear.toString() === yearFilter) &&
      (ageRatingFilter === "all" || movie.ageRating === ageRatingFilter),
  )

  const genres = ["Action", "Adventure", "Comedy", "Crime", "Drama", "Romance", "Sci-Fi"]
  const years = [...new Set(movies.map((movie) => movie.releaseYear))].sort((a, b) => b - a)
  const ageRatings = [...new Set(movies.map((movie) => movie.ageRating))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search movies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ageRatingFilter} onValueChange={setAgeRatingFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Age Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {ageRatings.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  {rating.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Title (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Title (Z-A)</DropdownMenuItem>
              <DropdownMenuItem>Rating (High to Low)</DropdownMenuItem>
              <DropdownMenuItem>Year (Newest)</DropdownMenuItem>
              <DropdownMenuItem>Year (Oldest)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <Card key={movie.id} className="overflow-hidden">
            <div className="aspect-[2/3] relative group">
              <img
                src={movie.posterImage || "/placeholder.svg"}
                alt={movie.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="font-medium text-white">{movie.title}</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs text-white ml-1">{movie.rating}</span>
                  <span className="mx-2 text-xs text-white">•</span>
                  <span className="text-xs text-white">{movie.releaseYear}</span>
                </div>
                <p className="text-xs text-white mt-1">{movie.director}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" className="w-full">
                    <Plus className="h-3 w-3 mr-1" /> Watchlist
                  </Button>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Badge className="bg-black/70">{movie.ageRating.replace("_", " ")}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium truncate">{movie.title}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm ml-1">{movie.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>{movie.releaseYear}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-1" />
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <List className="h-4 w-4 mr-1" />
                </Button>
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

