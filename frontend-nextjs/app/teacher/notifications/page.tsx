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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "assignment" | "meeting" | "deadline" | "resource" | "system" | "announcement"
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
  student?: string
  subject?: string
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New assignment submitted",
    message:
      "John Doe submitted Math Assignment 3 - Quadratic Equations. The assignment includes detailed solutions and shows good understanding of the concepts.",
    type: "assignment",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    priority: "high",
    student: "John Doe",
    subject: "Mathematics",
    actionUrl: "/teacher/assignments/123",
  },
  {
    id: "2",
    title: "Parent meeting request",
    message: "Mrs. Smith requested a meeting for tomorrow at 2:00 PM to discuss Emma's progress in Science class.",
    type: "meeting",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
    priority: "medium",
    student: "Emma Smith",
    subject: "Science",
    actionUrl: "/teacher/meetings/456",
  },
  {
    id: "3",
    title: "Grade deadline reminder",
    message:
      "Grades due for Quarter 2 in 3 days. Please ensure all assignments are graded and submitted to the system.",
    type: "deadline",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    priority: "high",
    subject: "All Subjects",
    actionUrl: "/teacher/grades",
  },
  {
    id: "4",
    title: "New resource available",
    message:
      "Science lab equipment guide has been uploaded to the resources section. This includes safety protocols and usage instructions.",
    type: "resource",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    priority: "low",
    subject: "Science",
    actionUrl: "/teacher/resources/789",
  },
  {
    id: "5",
    title: "System maintenance scheduled",
    message: "The gradebook system will be under maintenance this weekend from 10 PM Friday to 6 AM Monday.",
    type: "system",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    subject: "System",
  },
  {
    id: "6",
    title: "School announcement",
    message:
      "Parent-teacher conferences are scheduled for next week. Please check your schedule and prepare accordingly.",
    type: "announcement",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    subject: "General",
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "assignment":
      return <FileText className="w-5 h-5" />
    case "meeting":
      return <Users className="w-5 h-5" />
    case "deadline":
      return <Clock className="w-5 h-5" />
    case "resource":
      return <BookOpen className="w-5 h-5" />
    case "system":
      return <AlertCircle className="w-5 h-5" />
    case "announcement":
      return <Bell className="w-5 h-5" />
    default:
      return <Info className="w-5 h-5" />
  }
}

const getNotificationColor = (type: Notification["type"], priority: Notification["priority"]) => {
  if (priority === "high") {
    return "bg-gradient-to-br from-red-500 to-pink-500"
  }
  if (priority === "medium") {
    return "bg-gradient-to-br from-yellow-500 to-orange-500"
  }

  switch (type) {
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
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [filterPriority, setFilterPriority] = React.useState<string>("all")
  const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([])
  const { toast } = useToast()

  const unreadCount = notifications.filter((n) => !n.read).length
  const totalCount = notifications.length

  // Filter notifications based on search and filters
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.student?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.subject?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === "all" || notification.type === filterType
      const matchesPriority = filterPriority === "all" || notification.priority === filterPriority

      return matchesSearch && matchesType && matchesPriority
    })
  }, [notifications, searchQuery, filterType, filterPriority])

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    toast({
      title: "Notification marked as read",
      variant: "default",
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast({
      title: "All notifications marked as read",
      variant: "default",
    })
  }

  const handleClearAllNotifications = () => {
    setNotifications([])
    setSelectedNotifications([])
    toast({
      title: "All notifications cleared",
      description: "All notifications have been permanently removed.",
      variant: "default",
    })
  }

  const handleDeleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)))
    setSelectedNotifications([])
    toast({
      title: `${selectedNotifications.length} notification(s) deleted`,
      variant: "default",
    })
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
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
          {filteredNotifications.length > 0 ? (
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

              {filteredNotifications.map((notification) => (
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
                          getNotificationColor(notification.type, notification.priority),
                        )}
                      >
                        {getNotificationIcon(notification.type)}
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
                              {notification.priority === "high" && (
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
                                {notification.student && (
                                  <Badge variant="outline" className="text-xs">
                                    {notification.student}
                                  </Badge>
                                )}
                                {notification.subject && (
                                  <Badge
                                    className={cn(
                                      "text-xs text-white border-0",
                                      getNotificationColor(notification.type, notification.priority),
                                    )}
                                  >
                                    {notification.subject}
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
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
              ))}
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
