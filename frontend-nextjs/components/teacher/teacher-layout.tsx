"use client"

import type React from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { TeacherHeader } from "./teacher-header"
import { TeacherFooter } from "./teacher-footer"
import { useTeacherSidebar } from "@/lib/teacher-sidebar-store"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { useUser } from "@/hooks/useUser"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { BotChat } from "@/components/chat/bot-chat"

interface TeacherLayoutProps {
  children: React.ReactNode
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { isCollapsed } = useTeacherSidebar()
  const { data: user, isLoading, isError } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Prevent body scrolling when teacher layout is active
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Extract teacher data with fallbacks
  const teacherName = user?.teacher
    ? `${user.teacher.first_name} ${user.teacher.middle_name ? user.teacher.middle_name + ' ' : ''}${user.teacher.last_name}`.trim()
    : user?.full_name || 'Teacher'

  const teacherId = user?.teacher?.id || user?.id || 'unknown'
  const department = user?.teacher?.department || 'Education'
  const teacherAvatar = user?.profile?.avatar || '/teacher-avatar.png'

  return (
    <div className="flex h-screen bg-[hsl(var(--teacher-background))]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherHeader 
          teacherName={teacherName}
          teacherAvatar={teacherAvatar}
          department={department}
          teacherId={teacherId}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            "bg-[hsl(var(--teacher-background))] text-[hsl(var(--teacher-foreground))]",
          )}
        >
          <div className="flex flex-col min-h-0">
            <div className="flex-1 min-h-0">{children}</div>
            <TeacherFooter />
          </div>
        </main>
      </div>
      <Toaster />

      {/* AI Chat Widget */}
      <div className="fixed bottom-28 right-8 z-50">
        <BotChat />
      </div>

      {/* Mobile menu drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[256px] lg:hidden">
          <SheetTitle>
            <VisuallyHidden>Teacher navigation</VisuallyHidden>
          </SheetTitle>
          <TeacherSidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default TeacherLayout
