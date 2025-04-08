import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentUsers() {
  const users = [
    {
      id: 1,
      username: "johndoe",
      email: "john.doe@example.com",
      name: "John Doe",
      isAdmin: false,
      profileImage: "/placeholder.svg",
      createdAt: "2023-10-15",
    },
    {
      id: 2,
      username: "janedoe",
      email: "jane.doe@example.com",
      name: "Jane Doe",
      isAdmin: true,
      profileImage: "/placeholder.svg",
      createdAt: "2023-10-14",
    },
    {
      id: 3,
      username: "bobsmith",
      email: "bob.smith@example.com",
      name: "Bob Smith",
      isAdmin: false,
      profileImage: "/placeholder.svg",
      createdAt: "2023-10-13",
    },
    {
      id: 4,
      username: "alicejones",
      email: "alice.jones@example.com",
      name: "Alice Jones",
      isAdmin: false,
      profileImage: "/placeholder.svg",
      createdAt: "2023-10-12",
    },
    {
      id: 5,
      username: "mikebrown",
      email: "mike.brown@example.com",
      name: "Mike Brown",
      isAdmin: false,
      profileImage: "/placeholder.svg",
      createdAt: "2023-10-11",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Recently registered users on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-4 rounded-md border p-4">
              <Avatar>
                <AvatarImage src={user.profileImage} alt={user.username} />
                <AvatarFallback>
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              {user.isAdmin && (
                <Badge className="ml-auto" variant="secondary">
                  Admin
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

