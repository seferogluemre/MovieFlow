import { ActorTable } from "@/components/actor-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ActorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Actors</h1>
        <Link href="/dashboard/actors/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Actor
          </Button>
        </Link>
      </div>
      <ActorTable />
    </div>
  )
}

