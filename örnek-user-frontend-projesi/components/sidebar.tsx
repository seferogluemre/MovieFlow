"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Film,
  Users,
  User,
  Tag,
  Star,
  List,
  Heart,
  Library,
  UserPlus,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
    color: "text-violet-500",
  },
  {
    label: "Movies",
    icon: Film,
    href: "/dashboard/movies",
    color: "text-pink-700",
  },
  {
    label: "Actors",
    icon: User,
    href: "/dashboard/actors",
    color: "text-orange-500",
  },
  {
    label: "Genres",
    icon: Tag,
    href: "/dashboard/genres",
    color: "text-emerald-500",
  },
  {
    label: "Reviews",
    icon: Star,
    href: "/dashboard/reviews",
    color: "text-yellow-500",
  },
  {
    label: "Watchlists",
    icon: List,
    href: "/dashboard/watchlists",
    color: "text-green-500",
  },
  {
    label: "Wishlists",
    icon: Heart,
    href: "/dashboard/wishlists",
    color: "text-red-500",
  },
  {
    label: "Libraries",
    icon: Library,
    href: "/dashboard/libraries",
    color: "text-blue-500",
  },
  {
    label: "Friendships",
    icon: UserPlus,
    href: "/dashboard/friendships",
    color: "text-purple-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">FilmAdmin</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </Button>
      </div>
    </div>
  );
}
