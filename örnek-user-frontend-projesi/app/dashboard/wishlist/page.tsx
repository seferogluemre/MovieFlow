import { WishlistTable } from "@/components/wishlist-table"
import { Separator } from "@/components/ui/separator"

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">My Wishlist</h3>
        <p className="text-muted-foreground">Movies you wish to add to your collection.</p>
      </div>
      <Separator />
      <WishlistTable />
    </div>
  )
}

