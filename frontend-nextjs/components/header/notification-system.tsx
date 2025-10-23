"use client"

import * as React from "react"
import { Bell, X, Check, AlertCircle, Info, Calendar, Users, BookOpen, Sparkles } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "event" | "academic" | "social"
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: "low" | "medium" | "high"
}

interface NotificationSystemProps {
  className?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Spring Musical Auditions",
    message: "Auditions for Hamilton start next week. Sign up now!",
    type: "event",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    actionUrl: "/events/spring-musical",
    priority: "high",
  },
  {
    id: "2",
    title: "Grade Posted",
    message: "Your Chemistry test grade has been posted.",
    type: "academic",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    actionUrl: "/grades",
    priority: "medium",
  },
  {
    id: "3",
    title: "Club Meeting Reminder",
    message: "Robotics Club meeting tomorrow at 3:30 PM in Room 205.",
    type: "social",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    actionUrl: "/clubs/robotics",
    priority: "low",
  },
  {
    id: "4",
    title: "Basketball Game Tonight",
    message: "Varsity basketball vs. Central High at 7:00 PM. Come support!",
    type: "event",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: true,
    actionUrl: "/athletics/basketball",
    priority: "medium",
  },
  {
    id: "5",
    title: "Library Hours Extended",
    message: "Library will be open until 8 PM during finals week.",
    type: "info",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    actionUrl: "/library",
    priority: "low",
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "event":
      return <Calendar className="w-4 h-4" />
    case "academic":
      return <BookOpen className="w-4 h-4" />
    case "social":
      return <Users className="w-4 h-4" />
    case "success":
      return <Check className="w-4 h-4" />
    case "warning":
      return <AlertCircle className="w-4 h-4" />
    case "error":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "event":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900/20"
    case "academic":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
    case "social":
      return "text-green-600 bg-green-100 dark:bg-green-900/20"
    case "success":
      return "text-green-600 bg-green-100 dark:bg-green-900/20"
    case "warning":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
    case "error":
      return "text-red-600 bg-red-100 dark:bg-red-900/20"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
  }
}

const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return timestamp.toLocaleDateString()
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications)
  const { toast } = useToast()
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Handle click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Simulate real-time notifications
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications (for demo purposes)
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "New Announcement",
          message: "Check out the latest school news and updates.",
          type: "info",
          timestamp: new Date(),
          read: false,
          priority: "medium",
        }

        setNotifications((prev) => [newNotification, ...prev])

        // Show toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: "info",
        })
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [toast])

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }

    setIsOpen(false)
  }

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast({
      title: "All notifications marked as read",
      variant: "success",
    })
  }

  const handleClearAll = () => {
    setNotifications([])
    setIsOpen(false)
    toast({
      title: "All notifications cleared",
      variant: "success",
    })
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <AnimatedButton
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 rounded-xl shadow-lg hover:shadow-xl"
      >
        <Bell
          className={cn(
            "w-4 h-4 transition-all duration-300",
            unreadCount > 0 && "animate-pulse text-blue-600 dark:text-blue-400",
          )}
        />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white animate-pulse shadow-lg border-2 border-white dark:border-slate-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">{unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}</span>
      </AnimatedButton>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-500 overflow-hidden">
          <div className="relative p-6 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-b border-white/30 dark:border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-8 px-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg transition-all duration-200"
                  >
                    Mark all read
                  </AnimatedButton>
                )}
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </AnimatedButton>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-96">
            {notifications.length > 0 ? (
              <div className="p-2">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full p-4 rounded-xl transition-all duration-300 text-left group relative overflow-hidden",
                        !notification.read
                          ? "bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 hover:from-blue-100/80 hover:via-purple-100/80 hover:to-pink-100/80 dark:hover:from-blue-800/30 dark:hover:via-purple-800/30 dark:hover:to-pink-800/30 shadow-sm border border-blue-200/30 dark:border-blue-700/30"
                          : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-slate-100/80 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50",
                        "backdrop-blur-sm",
                      )}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30 dark:border-slate-600/30",
                            getNotificationColor(notification.type),
                            "bg-gradient-to-br",
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p
                                  className={cn(
                                    "text-sm font-semibold line-clamp-1",
                                    !notification.read && "text-slate-900 dark:text-slate-100",
                                  )}
                                >
                                  {notification.title}
                                </p>
                                {notification.priority === "high" && (
                                  <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                                {!notification.read && (
                                  <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              {!notification.read && (
                                <AnimatedButton
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg"
                                >
                                  <Check className="w-4 h-4" />
                                </AnimatedButton>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                    {index < notifications.length - 1 && (
                      <Separator className="my-2 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bell className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">All caught up!</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">No new notifications to show</p>
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="border-t border-white/30 dark:border-slate-700/50 p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-slate-600/30 rounded-lg transition-all duration-200"
                >
                  Clear all
                </AnimatedButton>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-semibold"
                  asChild
                >
                  <a href="/guess/notifications">View all notifications</a>
                </AnimatedButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
