"use client"

import { useState, useMemo } from "react"
import { StudentLayout } from "@/components/student/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAcademicCalendar } from "@/hooks/useAcademicCalendar"
import { getCalendarCategory } from "@/lib/api/endpoints/events"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  GraduationCap,
  Trophy,
  Palette,
  Heart,
  Search,
  Plus,
  Bell,
  Star,
  TrendingUp,
  Award,
  Utensils,
  Filter,
  Download,
  Share2,
  Eye,
  Zap,
  Target,
  Loader2,
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  location?: string
  category: "academic" | "sports" | "arts" | "social" | "exam" | "club" | "food" | "workshop"
  color: string
  price?: string
  attendees?: number
  priority?: "high" | "medium" | "low"
  description?: string
}

const eventCategories = {
  academic: { color: "bg-blue-500", icon: BookOpen, label: "Academic" },
  sports: { color: "bg-green-500", icon: Trophy, label: "Sports" },
  arts: { color: "bg-purple-500", icon: Palette, label: "Arts" },
  social: { color: "bg-pink-500", icon: Heart, label: "Social" },
  exam: { color: "bg-red-500", icon: GraduationCap, label: "Exams" },
  club: { color: "bg-orange-500", icon: Users, label: "Clubs" },
  food: { color: "bg-yellow-500", icon: Utensils, label: "Food" },
  workshop: { color: "bg-indigo-500", icon: Award, label: "Workshop" },
}

const mockEvents: CalendarEvent[] = [
  {
    id: "current-1",
    title: "Math Quiz Today",
    date: new Date(), // Today
    time: "10:00 AM - 11:00 AM",
    location: "Room 201",
    category: "exam",
    color: "bg-red-500",
    priority: "high",
    description: "Important algebra quiz covering recent lessons",
    attendees: 28,
  },
  {
    id: "current-2",
    title: "Basketball Practice",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: "4:00 PM - 6:00 PM",
    location: "Gymnasium",
    category: "sports",
    color: "bg-green-500",
    priority: "medium",
    attendees: 15,
    description: "Regular basketball team practice session",
  },
  {
    id: "current-3",
    title: "Science Club Meeting",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    time: "3:00 PM - 4:30 PM",
    location: "Science Lab",
    category: "club",
    color: "bg-orange-500",
    priority: "medium",
    attendees: 20,
    description: "Weekly science club meeting and project discussion",
  },
  {
    id: "current-4",
    title: "Art Workshop",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: "2:00 PM - 5:00 PM",
    location: "Art Room",
    category: "arts",
    color: "bg-purple-500",
    priority: "low",
    attendees: 12,
    description: "Painting and drawing workshop for beginners",
  },
  {
    id: "current-5",
    title: "Student Council Meeting",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    time: "12:00 PM - 1:00 PM",
    location: "Conference Room",
    category: "social",
    color: "bg-pink-500",
    priority: "high",
    attendees: 8,
    description: "Monthly student council meeting to discuss upcoming events",
  },
  {
    id: "1",
    title: "Math Quiz - Algebra",
    date: new Date(2025, 0, 15), // January 15, 2025
    time: "10:00 AM - 11:00 AM",
    location: "Room 201",
    category: "exam",
    color: "bg-red-500",
    priority: "high",
    description: "Quarterly algebra assessment covering chapters 1-5",
    attendees: 28,
  },
  {
    id: "2",
    title: "Science Fair Exhibition",
    date: new Date(2025, 0, 20), // January 20, 2025
    time: "2:00 PM - 5:00 PM",
    location: "Main Gymnasium",
    category: "academic",
    color: "bg-blue-500",
    priority: "medium",
    attendees: 150,
    description: "Annual science fair showcasing student projects",
  },
  {
    id: "3",
    title: "Basketball Championship",
    date: new Date(2025, 0, 25), // January 25, 2025
    time: "4:00 PM - 6:00 PM",
    location: "Sports Complex",
    category: "sports",
    color: "bg-green-500",
    price: "$5.0",
    priority: "high",
    attendees: 200,
    description: "Inter-school basketball championship finals",
  },
  {
    id: "4",
    title: "Art Exhibition Opening",
    date: new Date(2025, 1, 5), // February 5, 2025
    time: "1:00 PM - 4:00 PM",
    location: "Art Gallery",
    category: "arts",
    color: "bg-purple-500",
    priority: "medium",
    attendees: 75,
    description: "Student artwork exhibition featuring paintings and sculptures",
  },
  {
    id: "5",
    title: "Valentine's Dance",
    date: new Date(2025, 1, 14), // February 14, 2025
    time: "7:00 PM - 10:00 PM",
    location: "Main Auditorium",
    category: "social",
    color: "bg-pink-500",
    price: "$15.0",
    priority: "high",
    attendees: 180,
    description: "Annual Valentine's dance with live DJ and photo booth",
  },
  {
    id: "6",
    title: "Midterm Exams Begin",
    date: new Date(2025, 1, 20), // February 20, 2025
    time: "8:00 AM - 12:00 PM",
    location: "All Classrooms",
    category: "exam",
    color: "bg-red-500",
    priority: "high",
    attendees: 300,
    description: "Second semester midterm examinations start",
  },
  {
    id: "7",
    title: "Drama Club Performance",
    date: new Date(2025, 0, 18), // January 18, 2025
    time: "7:00 PM - 9:00 PM",
    location: "Theater Room",
    category: "club",
    color: "bg-orange-500",
    priority: "medium",
    attendees: 120,
    description: "Winter play performance - Romeo and Juliet",
  },
  {
    id: "8",
    title: "Coding Workshop - Python Basics",
    date: new Date(2025, 0, 22), // January 22, 2025
    time: "2:00 PM - 4:00 PM",
    location: "Computer Lab",
    category: "workshop",
    color: "bg-indigo-500",
    priority: "medium",
    attendees: 25,
    description: "Learn Python programming fundamentals with hands-on exercises",
  },
  {
    id: "9",
    title: "Lunar New Year Celebration",
    date: new Date(2025, 0, 29), // January 29, 2025
    time: "11:00 AM - 3:00 PM",
    location: "Main Lobby",
    category: "food",
    color: "bg-yellow-500",
    price: "$3.0 - $10.0",
    priority: "medium",
    attendees: 200,
    description: "Cultural celebration with traditional food and performances",
  },
  {
    id: "10",
    title: "Music Concert Rehearsal",
    date: new Date(2025, 1, 8), // February 8, 2025
    time: "4:00 PM - 6:00 PM",
    location: "Music Hall",
    category: "arts",
    color: "bg-purple-500",
    priority: "medium",
    attendees: 35,
    description: "Final rehearsal for spring concert performance",
  },
  {
    id: "11",
    title: "Student Government Elections",
    date: new Date(2025, 1, 12), // February 12, 2025
    time: "9:00 AM - 3:00 PM",
    location: "Main Hall",
    category: "social",
    color: "bg-pink-500",
    priority: "high",
    attendees: 400,
    description: "Annual student government elections and candidate speeches",
  },
  {
    id: "12",
    title: "Career Guidance Seminar",
    date: new Date(2025, 1, 18), // February 18, 2025
    time: "10:00 AM - 12:00 PM",
    location: "Auditorium",
    category: "workshop",
    color: "bg-indigo-500",
    priority: "high",
    attendees: 150,
    description: "Professional guidance on career paths and college preparation",
  },
  {
    id: "13",
    title: "Esports Tournament Finals",
    date: new Date(2025, 0, 30), // January 30, 2025
    time: "3:00 PM - 7:00 PM",
    location: "Computer Lab",
    category: "sports",
    color: "bg-green-500",
    price: "$5.0",
    priority: "medium",
    attendees: 80,
    description: "Championship finals for the school esports league",
  },
  {
    id: "14",
    title: "College Fair",
    date: new Date(2025, 1, 15), // February 15, 2025
    time: "9:00 AM - 3:00 PM",
    location: "Main Gymnasium",
    category: "academic",
    color: "bg-blue-500",
    priority: "high",
    attendees: 300,
    description: "Meet representatives from various colleges and universities",
  },
  {
    id: "15",
    title: "Environmental Club Tree Planting",
    date: new Date(2025, 1, 22), // February 22, 2025
    time: "8:00 AM - 11:00 AM",
    location: "School Garden",
    category: "club",
    color: "bg-orange-500",
    priority: "low",
    attendees: 40,
    description: "Community service project to beautify the campus",
  },
]

export default function CalendarPage() {
  // Use real API data
  const {
    year,
    month,
    events: apiEvents,
    loading,
    previousMonth,
    nextMonth,
    goToToday,
  } = useAcademicCalendar()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [showFilters, setShowFilters] = useState(false)

  // Transform API events to match student calendar format
  const mockEvents = useMemo(() => {
    return apiEvents.map((event) => {
      const category = getCalendarCategory(event)

      // Map calendar categories to student event categories
      let studentCategory: "academic" | "sports" | "arts" | "social" | "exam" | "club" | "food" | "workshop" = "academic"
      if (category === 'holiday') studentCategory = 'social'
      else if (category === 'academic') studentCategory = 'exam'
      else if (category === 'school-event') studentCategory = 'club'
      else if (category === 'professional') studentCategory = 'workshop'

      return {
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        time: event.time || '9:00 AM',
        location: event.location,
        category: studentCategory,
        color: eventCategories[studentCategory]?.color || 'bg-blue-500',
        description: event.description,
        priority: 'medium' as const,
      }
    })
  }, [apiEvents])

  const currentDate = new Date(year, month - 1)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchTerm])

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    return filteredEvents
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 8)
  }, [filteredEvents])

  const eventStats = useMemo(() => {
    const today = new Date()
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      thisWeek: mockEvents.filter((e) => e.date >= today && e.date <= thisWeek).length,
      thisMonth: mockEvents.filter((e) => e.date >= today && e.date <= thisMonth).length,
      highPriority: mockEvents.filter((e) => e.priority === "high" && e.date >= today).length,
    }
  }, [])

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      previousMonth()
    } else {
      nextMonth()
    }
  }

  const navigateWeek = (direction: "prev" | "next") => {
    // Week navigation still uses local state for now
    // Could be enhanced to work with API in the future
    if (direction === "prev") {
      previousMonth()
    } else {
      nextMonth()
    }
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const getWeekDates = (date: Date) => {
    const weekStart = getWeekStart(date)
    const dates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      dates.push(day)
    }
    return dates
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
    const prevMonthDays = prevMonth.getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      days.push(
        <div
          key={`prev-${day}`}
          className="h-16 sm:h-20 lg:h-24 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-1 sm:p-2 text-gray-400"
        >
          <span className="text-xs sm:text-sm">{day}</span>
        </div>,
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const events = getEventsForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const hasHighPriorityEvent = events.some((e) => e.priority === "high")

      days.push(
        <div
          key={day}
          className={cn(
            "h-16 sm:h-20 lg:h-24 border border-gray-200 dark:border-gray-700 p-1 sm:p-2 cursor-pointer transition-all duration-300 relative group hover:shadow-lg hover:scale-[1.02]",
            isToday &&
              "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-sm ring-1 sm:ring-2 ring-blue-200 dark:ring-blue-800",
            isSelected &&
              "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 text-blue-900 dark:text-blue-100 shadow-lg ring-1 sm:ring-2 ring-blue-300 dark:ring-blue-600",
            hasHighPriorityEvent && "ring-1 sm:ring-2 ring-red-200 dark:ring-red-800",
            "hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30",
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-start">
            <span
              className={cn(
                "text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-110",
                isSelected && "text-blue-800 dark:text-blue-200 font-bold",
                isToday &&
                  "text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full",
              )}
            >
              {day}
            </span>
            {hasHighPriorityEvent && <Star className="w-2 h-2 sm:w-3 sm:h-3 text-red-500 fill-current animate-pulse" />}
          </div>
          <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
            {events.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={cn(
                  "p-1 sm:p-2 rounded cursor-pointer transition-all border shadow-sm hover:shadow-lg hover:scale-[1.03]",
                  event.color,
                  "text-white"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDate(currentDate)
                  setShowEventDetails(event.id)
                }}
              >
                <div className="flex items-start gap-0.5 sm:gap-1.5">
                  <Calendar className="w-2 h-2 sm:w-3.5 sm:h-3.5 mt-0.5 flex-shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] sm:text-sm font-bold leading-snug truncate">{event.title}</div>
                    {event.time && (
                      <div className="items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 opacity-90 hidden sm:flex">
                        <Clock className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="text-[9px] sm:text-xs">{event.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {events.length > 2 && (
            <div className="text-[9px] sm:text-xs text-muted-foreground text-center py-0.5 sm:py-1 bg-muted/50 rounded-md font-medium border border-border/30 mt-0.5 sm:mt-1">
              +{events.length - 2}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 rounded transition-all duration-500 pointer-events-none"></div>
        </div>,
      )
    }

    // Next month's leading days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const remainingCells = totalCells - (firstDay + daysInMonth)

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-16 sm:h-20 lg:h-24 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-1 sm:p-2 text-gray-400"
        >
          <span className="text-xs sm:text-sm">{day}</span>
        </div>,
      )
    }

    return days
  }

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate)
    const timeSlots = [
      "8:00 AM",
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
    ]

    return (
      <div className="overflow-x-auto">
        {/* Week header with dates */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 min-w-[800px]">
          <div className="p-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            Time
          </div>
          {weekDates.map((date, index) => {
            const isToday = new Date().toDateString() === date.toDateString()
            const isSelected = selectedDate?.toDateString() === date.toDateString()
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "p-4 text-center text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gradient-to-r",
                  index === 0 && "hover:from-blue-50 hover:to-blue-100",
                  index === 1 && "hover:from-green-50 hover:to-green-100",
                  index === 2 && "hover:from-purple-50 hover:to-purple-100",
                  index === 3 && "hover:from-pink-50 hover:to-pink-100",
                  index === 4 && "hover:from-yellow-50 hover:to-yellow-100",
                  index === 5 && "hover:from-indigo-50 hover:to-indigo-100",
                  index === 6 && "hover:from-red-50 hover:to-red-100",
                  "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                  isToday && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                  isSelected && "bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200",
                )}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-gray-700 dark:text-gray-300">{daysOfWeek[index].slice(0, 3)}</div>
                <div className={cn("text-lg font-bold mt-1", isToday && "text-blue-600 dark:text-blue-400")}>
                  {date.getDate()}
                </div>
                {isToday && <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>}
              </div>
            )
          })}
        </div>

        {/* Week grid with time slots */}
        <div className="min-w-[800px]">
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-800">
              <div className="p-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 border-r border-gray-200 dark:border-gray-700">
                {time}
              </div>
              {weekDates.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date).filter((event) => {
                  const eventHour = Number.parseInt(event.time.split(":")[0])
                  const slotHour =
                    time.includes("PM") && !time.includes("12:")
                      ? Number.parseInt(time.split(":")[0]) + 12
                      : Number.parseInt(time.split(":")[0])
                  return Math.abs(eventHour - slotHour) <= 1
                })

                return (
                  <div
                    key={`${date.toISOString()}-${time}`}
                    className={cn(
                      "p-2 min-h-[60px] border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer relative group",
                      dayIndex === 6 && "border-r-0",
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    {dayEvents.map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-2 rounded-md mb-1 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 cursor-pointer",
                          event.color,
                          "text-white font-medium",
                        )}
                        title={`${event.title} - ${event.time}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowEventDetails(showEventDetails === event.id ? null : event.id)
                        }}
                      >
                        <div className="truncate font-semibold">{event.title}</div>
                        <div className="text-xs opacity-90">{event.time}</div>
                        {event.location && <div className="text-xs opacity-80 truncate">{event.location}</div>}
                      </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/5 group-hover:to-purple-400/5 rounded transition-all duration-300 pointer-events-none"></div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to be last (6)
  }

  return (
    <StudentLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
              Academic Calendar
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Stay updated with important dates and events</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}
              className={cn(
                "hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-md h-9 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-initial",
                viewMode === "week" && "bg-blue-100 border-blue-300 text-blue-700",
              )}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{viewMode === "month" ? "Week View" : "Month View"}</span>
              <span className="sm:hidden">{viewMode === "month" ? "Week" : "Month"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-200 hover:scale-110 hover:shadow-md bg-transparent h-9 px-2 sm:px-3 text-xs sm:text-sm hidden sm:flex"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 hover:scale-110 bg-transparent hover:shadow-md h-9 px-2 sm:px-3 text-xs sm:text-sm hidden lg:flex"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">This Week</p>
                  <p className="text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform">{eventStats.thisWeek}</p>
                  <p className="text-[10px] sm:text-xs text-blue-200 mt-1">Events</p>
                </div>
                <div className="relative">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">This Month</p>
                  <p className="text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform">
                    {eventStats.thisMonth}
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-200 mt-1">Events</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-200 group-hover:translate-y-1 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs sm:text-sm">High Priority</p>
                  <p className="text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform">
                    {eventStats.highPriority}
                  </p>
                  <p className="text-[10px] sm:text-xs text-red-200 mt-1">Important</p>
                </div>
                <div className="relative">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-red-200 group-hover:animate-bounce" />
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Categories</p>
                  <p className="text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform">
                    {Object.keys(eventCategories).length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-200 mt-1">Types</p>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-3 sm:pb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (viewMode === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-110 hover:shadow-md flex-shrink-0"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer truncate flex-1">
                    {viewMode === "month"
                      ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                      : (() => {
                          const weekStart = getWeekStart(currentDate)
                          const weekEnd = new Date(weekStart)
                          weekEnd.setDate(weekStart.getDate() + 6)
                          return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${
                            weekStart.getMonth() !== weekEnd.getMonth() ? `${monthNames[weekEnd.getMonth()]} ` : ""
                          }${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
                        })()}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (viewMode === "month" ? navigateMonth("next") : navigateWeek("next"))}
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-110 hover:shadow-md flex-shrink-0"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                {/* Enhanced Quick Action Buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 bg-transparent hover:scale-105 transition-all duration-200 hover:shadow-md h-8 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-initial hidden sm:flex"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden md:inline">Add Event</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 bg-transparent hover:scale-105 transition-all duration-200 hover:shadow-md h-8 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-initial hidden sm:flex"
                  >
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden lg:inline">Reminders</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="hover:bg-purple-50 bg-transparent hover:scale-105 transition-all duration-200 hover:shadow-md h-8 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-initial"
                  >
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {viewMode === "month" ? (
                  <>
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                      {daysOfWeek.map((day, index) => (
                        <div
                          key={day}
                          className={cn(
                            "p-2 sm:p-3 lg:p-4 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gradient-to-r",
                            index === 0 && "hover:from-blue-50 hover:to-blue-100",
                            index === 1 && "hover:from-green-50 hover:to-green-100",
                            index === 2 && "hover:from-purple-50 hover:to-purple-100",
                            index === 3 && "hover:from-pink-50 hover:to-pink-100",
                            index === 4 && "hover:from-yellow-50 hover:to-yellow-100",
                            index === 5 && "hover:from-indigo-50 hover:to-indigo-100",
                            index === 6 && "hover:from-red-50 hover:to-red-100",
                            "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                          )}
                        >
                          <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                          <span className="sm:hidden">{day.slice(0, 1)}</span>
                        </div>
                      ))}
                    </div>
                    {/* Calendar grid with loading overlay */}
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-card p-3 rounded-lg shadow-lg border">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Loading events...</span>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-7">{renderCalendarDays()}</div>
                    </div>
                  </>
                ) : (
                  /* Week view */
                  <div className="transition-all duration-500 ease-in-out">{renderWeekView()}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event List Sidebar */}
          <div className="space-y-3 sm:space-y-4">
            {/* Enhanced Search and Filter Controls */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="relative group">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 text-sm"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(eventCategories).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory("exam")}
                    className="text-[10px] sm:text-xs hover:bg-red-50 hover:border-red-300 hover:scale-105 transition-all duration-200 h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Exams</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory("sports")}
                    className="text-[10px] sm:text-xs hover:bg-green-50 hover:border-green-300 hover:scale-105 transition-all duration-200 h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Sports</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory("social")}
                    className="text-[10px] sm:text-xs hover:bg-pink-50 hover:border-pink-300 hover:scale-105 transition-all duration-200 h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Social</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="relative">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  Upcoming Events
                  <Badge variant="secondary" className="ml-auto hover:scale-110 transition-transform cursor-pointer text-xs">
                    {upcomingEvents.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto p-3 sm:p-6">
                {upcomingEvents.map((event, index) => {
                  const CategoryIcon = eventCategories[event.category].icon
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                        "hover:shadow-lg hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600",
                        "animate-in slide-in-from-right-5 duration-300",
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setShowEventDetails(showEventDetails === event.id ? null : event.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/50 transition-all duration-500 rounded-lg"></div>

                      <div className="flex items-start gap-2 sm:gap-3 relative z-10">
                        <div
                          className={cn(
                            "w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1.5 sm:mt-2 transition-all duration-300 flex-shrink-0",
                            "group-hover:scale-150 group-hover:shadow-lg",
                            event.color,
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <h4 className="font-medium text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </h4>
                            {event.priority === "high" && (
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 fill-current animate-pulse flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 group-hover:text-gray-700 transition-colors">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span>{event.date.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 transition-colors">
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 transition-colors">
                              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {event.attendees && (
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 transition-colors">
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              <span>{event.attendees} attending</span>
                            </div>
                          )}
                          <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                            {event.price && (
                              <Badge variant="secondary" className="text-[9px] sm:text-xs hover:scale-110 transition-transform h-5 sm:h-auto px-1.5 sm:px-2">
                                {event.price}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[9px] sm:text-xs hover:scale-110 transition-transform h-5 sm:h-auto px-1.5 sm:px-2">
                              <CategoryIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                              <span className="hidden sm:inline">{eventCategories[event.category].label}</span>
                            </Badge>
                          </div>
                          {/* Expandable Event Details */}
                          {showEventDetails === event.id && event.description && (
                            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 animate-in slide-in-from-top-2 duration-300 border-l-2 sm:border-l-4 border-blue-400">
                              <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">Event Details:</p>
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
