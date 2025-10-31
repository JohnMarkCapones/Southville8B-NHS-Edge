"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertCircle,
  Calendar,
  FileText,
  Megaphone,
  Clock,
  X,
  ChevronRight,
  Download,
  ExternalLink,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface AnnouncementData {
  id: string
  title: string
  message: string
  priority: "urgent" | "high" | "normal"
  category: "exam" | "assignment" | "event" | "general"
  teacher: {
    name: string
    subject?: string
    avatar?: string
  }
  timestamp: string
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  expiresAt?: string
}

interface AnnouncementModalProps {
  announcements?: AnnouncementData[]
  onDismiss?: (announcementId: string) => void
  onMarkAsRead?: (announcementId: string) => void
}

const PRIORITY_CONFIG = {
  urgent: {
    gradient: "from-red-500 via-red-600 to-orange-600",
    bgGradient: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-300",
    icon: AlertCircle,
    label: "Urgent",
    badgeBg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  },
  high: {
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-700 dark:text-orange-300",
    icon: Megaphone,
    label: "Important",
    badgeBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  },
  normal: {
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
    icon: Megaphone,
    label: "Info",
    badgeBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
}

const CATEGORY_CONFIG = {
  exam: { icon: FileText, label: "Exam", color: "text-purple-600 dark:text-purple-400" },
  assignment: { icon: FileText, label: "Assignment", color: "text-blue-600 dark:text-blue-400" },
  event: { icon: Calendar, label: "Event", color: "text-green-600 dark:text-green-400" },
  general: { icon: Megaphone, label: "General", color: "text-slate-600 dark:text-slate-400" },
}

export function AnnouncementModal({ announcements = [], onDismiss, onMarkAsRead }: AnnouncementModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  // Filter out dismissed announcements
  const activeAnnouncements = announcements.filter((a) => !dismissedIds.has(a.id))
  const currentAnnouncement = activeAnnouncements[currentIndex]
  const hasMore = currentIndex < activeAnnouncements.length - 1

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const stored = localStorage.getItem("dismissedAnnouncements")
    if (stored) {
      try {
        setDismissedIds(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error("[v0] Failed to parse dismissed announcements", e)
      }
    }
  }, [])

  useEffect(() => {
    // Show modal if there are unread announcements
    if (activeAnnouncements.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000) // Show 1 second after page load
      return () => clearTimeout(timer)
    }
  }, [activeAnnouncements.length])

  const handleDismiss = (dontShowAgain = false) => {
    if (!currentAnnouncement) return

    if (dontShowAgain) {
      // Add to dismissed list
      const newDismissed = new Set(dismissedIds)
      newDismissed.add(currentAnnouncement.id)
      setDismissedIds(newDismissed)
      localStorage.setItem("dismissedAnnouncements", JSON.stringify([...newDismissed]))
      onDismiss?.(currentAnnouncement.id)
    }

    // Move to next or close
    if (hasMore) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsOpen(false)
      setCurrentIndex(0)
    }
  }

  const handleMarkAsRead = () => {
    if (!currentAnnouncement) return
    onMarkAsRead?.(currentAnnouncement.id)
    handleDismiss(false)
  }

  if (!currentAnnouncement) return null

  const priorityConfig = PRIORITY_CONFIG[currentAnnouncement.priority]
  const categoryConfig = CATEGORY_CONFIG[currentAnnouncement.category]
  const PriorityIcon = priorityConfig.icon
  const CategoryIcon = categoryConfig.icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-[600px] h-[90vh] max-h-[700px] p-0 overflow-hidden border-0 gap-0 flex flex-col">
        {/* Header with gradient */}
        <div className={cn("relative overflow-hidden bg-gradient-to-r p-4 sm:p-6 flex-shrink-0", priorityConfig.gradient)}>
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                  <PriorityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge className={cn("text-xs font-bold border-white/30 mb-1", priorityConfig.badgeBg)}>
                    {priorityConfig.label}
                  </Badge>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <CategoryIcon className="w-3 h-3 text-white/90 flex-shrink-0" />
                    <span className="text-xs text-white/90 font-medium truncate">{categoryConfig.label}</span>
                  </div>
                </div>
              </div>

              {activeAnnouncements.length > 1 && (
                <Badge className="bg-white/20 text-white border-white/30 text-xs flex-shrink-0 ml-2">
                  {currentIndex + 1} of {activeAnnouncements.length}
                </Badge>
              )}
            </div>

            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 leading-tight break-words">
              {currentAnnouncement.title}
            </DialogTitle>

            {/* Teacher info */}
            <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-4">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-white/30 flex-shrink-0">
                <AvatarImage src={currentAnnouncement.teacher.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-xs sm:text-sm">
                  {currentAnnouncement.teacher.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-xs sm:text-sm truncate">{currentAnnouncement.teacher.name}</p>
                {currentAnnouncement.teacher.subject && (
                  <p className="text-white/80 text-xs truncate">{currentAnnouncement.teacher.subject}</p>
                )}
              </div>
              <div className="flex items-center space-x-1 text-white/80 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{currentAnnouncement.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
          <DialogDescription className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {currentAnnouncement.message}
          </DialogDescription>

          {/* Attachments */}
          {currentAnnouncement.attachments && currentAnnouncement.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Attachments</span>
              </p>
              <div className="space-y-2">
                {currentAnnouncement.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{attachment.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Expiration notice */}
          {currentAnnouncement.expiresAt && (
            <div className="flex items-center space-x-2 p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                This announcement expires on {currentAnnouncement.expiresAt}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-6 pt-0 flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => handleDismiss(true)}
            className="w-full sm:w-auto border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Don't Show Again</span>
            <span className="sm:hidden">Don't Show</span>
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            {hasMore ? (
              <Button
                onClick={() => handleDismiss(false)}
                className={cn(
                  "flex-1 sm:flex-none bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm",
                  priorityConfig.gradient,
                )}
              >
                <span className="hidden sm:inline">Next Announcement</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleMarkAsRead}
                className={cn(
                  "flex-1 sm:flex-none bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm",
                  priorityConfig.gradient,
                )}
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Got It!</span>
                <span className="sm:hidden">Got It</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
