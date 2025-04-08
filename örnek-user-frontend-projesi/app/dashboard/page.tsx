import { RecommendedMovies } from "@/components/recommended-movies"
import { UserStats } from "@/components/user-stats"
import { RecentlyWatched } from "@/components/recently-watched"
import { FriendActivity } from "@/components/friend-activity"
import { WatchlistPreview } from "@/components/watchlist-preview"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, John!</h1>
      <UserStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentlyWatched />
          <RecommendedMovies />
        </div>
        <div className="space-y-6">
          <WatchlistPreview />
          <FriendActivity />
        </div>
      </div>
    </div>
  )
}

