import { LibraryTable } from "@/components/library-table"
import { Separator } from "@/components/ui/separator"

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">My Library</h3>
        <p className="text-muted-foreground">Your collection of movies.</p>
      </div>
      <Separator />
      <LibraryTable />
    </div>
  )
}

