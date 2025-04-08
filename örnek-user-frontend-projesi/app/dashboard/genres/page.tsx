import { GenreTable } from "@/components/genre-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function GenresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Genres</h1>
        <Link href="/dashboard/genres/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Genre
          </Button>
        </Link>
      </div>
      <GenreTable />
    </div>
  )
}

