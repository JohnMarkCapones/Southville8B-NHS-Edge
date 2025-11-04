"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { AnimatedButton } from "@/components/ui/animated-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Search,
  BookOpen,
  FileText,
  Users,
  HelpCircle,
  Bookmark,
  Download,
  Upload,
  Zap,
  Globe,
  Clock,
  Star,
  Award,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  Plus,
  ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { logoutAction } from "@/app/actions/auth"

interface TeacherHeaderProps {
  teacherName: string
  teacherAvatar?: string
  department?: string
  teacherId?: string
  onOpenMobileMenu?: () => void
}

export function TeacherHeader({ teacherName, teacherAvatar, department, teacherId, onOpenMobileMenu }: TeacherHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const [notifications, setNotifications] = React.useState(3)
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't return null - causes hydration mismatch
  // Instead, calculate theme safely with mounted check
  const isDarkMode = mounted ? theme === "dark" : false

  const handleLogout = async () => {
    try {
      // Call the proper logout action to clear authentication cookies
      const result = await logoutAction()
      
      if (result.success) {
        console.log("[TeacherHeader] Logout successful")
        // Redirect to portal page after successful logout
        window.location.href = "/guess/portal?role=teacher"
      } else {
        console.error("[TeacherHeader] Logout failed:", result.error)
        // Still redirect even if logout action fails (fallback)
        window.location.href = "/guess/portal?role=teacher"
      }
    } catch (error) {
      console.error("[TeacherHeader] Logout error:", error)
      // Fallback redirect on error
      window.location.href = "/guess/portal?role=teacher"
    }
  }

  const handleClearAllNotifications = () => {
    setNotifications(0)
    console.log("[v0] All notifications cleared")
  }

  const handleMarkAllAsRead = () => {
    setNotifications(0)
    console.log("[v0] All notifications marked as read")
  }

  // Academic Year/Period State
  const [activeYear, setActiveYear] = React.useState<any>(null)
  const [currentPeriod, setCurrentPeriod] = React.useState<string>("Loading...")
  const [academicLoading, setAcademicLoading] = React.useState(true)

  // Load Academic Year and Period
  React.useEffect(() => {
    const loadAcademicData = async () => {
      try {
        setAcademicLoading(true)

        // Import the API client dynamically to avoid SSR issues
        const { academicYearsApi } = await import('@/lib/api/endpoints/academic-years')

        // Load active academic year
        const year = await academicYearsApi.getActive()
        setActiveYear(year)

        if (year) {
          // Load periods for the active academic year
          try {
            const yearPeriods = await academicYearsApi.getPeriods(year.id)

            // Determine current period based on today's date
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const sortedPeriods = yearPeriods.sort((a, b) =>
              new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
            )

            let foundPeriod = false
            for (const period of sortedPeriods) {
              const startDate = new Date(period.start_date)
              const endDate = new Date(period.end_date)

              startDate.setHours(0, 0, 0, 0)
              endDate.setHours(23, 59, 59, 999)

              if (today >= startDate && today <= endDate) {
                setCurrentPeriod(period.period_name)
                foundPeriod = true
                break
              }
            }

            if (!foundPeriod) {
              setCurrentPeriod("No Active Period")
            }
          } catch (periodError) {
            console.warn('Could not load periods:', periodError)
            setCurrentPeriod("Period N/A")
          }
        }
      } catch (err) {
        console.error('Error loading academic data:', err)
        setCurrentPeriod("N/A")
      } finally {
        setAcademicLoading(false)
      }
    }

    loadAcademicData()
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-xl border-white/20 shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile menu button */}
            <AnimatedButton
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-white/10 hover:scale-110 transition-all duration-300"
              onClick={onOpenMobileMenu}
            >
              <span className="sr-only">Open navigation</span>
              {/* Using three lines menu icon built from CSS to avoid extra import */}
              <div className="flex flex-col gap-1.5 items-center justify-center">
                <div className="w-5 h-[2px] bg-white/90 rounded" />
                <div className="w-5 h-[2px] bg-white/90 rounded" />
                <div className="w-5 h-[2px] bg-white/90 rounded" />
              </div>
            </AnimatedButton>
            <div className="hidden lg:flex items-center space-x-2 ml-4">
              <div className="flex flex-col items-end text-white/90 mr-2">
                {academicLoading ? (
                  <>
                    <div className="text-xs font-semibold animate-pulse">Loading...</div>
                    <div className="text-[10px] text-white/70 animate-pulse">Academic Info</div>
                  </>
                ) : activeYear ? (
                  <>
                    <div className="text-xs font-bold text-white shadow-sm">{currentPeriod}</div>
                    <div className="text-[10px] text-white/80">Academic Year {activeYear.year_name}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-yellow-200">No Active Year</div>
                    <div className="text-[10px] text-white/70">Setup Required</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? "scale-105" : ""}`}>
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isSearchFocused ? "text-yellow-400 scale-110" : "text-white/60"}`}
              />
              <input
                type="text"
                placeholder="Search students, classes, assignments, or resources..."
                className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-sm text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm ${isSearchFocused ? "border-yellow-400 shadow-lg bg-white/20" : "border-white/20"}`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 hover:bg-white/10 text-white/60 hover:text-white"
                  >
                    <Filter className="w-4 h-4" />
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Students
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Classes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Assignments
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/teacher/resources">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Resources
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <div className="hidden xl:flex items-center space-x-1 mr-2">
              <AnimatedButton
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Gradebook
              </AnimatedButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Resources
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/teacher/resources">
                      <FileText className="w-4 h-4 mr-2" />
                      Lesson Plans
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/teacher/resources">
                      <Download className="w-4 h-4 mr-2" />
                      Teaching Materials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/teacher/resources">
                      <Globe className="w-4 h-4 mr-2" />
                      Online Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/teacher/resources">
                      <Award className="w-4 h-4 mr-2" />
                      Assessment Tools
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/teacher/resources">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resource
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Separator orientation="vertical" className="h-6 mx-2 hidden xl:block bg-white/20" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-white/10 hover:scale-110 transition-all duration-300 group"
                >
                  <Bell className="w-5 h-5 text-white/80 hover:text-white transition-all duration-300 group-hover:animate-pulse" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-6 h-6 p-0 flex items-center justify-center bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white text-xs animate-pulse shadow-lg border-2 border-white/20">
                      {notifications}
                    </Badge>
                  )}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="relative p-6 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-b border-white/30 dark:border-slate-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Teacher Notifications
                        </h4>
                        {notifications > 0 && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {notifications} new notification{notifications > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notifications > 0 && (
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-xs h-8 px-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg transition-all duration-200"
                        >
                          Mark all read
                        </AnimatedButton>
                      )}
                      <AnimatedButton variant="ghost" size="sm" onClick={() => setNotifications(0)}>
                        <RefreshCw className="w-4 h-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {[
                    {
                      title: "New assignment submitted",
                      desc: "John Doe submitted Math Assignment 3 - Quadratic Equations",
                      time: "2 min ago",
                      type: "assignment",
                      priority: "high",
                      icon: FileText,
                      student: "John Doe",
                      subject: "Mathematics",
                    },
                    {
                      title: "Parent meeting request",
                      desc: "Mrs. Smith requested a meeting for tomorrow at 2:00 PM",
                      time: "1 hour ago",
                      type: "meeting",
                      priority: "medium",
                      icon: Users,
                      student: "Emma Smith",
                      subject: "General",
                    },
                    {
                      title: "Grade deadline reminder",
                      desc: "Grades due for Quarter 2 in 3 days - Don't forget!",
                      time: "3 hours ago",
                      type: "deadline",
                      priority: "high",
                      icon: Clock,
                      student: "System",
                      subject: "All Subjects",
                    },
                    {
                      title: "New resource available",
                      desc: "Science lab equipment guide uploaded to resources",
                      time: "5 hours ago",
                      type: "resource",
                      priority: "low",
                      icon: BookOpen,
                      student: "Admin",
                      subject: "Science",
                    },
                  ].map((notification, index) => {
                    const IconComponent = notification.icon
                    return (
                      <div key={index} className="mb-2">
                        <div
                          className={`p-4 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                            notification.priority === "high"
                              ? "bg-gradient-to-r from-red-50/80 via-pink-50/80 to-purple-50/80 dark:from-red-900/20 dark:via-pink-900/20 dark:to-purple-900/20 hover:from-red-100/80 hover:via-pink-100/80 hover:to-purple-100/80 dark:hover:from-red-800/30 dark:hover:via-pink-800/30 dark:hover:to-purple-800/30 border border-red-200/30 dark:border-red-700/30"
                              : notification.priority === "medium"
                                ? "bg-gradient-to-r from-yellow-50/80 via-orange-50/80 to-red-50/80 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 hover:from-yellow-100/80 hover:via-orange-100/80 hover:to-red-100/80 dark:hover:from-yellow-800/30 dark:hover:via-orange-800/30 dark:hover:to-red-800/30 border border-yellow-200/30 dark:border-yellow-700/30"
                                : "bg-gradient-to-r from-green-50/80 via-blue-50/80 to-purple-50/80 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 hover:from-green-100/80 hover:via-blue-100/80 hover:to-purple-100/80 dark:hover:from-green-800/30 dark:hover:via-blue-800/30 dark:hover:to-purple-800/30 border border-green-200/30 dark:border-green-700/30"
                          } backdrop-blur-sm shadow-sm hover:shadow-md`}
                        >
                          <div className="flex items-start space-x-4">
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30 dark:border-slate-600/30 ${
                                notification.priority === "high"
                                  ? "bg-gradient-to-br from-red-500 to-pink-500"
                                  : notification.priority === "medium"
                                    ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                                    : "bg-gradient-to-br from-green-500 to-blue-500"
                              }`}
                            >
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                      {notification.title}
                                    </p>
                                    {notification.priority === "high" && (
                                      <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                                    {notification.desc}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <p className="text-xs text-slate-500 dark:text-slate-500 font-medium flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {notification.time}
                                      </p>
                                      <Badge
                                        className={`text-xs border-0 shadow-sm ${
                                          notification.priority === "high"
                                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                            : notification.priority === "medium"
                                              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                              : "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                                        }`}
                                      >
                                        {notification.subject}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-white/30 dark:border-slate-700/50 p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllNotifications}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-slate-600/30 rounded-lg transition-all duration-200"
                    >
                      Clear all notifications
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-semibold"
                      asChild
                    >
                      <Link href="/teacher/notifications">View All Notifications</Link>
                    </AnimatedButton>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  className="xl:hidden hover:bg-white/10 hover:scale-110 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 text-white/80" />
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Gradebook
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/teacher/resources">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Resources
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AnimatedButton
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 hover:scale-110 transition-all duration-300"
              onClick={() => setTheme(mounted && theme === "light" ? "dark" : "light")}
              suppressHydrationWarning
            >
              <div className="relative w-5 h-5">
                {mounted && theme === "light" ? (
                  <Sun className="w-5 h-5 text-yellow-300" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-200" />
                )}
              </div>
            </AnimatedButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton
                  variant="ghost"
                  className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 hover:scale-105 transition-all duration-300"
                >
                  <div className="relative w-9 h-9 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-white">{teacherName}</div>
                    <div className="text-xs text-white/80 flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-300" />
                      {department || 'Education'} Teacher
                    </div>
                  </div>
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl"
              >
                <div className="p-3 border-b bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{teacherName}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{department || 'Education Department'}</div>
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1 animate-pulse">
                        <Activity className="w-3 h-3 mr-1" />
                        Active now
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Award className="w-4 h-4 mr-2" />
                  Achievements
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Zap className="w-4 h-4 mr-2" />
                  Keyboard Shortcuts
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowLogoutModal(true)
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Sign Out</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to sign out of your account? You'll need to log in again to access your teacher
              dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
