"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Bell,
  Clock,
  Plus,
  BookOpen,
  GraduationCap,
  Trophy,
  Users,
  AlertCircle,
  MapPin,
  CalendarDays,
  Coffee,
  Music,
  Heart,
  Star,
  Sparkles,
  PartyPopper,
  Briefcase,
  Zap,
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  category:
    | "academic"
    | "holiday"
    | "meeting"
    | "sports"
    | "exam"
    | "registration"
    | "deadline"
    | "celebration"
    | "break"
    | "orientation"
    | "workshop"
    | "club"
    | "volunteer"
  description?: string
  location?: string
  time?: string
  color: string
  priority?: "high" | "medium" | "low"
}

const eventCategories = {
  academic: { label: "Academic", color: "bg-gradient-to-r from-blue-500 to-blue-600", icon: BookOpen },
  holiday: { label: "Holiday", color: "bg-gradient-to-r from-green-500 to-emerald-600", icon: Calendar },
  meeting: { label: "Meeting", color: "bg-gradient-to-r from-purple-500 to-violet-600", icon: Users },
  sports: { label: "Sports", color: "bg-gradient-to-r from-orange-500 to-red-500", icon: Trophy },
  exam: { label: "Exam", color: "bg-gradient-to-r from-red-500 to-pink-600", icon: GraduationCap },
  registration: { label: "Registration", color: "bg-gradient-to-r from-cyan-500 to-teal-600", icon: CalendarDays },
  deadline: { label: "Deadline", color: "bg-gradient-to-r from-yellow-500 to-amber-600", icon: AlertCircle },
  celebration: { label: "Celebration", color: "bg-gradient-to-r from-pink-500 to-rose-600", icon: PartyPopper },
  break: { label: "Break", color: "bg-gradient-to-r from-indigo-500 to-purple-600", icon: Coffee },
  orientation: { label: "Orientation", color: "bg-gradient-to-r from-emerald-500 to-green-600", icon: Briefcase },
  workshop: { label: "Workshop", color: "bg-gradient-to-r from-violet-500 to-purple-600", icon: Zap },
  club: { label: "Club Activity", color: "bg-gradient-to-r from-rose-500 to-pink-600", icon: Users },
  volunteer: { label: "Volunteer", color: "bg-gradient-to-r from-teal-500 to-cyan-600", icon: Heart },
}

const mockEvents: CalendarEvent[] = [
  // August 1, 2025
  {
    id: "aug1",
    title: "Summer School Final Exams Begin",
    date: new Date(2025, 7, 1),
    category: "exam",
    description: "Final examination period for summer school courses",
    location: "Classrooms A-F",
    time: "8:00 AM - 12:00 PM",
    color: "bg-gradient-to-r from-red-500 to-pink-600",
    priority: "high",
  },
  // August 2, 2025
  {
    id: "aug2",
    title: "Teacher Professional Development",
    date: new Date(2025, 7, 2),
    category: "workshop",
    description: "Faculty training on new curriculum standards",
    location: "Main Conference Room",
    time: "9:00 AM - 4:00 PM",
    color: "bg-gradient-to-r from-violet-500 to-purple-600",
    priority: "medium",
  },
  // August 3, 2025
  {
    id: "aug3",
    title: "School Supply Drive",
    date: new Date(2025, 7, 3),
    category: "volunteer",
    description: "Community donation drive for school supplies",
    location: "Main Lobby",
    time: "10:00 AM - 3:00 PM",
    color: "bg-gradient-to-r from-teal-500 to-cyan-600",
    priority: "medium",
  },
  // August 4, 2025
  {
    id: "aug4",
    title: "Summer Reading Program Finale",
    date: new Date(2025, 7, 4),
    category: "celebration",
    description: "Celebration of summer reading achievements",
    location: "Library",
    time: "2:00 PM - 4:00 PM",
    color: "bg-gradient-to-r from-pink-500 to-rose-600",
    priority: "medium",
  },
  // August 5, 2025
  {
    id: "aug5",
    title: "Facility Maintenance Day",
    date: new Date(2025, 7, 5),
    category: "academic",
    description: "Campus-wide maintenance and preparation",
    location: "Entire Campus",
    time: "7:00 AM - 5:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "low",
  },
  // August 6, 2025
  {
    id: "aug6",
    title: "New Student Registration Opens",
    date: new Date(2025, 7, 6),
    category: "registration",
    description: "Online registration portal opens for new students",
    location: "Online Portal",
    time: "8:00 AM",
    color: "bg-gradient-to-r from-cyan-500 to-teal-600",
    priority: "high",
  },
  // August 7, 2025
  {
    id: "aug7",
    title: "Parent Information Session",
    date: new Date(2025, 7, 7),
    category: "meeting",
    description: "Information session for parents of new students",
    location: "Main Auditorium",
    time: "6:00 PM - 8:00 PM",
    color: "bg-gradient-to-r from-purple-500 to-violet-600",
    priority: "medium",
  },
  // August 8, 2025
  {
    id: "aug8",
    title: "Technology Setup Workshop",
    date: new Date(2025, 7, 8),
    category: "workshop",
    description: "Help students set up school technology accounts",
    location: "Computer Lab",
    time: "10:00 AM - 2:00 PM",
    color: "bg-gradient-to-r from-violet-500 to-purple-600",
    priority: "medium",
  },
  // August 9, 2025
  {
    id: "aug9",
    title: "Yearbook Photo Retakes",
    date: new Date(2025, 7, 9),
    category: "academic",
    description: "Makeup day for yearbook photos",
    location: "Photography Studio",
    time: "9:00 AM - 3:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "low",
  },
  // August 10, 2025
  {
    id: "aug10",
    title: "Drama Club Auditions",
    date: new Date(2025, 7, 10),
    category: "club",
    description: "Auditions for fall theater production",
    location: "Main Auditorium",
    time: "3:30 PM - 6:00 PM",
    color: "bg-gradient-to-r from-rose-500 to-pink-600",
    priority: "medium",
  },
  // August 11, 2025
  {
    id: "aug11",
    title: "Band Camp Begins",
    date: new Date(2025, 7, 11),
    category: "academic",
    description: "Intensive music preparation for marching band",
    location: "Music Room & Field",
    time: "8:00 AM - 5:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "medium",
  },
  // August 12, 2025
  {
    id: "aug12",
    title: "Counselor Meet & Greet",
    date: new Date(2025, 7, 12),
    category: "meeting",
    description: "Students meet with academic counselors",
    location: "Guidance Office",
    time: "9:00 AM - 4:00 PM",
    color: "bg-gradient-to-r from-purple-500 to-violet-600",
    priority: "high",
  },
  // August 13, 2025
  {
    id: "aug13",
    title: "Textbook Distribution",
    date: new Date(2025, 7, 13),
    category: "academic",
    description: "Students pick up textbooks for the new year",
    location: "Main Gymnasium",
    time: "10:00 AM - 6:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "high",
  },
  // August 14, 2025
  {
    id: "aug14",
    title: "Senior Portrait Day",
    date: new Date(2025, 7, 14),
    category: "academic",
    description: "Professional portraits for graduating seniors",
    location: "Photography Studio",
    time: "8:00 AM - 4:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "medium",
  },
  // August 15, 2025
  {
    id: "aug15",
    title: "Athletic Physical Day",
    date: new Date(2025, 7, 15),
    category: "sports",
    description: "Required physicals for all student athletes",
    location: "Nurse's Office",
    time: "8:00 AM - 3:00 PM",
    color: "bg-gradient-to-r from-orange-500 to-red-500",
    priority: "high",
  },
  // August 16, 2025
  {
    id: "aug16",
    title: "Freshman Orientation Day",
    date: new Date(2025, 7, 16),
    category: "orientation",
    description: "Welcome and orientation for incoming freshmen",
    location: "Main Auditorium",
    time: "9:00 AM - 3:00 PM",
    color: "bg-gradient-to-r from-emerald-500 to-green-600",
    priority: "high",
  },
  // August 17, 2025
  {
    id: "aug17",
    title: "Club Fair & Activities Expo",
    date: new Date(2025, 7, 17),
    category: "club",
    description: "Students explore extracurricular opportunities",
    location: "Main Gymnasium",
    time: "11:00 AM - 2:00 PM",
    color: "bg-gradient-to-r from-rose-500 to-pink-600",
    priority: "medium",
  },
  // August 18, 2025
  {
    id: "aug18",
    title: "Schedule Pick-up Day",
    date: new Date(2025, 7, 18),
    category: "academic",
    description: "Students receive their class schedules",
    location: "Main Office",
    time: "8:00 AM - 4:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "high",
  },
  // August 19, 2025
  {
    id: "aug19",
    title: "Fall Sports Tryouts Begin",
    date: new Date(2025, 7, 19),
    category: "sports",
    description: "Tryouts for fall athletic teams",
    location: "Athletic Fields",
    time: "3:30 PM - 6:00 PM",
    color: "bg-gradient-to-r from-orange-500 to-red-500",
    priority: "medium",
  },
  // August 20, 2025
  {
    id: "aug20",
    title: "New Teacher Welcome Lunch",
    date: new Date(2025, 7, 20),
    category: "meeting",
    description: "Welcome event for new faculty members",
    location: "Faculty Lounge",
    time: "12:00 PM - 1:30 PM",
    color: "bg-gradient-to-r from-purple-500 to-violet-600",
    priority: "low",
  },
  // August 21, 2025
  {
    id: "aug21",
    title: "Library Orientation",
    date: new Date(2025, 7, 21),
    category: "orientation",
    description: "Students learn about library resources and policies",
    location: "School Library",
    time: "10:00 AM - 2:00 PM",
    color: "bg-gradient-to-r from-emerald-500 to-green-600",
    priority: "medium",
  },
  // August 22, 2025
  {
    id: "aug22",
    title: "Student ID Photo Day",
    date: new Date(2025, 7, 22),
    category: "academic",
    description: "All students get new ID cards for the year",
    location: "Main Lobby",
    time: "8:00 AM - 3:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "high",
  },
  // August 23, 2025
  {
    id: "aug23",
    title: "Parking Permit Registration",
    date: new Date(2025, 7, 23),
    category: "registration",
    description: "Students register for parking permits",
    location: "Security Office",
    time: "7:30 AM - 4:00 PM",
    color: "bg-gradient-to-r from-cyan-500 to-teal-600",
    priority: "medium",
  },
  // August 24, 2025
  {
    id: "aug24",
    title: "Back-to-School BBQ",
    date: new Date(2025, 7, 24),
    category: "celebration",
    description: "Community barbecue to welcome everyone back",
    location: "School Courtyard",
    time: "5:00 PM - 8:00 PM",
    color: "bg-gradient-to-r from-pink-500 to-rose-600",
    priority: "medium",
  },
  // August 25, 2025
  {
    id: "aug25",
    title: "Final Preparation Day",
    date: new Date(2025, 7, 25),
    category: "academic",
    description: "Teachers prepare classrooms for first day",
    location: "All Classrooms",
    time: "8:00 AM - 4:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "low",
  },
  // August 26, 2025
  {
    id: "aug26",
    title: "FIRST DAY OF SCHOOL!",
    date: new Date(2025, 7, 26),
    category: "academic",
    description: "Welcome back! First day of the 2025-2026 school year",
    location: "All Campus",
    time: "8:00 AM - 3:30 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "high",
  },
  // August 27, 2025
  {
    id: "aug27",
    title: "Schedule Adjustment Day",
    date: new Date(2025, 7, 27),
    category: "academic",
    description: "Students can make schedule changes if needed",
    location: "Guidance Office",
    time: "8:00 AM - 3:30 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "medium",
  },
  // August 28, 2025
  {
    id: "aug28",
    title: "Parent Portal Training",
    date: new Date(2025, 7, 28),
    category: "workshop",
    description: "Help parents navigate the online grade portal",
    location: "Computer Lab",
    time: "6:00 PM - 7:30 PM",
    color: "bg-gradient-to-r from-violet-500 to-purple-600",
    priority: "medium",
  },
  // August 29, 2025
  {
    id: "aug29",
    title: "Student Government Elections",
    date: new Date(2025, 7, 29),
    category: "academic",
    description: "Voting for student body representatives",
    location: "Main Lobby",
    time: "8:00 AM - 3:00 PM",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    priority: "medium",
  },
  // August 30, 2025
  {
    id: "aug30",
    title: "First Week Celebration",
    date: new Date(2025, 7, 30),
    category: "celebration",
    description: "Ice cream social to celebrate completing first week",
    location: "Cafeteria",
    time: "3:30 PM - 4:30 PM",
    color: "bg-gradient-to-r from-pink-500 to-rose-600",
    priority: "low",
  },
  // August 31, 2025
  {
    id: "aug31",
    title: "Monthly Assessment Day",
    date: new Date(2025, 7, 31),
    category: "exam",
    description: "End-of-month progress assessments",
    location: "All Classrooms",
    time: "8:00 AM - 12:00 PM",
    color: "bg-gradient-to-r from-red-500 to-pink-600",
    priority: "medium",
  },
]

export function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)) // Default to August 2025 to show all events
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [personalEvents, setPersonalEvents] = useState<string[]>([])
  const { toast } = useToast()

  // Custom hook to handle window width safely for SSR
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640)
    }

    // Check on mount
    checkScreenSize()

    // Add event listener
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    return filteredEvents
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 8)
  }, [filteredEvents])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const goToAugust = () => {
    setCurrentDate(new Date(2025, 7, 1)) // Updated to August 2025
  }

  const addToPersonalCalendar = (eventId: string) => {
    if (!personalEvents.includes(eventId)) {
      setPersonalEvents((prev) => [...prev, eventId])
      toast({
        title: "Event Added",
        description: "Event has been added to your personal calendar.",
      })
    } else {
      toast({
        title: "Already Added",
        description: "This event is already in your personal calendar.",
        variant: "destructive",
      })
    }
  }

  const downloadCalendar = () => {
    toast({
      title: "Download Started",
      description: "Calendar file is being prepared for download.",
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-16 sm:h-20 md:h-24 lg:h-28 border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30"
        ></div>,
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const events = getEventsForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const hasHighPriorityEvent = events.some((event) => event.priority === "high")

      days.push(
        <div
          key={day}
          className={cn(
            "h-16 sm:h-20 md:h-24 lg:h-28 border border-gray-200 dark:border-gray-700 p-1 sm:p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200 relative group",
            isToday &&
              "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-600 shadow-sm",
            isSelected &&
              "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/30 dark:to-indigo-800/30 ring-2 ring-blue-400 dark:ring-blue-500",
            hasHighPriorityEvent && "border-l-4 border-l-red-500",
            events.length > 0 && "hover:shadow-md",
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div
            className={cn(
              "text-xs sm:text-sm font-semibold mb-1 flex items-center justify-between",
              isToday && "text-blue-600 dark:text-blue-400",
            )}
          >
            <span>{day}</span>
            {hasHighPriorityEvent && <Star className="w-2 h-2 sm:w-3 sm:h-3 text-red-500 fill-current" />}
          </div>
          <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
            {events.slice(0, isSmallScreen ? 2 : 3).map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "w-full h-1 sm:h-1.5 rounded-full shadow-sm transition-all duration-200 hover:h-1.5 sm:hover:h-2",
                  event.color,
                )}
                title={event.title}
              />
            ))}
            {events.length > (isSmallScreen ? 2 : 3) && (
              <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 rounded px-0.5 sm:px-1 py-0.5 text-center">
                +{events.length - (isSmallScreen ? 2 : 3)}
              </div>
            )}
          </div>
          {/* Enhanced hover tooltip - hidden on mobile for better performance */}
          {events.length > 0 && (
            <div className="hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg max-w-48">
                <div className="font-semibold">
                  {events.length} event{events.length > 1 ? "s" : ""}
                </div>
                {events.slice(0, 2).map((event) => (
                  <div key={event.id} className="truncate">
                    • {event.title}
                  </div>
                ))}
                {events.length > 2 && <div>• +{events.length - 2} more...</div>}
              </div>
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Enhanced Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex justify-center mb-3 sm:mb-4">
          <Badge
            variant="secondary"
            className="text-sm sm:text-base px-3 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-0"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Academic Year 2025-2026
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Academic Calendar
        </h2>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Stay organized with important dates, deadlines, and exciting events throughout the school year
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className="flex flex-col gap-4 items-stretch sm:items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(eventCategories).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", category.color)} />
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCalendar}
            className="hover:scale-105 transition-transform bg-transparent justify-center sm:justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:scale-105 transition-transform bg-transparent justify-center sm:justify-start"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-t-lg">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="hover:scale-110 transition-transform bg-white/80 dark:bg-gray-800/80 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center flex-1 sm:flex-none">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="hover:scale-110 transition-transform bg-white/80 dark:bg-gray-800/80 flex-shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToAugust}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all justify-center"
                >
                  <Star className="w-4 h-4 mr-2" />
                  August Events
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={goToToday}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-0 mb-2 sm:mb-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="p-1.5 sm:p-3 text-center text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 first:rounded-l-lg last:rounded-r-lg"
                  >
                    <span className="hidden xs:inline">{day}</span>
                    <span className="xs:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Upcoming Events */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Upcoming Events
                <Badge variant="secondary" className="ml-auto text-xs">
                  {upcomingEvents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {upcomingEvents.map((event) => {
                const CategoryIcon = eventCategories[event.category].icon
                return (
                  <Dialog key={event.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 cursor-pointer transition-all duration-200 hover:shadow-md group">
                        <div
                          className={cn(
                            "w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-0.5 sm:mt-1 shadow-sm flex-shrink-0",
                            event.color,
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">
                              {event.date.toLocaleDateString()} • {eventCategories[event.category].label}
                            </span>
                          </p>
                          {event.priority === "high" && (
                            <Badge variant="destructive" className="text-[10px] sm:text-xs mt-1">
                              <Star className="w-3 h-3 mr-1" />
                              High Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md mx-4">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="truncate">{event.title}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            <div className={cn("w-2 h-2 rounded-full", event.color)} />
                            {eventCategories[event.category].label}
                          </Badge>
                          {event.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              High Priority
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            {event.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium">{event.date.toLocaleDateString()}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => addToPersonalCalendar(event.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all text-sm"
                          disabled={personalEvents.includes(event.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {personalEvents.includes(event.id) ? "Added to Calendar" : "Add to Personal Calendar"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-teal-500/10 dark:from-green-500/20 dark:to-teal-500/20 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all text-sm"
                onClick={downloadCalendar}
              >
                <Download className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                Export Calendar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all text-sm"
              >
                <Bell className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0" />
                Event Reminders
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all text-sm"
              >
                <Clock className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                School Schedule
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all text-sm"
              >
                <Music className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                Event Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
