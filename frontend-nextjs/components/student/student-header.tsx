"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Menu,
  Globe,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Clock,
  BookOpen,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"

interface StudentHeaderProps {
  studentName: string
  studentAvatar?: string
  onToggleSidebar: () => void
  isMobile?: boolean
}

export default function StudentHeader({ studentName, studentAvatar, onToggleSidebar, isMobile }: StudentHeaderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { theme, setTheme } = useTheme()

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fil", name: "Filipino", flag: "🇵🇭" },
  ]

  const notifications = [
    {
      id: 1,
      type: "assignment",
      title: "Math Assignment Due",
      message: "Algebra homework is due tomorrow at 11:59 PM",
      time: "2 hours ago",
      read: false,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      id: 2,
      type: "grade",
      title: "New Grade Posted",
      message: "Your Science quiz grade has been posted: 95/100",
      time: "4 hours ago",
      read: false,
      icon: AlertCircle,
      color: "text-green-500",
    },
    {
      id: 3,
      type: "schedule",
      title: "Schedule Change",
      message: "PE class moved to Gymnasium B for today",
      time: "1 day ago",
      read: true,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      id: 4,
      type: "announcement",
      title: "School Announcement",
      message: "Parent-Teacher Conference scheduled for next week",
      time: "2 days ago",
      read: true,
      icon: Bell,
      color: "text-purple-500",
    },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    // In a real app, this would update the notification status
    console.log(`[v0] Marking notification ${id} as read`)
  }

  const markAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log("[v0] Marking all notifications as read")
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  const handleLogout = () => {
    // Handle logout logic here
    console.log("[v0] Student logout confirmed")
    // Redirect to login or handle logout
    window.location.href = "/guess/login"
  }

  return (
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 min-w-0 flex-1">
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] p-2"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                  <span className="hidden xs:inline">Welcome back, </span>
                  {studentName.split(" ")[0]}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium hidden sm:block">
                  Ready to achieve greatness today? ✨
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Theme Toggle Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] p-2"
                >
                  {theme === "light" && <Sun className="w-4 h-4" />}
                  {theme === "dark" && <Moon className="w-4 h-4" />}
                  {theme === "system" && <Monitor className="w-4 h-4" />}
                  <ChevronDown className="w-3 h-3 ml-1 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 sm:w-40">
                {themeOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className="flex items-center space-x-2 cursor-pointer touch-manipulation min-h-[44px]"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{option.label}</span>
                      {theme === option.value && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 touch-manipulation min-h-[44px]"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">{selectedLanguage}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.name)}
                    className="flex items-center space-x-2 cursor-pointer touch-manipulation min-h-[44px]"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {selectedLanguage === lang.name && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Notifications */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] p-2"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg animate-pulse">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 sm:w-80 p-0 shadow-xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
              >
                <div className="p-3 sm:p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Notifications
                    </h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs hover:bg-white/50 dark:hover:bg-slate-800/50 touch-manipulation min-h-[36px]"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(false)}
                        className="hover:bg-white/50 dark:hover:bg-slate-800/50 touch-manipulation min-w-[36px] min-h-[36px] p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const IconComponent = notification.icon
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors touch-manipulation ${
                            !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${notification.color} flex-shrink-0`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">{notification.title}</p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 px-2 sm:px-3 py-2 touch-manipulation min-h-[44px]"
                >
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-blue-200 dark:ring-blue-800">
                    <AvatarImage src={studentAvatar || "/placeholder.svg"} alt={studentName} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xs sm:text-sm">
                      {studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="font-semibold text-sm truncate max-w-[100px]">{studentName.split(" ")[0]}</p>
                    <p className="text-xs text-slate-500">Grade 8B</p>
                  </div>
                  <ChevronDown className="w-3 h-3 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 sm:w-64 shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={studentAvatar || "/placeholder.svg"} alt={studentName} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                        {studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate text-slate-900 dark:text-slate-100">{studentName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Grade 8 • Section B</p>
                      <Badge
                        variant="secondary"
                        className="text-xs mt-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        Student ID: S2024001
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer py-3 touch-manipulation text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer py-3 touch-manipulation text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  className="flex items-center space-x-3 text-red-600 dark:text-red-400 cursor-pointer py-3 touch-manipulation hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowLogoutModal(true)
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Sign Out</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to sign out of your account? You'll need to log in again to access your dashboard.
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
