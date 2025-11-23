"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StudentLayout from "@/components/student/student-layout"
import { Notes } from "@/components/productivity/notes"
import { TodoList } from "@/components/productivity/todo-list"
import { GoalTracker } from "@/components/productivity/goal-tracker"
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer"
import { AnnouncementModal, type AnnouncementData } from "@/components/student/announcement-modal"
import { useUser } from "@/hooks/useUser"
import { useMySchedule } from "@/hooks/useSchedules"
import { useEvents } from "@/hooks/useEvents"
import { EventStatus, EventVisibility } from "@/lib/api/types/events"
import { newsApi } from "@/lib/api/endpoints/news"
import { useStudentActivities } from "@/hooks/useStudentActivities"
import {
  PointsCounter,
  LevelProgressBar,
  BadgeShowcaseCompact,
  LeaderboardWidget,
  StreakCalendar,
} from "@/components/gamification"
import {
  getMyProfile,
  getMyBadges,
  getLeaderboard,
  formatPoints,
  getLevelTitle,
  type GamificationProfile,
  type MyBadgesResponse,
  type LeaderboardResponse,
} from "@/lib/api/endpoints/gamification"
import { getLoginStreak } from "@/lib/api/endpoints/users"
import { useNotifications } from "@/hooks/useNotifications"
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
  X,
  Sparkles,
  StickyNote,
  CheckSquare,
  Coffee,
  BarChart3,
  Zap,
  Star,
  Newspaper,
  Calendar,
  ArrowRight,
} from "lucide-react"

// Separate component for live clock to prevent parent re-renders
const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
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
    </>
  )
}

export default function StudentDashboard() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [subjectsCollapsed, setSubjectsCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeProductivityTool, setActiveProductivityTool] = useState<string | null>(null)

  // Gamification state
  const [gamificationProfile, setGamificationProfile] = useState<GamificationProfile | null>(null)
  const [badgesData, setBadgesData] = useState<MyBadgesResponse | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null)
  const [isLoadingGamification, setIsLoadingGamification] = useState(true)
  
  // Login streak state
  const [loginStreak, setLoginStreak] = useState<number | null>(null)
  const [isLoadingStreak, setIsLoadingStreak] = useState(true)

  // Fetch current user data
  const { data: user, isLoading, isError} = useUser()

  // Fetch student schedule
  const { data: schedules, isLoading: isLoadingSchedule } = useMySchedule()

  // Fetch upcoming events
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const { data: eventsResponse, isLoading: isLoadingEvents } = useEvents({
    status: EventStatus.PUBLISHED,
    visibility: EventVisibility.PUBLIC,
    startDate: today,
    limit: 5,
  })

  // Fetch recent news
  const [newsData, setNewsData] = useState<any[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoadingNews(true)
      try {
        const response = await newsApi.getNews({ limit: 5, sortBy: 'newest' })
        const publishedNews = response.data.filter((article) => article.status === 'Published')
        setNewsData(publishedNews.slice(0, 5))
      } catch (error) {
        console.error('Error fetching news:', error)
        setNewsData([])
      } finally {
        setIsLoadingNews(false)
      }
    }
    fetchNews()
  }, [])

  // Fetch student activities
  const { data: activitiesResponse, isLoading: isLoadingActivities } = useStudentActivities({
    limit: 10,
    page: 1,
  })

  // Fetch gamification data
  useEffect(() => {
    const fetchGamificationData = async () => {
      setIsLoadingGamification(true)
      try {
        const [profile, badges, leaderboard] = await Promise.all([
          getMyProfile(),
          getMyBadges('all'),
          getLeaderboard({ scope: 'global', limit: 10 }),
        ])
        setGamificationProfile(profile)
        setBadgesData(badges)
        setLeaderboardData(leaderboard)
      } catch (error) {
        console.error('Error fetching gamification data:', error)
      } finally {
        setIsLoadingGamification(false)
      }
    }

    fetchGamificationData()
  }, [])

  // Fetch login streak
  useEffect(() => {
    const fetchLoginStreakData = async () => {
      setIsLoadingStreak(true)
      try {
        const response = await getLoginStreak()
        setLoginStreak(response.streak)
      } catch (error) {
        console.error('Error fetching login streak:', error)
        setLoginStreak(0) // Default to 0 on error
      } finally {
        setIsLoadingStreak(false)
      }
    }

    fetchLoginStreakData()
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

  // Extract student data with fallbacks
  const studentData = {
    name: user?.student
      ? `${user.student.first_name} ${user.student.middle_name ? user.student.middle_name + ' ' : ''}${user.student.last_name}`.trim()
      : user?.full_name || 'Student',
    studentId: user?.student?.student_id || 'N/A',
    grade: user?.student?.grade_level ? `Grade ${user.student.grade_level}` : 'N/A',
    section: user?.student?.sections?.name || 'N/A',
    avatar: user?.profile?.avatar || '/student-avatar.png',
    gwa: 94.5, // TODO: Get from actual GWA data when available
    rank: user?.student?.rank || 12,
    totalStudents: 240, // TODO: Get from actual total students count when available
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

  // Get today's schedule
  const getTodaysSchedule = () => {
    if (!schedules || schedules.length === 0) return []

    // Get current day name
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    // Filter schedules for today
    const todaySchedules = schedules.filter(schedule => schedule.dayOfWeek === today)

    // Get current time
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    // Format and sort schedules
    return todaySchedules
      .map(schedule => {
        // Parse start time (HH:MM:SS format) - handle null/undefined
        if (!schedule.startTime || !schedule.endTime) {
          console.warn('Schedule missing time data:', schedule)
          return null
        }

        const startParts = schedule.startTime.split(':')
        const endParts = schedule.endTime.split(':')

        if (startParts.length < 2 || endParts.length < 2) {
          console.warn('Invalid time format:', schedule.startTime, schedule.endTime)
          return null
        }

        const startHour = parseInt(startParts[0], 10)
        const startMin = parseInt(startParts[1], 10)
        const endHour = parseInt(endParts[0], 10)
        const endMin = parseInt(endParts[1], 10)

        if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
          console.warn('Failed to parse time:', schedule)
          return null
        }

        const startTimeMinutes = startHour * 60 + startMin
        const endTimeMinutes = endHour * 60 + endMin

        // Determine status
        let status = 'upcoming'
        if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) {
          status = 'current'
        } else if (currentTime >= endTimeMinutes) {
          status = 'completed'
        }

        // Format time (12-hour format)
        const formatTime = (hour: number, min: number) => {
          const period = hour >= 12 ? 'PM' : 'AM'
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
          return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`
        }

        // Get teacher name - handle various formats
        let teacherName = 'TBA'
        if (schedule.teacher) {
          if (schedule.teacher.user?.fullName) {
            teacherName = schedule.teacher.user.fullName
          } else if (schedule.teacher.firstName || schedule.teacher.lastName) {
            const firstName = schedule.teacher.firstName || ''
            const lastName = schedule.teacher.lastName || ''
            teacherName = `${firstName} ${lastName}`.trim() || 'TBA'
          }
        }

        return {
          subject: schedule.subject?.subjectName || 'No Subject Name',
          time: formatTime(startHour, startMin),
          room: schedule.room ? `Room ${schedule.room.roomNumber}` : schedule.building?.name || 'TBA',
          teacher: teacherName,
          status,
          startTimeMinutes,
        }
      })
      .filter(item => item !== null) // Remove invalid entries
      .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes)
  }

  const upcomingClasses = getTodaysSchedule()

  // Debug: Log schedule data
  if (schedules && schedules.length > 0) {
    console.log('Schedules received:', schedules)
    console.log('Today\'s classes:', upcomingClasses)
  }

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

  const motivationalQuote = {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  }

  // Use real activities from API or fallback to empty array
  const recentActivities = activitiesResponse?.data?.map(activity => {
    console.log('Activity metadata:', activity.metadata); // Debug log
    return {
      action: activity.title,
      time: formatTimestamp(activity.activityTimestamp),
      icon: getIconComponent(activity.icon || 'Activity'),
      color: activity.color || 'text-gray-500',
      description: activity.description,
      metadata: activity.metadata,
    };
  }) || []

  // Helper function to format timestamp
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  // Helper function to map icon strings to components
  function getIconComponent(iconName: string) {
    const iconMap: Record<string, any> = {
      CheckCircle2,
      Users,
      BookOpenCheck,
      Award,
      Trophy,
      BookOpen,
      Brain,
      Target,
      Activity,
      Lightbulb,
      BookMarked,
    }
    return iconMap[iconName] || Activity
  }

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

  // Use real notifications from API
  const {
    notifications: apiNotifications,
    loading: notificationsLoading,
    unreadCount,
  } = useNotifications()

  // Format notifications for display
  const formatNotificationTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
  }

  // Map API notifications to display format
  const notifications = apiNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: formatNotificationTime(n.timestamp),
    urgent: n.priority === "high" || n.type === "warning" || n.type === "error",
    read: n.read,
  }))

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
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{t('dashboard.welcomeBack')}, {studentData.name}!</h1>
                    <div className="animate-bounce">👋</div>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg opacity-90 mb-3 sm:mb-4">
                    {t('dashboard.readyToConquer')}
                  </p>

                <div className="flex items-center flex-wrap gap-3 sm:gap-6 mb-3 sm:mb-4">
                  <LiveClock />
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{t('dashboard.productiveDay')}</span>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 max-w-2xl border border-white/30">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-yellow-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">💡 {t('dashboard.studyTipOfTheDay')}</p>
                      <p className="text-xs sm:text-sm opacity-90">{currentTip}</p>
                      <p className="text-xs opacity-75 mt-1">💪 {t('dashboard.youveGotThis')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block ml-6">
                <img
                  src="/images/design-mode/memphis-studying-geography-with-a-globe(1).png"
                  alt="Educational globe with graduation cap"
                  className="w-44 h-44 object-contain transform hover:scale-110 transition-transform duration-300"
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

        {/* Enhanced Stats Grid - Gamification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Points Card - Column 1 (green) */}
          <Card
            className="bg-gradient-to-br from-green-500 to-green-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("points")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push("/student/ranking")}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Total Points</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoadingGamification ? "..." : formatPoints(gamificationProfile?.points.total || 0)}
                  </p>
                  <p className="text-xs text-green-200 mt-1">
                    Rank #{gamificationProfile?.ranks.global || "-"}
                  </p>
                </div>
                <Zap
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-green-200 transition-transform duration-300 ${hoveredCard === "points" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Level Card - Column 2 (orange) */}
          <Card
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("level")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push("/student/achievements")}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm">Level</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoadingGamification ? "..." : gamificationProfile?.level.current || 1}
                  </p>
                  <p className="text-xs text-orange-200 mt-1">
                    {gamificationProfile ? getLevelTitle(gamificationProfile.level.current) : "Novice"}
                  </p>
                </div>
                <Trophy
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-orange-200 transition-transform duration-300 ${hoveredCard === "level" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Streak Card - Column 3 (blue) */}
          <Card
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("streak")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Activity Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoadingStreak ? "..." : loginStreak !== null ? loginStreak : (isLoadingGamification ? "..." : gamificationProfile?.streak.current || 0)} days
                  </p>
                  <p className="text-xs text-blue-200 mt-1">
                    Best: {gamificationProfile?.streak.longest || 0} days
                  </p>
                </div>
                <Flame
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-blue-200 transition-transform duration-300 ${hoveredCard === "streak" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Badges Card - Column 4 (purple) */}
          <Card
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("badges")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push("/student/achievements")}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Badges Earned</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {badgesData ? badgesData.earned.length : (isLoadingGamification ? "..." : 0)}
                  </p>
                  <p className="text-xs text-purple-200 mt-1">
                    {badgesData ? `${badgesData.earned.length}/${badgesData.earned.length + badgesData.unearned.length} collected` : "Loading..."}
                  </p>
                </div>
                <Star
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-purple-200 transition-transform duration-300 ${hoveredCard === "badges" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications - Column 1 (green) */}
          <Card
            className="bg-gradient-to-br from-green-500 to-green-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("notifications")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Notifications</p>
                  <p className="text-2xl sm:text-3xl font-bold">{unreadCount || 0}</p>
                  <p className="text-xs text-green-200 mt-1">{unreadCount === 1 ? "Unread item" : "Unread items"}</p>
                </div>
                <Bell
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-green-200 transition-transform duration-300 ${hoveredCard === "notifications" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current GWA - Column 2 (orange) */}
          <Card
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("gwa")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm">Current GWA</p>
                  <p className="text-2xl sm:text-3xl font-bold">{studentData.gwa}</p>
                  <p className="text-xs text-orange-200 mt-1">
                    Rank #{studentData.rank} of {studentData.totalStudents}
                  </p>
                </div>
                <TrendingUp
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-orange-200 transition-transform duration-300 ${hoveredCard === "gwa" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Subjects - Column 3 (blue) */}
          <Card
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden touch-manipulation"
            onMouseEnter={() => setHoveredCard("subjects")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Active Subjects</p>
                  <p className="text-2xl sm:text-3xl font-bold">8</p>
                  <p className="text-xs text-blue-200 mt-1">All on track</p>
                </div>
                <BookOpen
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-blue-200 transition-transform duration-300 ${hoveredCard === "subjects" ? "rotate-12 scale-110" : ""}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {showNotifications && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 animate-in slide-in-from-top duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Notifications
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                        notification.urgent
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : notification.read
                          ? "border-green-300 bg-green-50/50 dark:bg-green-900/10"
                          : "border-green-500 bg-green-50 dark:bg-green-900/20"
                      }`}
                      onClick={() => {
                        if (notification.id && !notification.read) {
                          // Mark as read - you might want to add markAsRead from useNotifications
                        }
                        setShowNotifications(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        {notification.urgent && <AlertCircle className="w-4 h-4 text-red-500 ml-2 flex-shrink-0" />}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  {notifications.length > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/student/notifications")}
                        className="text-green-600 dark:text-green-400"
                      >
                        View all {notifications.length} notifications
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}


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
                {isLoadingSchedule ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : upcomingClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8 min-h-[200px]">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No classes scheduled for today</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Enjoy your day off!</p>
                  </div>
                ) : (
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
                )}
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
                {isLoadingEvents ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : !eventsResponse?.data || eventsResponse.data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8 min-h-[200px]">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No upcoming events</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Check back later for new events!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eventsResponse.data.slice(0, 4).map((event, index) => {
                        const gradients = [
                          'from-purple-500 to-purple-600',
                          'from-orange-500 to-orange-600',
                          'from-green-500 to-emerald-600',
                          'from-blue-500 to-blue-600',
                        ]
                        const textColors = [
                          'text-purple-100',
                          'text-orange-100',
                          'text-green-100',
                          'text-blue-100',
                        ]

                        // Format date and time
                        const eventDate = new Date(event.startDate)
                        const now = new Date()
                        const tomorrow = new Date(now)
                        tomorrow.setDate(tomorrow.getDate() + 1)

                        let dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                        if (eventDate.toDateString() === now.toDateString()) {
                          dateStr = 'Today'
                        } else if (eventDate.toDateString() === tomorrow.toDateString()) {
                          dateStr = 'Tomorrow'
                        }

                        const timeStr = event.startTime
                          ? new Date(`2000-01-01T${event.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                          : ''

                        return (
                          <div
                            key={event.id}
                            className={`p-4 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                            onClick={() => router.push(`/student/events/${event.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h4>
                                <p className={`text-xs ${textColors[index % textColors.length]}`}>
                                  {dateStr}{timeStr && `, ${timeStr}`}
                                </p>
                                {event.location && (
                                  <p className={`text-xs ${textColors[index % textColors.length]} mt-1`}>
                                    {event.location}
                                  </p>
                                )}
                              </div>
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <CalendarIcon className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* This Week Summary */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <strong>This Week:</strong> {(() => {
                            // Calculate events happening this week
                            const now = new Date()
                            const endOfWeek = new Date(now)
                            endOfWeek.setDate(now.getDate() + (7 - now.getDay())) // Sunday

                            const thisWeekEvents = eventsResponse.data.filter(event => {
                              const eventDate = new Date(event.startDate)
                              return eventDate >= now && eventDate <= endOfWeek
                            })

                            return thisWeekEvents.length
                          })()} upcoming events • 2 assignments due • 1 quiz scheduled
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                {isLoadingActivities ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8 min-h-[200px]">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No recent activities</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Your activities will appear here as you engage with the platform</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative">
                    {/* Timeline line */}
                    <div className="absolute left-1 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon
                      // Extract color class (e.g., 'text-green-500' -> 'green')
                      const colorMatch = activity.color.match(/text-(\w+)-/)
                      const dotColor = colorMatch ? `bg-${colorMatch[1]}-500` : 'bg-gray-500'

                      return (
                        <div key={index} className="relative flex items-start space-x-4 pb-2">
                          <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 relative z-10`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Icon className={`w-4 h-4 ${activity.color}`} />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {activity.action}
                                </h4>
                              </div>
                              <span className="text-xs text-gray-500">{activity.time}</span>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.description}
                              </p>
                            )}
                            {/* Display metadata if available (quiz scores, file names, etc.) */}
                            {activity.metadata && (
                              <div className="flex items-center space-x-2 mt-2">
                                {activity.metadata.score && activity.metadata.max_score && (
                                  <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                                      Score: {activity.metadata.score}/{activity.metadata.max_score}
                                    </span>
                                  </div>
                                )}
                                {activity.metadata.file_name && activity.metadata.module_id && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const { getModuleDownloadUrl } = await import('@/lib/api/endpoints/modules');
                                        const result = await getModuleDownloadUrl(activity.metadata.module_id);

                                        // For PDF files, use downloadUrl
                                        if (result.fileType === 'pdf' && result.downloadUrl) {
                                          const link = document.createElement('a');
                                          link.href = result.downloadUrl;
                                          link.download = activity.metadata.file_name;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }
                                        // For PPTX files, open the first slide or download URL
                                        else if (result.fileType === 'pptx' && result.downloadUrl) {
                                          const link = document.createElement('a');
                                          link.href = result.downloadUrl;
                                          link.download = activity.metadata.file_name;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }
                                      } catch (error) {
                                        console.error('Failed to download file:', error);
                                        alert('Failed to download file. Please try again.');
                                      }
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-xs transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3 text-blue-500" />
                                    <span className="text-blue-700 dark:text-blue-300 hover:underline">{activity.metadata.file_name}</span>
                                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </button>
                                )}
                                {activity.metadata.club_name && (
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                                    <Users className="w-3 h-3 text-purple-500" />
                                    <span className="text-purple-700 dark:text-purple-300">{activity.metadata.club_name}</span>
                                  </div>
                                )}
                                {activity.metadata.badge_name && (
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                                    <Trophy className="w-3 h-3 text-yellow-600" />
                                    <span className="text-yellow-700 dark:text-yellow-300 font-medium">{activity.metadata.badge_name}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Display journalism activity feedback (rejection, approval, revision) */}
                            {activity.metadata && (activity.metadata.reason || activity.metadata.remarks || activity.metadata.feedback) && (
                              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  {activity.metadata.reason ? 'Rejection Reason:' : activity.metadata.feedback ? 'Feedback:' : 'Remarks:'}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                  {activity.metadata.reason || activity.metadata.feedback || activity.metadata.remarks}
                                </p>
                                {activity.metadata.article_id && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 h-7 text-xs"
                                    onClick={() => router.push(`/student/publisher/preview/${activity.metadata.article_id}`)}
                                  >
                                    View Article
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
            {/* Quick Tools Section */}
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
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => router.push("/student/notes")}
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border-indigo-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all duration-200"
                  >
                    <StickyNote className="w-5 h-5 mb-1 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium">Notes</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/student/todo")}
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border-indigo-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all duration-200"
                  >
                    <CheckSquare className="w-5 h-5 mb-1 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium">Todo List</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/student/goals")}
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border-indigo-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all duration-200"
                  >
                    <Target className="w-5 h-5 mb-1 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium">Goals</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/student/pomodoro")}
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border-indigo-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-all duration-200"
                  >
                    <Timer className="w-5 h-5 mb-1 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium">Pomodoro</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* News Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-blue-700 dark:text-blue-300 text-base sm:text-lg">
                    <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    School News
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/student/news")}
                    className="h-8 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View All
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                  Latest updates and announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingNews ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : newsData.length > 0 ? (
                  newsData.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => router.push(`/student/news/${article.slug}`)}
                      className="p-3 bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border border-blue-200 dark:border-slate-600 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground dark:text-slate-400 line-clamp-1">
                        {article.description || article.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString() : 'Recent'}
                        </span>
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">
                            {article.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Newspaper className="w-8 h-8 mx-auto mb-2 text-blue-300 dark:text-blue-700" />
                    <p className="text-sm text-muted-foreground dark:text-slate-400">No news available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Events Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-300 text-base sm:text-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Upcoming Events
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/student/events")}
                    className="h-8 px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    View All
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <CardDescription className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">
                  Don't miss out on school activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingEvents ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : eventsResponse?.data && eventsResponse.data.length > 0 ? (
                  eventsResponse.data.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => router.push(`/student/events/${event.slug || event.id}`)}
                      className="p-3 bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-700/90 border border-emerald-200 dark:border-slate-600 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-slate-400">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-emerald-300 dark:text-emerald-700" />
                    <p className="text-sm text-muted-foreground dark:text-slate-400">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gamification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Progress */}
          <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Trophy className="w-5 h-5 mr-2 text-purple-600" />
                Your Progress
              </CardTitle>
              <CardDescription>Level up by earning points and completing activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGamification ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : gamificationProfile ? (
                <LevelProgressBar
                  level={gamificationProfile.level.current}
                  currentXP={gamificationProfile.level.currentXP}
                  nextLevelXP={gamificationProfile.level.nextLevelXP}
                  progress={gamificationProfile.level.progress}
                  title={gamificationProfile.level.title}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-base">
                    <Star className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Badges
                  </CardTitle>
                  <CardDescription>Your latest achievements</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/student/achievements")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingGamification ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : badgesData && badgesData.earned.length > 0 ? (
                <BadgeShowcaseCompact
                  badges={[...badgesData.earned, ...badgesData.unearned]}
                  maxDisplay={6}
                  onViewAll={() => router.push("/student/achievements")}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Star className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No badges earned yet</p>
                  <p className="text-xs text-muted-foreground">Complete activities to earn your first badge!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Widget */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-base">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Top Performers
                </CardTitle>
                <CardDescription>See how you rank among your peers</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/student/ranking")}
              >
                View Full Rankings
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingGamification ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded animate-pulse">
                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : leaderboardData && leaderboardData.entries.length > 0 ? (
              <LeaderboardWidget
                entries={leaderboardData.entries}
                maxEntries={5}
                onViewAll={() => router.push("/student/ranking")}
              />
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-muted-foreground">No rankings available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
