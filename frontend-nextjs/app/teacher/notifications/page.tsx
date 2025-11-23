"use client"

import * as React from "react"
import { TeacherHeader } from "@/components/teacher/teacher-header"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Users,
  BookOpen,
  FileText,
  Clock,
  AlertCircle,
  Info,
  Star,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useNotifications, type Notification } from "@/hooks/useNotifications"

// Teacher-specific notification display type
interface TeacherNotificationDisplay {
  type: "assignment" | "meeting" | "deadline" | "resource" | "system" | "announcement"
  icon: typeof FileText
  priority: "low" | "medium" | "high"
}

// Map backend notification to teacher display type
const mapTeacherNotificationType = (notification: Notification): TeacherNotificationDisplay => {
  // Quiz submission (ACADEMIC category) → assignment
  if (notification.type === 'academic' && notification.message.toLowerCase().includes('quiz')) {
    return { type: 'assignment', icon: FileText, priority: 'high' };
  }
  // Advisory activity (ACADEMIC category) → meeting or announcement
  if (notification.type === 'academic' && (
    notification.message.toLowerCase().includes('advisory') ||
    notification.message.toLowerCase().includes('meeting')
  )) {
    return { type: 'meeting', icon: Users, priority: 'medium' };
  }
  // News approval/rejection (COMMUNICATION category) → announcement
  if (notification.type === 'social' && notification.message.toLowerCase().includes('news')) {
    return { type: 'announcement', icon: Bell, priority: 'medium' };
  }
  // Performance alerts (ACADEMIC + WARNING) → deadline
  if (notification.type === 'academic' && notification.priority === 'high') {
    return { type: 'deadline', icon: Clock, priority: 'high' };
  }
  // System notifications
  if (notification.type === 'info' && notification.priority === 'low') {
    return { type: 'system', icon: AlertCircle, priority: 'low' };
  }
  // Default based on priority
  if (notification.priority === 'high') {
    return { type: 'deadline', icon: Clock, priority: 'high' };
  }
  if (notification.priority === 'medium') {
    return { type: 'announcement', icon: Bell, priority: 'medium' };
  }
  return { type: 'resource', icon: BookOpen, priority: 'low' };
}

const getNotificationIcon = (displayType: TeacherNotificationDisplay) => {
  const IconComponent = displayType.icon;
  return <IconComponent className="w-5 h-5" />;
}

const getNotificationColor = (displayType: TeacherNotificationDisplay) => {
  if (displayType.priority === "high") {
    return "bg-gradient-to-br from-red-500 to-pink-500"
  }
  if (displayType.priority === "medium") {
    return "bg-gradient-to-br from-yellow-500 to-orange-500"
  }

  switch (displayType.type) {
    case "assignment":
      return "bg-gradient-to-br from-blue-500 to-purple-500"
    case "meeting":
      return "bg-gradient-to-br from-green-500 to-teal-500"
    case "deadline":
      return "bg-gradient-to-br from-red-500 to-pink-500"
    case "resource":
      return "bg-gradient-to-br from-indigo-500 to-blue-500"
    case "system":
      return "bg-gradient-to-br from-gray-500 to-slate-500"
    case "announcement":
      return "bg-gradient-to-br from-purple-500 to-indigo-500"
    default:
      return "bg-gradient-to-br from-gray-500 to-slate-500"
  }
}

// Build teacher-specific action URLs
const buildTeacherActionUrl = (notification: Notification): string | undefined => {
  if (notification.actionUrl) {
    // If actionUrl already exists, convert student routes to teacher routes
    if (notification.actionUrl.startsWith('/student/quiz/')) {
      const quizId = notification.actionUrl.replace('/student/quiz/', '');
      return `/teacher/quiz/${quizId}/grade`;
    }
    if (notification.actionUrl.startsWith('/student/news/')) {
      const newsId = notification.actionUrl.replace('/student/news/', '');
      return `/teacher/news/view/${newsId}`;
    }
    if (notification.actionUrl.startsWith('/student/clubs/')) {
      const clubId = notification.actionUrl.replace('/student/clubs/', '');
      return `/teacher/clubs/${clubId}`;
    }
    if (notification.actionUrl === '/student/schedule') {
      return '/teacher/schedule';
    }
  }
  return notification.actionUrl;
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

export default function TeacherNotificationsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [filterPriority, setFilterPriority] = React.useState<string>("all")
  const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([])
  const { toast } = useToast()
  
  const {
    notifications: apiNotifications,
    loading: notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const totalCount = apiNotifications.length

  // Filter notifications based on search and filters
  const filteredNotifications = React.useMemo(() => {
    return apiNotifications.filter((notification) => {
      const mapped = mapTeacherNotificationType(notification);
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === "all" || mapped.type === filterType
      const matchesPriority = filterPriority === "all" || mapped.priority === filterPriority

      return matchesSearch && matchesType && matchesPriority
    })
  }, [apiNotifications, searchQuery, filterType, filterPriority])

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleClearAllNotifications = async () => {
    const deletePromises = apiNotifications.map((n) => deleteNotification(n.id))
    await Promise.all(deletePromises)
    setSelectedNotifications([])
  }

  const handleDeleteSelected = async () => {
    const deletePromises = selectedNotifications.map((id) => deleteNotification(id))
    await Promise.all(deletePromises)
    setSelectedNotifications([])
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id))
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }
    const actionUrl = buildTeacherActionUrl(notification)
    if (actionUrl) {
      window.location.href = actionUrl
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Teacher Notifications
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {totalCount} total notifications • {unreadCount} unread
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <AnimatedButton
                  onClick={handleMarkAllAsRead}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </AnimatedButton>
              )}
              {totalCount > 0 && (
                <AnimatedButton
                  onClick={handleClearAllNotifications}
                  variant="destructive"
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </AnimatedButton>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AnimatedButton variant="outline" className="min-w-[120px]">
                        <Filter className="w-4 h-4 mr-2" />
                        Type: {filterType === "all" ? "All" : filterType}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </AnimatedButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterType("all")}>All Types</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("assignment")}>Assignments</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("meeting")}>Meetings</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("deadline")}>Deadlines</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("resource")}>Resources</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("system")}>System</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("announcement")}>Announcements</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AnimatedButton variant="outline" className="min-w-[120px]">
                        <Star className="w-4 h-4 mr-2" />
                        Priority: {filterPriority === "all" ? "All" : filterPriority}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </AnimatedButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterPriority("all")}>All Priorities</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterPriority("high")}>High Priority</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterPriority("medium")}>Medium Priority</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterPriority("low")}>Low Priority</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedNotifications.length} notification(s) selected
                    </p>
                    <div className="flex items-center space-x-2">
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          selectedNotifications.forEach(handleMarkAsRead)
                          setSelectedNotifications([])
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Read
                      </AnimatedButton>
                      <AnimatedButton size="sm" variant="destructive" onClick={handleDeleteSelected}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </AnimatedButton>
                      <AnimatedButton size="sm" variant="ghost" onClick={() => setSelectedNotifications([])}>
                        <X className="w-4 h-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notificationsLoading ? (
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length > 0 ? (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between">
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-slate-600 dark:text-slate-400"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {selectedNotifications.length === filteredNotifications.length ? "Deselect All" : "Select All"}
                </AnimatedButton>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {filteredNotifications.length} of {totalCount} notifications
                </p>
              </div>

              {filteredNotifications.map((notification) => {
                const mapped = mapTeacherNotificationType(notification);
                const actionUrl = buildTeacherActionUrl(notification);
                return (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all duration-300 cursor-pointer hover:shadow-lg backdrop-blur-sm border",
                    !notification.read
                      ? "bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200/50 dark:border-blue-700/50 shadow-md"
                      : "bg-white/60 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-700/50",
                    selectedNotifications.includes(notification.id) && "ring-2 ring-blue-500 ring-offset-2",
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Selection Checkbox */}
                      <div className="flex items-center pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      {/* Icon */}
                      <div
                        className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg text-white",
                          getNotificationColor(mapped),
                        )}
                      >
                        {getNotificationIcon(mapped)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(notification)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3
                                className={cn(
                                  "text-lg font-semibold line-clamp-1",
                                  !notification.read && "text-slate-900 dark:text-slate-100",
                                )}
                              >
                                {notification.title}
                              </h3>
                              {mapped.priority === "high" && (
                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
                              )}
                              {!notification.read && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                                {mapped.type && (
                                  <Badge
                                    className={cn(
                                      "text-xs text-white border-0",
                                      getNotificationColor(mapped),
                                    )}
                                  >
                                    {mapped.type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <AnimatedButton
                                size="sm"
                                variant="ghost"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await handleMarkAsRead(notification.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Check className="w-4 h-4" />
                              </AnimatedButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </>
          ) : (
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  {searchQuery || filterType !== "all" || filterPriority !== "all"
                    ? "No matching notifications"
                    : "All caught up!"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {searchQuery || filterType !== "all" || filterPriority !== "all"
                    ? "Try adjusting your search or filters"
                    : "No new notifications to show"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
