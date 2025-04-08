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
import { MoreHorizontal, Search, UserX, MessageSquare, Film, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FriendsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const friends = [
    {
      id: 1,
      username: "janedoe",
      name: "Jane Doe",
      profileImage: "/placeholder.svg",
      status: "online",
      friendSince: "2023-05-15",
    },
    {
      id: 2,
      username: "bobsmith",
      name: "Bob Smith",
      profileImage: "/placeholder.svg",
      status: "offline",
      friendSince: "2023-04-20",
    },
    {
      id: 3,
      username: "alicejones",
      name: "Alice Jones",
      profileImage: "/placeholder.svg",
      status: "online",
      friendSince: "2023-03-10",
    },
    {
      id: 4,
      username: "mikebrown",
      name: "Mike Brown",
      profileImage: "/placeholder.svg",
      status: "offline",
      friendSince: "2023-02-05",
    },
  ]

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Friend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Friend Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFriends.map((friend) => (
              <TableRow key={friend.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.profileImage} alt={friend.name} />
                      <AvatarFallback>
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      friend.status === "online" ? "border-green-500 text-green-500" : "border-gray-500 text-gray-500"
                    }
                  >
                    {friend.status}
                  </Badge>
                </TableCell>
                <TableCell>{friend.friendSince}</TableCell>
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
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Film className="mr-2 h-4 w-4" />
                        View Watched Movies
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <UserX className="mr-2 h-4 w-4" />
                        Remove Friend
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

