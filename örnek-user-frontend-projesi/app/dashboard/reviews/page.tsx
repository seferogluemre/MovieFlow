import { UserReviewsTable } from "@/components/user-reviews-table"
import { Separator } from "@/components/ui/separator"

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">My Reviews</h3>
        <p className="text-muted-foreground">Reviews you've written for movies.</p>
      </div>
      <Separator />
      <UserReviewsTable />
    </div>
  )
}

