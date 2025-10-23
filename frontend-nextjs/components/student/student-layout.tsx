"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import StudentHeader from "@/components/student/student-header"
import StudentFooter from "@/components/student/student-footer"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { useSidebarStore } from "@/lib/stores/sidebar-store"
import { BotChat } from "@/components/chat/bot-chat"
import { useUser } from "@/hooks/useUser"
import {
  BookOpen,
  CalendarIcon,
  GraduationCap,
  Home,
  Settings,
  User,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Newspaper,
  Trophy,
  Bell,
  Menu,
  ChevronDown,
  FileText,
  Award,
  Wrench,
  StickyNote,
  CheckSquare,
  Target,
  Timer,
  UserPlus,
  Zap,
  Brain,
  PenTool,
  Edit3,
  BarChart3,
  FileCheck,
  Search,
} from "lucide-react"

interface StudentLayoutProps {
  children: React.ReactNode
}

// NAVIGATION_CONFIG will be created inside the component using translations

const SidebarHeader = ({
  sidebarCollapsed,
  isMobile,
  onToggleCollapse,
}: {
  sidebarCollapsed: boolean
  isMobile: boolean
  onToggleCollapse: () => void
}) => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

    <div className="relative p-6 flex items-center justify-between">
      {(!sidebarCollapsed || isMobile) && (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <img
                src="/placeholder.svg?height=32&width=32"
                alt="Southville 8B NHS Logo"
                className="w-8 h-8 relative z-10"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-wide">Southville 8B NHS</h2>
            <p className="text-xs text-white/90 font-medium tracking-wider">Student Portal</p>
          </div>
        </div>
      )}

      {sidebarCollapsed && !isMobile && (
        <div className="relative">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/30 transition-all duration-300"></div>
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="Southville 8B NHS Logo"
              className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
      )}

      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto hover:bg-white/20 text-white border-white/30 backdrop-blur-sm transition-all duration-300 rounded-xl p-2 hover:scale-105"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      )}
    </div>
  </div>
)

const StudentProfile = ({
  sidebarCollapsed,
  isMobile,
  studentName,
  studentId,
  gradeLevel,
  section,
  gwa,
  notifications,
  achievements
}: {
  sidebarCollapsed: boolean;
  isMobile: boolean;
  studentName: string;
  studentId: string;
  gradeLevel: string;
  section: string;
  gwa: number;
  notifications: number;
  achievements: number;
}) => {
  // Get initials from student name
  const initials = studentName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  if (sidebarCollapsed && !isMobile) {
    return (
      <div className="p-3 border-b border-slate-200/20 dark:border-slate-700/20">
        <div className="flex justify-center">
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:from-white/30 transition-all duration-300"></div>
              <span className="text-white font-bold text-sm relative z-10">{initials}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">{notifications}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-slate-200/20 dark:border-slate-700/20">
      <div className="relative bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-3xl p-5 border border-violet-200/30 dark:border-violet-700/30 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full translate-y-8 -translate-x-8"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="text-white font-bold text-lg relative z-10">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate text-slate-800 dark:text-slate-200">{studentName}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {gradeLevel} • {section}
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400 font-mono font-medium">
                ID: {studentId}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 gap-2">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-2 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">GWA {gwa}</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-100/80 to-green-100/80 dark:from-emerald-900/30 dark:to-green-900/30 px-3 py-2 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {achievements}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-gradient-to-r from-red-100/80 to-pink-100/80 dark:from-red-900/30 dark:to-pink-900/30 px-3 py-2 rounded-xl border border-red-200/50 dark:border-red-700/20 relative">
                <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">{notifications}</span>
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const NavigationItem = ({
  item,
  isActive,
  sidebarCollapsed,
  isMobile,
}: {
  item: any
  isActive: boolean
  sidebarCollapsed: boolean
  isMobile: boolean
}) => (
  <Link href={item.href}>
    <div className="relative group">
      <Button
        variant="ghost"
        className={`relative w-full ${sidebarCollapsed && !isMobile ? "justify-center px-3" : "justify-start"} transition-all duration-300 min-h-[56px] rounded-2xl font-medium text-base border-2 ${
          isActive
            ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl border-transparent`
            : "hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg backdrop-blur-sm border-transparent hover:border-violet-200/30 dark:hover:border-violet-700/30 text-slate-700 dark:text-slate-300"
        }`}
        title={sidebarCollapsed && !isMobile ? item.label : undefined}
      >
        <div className={`flex items-center ${sidebarCollapsed && !isMobile ? "" : "w-full"}`}>
          <div className="relative">
            <item.icon
              className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-600 dark:text-slate-400"} transition-all duration-200`}
            />
          </div>

          {(!sidebarCollapsed || isMobile) && <span className="ml-4 flex-1 text-left font-semibold">{item.label}</span>}
        </div>
      </Button>
    </div>
  </Link>
)

const SectionPopover = ({ section, children }: { section: any; children: React.ReactNode }) => {
  const [showPopover, setShowPopover] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setShowPopover(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>

      {showPopover && (
        <div
          className="fixed left-24 z-[9999] w-72 bg-white dark:bg-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl border border-violet-200/50 dark:border-violet-700/20 p-5 transition-all duration-200 transform scale-100"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-violet-100 dark:border-violet-800">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-lg`}
            >
              <section.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{section.label}</h3>
          </div>
          <div className="space-y-2">
            {section.items.map((item: any) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/20 dark:hover:to-violet-900/20 transition-all duration-200 group cursor-pointer border border-transparent hover:border-violet-200/50 dark:hover:border-violet-700/50 hover:shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-800/50 transition-colors duration-200">
                    <item.icon className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-300 block">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <Badge className="text-xs px-2 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800 rounded-lg font-medium">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const NavigationSection = ({
  section,
  pathname,
  sidebarCollapsed,
  isMobile,
}: {
  section: any
  pathname: string
  sidebarCollapsed: boolean
  isMobile: boolean
}) => {
  const { expandedSections, toggleSection } = useSidebarStore()
  const isExpanded = expandedSections[section.key as keyof typeof expandedSections]

  const sectionButton = (
    <div className="relative group">
      <Button
        variant="ghost"
        onClick={() => !sidebarCollapsed && toggleSection(section.key)}
        className={`relative w-full ${sidebarCollapsed && !isMobile ? "justify-center px-3" : "justify-start"} hover:bg-transparent transition-all duration-300 min-h-[56px] rounded-2xl font-medium text-base`}
        title={sidebarCollapsed && !isMobile ? section.label : undefined}
      >
        <div className={`flex items-center ${sidebarCollapsed && !isMobile ? "" : "w-full"}`}>
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-lg transition-all duration-300`}
          >
            <section.icon className="w-5 h-5 text-white" />
          </div>

          {(!sidebarCollapsed || isMobile) && (
            <>
              <span className="ml-4 flex-1 text-left font-bold text-slate-700 dark:text-slate-300">
                {section.label}
              </span>
              <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
            </>
          )}
        </div>
      </Button>
    </div>
  )

  return (
    <div className="space-y-2">
      {sidebarCollapsed && !isMobile ? (
        <SectionPopover section={section}>{sectionButton}</SectionPopover>
      ) : (
        sectionButton
      )}

      {isExpanded && (!sidebarCollapsed || isMobile) && (
        <div className="ml-12 space-y-1 pl-4 border-l-2 border-gradient-to-b from-violet-200 to-purple-200 dark:from-violet-800 dark:to-purple-800">
          {section.items.map((item: any) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href}>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative w-full justify-start transition-all duration-300 min-h-[48px] rounded-xl font-medium text-sm ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                        : "hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""} transition-all duration-200`} />
                    <span className="ml-3 flex-1 text-left font-semibold">{item.label}</span>
                    {item.badge && (
                      <Badge
                        className={`ml-auto text-xs px-2 py-1 rounded-lg font-bold ${
                          isActive
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

const InviteFriendsSection = ({ sidebarCollapsed, isMobile }: { sidebarCollapsed: boolean; isMobile: boolean }) => (
  <div className="p-5 border-t border-slate-200/20 dark:border-slate-700/20 bg-gradient-to-br from-slate-50/50 to-white/30 dark:from-slate-800/50 dark:to-slate-900/30">
    {!sidebarCollapsed || isMobile ? (
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-xl transition-all duration-300 cursor-pointer">
        <div className="relative flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base">Invite Friends</h3>
            <p className="text-xs text-white/90 mt-1">Share with classmates</p>
          </div>
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center transition-transform duration-300">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          className="w-12 h-12 p-0 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all duration-300 rounded-2xl group"
          title="Invite Friends"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
        </Button>
      </div>
    )}
  </div>
)

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { restoreScrollPosition, saveScrollPosition, setIsUserScrolling } = useSidebarStore()
  const { t } = useTranslation()

  // Fetch current user data
  const { data: user, isLoading, isError } = useUser()

  // Extract student data with fallbacks
  const studentName = user?.student
    ? `${user.student.first_name} ${user.student.middle_name ? user.student.middle_name + ' ' : ''}${user.student.last_name}`.trim()
    : user?.full_name || 'Student'

  const studentId = user?.student?.student_id || 'N/A'
  const gradeLevel = user?.student?.grade_level ? `Grade ${user.student.grade_level}` : 'N/A'
  const section = user?.student?.sections?.name || 'N/A'
  const gwa = 94.5 // TODO: Get from actual GWA data when available
  const notifications = 3 // TODO: Get from actual notifications when available
  const achievements = 12 // TODO: Get from actual achievements when available
  const studentAvatar = user?.profile?.avatar || '/student-avatar.png'

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const element = sidebarScrollRef.current
    if (!element) return

    const handleScroll = () => {
      setIsUserScrolling(true)
      saveScrollPosition(element.scrollTop)

      const timer = setTimeout(() => {
        setIsUserScrolling(false)
      }, 150)

      return () => clearTimeout(timer)
    }

    element.addEventListener("scroll", handleScroll)
    return () => element.removeEventListener("scroll", handleScroll)
  }, [saveScrollPosition, setIsUserScrolling])

  useEffect(() => {
    const element = sidebarScrollRef.current
    if (element) {
      restoreScrollPosition(element)
    }
  }, [pathname, restoreScrollPosition])

  // Build navigation with translations
  const NAV = [
    {
      type: "single" as const,
      icon: Home,
      label: t('navigation.dashboard'),
      href: "/student",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      type: "section" as const,
      key: "academics",
      icon: GraduationCap,
      label: t('navigation.academics'),
      gradient: "from-emerald-500 to-teal-600",
      items: [
        { icon: BookOpen, label: t('student.mySubjects'), href: "/student/courses" },
        { icon: Brain, label: t('student.quizCentral'), href: "/student/quiz" },
        { icon: CalendarIcon, label: t('student.classSchedule'), href: "/student/schedule" },
        { icon: Trophy, label: t('student.grades'), href: "/student/grades" },
        { icon: Calendar, label: t('student.academicCalendar'), href: "/student/calendar" },
      ],
    },
    {
      type: "section" as const,
      key: "documents",
      icon: FileText,
      label: t('navigation.documents'),
      gradient: "from-orange-500 to-red-600",
      items: [{ icon: Award, label: t('student.certificates'), href: "/student/certificates" }],
    },
    {
      type: "section" as const,
      key: "studentLife",
      icon: Users,
      label: t('navigation.studentLife'),
      gradient: "from-purple-500 to-pink-600",
      items: [
        { icon: Users, label: t('student.myClubs'), href: "/student/clubs" },
        { icon: FileCheck, label: t('student.myApplications'), href: "/student/clubs/applications" },
        { icon: Search, label: t('student.discoverClubs'), href: "/student/clubs/discover" },
        { icon: Calendar, label: t('student.schoolEvents'), href: "/student/events", badge: "2" },
        { icon: Newspaper, label: t('student.schoolNews'), href: "/student/news", badge: "5" },
      ],
    },
    {
      type: "section" as const,
      key: "publisher",
      icon: PenTool,
      label: t('navigation.publisher'),
      gradient: "from-rose-500 to-pink-600",
      items: [
        { icon: Users, label: t('student.journalist'), href: "/student/publisher/journalist" },
        { icon: BarChart3, label: t('student.myArticles'), href: "/student/publisher" },
        { icon: Edit3, label: t('student.writeArticle'), href: "/student/publisher/create" },
      ],
    },
    {
      type: "section" as const,
      key: "tools",
      icon: Wrench,
      label: t('navigation.tools'),
      gradient: "from-cyan-500 to-blue-600",
      items: [
        { icon: StickyNote, label: t('student.notes'), href: "/student/notes" },
        { icon: CheckSquare, label: t('student.todoList'), href: "/student/todo" },
        { icon: Target, label: t('student.goals'), href: "/student/goals" },
        { icon: Timer, label: t('student.pomodoroTimer'), href: "/student/pomodoro" },
        { icon: Settings, label: t('student.settings'), href: "/student/settings" },
        { icon: User, label: t('student.profile'), href: "/student/profile" },
      ],
    },
  ] as const

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-2xl dark:bg-slate-900/95">
      <SidebarHeader
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <StudentProfile
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        studentName={studentName}
        studentId={studentId}
        gradeLevel={gradeLevel}
        section={section}
        gwa={gwa}
        notifications={notifications}
        achievements={achievements}
      />

      <nav
        ref={sidebarScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/30 to-white/20 dark:from-slate-800/30 dark:to-slate-900/20 scrollbar-thin scrollbar-thumb-violet-300 dark:scrollbar-thumb-violet-600 scrollbar-track-transparent hover:scrollbar-thumb-violet-400 dark:hover:scrollbar-thumb-violet-500 scrollbar-thumb-rounded-full"
      >
        {NAV.map((section) => {
          if (section.type === "single") {
            const isActive = pathname === section.href
            return (
              <NavigationItem
                key={section.label}
                item={section}
                isActive={isActive}
                sidebarCollapsed={sidebarCollapsed}
                isMobile={isMobile}
              />
            )
          }

          if (section.type === "section") {
            return (
              <NavigationSection
                key={section.key}
                section={section}
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
                isMobile={isMobile}
              />
            )
          }

          return null
        })}
      </nav>

      <InviteFriendsSection sidebarCollapsed={sidebarCollapsed} isMobile={isMobile} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {!isMobile && (
        <aside
          className={`fixed left-0 top-0 h-full z-40 transition-all duration-500 ease-in-out shadow-2xl flex flex-col border-r border-violet-200/30 dark:border-violet-700/20 ${
            sidebarCollapsed ? "w-20" : "w-80"
          }`}
        >
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-6 left-6 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl p-3 border border-violet-200/30 dark:border-violet-700/30"
            >
              <Menu className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0 border-r border-violet-200/50 dark:border-violet-700/20 flex flex-col"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      <main
        className={`transition-all duration-500 ease-in-out flex flex-col min-h-screen ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-80"
        }`}
      >
        <StudentHeader
          studentName={studentName}
          studentAvatar={studentAvatar}
          gradeLevel={gradeLevel}
          section={section}
          studentId={studentId}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />

        <div className="flex-1 p-6 sm:p-8 lg:p-10">{children}</div>

        <StudentFooter />
      </main>

      <div className="fixed bottom-28 right-8 z-50">
        <BotChat />
      </div>
    </div>
  )
}

export { StudentLayout }
export default StudentLayout
