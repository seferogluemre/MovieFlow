"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MoreHorizontal, Search, Edit, Trash, Film } from "lucide-react"

export function GenreTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const genres = [
    {
      id: 1,
      name: "Action",
      movieCount: 125,
    },
    {
      id: 2,
      name: "Comedy",
      movieCount: 98,
    },
    {
      id: 3,
      name: "Drama",
      movieCount: 156,
    },
    {
      id: 4,
      name: "Horror",
      movieCount: 67,
    },
    {
      id: 5,
      name: "Science Fiction",
      movieCount: 89,
    },
    {
      id: 6,
      name: "Romance",
      movieCount: 76,
    },
    {
      id: 7,
      name: "Thriller",
      movieCount: 112,
    },
    {
      id: 8,
      name: "Documentary",
      movieCount: 45,
    },
  ]

  const filteredGenres = genres.filter((genre) => genre.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search genres..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Genre Name</TableHead>
              <TableHead>Movie Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGenres.map((genre) => (
              <TableRow key={genre.id}>
                <TableCell>
                  <div className="font-medium">{genre.name}</div>
                </TableCell>
                <TableCell>{genre.movieCount}</TableCell>
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
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Film className="mr-2 h-4 w-4" />
                        View Movies
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
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

