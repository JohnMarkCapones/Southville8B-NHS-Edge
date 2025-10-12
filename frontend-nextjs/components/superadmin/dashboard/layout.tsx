"use client"

import type React from "react"

import { useState, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Activity, Settings, Sun, Moon, HelpCircle } from "lucide-react"
import { primaryNavItems } from "@/components/superadmin/data/navigation-data"

// Loading components
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
)

const SectionSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
)

// Clock Component (from original)
const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-right">
      <div className="text-sm font-semibold text-foreground">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-xs text-muted-foreground">
        {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  )
}

// Main Dashboard Layout Component
interface DashboardLayoutProps {
  activeSection: string
  activeSubSection: string
  children?: React.ReactNode
}

export const DashboardLayout = ({ activeSection, activeSubSection, children }: DashboardLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const activeNavItem = primaryNavItems.find((item) => item.id === activeSection)

  // Filter secondary sidebar content based on search
  const filteredContent = activeNavItem?.content.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <DashboardHeader />

      <div className="flex">
        {/* Primary Sidebar */}
        <PrimarySidebar
          activeSection={activeSection}
          filteredContent={filteredContent}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Secondary Sidebar */}
        <SecondarySidebar
          activeNavItem={activeNavItem}
          activeSubSection={activeSubSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredContent={filteredContent}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background h-[calc(100vh-4rem)] overflow-y-auto">
          <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

// Academic Quarter Component
const AcademicQuarter = () => {
  // Get current date to determine which quarter we're in
  const getCurrentQuarter = () => {
    const now = new Date()
    const month = now.getMonth() + 1 // getMonth() returns 0-11, so add 1

    // School year typically runs August-July
    // 1st Quarter: August-October
    // 2nd Quarter: November-January
    // 3rd Quarter: February-April
    // 4th Quarter: May-July

    if (month >= 8 || month <= 10) {
      if (month >= 8) {
        return { quarter: "1st Quarter", academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}` }
      } else {
        return { quarter: "2nd Quarter", academicYear: `${now.getFullYear() - 1}-${now.getFullYear()}` }
      }
    } else if (month >= 11 || month <= 1) {
      if (month >= 11) {
        return { quarter: "2nd Quarter", academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}` }
      } else {
        return { quarter: "2nd Quarter", academicYear: `${now.getFullYear() - 1}-${now.getFullYear()}` }
      }
    } else if (month >= 2 && month <= 4) {
      return { quarter: "3rd Quarter", academicYear: `${now.getFullYear() - 1}-${now.getFullYear()}` }
    } else {
      return { quarter: "4th Quarter", academicYear: `${now.getFullYear() - 1}-${now.getFullYear()}` }
    }
  }

  const { quarter, academicYear } = getCurrentQuarter()

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
        <Activity className="h-4 w-4 text-white" />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-cyan-800 dark:text-cyan-200">{quarter}</div>
        <div className="text-xs text-cyan-600 dark:text-cyan-400">Academic Year {academicYear}</div>
      </div>
    </div>
  )
}

// Header Component
const DashboardHeader = () => (
  <header className="border-b border-border bg-card shadow-sm">
    <div className="flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">SA</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SuperAdmin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Southville 8B NHS Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <AcademicQuarter />
        <Clock />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
          <Badge variant="outline" className="text-primary border-primary bg-primary/5">
            System Administrator
          </Badge>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">SA</span>
          </div>
        </div>
      </div>
    </div>
  </header>
)

// Primary sidebar for main navigation categories
interface PrimarySidebarProps {
  activeSection: string
  filteredContent?: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const PrimarySidebar = ({ activeSection }: PrimarySidebarProps) => {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleSectionChange = (sectionId: string) => {
    // Map section IDs to routes with proper defaults
    const routeMap: Record<string, string> = {
      dashboard: "/superadmin/overview",
      users: "/superadmin/all-users",
      content: "/superadmin/news",
      academic: "/superadmin/subjects",
      schedule: "/superadmin/timetable",
      classroom: "/superadmin/classroom-management/assignments",
      settings: "/superadmin/system-settings",
    }

    const route = routeMap[sectionId] || "/superadmin/overview"
    router.push(route)
  }

  return (
    <div className="w-16 bg-muted/30 border-r border-border h-[calc(100vh-4rem)] flex flex-col shadow-sm">
      {/* Main Navigation */}
      <nav className="p-2 space-y-2 flex-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group relative ${
                activeSection === item.id
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md"
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              {activeSection === item.id && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 space-y-2 border-t border-border">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md group"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
          ) : (
            <Moon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>

        <button
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md"
          title="Help & Support"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

// Secondary Sidebar Component
interface SecondarySidebarProps {
  activeNavItem: any
  activeSubSection: string
  searchQuery: string
  onSearchChange: (query: string) => void
  filteredContent?: any[]
}

const SecondarySidebar = ({
  activeNavItem,
  activeSubSection,
  searchQuery,
  onSearchChange,
  filteredContent,
}: SecondarySidebarProps) => {
  const router = useRouter()

  const handleSubSectionChange = (subSection: string) => {
    // Map subsections to routes
    const routeMap: Record<string, string> = {
      // Dashboard section
      Overview: "/superadmin/overview",
      "System Status": "/superadmin/system-status",

      // User Management section
      "All Users": "/superadmin/all-users",
      Students: "/superadmin/students",
      Teachers: "/superadmin/teachers",
      Admins: "/superadmin/admins",
      Permissions: "/superadmin/permissions",
      Authentication: "/superadmin/authentication",
      "User Activity": "/superadmin/user-activity",
      "Session Management": "/superadmin/session-management",

      // Content Management section
      News: "/superadmin/news",
      Announcements: "/superadmin/announcements",
      Events: "/superadmin/events",
      "Clubs/Organizations": "/superadmin/clubs",
      "School Gallery": "/superadmin/gallery",
      "FAQs/Knowledge Base": "/superadmin/faqs",
      "Static School Pages": "/superadmin/static-pages",
      Resources: "/superadmin/resources",

      // Academic Management section
      Curriculum: "/superadmin/subjects",
      Subjects: "/superadmin/subjects",
      "Grade Levels": "/superadmin/classes",
      "Learning Materials/Modules": "/superadmin/learning-materials",
      "Progress Tracking": "/superadmin/reports",
      "Honors & Awards": "/superadmin/grading",
      "Top Performers": "/superadmin/students",
      "Performance Goals": "/superadmin/reports",

      // Schedule Management section
      "Academic Calendar": "/superadmin/academic-calendar",
      "Class Schedules": "/superadmin/timetable",
      Holidays: "/superadmin/academic-calendar",

      // Classroom Management section
      "Virtual Classrooms": "/superadmin/virtual-classroom",
      "Class Assignments": "/superadmin/classroom-management/assignments",
      "Student Groups": "/superadmin/classes",
      Attendance: "/superadmin/attendance",
      Sections: "/superadmin/classes",
      "Club Management": "/superadmin/classes",

      // Settings section
      "System Config": "/superadmin/system-settings",
      Themes: "/superadmin/system-settings",
      Integrations: "/superadmin/integrations",
      Backup: "/superadmin/backups",
      Security: "/superadmin/security",
      Database: "/superadmin/system-settings",
      "Server Status": "/superadmin/system-status",
    }

    const route = routeMap[subSection] || "/superadmin/overview"
    router.push(route)
  }

  if (!activeNavItem) return null

  return (
    <div className="w-72 bg-muted/30 border-r border-border h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">{activeNavItem.label}</h2>
          <Badge variant="secondary" className="text-xs">
            {filteredContent?.length || 0}
          </Badge>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-sm bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary shadow-sm"
          />
        </div>

        <nav className="space-y-1">
          {filteredContent?.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => handleSubSectionChange(item.label)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left group hover:shadow-sm ${
                  activeSubSection === item.label ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    activeSubSection === item.label ? "bg-primary/20" : "bg-primary/10 group-hover:bg-primary/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${activeSubSection === item.label ? "text-primary" : "text-primary"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold truncate transition-colors ${
                      activeSubSection === item.label ? "text-primary" : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// Error Boundary Component for sections
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const SectionErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
  return <>{children}</>
}

// Default fallback for sections under development
export const ComingSoonSection = ({ title, description }: { title: string; description?: string }) => (
  <div className="space-y-6">
    <div className="text-center py-16">
      <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
        <Settings className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {description || "This section is under development. Check back soon for new features."}
      </p>
      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
        Coming Soon
      </Button>
    </div>
  </div>
)
