import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { RequireAuth } from "@/components/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth requiredRoles={['Admin']}>
      <div className="min-h-screen bg-[hsl(var(--superadmin-background))] text-[hsl(var(--superadmin-foreground))]">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
