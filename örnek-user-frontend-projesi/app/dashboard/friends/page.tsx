import { FriendsTable } from "@/components/friends-table"
import { FriendRequests } from "@/components/friend-requests"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FriendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Friends</h3>
        <p className="text-muted-foreground">Manage your friends and friend requests.</p>
      </div>
      <Separator />
      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="mt-4">
          <FriendsTable />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <FriendRequests />
        </TabsContent>
        <TabsContent value="blocked" className="mt-4">
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">You haven't blocked any users yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

