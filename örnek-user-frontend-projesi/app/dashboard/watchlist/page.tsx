import { WatchlistTable } from "@/components/watchlist-table"
import { Separator } from "@/components/ui/separator"

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">My Watchlist</h3>
        <p className="text-muted-foreground">Movies you want to watch in the future.</p>
      </div>
      <Separator />
      <WatchlistTable />
    </div>
  )
}

