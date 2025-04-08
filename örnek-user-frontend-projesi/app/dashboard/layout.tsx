import type React from "react"
import { UserNavbar } from "@/components/user-navbar"
import { UserSidebar } from "@/components/user-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <UserSidebar />
      <div className="flex flex-col flex-1">
        <UserNavbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

