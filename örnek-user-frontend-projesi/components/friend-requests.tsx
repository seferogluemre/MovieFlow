"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"

export function FriendRequests() {
  const requests = [
    {
      id: 1,
      username: "sarahconnor",
      name: "Sarah Connor",
      profileImage: "/placeholder.svg",
      requestDate: "2 days ago",
    },
    {
      id: 2,
      username: "johndoe",
      name: "John Doe",
      profileImage: "/placeholder.svg",
      requestDate: "1 week ago",
    },
    {
      id: 3,
      username: "markwilson",
      name: "Mark Wilson",
      profileImage: "/placeholder.svg",
      requestDate: "2 weeks ago",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.length > 0 ? (
        requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={request.profileImage} alt={request.name} />
                  <AvatarFallback>
                    {request.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{request.name}</h3>
                  <p className="text-sm text-muted-foreground">@{request.username}</p>
                  <p className="text-xs text-muted-foreground mt-1">Requested {request.requestDate}</p>
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <X className="h-4 w-4 mr-1" /> Decline
                  </Button>
                  <Button className="w-full" size="sm">
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full rounded-md border p-8 text-center">
          <p className="text-muted-foreground">You have no pending friend requests.</p>
        </div>
      )}
    </div>
  )
}

