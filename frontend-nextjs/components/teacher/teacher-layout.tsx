"use client"

import type React from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { TeacherHeader } from "./teacher-header"
import { TeacherFooter } from "./teacher-footer"
import { useTeacherSidebar } from "@/lib/teacher-sidebar-store"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { useUser } from "@/hooks/useUser"

interface TeacherLayoutProps {
  children: React.ReactNode
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { isCollapsed } = useTeacherSidebar()
  const { data: user, isLoading, isError } = useUser()

  // Extract teacher data with fallbacks
  const teacherName = user?.teacher
    ? `${user.teacher.first_name} ${user.teacher.middle_name ? user.teacher.middle_name + ' ' : ''}${user.teacher.last_name}`.trim()
    : user?.full_name || 'Teacher'

  const teacherId = user?.teacher?.id || user?.id || 'unknown'
  const department = user?.teacher?.department || 'Education'
  const teacherAvatar = user?.profile?.avatar || '/teacher-avatar.png'

  return (
    <div className="flex h-screen bg-[hsl(var(--teacher-background))]">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherHeader 
          teacherName={teacherName}
          teacherAvatar={teacherAvatar}
          department={department}
          teacherId={teacherId}
        />
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
