import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Star } from "lucide-react";

export function FriendActivity() {
  const activities = [
    {
      id: 1,
      user: {
        name: "Jane Doe",
        avatar: "/placeholder.svg",
      },
      type: "review",
      movie: "Inception",
      rating: 4.5,
      time: "2 hours ago",
    },
    {
      id: 2,
      user: {
        name: "Bob Smith",
        avatar: "/placeholder.svg",
      },
      type: "watched",
      movie: "The Matrix",
      time: "5 hours ago",
    },
    {
      id: 3,
      user: {
        name: "Alice Johnson",
        avatar: "/placeholder.svg",
      },
      type: "comment",
      movie: "Interstellar",
      comment: "This movie blew my mind!",
      time: "1 day ago",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Friend Activity</CardTitle>
          <CardDescription>See what your friends are watching.</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={activity.user.avatar}
                  alt={activity.user.name}
                />
                <AvatarFallback>
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  {activity.type === "review" && (
                    <>
                      rated{" "}
                      <span className="font-medium">{activity.movie}</span>{" "}
                      <div className="inline-flex items-center">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 inline mr-1" />
                        {activity.rating}
                      </div>
                    </>
                  )}
                  {activity.type === "watched" && (
                    <>
                      watched{" "}
                      <span className="font-medium">{activity.movie}</span>
                    </>
                  )}
                  {activity.type === "comment" && (
                    <>
                      commented on{" "}
                      <span className="font-medium">{activity.movie}</span>
                    </>
                  )}
                </p>
                {activity.type === "comment" && (
                  <p className="text-xs text-muted-foreground">
                    "{activity.comment}"
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
