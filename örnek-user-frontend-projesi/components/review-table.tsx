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
import { MoreHorizontal, Search, Trash, Eye, Film, User } from "lucide-react"

export function ReviewTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const reviews = [
    {
      id: 1,
      content: "This movie was absolutely amazing! The acting was superb and the storyline kept me engaged throughout.",
      createdAt: "2023-10-15",
      user: {
        id: 1,
        username: "johndoe",
        profileImage: "/placeholder.svg",
      },
      movie: {
        id: 1,
        title: "The Shawshank Redemption",
        posterImage: "/placeholder.svg",
      },
    },
    {
      id: 2,
      content: "I was disappointed with this film. The pacing was off and the characters weren't well developed.",
      createdAt: "2023-10-14",
      user: {
        id: 2,
        username: "janedoe",
        profileImage: "/placeholder.svg",
      },
      movie: {
        id: 2,
        title: "The Godfather",
        posterImage: "/placeholder.svg",
      },
    },
    {
      id: 3,
      content: "A masterpiece! This film deserves all the awards it received. The cinematography was breathtaking.",
      createdAt: "2023-10-13",
      user: {
        id: 3,
        username: "bobsmith",
        profileImage: "/placeholder.svg",
      },
      movie: {
        id: 3,
        title: "The Dark Knight",
        posterImage: "/placeholder.svg",
      },
    },
    {
      id: 4,
      content: "Interesting concept but poorly executed. I expected more from this director.",
      createdAt: "2023-10-12",
      user: {
        id: 4,
        username: "alicejones",
        profileImage: "/placeholder.svg",
      },
      movie: {
        id: 4,
        title: "Pulp Fiction",
        posterImage: "/placeholder.svg",
      },
    },
  ]

  const filteredReviews = reviews.filter(
    (review) =>
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.movie.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Movie</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.user.profileImage} alt={review.user.username} />
                      <AvatarFallback>{review.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@{review.user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-md">
                      <AvatarImage src={review.movie.posterImage} alt={review.movie.title} />
                      <AvatarFallback className="rounded-md">{review.movie.title.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.movie.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                <TableCell>{review.createdAt}</TableCell>
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
                        View Full Review
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Film className="mr-2 h-4 w-4" />
                        View Movie
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        View User
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

