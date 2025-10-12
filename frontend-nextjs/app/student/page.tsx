"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StudentLayout from "@/components/student/student-layout"
import { Notes } from "@/components/productivity/notes"
import { TodoList } from "@/components/productivity/todo-list"
import { GoalTracker } from "@/components/productivity/goal-tracker"
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer"
import { AnnouncementModal, type AnnouncementData } from "@/components/student/announcement-modal"
import {
  BookOpen,
  CalendarIcon,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  Target,
  Brain,
  Trophy,
  BookMarked,
  Timer,
  Activity,
  Lightbulb,
  Flame,
  Bell,
  Users,
  BookOpenCheck,
  AlertCircle,
  Sparkles,
  StickyNote,
  CheckSquare,
  Coffee,
  BarChart3,
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [subjectsCollapsed, setSubjectsCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeProductivityTool, setActiveProductivityTool] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const sampleAnnouncements: AnnouncementData[] = [
    {
      id: "ann-001",
      title: "🚨 Important: Crazy Math Exam This Thursday!",
      message:
        "Hello students! 📚\n\nJust a heads up - we have a comprehensive Math exam scheduled for this Thursday, March 21st at 10:00 AM.\n\nTopics covered:\n• Algebra (equations and inequalities)\n• Geometry (triangles and circles)\n• Statistics (mean, median, mode)\n\nPlease review your notes and practice problems. Office hours are available Tuesday and Wednesday from 3-5 PM if you need extra help.\n\nGood luck with your preparation! 💪",
      priority: "urgent",
      category: "exam",
      teacher: {
        name: "Ms. Garcia",
        subject: "Mathematics",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: "Posted 2 hours ago",
      attachments: [
        {
          name: "Math Exam Study Guide.pdf",
          url: "#",
          type: "application/pdf",
        },
        {
          name: "Practice Problems.pdf",
          url: "#",
          type: "application/pdf",
        },
      ],
      expiresAt: "March 21, 2024",
    },
    {
      id: "ann-002",
      title: "Science Project Submission Reminder",
      message:
        "Dear students,\n\nThis is a friendly reminder that your Science Fair projects are due next Monday, March 25th.\n\nPlease ensure your project includes:\n• Written report (5-10 pages)\n• Visual presentation board\n• Working demonstration (if applicable)\n\nSubmit your projects to the Science Lab by 3:00 PM. Late submissions will receive a 10% deduction per day.\n\nLooking forward to seeing your amazing work!",
      priority: "high",
      category: "assignment",
      teacher: {
        name: "Mr. Santos",
        subject: "Science",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: "Posted 5 hours ago",
      expiresAt: "March 25, 2024",
    },
    {
      id: "ann-003",
      title: "Field Trip to National Museum - Permission Slips Due",
      message:
        "Exciting news! 🎉\n\nWe're organizing a field trip to the National Museum on April 5th. This will be a great opportunity to learn about Philippine history and culture.\n\nImportant details:\n• Date: April 5, 2024\n• Departure: 8:00 AM from school\n• Return: 4:00 PM\n• Cost: ₱500 (includes transportation and lunch)\n\nPlease submit your signed permission slips and payment by March 28th. Limited slots available!",
      priority: "normal",
      category: "event",
      teacher: {
        name: "Mrs. Cruz",
        subject: "Araling Panlipunan",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: "Posted 1 day ago",
      expiresAt: "March 28, 2024",
    },
  ]

  const handleDismissAnnouncement = (announcementId: string) => {
    console.log("[v0] Dismissed announcement:", announcementId)
    // In a real app, this would update the backend
  }

  const handleMarkAsRead = (announcementId: string) => {
    console.log("[v0] Marked announcement as read:", announcementId)
    // In a real app, this would update the backend
  }

  const studentData = {
    name: "Precious Danielle Mañalac",
    studentId: "S2024001",
    grade: "Grade 8",
    section: "Section B",
    avatar: "/student-avatar.png",
    gwa: 94.5,
    rank: 12,
    totalStudents: 240,
  }

  const subjects = [
    { name: "TLE (Technology and Livelihood Education)", grade: 95, color: "bg-emerald-500", progress: 95 },
    { name: "Science", grade: 94, color: "bg-green-500", progress: 94 },
    { name: "Mathematics", grade: 96, color: "bg-blue-500", progress: 96 },
    { name: "Filipino", grade: 95, color: "bg-orange-500", progress: 95 },
    { name: "English", grade: 92, color: "bg-purple-500", progress: 92 },
    { name: "Araling Panlipunan", grade: 93, color: "bg-cyan-500", progress: 93 },
    { name: "ESP (Edukasyon sa Pagpapakatao)", grade: 97, color: "bg-pink-500", progress: 97 },
    { name: "MAPEH (Music, Arts, Physical Education, Health)", grade: 94, color: "bg-indigo-500", progress: 94 },
  ]

  const upcomingClasses = [
    { subject: "Mathematics", time: "8:00 AM", room: "Room 201", teacher: "Ms. Garcia", status: "upcoming" },
    { subject: "Science", time: "9:30 AM", room: "Lab 1", teacher: "Mr. Santos", status: "current" },
    { subject: "English", time: "11:00 AM", room: "Room 105", teacher: "Mrs. Cruz", status: "upcoming" },
    { subject: "PE", time: "1:00 PM", room: "Gymnasium", teacher: "Coach Martinez", status: "upcoming" },
  ]

  const achievements = [
    { title: "Perfect Attendance", icon: Trophy, color: "text-yellow-500", earned: true },
    { title: "Math Wizard", icon: Brain, color: "text-blue-500", earned: true },
    { title: "Science Explorer", icon: Lightbulb, color: "text-green-500", earned: false },
    { title: "Reading Champion", icon: BookMarked, color: "text-purple-500", earned: true },
  ]

  const studyStreak = {
    current: 15,
    best: 28,
    weeklyGoal: 7,
    completed: 5,
  }

  const learningStats = [
    { label: "Study Hours This Week", value: "12.5", icon: Timer, color: "bg-blue-100 text-blue-600" },
    { label: "Study Sessions", value: "8/10", icon: CheckCircle2, color: "bg-green-100 text-green-600" },
    { label: "Quiz Average", value: "94%", icon: Target, color: "bg-purple-100 text-purple-600" },
    { label: "Reading Progress", value: "3 Books", icon: BookOpen, color: "bg-orange-100 text-orange-600" },
  ]

  const motivationalQuote = {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  }

  const recentActivities = [
    { action: "Submitted Math Assignment", time: "2 hours ago", icon: CheckCircle2, color: "text-green-500" },
    { action: "Joined Science Study Group", time: "4 hours ago", icon: Users, color: "text-blue-500" },
    { action: "Completed English Quiz", time: "1 day ago", icon: BookOpenCheck, color: "text-purple-500" },
    { action: "Earned Perfect Attendance Badge", time: "2 days ago", icon: Award, color: "text-yellow-500" },
  ]

  const quickActions = [
    {
      title: "Join Quiz",
      icon: Brain,
      color: "bg-green-500 hover:bg-green-600",
      action: () => router.push("/student/quiz"),
    },
    {
      title: "View Grades",
      icon: TrendingUp,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => router.push("/student/grades"),
    },
    {
      title: "View Activities",
      icon: BookOpenCheck,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => router.push("/student/courses"),
    },
    {
      title: "Study Resources",
      icon: BookMarked,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => router.push("/student/courses"),
    },
  ]

  const productivityTools = [
    {
      id: "notes",
      title: "Notes",
      icon: StickyNote,
      color: "bg-yellow-500 hover:bg-yellow-600",
      component: Notes,
    },
    {
      id: "todos",
      title: "Todo List",
      icon: CheckSquare,
      color: "bg-blue-500 hover:bg-blue-600",
      component: TodoList,
    },
    {
      id: "goals",
      title: "Goals",
      icon: Target,
      color: "bg-purple-500 hover:bg-purple-600",
      component: GoalTracker,
    },
    {
      id: "pomodoro",
      title: "Pomodoro",
      icon: Timer,
      color: "bg-red-500 hover:bg-red-600",
      component: PomodoroTimer,
    },
  ]

  const notifications = [
    { title: "New assignment in Mathematics", time: "5 min ago", type: "assignment", urgent: true },
    { title: "Science lab session tomorrow", time: "1 hour ago", type: "reminder", urgent: false },
    { title: "Parent-teacher meeting scheduled", time: "2 hours ago", type: "meeting", urgent: true },
    { title: "Library book due in 3 days", time: "1 day ago", type: "reminder", urgent: false },
  ]

  const weeklyGoals = [
    { title: "Complete all assignments", progress: 80, target: 100, icon: Target },
    { title: "Study 20 hours", progress: 15, target: 20, icon: Timer },
    { title: "Read 2 books", progress: 1, target: 2, icon: BookOpen },
    { title: "Exercise 5 times", progress: 3, target: 5, icon: Activity },
  ]

  const studyTips = [
    "Take breaks every 25 minutes using the Pomodoro technique",
    "Create a dedicated study space free from distractions",
    "Use active recall by testing yourself on the material",
    "Form study groups with classmates for better understanding",
  ]

  const currentTip = studyTips[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % studyTips.length]

  const productivityTips = {
    notes: {
      title: "📝 Smart Note-Taking Tips",
      tips: [
        "Use the Cornell Note-Taking System: divide your notes into cues, notes, and summary sections",
        "Color-code your notes by subject or importance level for better visual organization",
        "Review and summarize your notes within 24 hours to improve retention",
        "Use tags to create connections between related topics across different subjects",
      ],
    },
    todos: {
      title: "✅ Task Management Mastery",
      tips: [
        "Apply the Eisenhower Matrix: categorize tasks by urgency and importance",
        "Break large tasks into smaller, actionable steps to avoid overwhelm",
        "Set realistic deadlines and add buffer time for unexpected delays",
        "Use the 2-minute rule: if it takes less than 2 minutes, do it immediately",
      ],
    },
    goals: {
      title: "🎯 Goal Achievement Strategies",
      tips: [
        "Follow SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound",
        "Break long-term goals into weekly and daily milestones for consistent progress",
        "Track your progress visually to maintain motivation and identify patterns",
        "Celebrate small wins along the way to maintain momentum and positive mindset",
      ],
    },
    pomodoro: {
      title: "⏰ Focus Technique Guide",
      tips: [
        "Start with 25-minute work sessions and 5-minute breaks for optimal focus",
        "During breaks, step away from screens and do light physical activity",
        "Use longer breaks (15-30 minutes) after every 4 pomodoro sessions",
        "Eliminate distractions: turn off notifications and create a dedicated study space",
      ],
    },
  }

  const enhancedProductivityTools = [
    {
      id: "notes",
      title: "Smart Notes",
      icon: StickyNote,
      color: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
      component: Notes,
      description: "Capture and organize your thoughts with advanced categorization",
      stats: "12 notes created this week",
      tips: productivityTips.notes,
    },
    {
      id: "todos",
      title: "Task Manager",
      icon: CheckSquare,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      component: TodoList,
      description: "Prioritize and track your assignments and personal tasks",
      stats: "8 tasks completed today",
      tips: productivityTips.todos,
    },
    {
      id: "goals",
      title: "Goal Tracker",
      icon: Target,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      component: GoalTracker,
      description: "Set, monitor, and achieve your academic and personal goals",
      stats: "3 goals on track this month",
      tips: productivityTips.goals,
    },
    {
      id: "pomodoro",
      title: "Focus Timer",
      icon: Timer,
      color: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600",
      component: PomodoroTimer,
      description: "Boost concentration with the proven Pomodoro Technique",
      stats: "6 focus sessions completed",
      tips: productivityTips.pomodoro,
    },
  ]

  const studyTechniques = [
    {
      name: "Active Recall",
      description: "Test yourself regularly instead of just re-reading notes",
      icon: Brain,
      effectiveness: 95,
    },
    {
      name: "Spaced Repetition",
      description: "Review material at increasing intervals for long-term retention",
      icon: Clock,
      effectiveness: 90,
    },
    {
      name: "Feynman Technique",
      description: "Explain concepts in simple terms to identify knowledge gaps",
      icon: Lightbulb,
      effectiveness: 85,
    },
    {
      name: "Mind Mapping",
      description: "Create visual connections between related concepts and ideas",
      icon: BarChart3,
      effectiveness: 80,
    },
  ]

  return (
    <StudentLayout>
      <AnnouncementModal
        announcements={sampleAnnouncements}
        onDismiss={handleDismissAnnouncement}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* Dashboard Content */}
      <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Enhanced Welcome Section */}
        <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Welcome back, {studentData.name}!</h1>
                  <div className="animate-bounce">👋</div>
                </div>
                <p className="text-sm sm:text-base md:text-lg opacity-90 mb-3 sm:mb-4">
                  Ready to conquer another day of learning?
                </p>

                <div className="flex items-center flex-wrap gap-3 sm:gap-6 mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">
                      {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">
                      {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Productive Day</span>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 max-w-2xl border border-white/30">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-yellow-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">💡 Study Tip of the Day</p>
                      <p className="text-xs sm:text-sm opacity-90">{currentTip}</p>
                      <p className="text-xs opacity-75 mt-1">💪 You've got this! Stay focused and keep learning!</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block ml-6">
                <img
                  src="/images/design-mode/memphis-studying-geography-with-a-globe%281%29(1).png"
                  alt="Educational globe with graduation cap"
                  className="w-36 h-36 object-contain transform hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white h-14 sm:h-16 flex flex-col items-center justify-center space-y-1 transform transition-all duration-200 hover:scale-105 hover:shadow-lg touch-manipulation`}
            >
              <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs font-medium text-center leading-tight">{action.title}</span>
            </Button>
          ))}
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("streak")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Study Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold">{studyStreak.current} days</p>
                  <p className="text-xs text-green-200 mt-1">Best: {studyStreak.best} days</p>
                </div>
                <Flame
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-orange-300 transition-transform duration-300 ${hoveredCard === "streak" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-orange-500 to-red-500 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("notifications")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm">Notifications</p>
                  <p className="text-2xl sm:text-3xl font-bold">{notifications.filter((n) => n.urgent).length}</p>
                  <p className="text-xs text-orange-200 mt-1">Urgent items</p>
                </div>
                <Bell
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-orange-200 transition-transform duration-300 ${hoveredCard === "notifications" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("gwa")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Current GWA</p>
                  <p className="text-2xl sm:text-3xl font-bold">{studentData.gwa}</p>
                  <p className="text-xs text-blue-200 mt-1">
                    Rank #{studentData.rank} of {studentData.totalStudents}
                  </p>
                </div>
                <TrendingUp
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-blue-200 transition-transform duration-300 ${hoveredCard === "gwa" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("subjects")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Active Subjects</p>
                  <p className="text-2xl sm:text-3xl font-bold">8</p>
                  <p className="text-xs text-purple-200 mt-1">All on track</p>
                </div>
                <BookOpen
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-purple-200 transition-transform duration-300 ${hoveredCard === "subjects" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {showNotifications && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 animate-in slide-in-from-top duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                <Bell className="w-5 h-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      notification.urgent
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {notification.urgent && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {learningStats.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group touch-manipulation"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div
                    className={`p-2 sm:p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="font-bold text-base sm:text-lg">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your current class schedule for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                        classItem.status === "current"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-sm">{classItem.subject}</h4>
                            {classItem.status === "current" && (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Current</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {classItem.time} • {classItem.room} • {classItem.teacher}
                          </p>
                        </div>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Calendar Overview
                </CardTitle>
                <CardDescription>Upcoming events and important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Math Quiz</h4>
                          <p className="text-xs text-purple-100">Tomorrow, 10:00 AM</p>
                          <p className="text-xs text-purple-200 mt-1">Room 201</p>
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Science Fair</h4>
                          <p className="text-xs text-orange-100">Friday, 2:00 PM</p>
                          <p className="text-xs text-orange-200 mt-1">Laboratory</p>
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Parent-Teacher Meeting</h4>
                        <p className="text-xs text-green-100">Next Monday, 3:00 PM</p>
                        <p className="text-xs text-green-200 mt-1">Conference Room A</p>
                      </div>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>This Week:</strong> 3 upcoming events • 2 assignments due • 1 quiz scheduled
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goals Section */}

            {/* Recent Activity Feed */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Activity Timeline
                  </div>
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

                  {/* Activity 1 */}
                  <div className="relative flex items-start space-x-4 pb-6">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Submitted Math Assignment
                        </h4>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Assignment has been submitted to the teacher
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-red-700 dark:text-red-300">assignment.pdf</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity 2 */}
                  <div className="relative flex items-start space-x-4 pb-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Joined Science Study Group
                        </h4>
                        <span className="text-xs text-gray-500">4 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Study session with classmates @2:30pm
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center -space-x-1">
                          <img
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                            src="/placeholder.svg?height=24&width=24"
                            alt="Student 1"
                          />
                          <img
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                            src="/placeholder.svg?height=24&width=24"
                            alt="Student 2"
                          />
                          <img
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                            src="/placeholder.svg?height=24&width=24"
                            alt="Student 3"
                          />
                          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">+2</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Maria Santos</span> (Study Leader)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity 3 */}
                  <div className="relative flex items-start space-x-4 pb-6">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Completed English Quiz
                        </h4>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Quiz completed with excellent results
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                          <span className="text-green-700 dark:text-green-300 font-medium">Score: 95/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity 4 */}
                  <div className="relative flex items-start space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Earned Perfect Attendance Badge
                        </h4>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Achievement unlocked for consistent attendance
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                          <Trophy className="w-3 h-3 text-yellow-600" />
                          <span className="text-yellow-700 dark:text-yellow-300 font-medium">Perfect Attendance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Proven Study Techniques
                </CardTitle>
                <CardDescription>Evidence-based methods to enhance your learning effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {studyTechniques.map((technique, index) => (
                    <Card
                      key={index}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <technique.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{technique.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{technique.description}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${technique.effectiveness}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-purple-600">{technique.effectiveness}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      <strong>Pro Tip:</strong> Combine multiple techniques for maximum effectiveness. Try active recall
                      with spaced repetition for optimal results!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300 text-base sm:text-lg">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Quick Tools
                </CardTitle>
                <CardDescription className="text-indigo-600/70 dark:text-indigo-400/70 text-sm">
                  Fast access to productivity features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {enhancedProductivityTools.map((tool) => (
                  <Button
                    key={tool.id}
                    onClick={() => setActiveProductivityTool(activeProductivityTool === tool.id ? null : tool.id)}
                    variant="outline"
                    size="sm"
                    className={`w-full justify-start bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border-indigo-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all duration-200 touch-manipulation min-h-[44px] ${
                      activeProductivityTool === tool.id
                        ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-600"
                        : ""
                    }`}
                  >
                    <tool.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{tool.title}</div>
                      <div className="text-xs text-muted-foreground">{tool.stats}</div>
                    </div>
                  </Button>
                ))}

                <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-700 dark:text-green-300">
                      <strong>Daily Challenge:</strong> Use each productivity tool for 10 minutes today to build
                      effective study habits!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
