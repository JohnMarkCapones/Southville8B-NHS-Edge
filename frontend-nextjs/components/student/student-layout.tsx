"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import StudentHeader from "@/components/student/student-header"
import StudentFooter from "@/components/student/student-footer"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { useSidebarStore } from "@/lib/stores/sidebar-store"
import { BotChat } from "@/components/chat/bot-chat"
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/lib/api/endpoints'
import type { UserProfileResponse } from '@/lib/api/types'
import { getEvents } from '@/lib/api/endpoints/events'
import { newsApi } from '@/lib/api/endpoints/news'
import { EventStatus, EventVisibility } from '@/lib/api/types/events'
import { getMyGwa } from '@/lib/api/endpoints/gwa'
import { academicYearsApi } from '@/lib/api/endpoints/academic-years'
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
  Copy,
  Share2,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  BookOpen as BookOpenIcon,
  Mail,
  Phone,
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

    <div className={`relative p-6 flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
      {(!sidebarCollapsed || isMobile) && (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                <Image
                  src="/logo-48.webp"
                  alt="Southville 8B NHS Logo"
                  width={40}
                  height={40}
                  className="object-contain p-1"
                  priority
                />
              </div>
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
        <div className="relative w-full flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/30 transition-all duration-300"></div>
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                <Image
                  src="/logo-48.webp"
                  alt="Southville 8B NHS Logo"
                  width={40}
                  height={40}
                  className="object-contain p-1 relative z-10 transition-transform duration-300 group-hover:scale-110"
                  priority
                />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg z-20">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hover:bg-white/20 text-white border-white/30 backdrop-blur-sm transition-all duration-300 rounded-xl p-2 hover:scale-105"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {!isMobile && !sidebarCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto hover:bg-white/20 text-white border-white/30 backdrop-blur-sm transition-all duration-300 rounded-xl p-2 hover:scale-105"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
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
  isLoadingGwa,
  notifications,
  achievements
}: {
  sidebarCollapsed: boolean;
  isMobile: boolean;
  studentName: string;
  studentId: string;
  gradeLevel: string;
  section: string;
  gwa: number | null;
  isLoadingGwa: boolean;
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
            {/* Enhanced tooltip for profile when collapsed */}
            <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              <div className="font-semibold">{studentName}</div>
              <div className="text-xs text-slate-300 mt-1">{gradeLevel} • {section}</div>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800"></div>
            </div>
            
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 relative overflow-hidden"
                 aria-label={`${studentName} profile`}
                 role="button"
                 tabIndex={0}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:from-white/30 transition-all duration-300"></div>
              <span className="text-white font-bold text-sm relative z-10">{initials}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center" aria-label="Online status">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            {notifications > 0 && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center" aria-label={`${notifications} notifications`}>
                <span className="text-white text-xs font-bold">{notifications}</span>
              </div>
            )}
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
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                GWA {gwa !== null ? gwa.toFixed(1) : isLoadingGwa ? '...' : 'N/A'}
              </span>
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
}) => {
  const handleClick = () => {
    // Remove focus from the button after click to prevent auto-scroll
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }, 0)
  }

  return (
    <Link href={item.href} onClick={handleClick}>
      <div className="relative group">
        {/* Enhanced tooltip for collapsed state */}
        {sidebarCollapsed && !isMobile && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800"></div>
          </div>
        )}
        
        <Button
          variant="ghost"
          className={`relative w-full ${sidebarCollapsed && !isMobile ? "justify-center px-3" : "justify-start"} transition-all duration-300 min-h-[56px] rounded-2xl font-medium text-base border-2 ${
            isActive
              ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl border-transparent ring-2 ring-offset-2 ring-violet-400/50`
              : "hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg backdrop-blur-sm border-transparent hover:border-violet-200/30 dark:hover:border-violet-700/30 text-slate-700 dark:text-slate-300"
          }`}
          title={sidebarCollapsed && !isMobile ? item.label : undefined}
          aria-label={item.label}
          aria-current={isActive ? "page" : undefined}
        >
          <div className={`flex items-center ${sidebarCollapsed && !isMobile ? "" : "w-full"}`}>
            <div className="relative">
              <item.icon
                className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-600 dark:text-slate-400"} transition-all duration-200`}
                aria-hidden="true"
              />
              {/* Active state indicator dot when collapsed */}
              {isActive && sidebarCollapsed && !isMobile && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-current shadow-lg"></div>
              )}
            </div>

            {(!sidebarCollapsed || isMobile) && <span className="ml-4 flex-1 text-left font-semibold">{item.label}</span>}
          </div>
        </Button>
      </div>
    </Link>
  )
}

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
      {/* Enhanced tooltip for collapsed sections */}
      {sidebarCollapsed && !isMobile && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          {section.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800"></div>
        </div>
      )}
      
      <Button
        variant="ghost"
        onClick={() => !sidebarCollapsed && toggleSection(section.key)}
        className={`relative w-full ${sidebarCollapsed && !isMobile ? "justify-center px-3" : "justify-start"} hover:bg-transparent transition-all duration-300 min-h-[56px] rounded-2xl font-medium text-base`}
        title={sidebarCollapsed && !isMobile ? section.label : undefined}
        aria-label={section.label}
        aria-expanded={isExpanded}
        aria-controls={section.key}
      >
        <div className={`flex items-center ${sidebarCollapsed && !isMobile ? "" : "w-full"}`}>
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-lg transition-all duration-300 relative ${
              isExpanded && sidebarCollapsed && !isMobile ? "ring-2 ring-offset-2 ring-violet-400/50" : ""
            }`}
          >
            <section.icon className="w-5 h-5 text-white" aria-hidden="true" />
            {/* Expanded state indicator dot when collapsed */}
            {isExpanded && sidebarCollapsed && !isMobile && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-current shadow-lg"></div>
            )}
          </div>

          {(!sidebarCollapsed || isMobile) && (
            <>
              <span className="ml-4 flex-1 text-left font-bold text-slate-700 dark:text-slate-300">
                {section.label}
              </span>
              <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
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
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""} transition-all duration-200`} aria-hidden="true" />
                    <span className="ml-3 flex-1 text-left font-semibold">{item.label}</span>
                    {item.badge && (
                      <Badge
                        className={`ml-auto text-xs px-2 py-1 rounded-lg font-bold ${
                          isActive
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800"
                        }`}
                        aria-label={`${item.badge} new items`}
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

const HelpSupportSection = ({ 
  sidebarCollapsed, 
  isMobile,
  onHelpClick 
}: { 
  sidebarCollapsed: boolean
  isMobile: boolean
  onHelpClick: () => void
}) => (
  <div className="p-5 border-t border-slate-200/20 dark:border-slate-700/20 bg-gradient-to-br from-slate-50/50 to-white/30 dark:from-slate-800/50 dark:to-slate-900/30">
    {!sidebarCollapsed || isMobile ? (
      <div 
        onClick={onHelpClick}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-5 text-white shadow-xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base">Help & Support</h3>
            <p className="text-xs text-white/90 mt-1">Get assistance anytime</p>
          </div>
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={onHelpClick}
          className="w-12 h-12 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-300 rounded-2xl group"
          title="Help & Support"
          aria-label="Help & Support"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
            <HelpCircle className="w-5 h-5 text-white" />
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
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { expandedSections, toggleSection } = useSidebarStore()
  const { t } = useTranslation()

  // Fetch current user data - with refetchOnWindowFocus DISABLED to prevent scroll jumps
  const { data: user, isLoading, isError } = useQuery<UserProfileResponse, Error>({
    queryKey: ['user', 'me'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false, // DISABLED - prevents re-render when clicking sidebar
    refetchOnReconnect: true,
  })

  // Fetch events count (only published and upcoming events)
  const { data: eventsData } = useQuery({
    queryKey: ['events', 'count'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const response = await getEvents({
        status: EventStatus.PUBLISHED,
        visibility: EventVisibility.PUBLIC,
        limit: 1000, // Get all to count
      })
      // Filter for upcoming events only
      const upcomingEvents = response.data.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= today
      })
      return upcomingEvents.length
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch news count (only published news)
  const { data: newsCount } = useQuery({
    queryKey: ['news', 'count'],
    queryFn: async () => {
      const response = await newsApi.getNews({ limit: 1000, sortBy: 'newest' })
      // Filter for published news only
      const publishedNews = response.data.filter((article) => article.status === 'Published')
      return publishedNews.length
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Extract student data with fallbacks
  const studentName = user?.student
    ? `${user.student.first_name} ${user.student.middle_name ? user.student.middle_name + ' ' : ''}${user.student.last_name}`.trim()
    : user?.full_name || 'Student'

  const studentId = user?.student?.student_id || 'N/A'
  const gradeLevel = user?.student?.grade_level ? `Grade ${user.student.grade_level}` : 'N/A'
  const section = user?.student?.sections?.name || 'N/A'
  const studentAvatar = user?.profile?.avatar || '/student-avatar.png'

  // Fetch current academic period
  const { data: currentPeriod } = useQuery({
    queryKey: ['current-period'],
    queryFn: () => academicYearsApi.getCurrentPeriod(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Map period name to grading period (Q1, Q2, Q3, Q4)
  const getGradingPeriodFromPeriodName = (periodName: string | null | undefined): string | undefined => {
    if (!periodName) return undefined
    const name = periodName.toLowerCase()
    if (name.includes('q1') || name.includes('first quarter') || name.includes('1st quarter')) return 'Q1'
    if (name.includes('q2') || name.includes('second quarter') || name.includes('2nd quarter')) return 'Q2'
    if (name.includes('q3') || name.includes('third quarter') || name.includes('3rd quarter')) return 'Q3'
    if (name.includes('q4') || name.includes('fourth quarter') || name.includes('4th quarter')) return 'Q4'
    // Try to extract Q + number pattern
    const match = name.match(/q(\d)/)
    if (match && match[1] >= '1' && match[1] <= '4') {
      return `Q${match[1]}`
    }
    return undefined
  }

  // Get active academic year for school year filter
  const { data: activeYear } = useQuery({
    queryKey: ['active-year'],
    queryFn: () => academicYearsApi.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch GWA for current quarter
  const gradingPeriod = getGradingPeriodFromPeriodName(currentPeriod?.period_name)
  const schoolYear = activeYear?.year_name

  // Fetch all GWA records if we have school year, then filter client-side
  const { data: gwaRecords, isLoading: isLoadingGwa, error: gwaError } = useQuery({
    queryKey: ['my-gwa', gradingPeriod, schoolYear],
    queryFn: async () => {
      // Try to fetch with filters first
      if (gradingPeriod && schoolYear) {
        try {
          const records = await getMyGwa(gradingPeriod, schoolYear)
          if (records && records.length > 0) {
            return records
          }
        } catch (err) {
          console.warn('Failed to fetch GWA with filters, trying without:', err)
        }
      }
      
      // Fallback: fetch all records and filter client-side
      const allRecords = await getMyGwa()
      if (!allRecords || allRecords.length === 0) {
        return []
      }

      // Filter for current quarter if we have it
      if (gradingPeriod && schoolYear) {
        return allRecords.filter(
          (record) =>
            record.grading_period === gradingPeriod &&
            record.school_year === schoolYear
        )
      }

      // If no filters, return most recent record
      return allRecords.sort((a, b) => {
        if (a.school_year !== b.school_year) {
          return b.school_year?.localeCompare(a.school_year || '') || 0
        }
        const periodOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }
        const aOrder = periodOrder[a.grading_period as keyof typeof periodOrder] || 0
        const bOrder = periodOrder[b.grading_period as keyof typeof periodOrder] || 0
        return bOrder - aOrder
      })
    },
    enabled: !!schoolYear || true, // Fetch if we have school year, or try anyway
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Get GWA for current quarter (first record if available)
  const currentGwa = gwaRecords && gwaRecords.length > 0 ? gwaRecords[0].gwa : null
  const gwa = isLoadingGwa ? null : (currentGwa ?? null)

  // Debug logging
  useEffect(() => {
    if (gwaError) {
      console.error('Error fetching GWA:', gwaError)
    }
    if (currentPeriod) {
      console.log('Current period:', currentPeriod.period_name, '-> Grading period:', gradingPeriod)
    }
    if (activeYear) {
      console.log('Active year:', activeYear.year_name)
    }
    if (gwaRecords) {
      console.log('GWA records:', gwaRecords)
    }
  }, [currentPeriod, gradingPeriod, activeYear, gwaRecords, gwaError])

  const notifications = 3 // TODO: Get from actual notifications when available
  const achievements = 12 // TODO: Get from actual achievements when available


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

  // NO SCROLL RESTORATION - Just let the sidebar scroll naturally

  // Build navigation with translations - useMemo to prevent recreating on every render!
  const NAV = useMemo(() => [
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
      key: "studentLife",
      icon: Users,
      label: t('navigation.studentLife'),
      gradient: "from-purple-500 to-pink-600",
      items: [
        { icon: Users, label: t('student.myClubs'), href: "/student/clubs" },
        { icon: FileCheck, label: t('student.myApplications'), href: "/student/clubs/applications" },
        { icon: Search, label: t('student.discoverClubs'), href: "/student/clubs/discover" },
        { 
          icon: Calendar, 
          label: t('student.schoolEvents'), 
          href: "/student/events", 
          badge: eventsData !== undefined ? eventsData.toString() : "0"
        },
        { 
          icon: Newspaper, 
          label: t('student.schoolNews'), 
          href: "/student/news", 
          badge: newsCount !== undefined ? newsCount.toString() : "0"
        },
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
  ] as const, [t, eventsData, newsCount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {!isMobile && (
        <aside
          className={`fixed left-0 top-0 h-full z-40 transition-all duration-500 ease-in-out shadow-2xl flex flex-col border-r border-violet-200/30 dark:border-violet-700/20 ${
            sidebarCollapsed ? "w-20" : "w-80"
          }`}
        >
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
              isLoadingGwa={isLoadingGwa}
              notifications={notifications}
              achievements={achievements}
            />

            <div
              ref={sidebarScrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/30 to-white/20 dark:from-slate-800/30 dark:to-slate-900/20 scrollbar-thin scrollbar-thumb-violet-300 dark:scrollbar-thumb-violet-600 scrollbar-track-transparent hover:scrollbar-thumb-violet-400 dark:hover:scrollbar-thumb-violet-500 scrollbar-thumb-rounded-full"
              style={{ scrollBehavior: 'auto', overflowAnchor: 'none' }}
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
            </div>

            <HelpSupportSection 
              sidebarCollapsed={sidebarCollapsed} 
              isMobile={isMobile}
              onHelpClick={() => setHelpModalOpen(true)}
            />
          </div>

          {/* Floating Collapse/Uncollapse Button */}
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-8 h-16 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 rounded-r-2xl shadow-2xl border-2 border-violet-200 dark:border-violet-700 transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center p-0"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
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
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>
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
                isLoadingGwa={isLoadingGwa}
                notifications={notifications}
                achievements={achievements}
              />

              <div
                ref={sidebarScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/30 to-white/20 dark:from-slate-800/30 dark:to-slate-900/20 scrollbar-thin scrollbar-thumb-violet-300 dark:scrollbar-thumb-violet-600 scrollbar-track-transparent hover:scrollbar-thumb-violet-400 dark:hover:scrollbar-thumb-violet-500 scrollbar-thumb-rounded-full"
                style={{ scrollBehavior: 'auto', overflowAnchor: 'none' }}
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
              </div>

              <HelpSupportSection 
                sidebarCollapsed={sidebarCollapsed} 
                isMobile={isMobile}
                onHelpClick={() => {
                  setHelpModalOpen(true)
                  setMobileMenuOpen(false)
                }}
              />
            </div>
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

      {/* Help & Support Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              Help & Support
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
              Get assistance with your student portal or contact support
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/student/help" onClick={() => setHelpModalOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full flex flex-col items-center gap-2 h-auto py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                >
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-center">Help Center</span>
                </Button>
              </Link>
              <Button
                onClick={() => {
                  // Scroll to bot chat or open it
                  const botChat = document.querySelector('[data-bot-chat]')
                  if (botChat) {
                    botChat.scrollIntoView({ behavior: 'smooth' })
                  }
                  setHelpModalOpen(false)
                }}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-center">Chat Support</span>
              </Button>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Support</p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.href = 'mailto:support@southville8bnhs.edu.ph'}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Mail className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Email Support</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">support@southville8bnhs.edu.ph</div>
                  </div>
                </Button>
                <Button
                  onClick={() => window.location.href = 'tel:+1234567890'}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Phone className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Phone Support</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+1 (234) 567-8900</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Helpful Links */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick Links</p>
              <div className="space-y-2">
                <Link href="/student/help" onClick={() => setHelpModalOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <HelpCircle className="w-4 h-4 mr-3 text-emerald-600 dark:text-emerald-400" />
                    Help Center
                  </Button>
                </Link>
                <Link href="/student/help#faq" onClick={() => setHelpModalOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <MessageCircle className="w-4 h-4 mr-3 text-emerald-600 dark:text-emerald-400" />
                    Frequently Asked Questions
                  </Button>
                </Link>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Need Immediate Help?
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    Our support team is available Monday-Friday, 8:00 AM - 5:00 PM. For urgent matters, please call our hotline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { StudentLayout }
export default StudentLayout
