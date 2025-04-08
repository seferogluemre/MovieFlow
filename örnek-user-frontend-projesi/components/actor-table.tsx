"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { MoreHorizontal, Search, Edit, Trash, Eye, Film } from "lucide-react"

export function ActorTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const actors = [
    {
      id: 1,
      name: "Tom Hanks",
      birthYear: 1956,
      nationality: "American",
      photo: "/placeholder.svg",
      biography: "Thomas Jeffrey Hanks is an American actor and filmmaker.",
    },
    {
      id: 2,
      name: "Meryl Streep",
      birthYear: 1949,
      nationality: "American",
      photo: "/placeholder.svg",
      biography: "Mary Louise Streep is an American actress.",
    },
    {
      id: 3,
      name: "Leonardo DiCaprio",
      birthYear: 1974,
      nationality: "American",
      photo: "/placeholder.svg",
      biography: "Leonardo Wilhelm DiCaprio is an American actor and film producer.",
    },
    {
      id: 4,
      name: "Viola Davis",
      birthYear: 1965,
      nationality: "American",
      photo: "/placeholder.svg",
      biography: "Viola Davis is an American actress and producer.",
    },
    {
      id: 5,
      name: "Denzel Washington",
      birthYear: 1954,
      nationality: "American",
      photo: "/placeholder.svg",
      biography: "Denzel Hayes Washington Jr. is an American actor, director, and producer.",
    },
  ]

  const filteredActors = actors.filter(
    (actor) =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.birthYear.toString().includes(searchTerm),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search actors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Birth Year</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Biography</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActors.map((actor) => (
              <TableRow key={actor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={actor.photo} alt={actor.name} />
                      <AvatarFallback>
                        {actor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{actor.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{actor.birthYear}</TableCell>
                <TableCell>{actor.nationality}</TableCell>
                <TableCell className="max-w-xs truncate">{actor.biography}</TableCell>
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
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
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

