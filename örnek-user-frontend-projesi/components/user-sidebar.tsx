"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Film, User, List, Heart, Library, UserPlus, LayoutDashboard, Star, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
    color: "text-violet-500",
  },
  {
    label: "Browse Movies",
    icon: Film,
    href: "/dashboard/movies",
    color: "text-pink-700",
  },
  {
    label: "Watchlist",
    icon: List,
    href: "/dashboard/watchlist",
    color: "text-green-500",
  },
  {
    label: "Wishlist",
    icon: Heart,
    href: "/dashboard/wishlist",
    color: "text-red-500",
  },
  {
    label: "Library",
    icon: Library,
    href: "/dashboard/library",
    color: "text-blue-500",
  },
  {
    label: "My Reviews",
    icon: Star,
    href: "/dashboard/reviews",
    color: "text-yellow-500",
  },
  {
    label: "Friends",
    icon: UserPlus,
    href: "/dashboard/friends",
    color: "text-purple-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export function UserSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Film className="h-6 w-6" />
            <span className="text-lg font-bold">FilmPortal</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid items-start px-2 lg:px-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <route.icon className={cn("h-5 w-5", route.color)} />
                {route.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}

