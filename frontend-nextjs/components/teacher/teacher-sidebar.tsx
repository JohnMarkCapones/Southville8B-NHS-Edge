"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTeacherSidebar } from "@/lib/teacher-sidebar-store"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  Trophy,
  Newspaper,
  Upload,
  FileText,
  UserCog,
  MessageSquare,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/teacher",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: Users,
    id: "students",
  },
  {
    title: "Classes",
    href: "/teacher/classes",
    icon: GraduationCap,
    id: "classes",
  },
  {
    title: "Quiz Central",
    href: "/teacher/quiz",
    icon: ClipboardList,
    id: "quiz",
  },
  {
    title: "Schedule",
    href: "/teacher/schedule",
    icon: Calendar,
    id: "schedule",
  },
  {
    title: "Chat",
    href: "/teacher/chat",
    icon: MessageSquare,
    id: "chat",
  },
  {
    title: "Subjects",
    href: "/teacher/subjects",
    icon: BookOpen,
    id: "subjects",
  },
  {
    title: "Learning Materials",
    href: "/teacher/learning-materials",
    icon: Upload,
    id: "learning-materials",
  },
  {
    title: "Student Materials",
    href: "/teacher/student-materials",
    icon: FileText,
    id: "student-materials",
  },
  {
    title: "Clubs and Organizations",
    href: "/teacher/clubs",
    icon: Trophy,
    id: "clubs",
  },
  {
    title: "News",
    href: "/teacher/news",
    icon: Newspaper,
    id: "news",
  },
  {
    title: "News Team",
    href: "/teacher/news-team",
    icon: UserCog,
    id: "news-team",
  },
  {
    title: "Analytics",
    href: "/teacher/analytics",
    icon: BarChart3,
    id: "analytics",
  },
  {
    title: "Settings",
    href: "/teacher/settings",
    icon: Settings,
    id: "settings",
  },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed, setActiveSection } = useTeacherSidebar()

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
        "border-r border-blue-200 dark:border-blue-800 shadow-lg",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-600/10 to-blue-700/10 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <GraduationCap className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="font-bold text-base text-blue-900 dark:text-blue-100">Teacher Portal</span>
              <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">Southville 8B NHS</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-9 w-9 p-0 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-all duration-300 hover:scale-110 rounded-lg"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105 hover:shadow-xl"
                  : "text-blue-700 dark:text-blue-200 hover:text-blue-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 hover:scale-102 hover:shadow-md",
                isCollapsed && "justify-center px-3",
              )}
            >
              {/* Background glow effect for active items */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl blur-sm"></div>
              )}

              <Icon
                className={cn(
                  "flex-shrink-0 transition-all duration-300 relative z-10",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5",
                  isActive && "drop-shadow-sm",
                )}
              />

              {!isCollapsed && <span className="font-semibold relative z-10 tracking-wide">{item.title}</span>}

              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <div className="ml-auto flex items-center space-x-1 relative z-10">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse"></div>
                  <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                </div>
              )}

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10 rounded-xl transition-all duration-300"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-600/5 to-blue-700/5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-md"></div>
              <div className="text-sm text-green-600 dark:text-green-400 font-semibold">System Online</div>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce shadow-md"></div>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-300 font-medium bg-blue-100/50 dark:bg-blue-800/30 px-2 py-1 rounded-md">
            Teacher Dashboard v2.1
          </div>
        </div>
      )}
    </div>
  )
}
