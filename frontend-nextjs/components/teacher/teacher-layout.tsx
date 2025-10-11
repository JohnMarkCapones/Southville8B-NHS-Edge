"use client"

import type React from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { TeacherHeader } from "./teacher-header"
import { TeacherFooter } from "./teacher-footer"
import { useTeacherSidebar } from "@/lib/teacher-sidebar-store"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

interface TeacherLayoutProps {
  children: React.ReactNode
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { isCollapsed } = useTeacherSidebar()

  return (
    <div className="flex h-screen bg-[hsl(var(--teacher-background))]">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherHeader />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            "bg-[hsl(var(--teacher-background))] text-[hsl(var(--teacher-foreground))]",
          )}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1">{children}</div>
            <TeacherFooter />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default TeacherLayout
