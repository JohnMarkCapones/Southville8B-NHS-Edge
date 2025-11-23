"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAcademicCalendar } from "@/hooks/useAcademicCalendar"
import { getCalendarCategory } from "@/lib/api/endpoints/events"
import {
  Calendar,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  CalendarDays,
  Timer,
  Filter,
  MapPin,
  Users,
  BookOpen,
  Sparkles,
  Star,
  Bell,
  Loader2,
} from "lucide-react"

const initialScheduleData = [
  {
    id: "SCH001",
    title: "Mathematics - Algebra",
    subject: "Mathematics",
    grade: "Grade 8-A",
    section: "Einstein",
    time: "08:00 - 09:00",
    room: "Room 101",
    students: 32,
    type: "class",
    status: "scheduled",
    date: "2024-01-22",
    recurring: "weekly",
    description: "Introduction to algebraic expressions and equations",
    category: "academic",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "high",
  },
  {
    id: "SCH002",
    title: "Science - Chemistry Lab",
    subject: "Science",
    grade: "Grade 8-B",
    section: "Newton",
    time: "09:15 - 10:45",
    room: "Lab 201",
    students: 28,
    type: "lab",
    status: "in-progress",
    date: "2024-01-22",
    recurring: "weekly",
    description: "Hands-on chemistry experiments with safety protocols",
    category: "academic",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    priority: "medium",
  },
  {
    id: "SCH003",
    title: "Parent-Teacher Conference",
    subject: "General",
    grade: "All Grades",
    section: "All",
    time: "14:00 - 16:00",
    room: "Conference Room",
    students: 0,
    type: "meeting",
    status: "scheduled",
    date: "2024-01-22",
    recurring: "none",
    description: "Quarterly parent-teacher conference meetings",
    category: "meeting",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    priority: "high",
  },
  {
    id: "SCH004",
    title: "English - Literature Discussion",
    subject: "English",
    grade: "Grade 8-C",
    section: "Darwin",
    time: "10:00 - 11:00",
    room: "Room 103",
    students: 30,
    type: "class",
    status: "completed",
    date: "2024-01-21",
    recurring: "weekly",
    description: "Analysis of contemporary Filipino literature",
    category: "academic",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    priority: "medium",
  },
  {
    id: "SCH005",
    title: "Faculty Meeting",
    subject: "Administrative",
    grade: "Faculty",
    section: "All",
    time: "16:00 - 17:00",
    room: "Faculty Lounge",
    students: 0,
    type: "meeting",
    status: "scheduled",
    date: "2024-01-23",
    recurring: "monthly",
    description: "Monthly faculty meeting and updates",
    category: "meeting",
    color: "bg-gradient-to-r from-teal-500 to-teal-600",
    priority: "high",
  },
  {
    id: "SCH006",
    title: "Basketball Practice",
    subject: "Physical Education",
    grade: "Grade 8",
    section: "All",
    time: "15:00 - 16:30",
    room: "Gymnasium",
    students: 20,
    type: "activity",
    status: "scheduled",
    date: "2024-01-24",
    recurring: "weekly",
    description: "Basketball team practice session",
    category: "sports",
    color: "bg-gradient-to-r from-green-600 to-green-700",
    priority: "medium",
  },
  {
    id: "SCH007",
    title: "Art Workshop",
    subject: "Arts",
    grade: "Grade 8",
    section: "All",
    time: "13:00 - 14:30",
    room: "Art Room",
    students: 15,
    type: "workshop",
    status: "scheduled",
    date: "2024-01-25",
    recurring: "none",
    description: "Creative arts workshop for students",
    category: "arts",
    color: "bg-gradient-to-r from-pink-500 to-pink-600",
    priority: "low",
  },
]

const eventCategories = {
  all: { label: "All Events", color: "bg-gray-500", icon: Calendar },
  academic: { label: "Academic", color: "bg-blue-500", icon: BookOpen },
  meeting: { label: "Meetings", color: "bg-orange-500", icon: Users },
  sports: { label: "Sports", color: "bg-green-500", icon: Timer },
  arts: { label: "Arts", color: "bg-pink-500", icon: Sparkles },
  workshop: { label: "Workshops", color: "bg-purple-500", icon: Star },
}

const timeSlots = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const getFirstDayOfMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
}

const getEventsForDate = (date: Date, events: any[]) => {
  return events.filter((event) => {
    const eventDate = new Date(event.date)
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    )
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200 shadow-sm dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/50 dark:shadow-blue-900/20"
    case "in-progress":
      return "bg-green-50 text-green-700 border-green-200 shadow-sm animate-pulse dark:bg-green-950/40 dark:text-green-200 dark:border-green-800/50 dark:shadow-green-900/20"
    case "completed":
      return "bg-gray-50 text-gray-600 border-gray-200 shadow-sm dark:bg-gray-900/60 dark:text-gray-300 dark:border-gray-700/50 dark:shadow-gray-900/30"
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200 shadow-sm dark:bg-red-950/40 dark:text-red-200 dark:border-red-800/50 dark:shadow-red-900/20"
    default:
      return "bg-gray-50 text-gray-600 border-gray-200 shadow-sm dark:bg-gray-900/60 dark:text-gray-300 dark:border-gray-700/50 dark:shadow-gray-900/30"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "scheduled":
      return <Calendar className="w-4 h-4" />
    case "in-progress":
      return <Clock className="w-4 h-4 animate-spin" />
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "cancelled":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-l-4 border-red-500 dark:border-red-400 dark:shadow-red-500/20"
    case "medium":
      return "border-l-4 border-yellow-500 dark:border-yellow-400 dark:shadow-yellow-500/20"
    case "low":
      return "border-l-4 border-green-500 dark:border-green-400 dark:shadow-green-500/20"
    default:
      return "border-l-4 border-gray-300 dark:border-gray-500 dark:shadow-gray-500/20"
  }
}

export default function SchedulePage() {
  // Use real API data from Academic Calendar
  const {
    year,
    month,
    events: apiEvents,
    loading,
    previousMonth,
    nextMonth,
    goToToday,
  } = useAcademicCalendar()

  const [activeTab, setActiveTab] = useState("calendar")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState("month")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [draggedEvent, setDraggedEvent] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [animatingEvents, setAnimatingEvents] = useState<Set<string>>(new Set())

  const [scheduleData, setScheduleData] = useState(initialScheduleData)
  const { toast } = useToast()

  // Transform API events to match teacher schedule format
  const transformedApiEvents = useMemo(() => {
    return apiEvents.map((event) => {
      const category = getCalendarCategory(event)

      // Map calendar categories to teacher schedule categories
      let teacherCategory: "academic" | "meeting" | "sports" | "arts" | "workshop" = "academic"
      if (category === 'holiday') teacherCategory = 'meeting'
      else if (category === 'academic') teacherCategory = 'academic'
      else if (category === 'school-event') teacherCategory = 'meeting'
      else if (category === 'professional') teacherCategory = 'workshop'

      return {
        id: event.id,
        title: event.title,
        subject: "General",
        grade: "All Grades",
        section: "All",
        time: event.time || '9:00 AM - 10:00 AM',
        room: event.location || "TBA",
        students: 0,
        type: "meeting" as const,
        status: "scheduled" as const,
        date: new Date(event.date).toISOString().split('T')[0],
        recurring: "none" as const,
        description: event.description || "",
        category: teacherCategory,
        color: eventCategories[teacherCategory]?.color || "bg-gradient-to-r from-gray-500 to-gray-600",
        priority: 'medium' as const,
      }
    })
  }, [apiEvents])

  // Merge API events with local schedule data
  const allEvents = useMemo(() => {
    return [...transformedApiEvents, ...scheduleData]
  }, [transformedApiEvents, scheduleData])

  const currentDate = new Date(year, month - 1)

  const [newEvent, setNewEvent] = useState({
    title: "",
    subject: "",
    grade: "",
    section: "",
    date: "",
    startTime: "",
    endTime: "",
    room: "",
    type: "class",
    recurring: "none",
    description: "",
    reminder: true,
    priority: "medium",
    category: "academic",
  })

  const tabs = [
    { id: "calendar", label: "Calendar View", icon: Calendar },
    { id: "schedule", label: "My Schedule", icon: CalendarDays },
    { id: "upcoming", label: "Upcoming Events", icon: Clock },
    { id: "analytics", label: "Time Analytics", icon: Timer },
  ]

  const filteredEvents = allEvents.filter(
    (event) => selectedCategory === "all" || event.category === selectedCategory,
  )

  const handleEventDrop = (eventId: string, newDate: Date, newTime?: string) => {
    const eventBeingMoved = scheduleData.find((event) => event.id === eventId)

    setScheduleData((prevData) =>
      prevData.map((event) => {
        if (event.id === eventId) {
          const updatedEvent = { ...event }

          // Use local date formatting instead of toISOString to prevent timezone shifts
          const year = newDate.getFullYear()
          const month = String(newDate.getMonth() + 1).padStart(2, "0")
          const day = String(newDate.getDate()).padStart(2, "0")
          updatedEvent.date = `${year}-${month}-${day}`

          // Update time if provided (for week/day view)
          if (newTime) {
            const [startTime] = event.time.split(" - ")
            const [hours, minutes] = startTime.split(":")
            const duration = Number.parseInt(hours) * 60 + Number.parseInt(minutes)
            const [newHours, newMinutes] = newTime.split(":")
            const newStartMinutes = Number.parseInt(newHours) * 60 + Number.parseInt(newMinutes)
            const endMinutes = newStartMinutes + 60 // Default 1 hour duration

            const formatTime = (totalMinutes: number) => {
              const h = Math.floor(totalMinutes / 60)
              const m = totalMinutes % 60
              return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
            }

            updatedEvent.time = `${newTime} - ${formatTime(endMinutes)}`
          }

          return updatedEvent
        }
        return event
      }),
    )

    if (eventBeingMoved) {
      const formattedDate = newDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      toast({
        title: "Event Moved Successfully",
        description: `"${eventBeingMoved.title}" has been moved to ${formattedDate}${newTime ? ` at ${newTime}` : ""}`,
        variant: "success",
        duration: 4000,
      })
    }
  }

  const renderMonthCalendar = () => {
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
          className="h-32 border border-gray-200/50 bg-gray-50/30 p-2 text-gray-400 transition-all duration-200 dark:border-gray-700/30 dark:bg-gray-900/20 dark:text-gray-600"
        >
          <span className="text-sm font-medium">{day}</span>
        </div>,
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const events = getEventsForDate(date, filteredEvents)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const cellKey = `${date.getFullYear()}-${date.getMonth()}-${day}`

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200/50 p-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-blue-50/50 dark:border-gray-700/30 dark:hover:bg-blue-900/30 dark:hover:shadow-blue-900/20 ${
            isToday
              ? "bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200 dark:bg-blue-950/50 dark:border-blue-600/70 dark:ring-blue-700/50 dark:shadow-blue-900/30"
              : "dark:bg-gray-900/10"
          } ${isSelected ? "bg-blue-100 border-blue-400 shadow-lg dark:bg-blue-900/40 dark:border-blue-500/70 dark:shadow-blue-900/40" : ""} ${
            hoveredCell === cellKey && isDragging
              ? "bg-green-50 border-green-300 ring-2 ring-green-200 dark:bg-green-950/40 dark:border-green-600/70 dark:ring-green-700/50 dark:shadow-green-900/30"
              : ""
          }`}
          onClick={() => setSelectedDate(date)}
          onDragOver={(e) => {
            e.preventDefault()
            setHoveredCell(cellKey)
          }}
          onDragLeave={() => setHoveredCell(null)}
          onDrop={(e) => {
            e.preventDefault()
            if (draggedEvent) {
              setAnimatingEvents((prev) => new Set([...prev, draggedEvent.id]))
              setTimeout(() => {
                setAnimatingEvents((prev) => {
                  const newSet = new Set(prev)
                  newSet.delete(draggedEvent.id)
                  return newSet
                })
              }, 500)
              handleEventDrop(draggedEvent.id, date)
              setDraggedEvent(null)
              setIsDragging(false)
              setHoveredCell(null)
            }
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span
              className={`text-sm font-semibold ${isToday ? "text-blue-700 dark:text-blue-200" : "text-gray-700 dark:text-gray-200"}`}
            >
              {day}
            </span>
            {events.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1 py-0 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-600/50"
              >
                {events.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1 overflow-hidden">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-2 rounded-lg cursor-move transition-all duration-300 hover:scale-105 hover:shadow-md ${event.color} text-white ${getPriorityColor(event.priority)} ${
                  animatingEvents.has(event.id) ? "animate-bounce" : ""
                }`}
                draggable
                onDragStart={(e) => {
                  setDraggedEvent(event)
                  setIsDragging(true)
                  e.dataTransfer.effectAllowed = "move"
                }}
                onDragEnd={() => {
                  setDraggedEvent(null)
                  setIsDragging(false)
                  setHoveredCell(null)
                }}
                title={`${event.title} - ${event.time} at ${event.room}`}
              >
                <div className="font-semibold truncate flex items-center gap-1">
                  {event.priority === "high" && <Bell className="w-3 h-3" />}
                  {event.title}
                </div>
                <div className="text-xs opacity-90 truncate">{event.time}</div>
                <div className="text-xs opacity-75 truncate flex items-center gap-1">
                  <MapPin className="w-2 h-2" />
                  {event.room}
                </div>
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium hover:bg-gray-200 transition-colors cursor-pointer dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600">
                +{events.length - 3} more events
              </div>
            )}
          </div>
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
          className="h-32 border border-gray-200/50 bg-gray-50/30 p-2 text-gray-400 transition-all duration-200 dark:border-gray-700/30 dark:bg-gray-900/20 dark:text-gray-600"
        >
          <span className="text-sm font-medium">{day}</span>
        </div>,
      )
    }

    return days
  }

  const renderWeekView = () => {
    return (
      <div className="space-y-2">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-sm font-semibold text-gray-600 p-3 text-center dark:text-gray-400">Time</div>
          {weekDays.map((day, index) => {
            const date = new Date(currentDate)
            date.setDate(currentDate.getDate() - currentDate.getDay() + index + 1)
            const isToday = new Date().toDateString() === date.toDateString()

            return (
              <div
                key={day}
                className={`text-sm font-semibold p-3 text-center rounded-lg transition-all duration-200 ${
                  isToday
                    ? "bg-blue-100 text-blue-700 shadow-md dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <div>{day}</div>
                <div className="text-xs font-normal mt-1">{date.getDate()}</div>
              </div>
            )
          })}
        </div>

        {/* Time Slots */}
        <div className="space-y-1">
          {timeSlots.slice(2, 18).map((time) => (
            <div key={time} className="grid grid-cols-8 gap-2 min-h-[80px]">
              <div className="text-xs font-medium text-gray-500 p-3 border-r border-gray-200 bg-gray-50/50 rounded-l-lg flex items-center justify-center dark:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
                const date = new Date(currentDate)
                date.setDate(currentDate.getDate() - currentDate.getDay() + dayIndex + 1)

                const dayEvents = filteredEvents.filter((event) => {
                  const eventDate = new Date(event.date)
                  const eventTime = event.time.split(" - ")[0]
                  return eventDate.toDateString() === date.toDateString() && eventTime === time
                })
                const cellKey = `${day}-${time}`

                return (
                  <div
                    key={cellKey}
                    className={`p-2 border border-gray-200 rounded-lg hover:bg-blue-50/50 transition-all duration-200 hover:shadow-sm dark:border-gray-700 dark:hover:bg-blue-900/20 ${
                      hoveredCell === cellKey && isDragging
                        ? "bg-green-50 border-green-300 ring-2 ring-green-200 dark:bg-green-900/30 dark:border-green-600 dark:ring-green-700"
                        : ""
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setHoveredCell(cellKey)
                    }}
                    onDragLeave={() => setHoveredCell(null)}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (draggedEvent) {
                        setAnimatingEvents((prev) => new Set([...prev, draggedEvent.id]))
                        setTimeout(() => {
                          setAnimatingEvents((prev) => {
                            const newSet = new Set(prev)
                            newSet.delete(draggedEvent.id)
                            return newSet
                          })
                        }, 500)
                        handleEventDrop(draggedEvent.id, date, time)
                        setDraggedEvent(null)
                        setIsDragging(false)
                        setHoveredCell(null)
                      }
                    }}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-3 rounded-lg cursor-move transition-all duration-300 hover:scale-105 hover:shadow-lg ${event.color} text-white ${getPriorityColor(event.priority)} ${
                          animatingEvents.has(event.id) ? "animate-pulse" : ""
                        }`}
                        draggable
                        onDragStart={() => {
                          setDraggedEvent(event)
                          setIsDragging(true)
                        }}
                        onDragEnd={() => {
                          setDraggedEvent(null)
                          setIsDragging(false)
                          setHoveredCell(null)
                        }}
                      >
                        <div className="font-semibold truncate flex items-center gap-1">
                          {event.priority === "high" && <Bell className="w-3 h-3" />}
                          {event.title}
                        </div>
                        <div className="text-xs opacity-90 truncate flex items-center gap-1 mt-1">
                          <MapPin className="w-2 h-2" />
                          {event.room}
                        </div>
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <Users className="w-2 h-2" />
                          {event.students} students
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate, filteredEvents)

    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-sm text-blue-600 mt-1 dark:text-blue-400">{dayEvents.length} events scheduled</p>
        </div>

        <div className="space-y-2">
          {timeSlots.slice(2, 18).map((time) => {
            const timeEvents = dayEvents.filter((event) => {
              const eventTime = event.time.split(" - ")[0]
              return eventTime === time
            })

            return (
              <div key={time} className="flex gap-4 min-h-[100px]">
                <div className="w-20 text-sm font-medium text-gray-500 p-4 bg-gray-50 rounded-lg flex items-center justify-center dark:text-gray-400 dark:bg-gray-800">
                  {time}
                </div>
                <div
                  className={`flex-1 p-4 border-2 border-dashed border-gray-200 rounded-lg transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/30 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 ${
                    hoveredCell === time && isDragging
                      ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/30"
                      : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setHoveredCell(time)
                  }}
                  onDragLeave={() => setHoveredCell(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedEvent) {
                      setAnimatingEvents((prev) => new Set([...prev, draggedEvent.id]))
                      setTimeout(() => {
                        setAnimatingEvents((prev) => {
                          const newSet = new Set(prev)
                          newSet.delete(draggedEvent.id)
                          return newSet
                        })
                      }, 500)
                      handleEventDrop(draggedEvent.id, selectedDate, time)
                      setDraggedEvent(null)
                      setIsDragging(false)
                      setHoveredCell(null)
                    }
                  }}
                >
                  {timeEvents.length === 0 ? (
                    <div className="text-gray-400 text-center py-8 dark:text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {timeEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-xl cursor-move transition-all duration-300 hover:scale-105 hover:shadow-xl ${event.color} text-white ${getPriorityColor(event.priority)} ${
                            animatingEvents.has(event.id) ? "animate-bounce" : ""
                          }`}
                          draggable
                          onDragStart={() => {
                            setDraggedEvent(event)
                            setIsDragging(true)
                          }}
                          onDragEnd={() => {
                            setDraggedEvent(null)
                            setIsDragging(false)
                            setHoveredCell(null)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              {event.priority === "high" && <Bell className="w-4 h-4" />}
                              {event.title}
                            </h4>
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              {event.type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm opacity-90">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.room}
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {event.subject}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {event.students} students
                            </div>
                          </div>
                          {event.description && <p className="text-sm opacity-80 mt-2 italic">{event.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const handleCreateEvent = () => {
    const eventId = `SCH${String(scheduleData.length + 1).padStart(3, "0")}`
    const newEventData = {
      id: eventId,
      title: newEvent.title,
      subject: newEvent.subject,
      grade: newEvent.grade,
      section: newEvent.section,
      time: `${newEvent.startTime} - ${newEvent.endTime}`,
      room: newEvent.room,
      students: 0,
      type: newEvent.type,
      status: "scheduled",
      date: newEvent.date,
      recurring: newEvent.recurring,
      description: newEvent.description,
      category: newEvent.category,
      color:
        eventCategories[newEvent.category as keyof typeof eventCategories]?.color ||
        "bg-gradient-to-r from-gray-500 to-gray-600",
      priority: newEvent.priority,
    }

    setScheduleData((prev) => [...prev, newEventData])

    const eventDate = new Date(newEvent.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    toast({
      title: "Event Created Successfully",
      description: `"${newEvent.title}" has been scheduled for ${eventDate} from ${newEvent.startTime} to ${newEvent.endTime}`,
      variant: "success",
      duration: 5000,
    })

    setNewEvent({
      title: "",
      subject: "",
      grade: "",
      section: "",
      date: "",
      startTime: "",
      endTime: "",
      room: "",
      type: "class",
      recurring: "none",
      description: "",
      reminder: true,
      priority: "medium",
      category: "academic",
    })
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 min-h-screen dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 dark:bg-gradient-to-br">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300">
            Schedule Management
          </h1>
          <p className="text-gray-600 flex items-center gap-2 dark:text-gray-300">
            <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            Manage your classes, meetings, and events with style
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-900/80 dark:border-gray-700/50 dark:shadow-gray-900/20 dark:hover:shadow-gray-800/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">📅 Month</SelectItem>
              <SelectItem value="week">📊 Week</SelectItem>
              <SelectItem value="day">🗓️ Day</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900/95 dark:border-gray-700/50 dark:shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Create New Event
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Fill in the details below to create a new event in your schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="dark:text-gray-200">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g., Mathematics - Algebra"
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="dark:text-gray-200">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="dark:text-gray-200">
                    Grade Level
                  </Label>
                  <Select value={newEvent.grade} onValueChange={(value) => setNewEvent({ ...newEvent, grade: value })}>
                    <SelectTrigger className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 7">Grade 7</SelectItem>
                      <SelectItem value="Grade 8">Grade 8</SelectItem>
                      <SelectItem value="Grade 9">Grade 9</SelectItem>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section" className="dark:text-gray-200">
                    Section
                  </Label>
                  <Input
                    id="section"
                    value={newEvent.section}
                    onChange={(e) => setNewEvent({ ...newEvent, section: e.target.value })}
                    placeholder="e.g., Einstein"
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="dark:text-gray-200">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room" className="dark:text-gray-200">
                    Room/Location
                  </Label>
                  <Input
                    id="room"
                    value={newEvent.room}
                    onChange={(e) => setNewEvent({ ...newEvent, room: e.target.value })}
                    placeholder="e.g., Room 101"
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="dark:text-gray-200">
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="dark:text-gray-200">
                    End Time *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="dark:text-gray-200">
                    Event Type
                  </Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                    <SelectTrigger className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="dark:text-gray-200">
                    Category
                  </Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="dark:text-gray-200">
                    Priority
                  </Label>
                  <Select
                    value={newEvent.priority}
                    onValueChange={(value) => setNewEvent({ ...newEvent, priority: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurring" className="dark:text-gray-200">
                    Recurring
                  </Label>
                  <Select
                    value={newEvent.recurring}
                    onValueChange={(value) => setNewEvent({ ...newEvent, recurring: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="dark:text-gray-200">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Brief description of the event..."
                    className="dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ... existing tab navigation ... */}

      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            {/* Enhanced sidebar with better styling */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-900/80 dark:border-gray-700/50 dark:shadow-gray-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>

            {/* Enhanced mini calendar */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-900/80 dark:border-gray-700/50 dark:shadow-gray-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-100 transition-colors duration-200 dark:hover:bg-blue-900/30"
                    onClick={previousMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-100 transition-colors duration-200 dark:hover:bg-blue-900/30"
                    onClick={nextMonth}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="font-semibold text-gray-600 p-2 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6)
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                    const isToday = new Date().toDateString() === date.toDateString()
                    const hasEvents = getEventsForDate(date, filteredEvents).length > 0

                    return (
                      <button
                        key={i}
                        className={`p-2 text-xs rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-110 dark:hover:bg-blue-900/30 ${
                          !isCurrentMonth ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"
                        } ${isToday ? "bg-blue-500 text-white shadow-md dark:bg-blue-600" : ""} ${
                          hasEvents ? "font-bold ring-2 ring-blue-200 dark:ring-blue-700" : ""
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced event filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-900/80 dark:border-gray-700/50 dark:shadow-gray-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Filter className="w-4 h-4 text-purple-500" />
                  Event Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(eventCategories).map(([key, category]) => {
                  const IconComponent = category.icon
                  return (
                    <div
                      key={key}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 dark:hover:bg-gray-700/50"
                    >
                      <Checkbox
                        id={key}
                        checked={selectedCategory === "all" || selectedCategory === key}
                        onCheckedChange={(checked) => {
                          setSelectedCategory(checked ? key : "all")
                        }}
                        className="data-[state=checked]:bg-blue-500"
                      />
                      <div className={`w-4 h-4 rounded-full ${category.color} flex items-center justify-center`}>
                        <IconComponent className="w-2 h-2 text-white" />
                      </div>
                      <label
                        htmlFor={key}
                        className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300"
                      >
                        {category.label}
                      </label>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-900/80 dark:border-gray-700/50 dark:shadow-gray-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 transition-colors duration-200 bg-transparent dark:hover:bg-blue-900/30"
                    onClick={() => {
                      if (viewMode === "month") {
                        previousMonth()
                      } else if (viewMode === "week") {
                        // Week navigation - use API navigation
                        previousMonth()
                      } else {
                        // Day navigation - local state
                        setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {viewMode === "month"
                      ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                      : viewMode === "week"
                        ? `${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(
                            currentDate.getTime() + 6 * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 transition-colors duration-200 bg-transparent dark:hover:bg-blue-900/30"
                    onClick={() => {
                      if (viewMode === "month") {
                        nextMonth()
                      } else if (viewMode === "week") {
                        // Week navigation - use API navigation
                        nextMonth()
                      } else {
                        // Day navigation - local state
                        setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))
                      }
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    className={
                      viewMode === "month"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    }
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    className={
                      viewMode === "week"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    }
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "outline"}
                    size="sm"
                    className={
                      viewMode === "day"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    }
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {viewMode === "month" && (
                  <>
                    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                          key={day}
                          className="p-4 text-center text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:text-gray-300 dark:from-gray-800 dark:to-gray-700"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-card p-3 rounded-lg shadow-lg border">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Loading events...</span>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-7">{renderMonthCalendar()}</div>
                    </div>
                  </>
                )}

                {viewMode === "week" && <div className="p-4">{renderWeekView()}</div>}

                {viewMode === "day" && <div className="p-4">{renderDayView()}</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ... existing other tab content ... */}

      <Toaster />
    </div>
  )
}
