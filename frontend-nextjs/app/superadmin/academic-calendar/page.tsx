"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "@/components/ui/time-picker"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  MapPin,
  FileText,
  X,
  Download,
  Printer,
  Sparkles,
  Clock,
  HelpCircle,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Event categories with colors
const eventCategories = [
  { value: "holiday", label: "School Holiday", color: "bg-red-500/10 text-red-700 border-red-500/20" },
  { value: "academic", label: "Academic Event", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  { value: "school-event", label: "School Event", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  {
    value: "professional",
    label: "Professional Development",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  },
  { value: "no-class", label: "No Class Day", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
  { value: "deadline", label: "Important Deadline", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
]

// Mock data for academic calendar events
const mockCalendarEvents = [
  {
    id: "1",
    title: "Christmas Break",
    description: "School holiday for Christmas celebration",
    category: "holiday",
    startDate: "2025-12-20",
    endDate: "2025-01-05",
    location: "",
    notes: "School resumes on January 6, 2025",
    isMultiDay: true,
  },
  {
    id: "2",
    title: "First Semester Enrollment",
    description: "Enrollment period for first semester",
    category: "academic",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    location: "Registrar's Office",
    notes: "Online enrollment also available",
    isMultiDay: true,
  },
  {
    id: "3",
    title: "Foundation Day",
    description: "School foundation anniversary celebration",
    category: "school-event",
    startDate: "2025-03-15",
    endDate: "2025-03-15",
    location: "School Grounds",
    notes: "All students required to attend",
    isMultiDay: false,
  },
  {
    id: "4",
    title: "Teacher Training Workshop",
    description: "Professional development for teaching staff",
    category: "professional",
    startDate: "2025-04-10",
    endDate: "2025-04-10",
    location: "Conference Room",
    notes: "No classes for students",
    isMultiDay: false,
  },
  {
    id: "5",
    title: "Midterm Examinations",
    description: "First semester midterm exams",
    category: "academic",
    startDate: "2025-08-15",
    endDate: "2025-08-20",
    location: "Various Classrooms",
    notes: "Exam schedules will be posted",
    isMultiDay: true,
  },
]

interface EventHighlight {
  id: string
  text: string
}

interface ScheduleItem {
  id: string
  time: string
  title: string
}

interface FAQ {
  id: string
  question: string
  answer: string
}

interface AdditionalInfo {
  id: string
  text: string
}

const AcademicCalendarPage = () => {
  const { toast } = useToast()
  const [events, setEvents] = useState(mockCalendarEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "year" | "list">("month")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Modal states
  const [addEventModal, setAddEventModal] = useState(false)
  const [editEventModal, setEditEventModal] = useState<{ isOpen: boolean; event: any }>({ isOpen: false, event: null })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; event: any }>({
    isOpen: false,
    event: null,
  })

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "academic",
    startDate: "",
    endDate: "",
    location: "",
    notes: "",
  })

  const [highlights, setHighlights] = useState<EventHighlight[]>([{ id: "1", text: "" }])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ id: "1", time: "", title: "" }])
  const [faqs, setFaqs] = useState<FAQ[]>([{ id: "1", question: "", answer: "" }])
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([{ id: "1", text: "" }])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    date: Date | null
    event: any | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: null,
    event: null,
  })

  const usedTimes = schedule.map((item) => item.time).filter(Boolean)

  const addHighlight = () => {
    setHighlights([...highlights, { id: Date.now().toString(), text: "" }])
  }

  const removeHighlight = (id: string) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((h) => h.id !== id))
    }
  }

  const updateHighlight = (id: string, text: string) => {
    setHighlights(highlights.map((h) => (h.id === id ? { ...h, text } : h)))
  }

  const addScheduleItem = () => {
    setSchedule([...schedule, { id: Date.now().toString(), time: "", title: "" }])
  }

  const removeScheduleItem = (id: string) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((s) => s.id !== id))
    }
  }

  const updateScheduleItem = (id: string, field: "time" | "title", value: string) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const addFAQ = () => {
    setFaqs([...faqs, { id: Date.now().toString(), question: "", answer: "" }])
  }

  const removeFAQ = (id: string) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter((f) => f.id !== id))
    }
  }

  const updateFAQ = (id: string, field: "question" | "answer", value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const addAdditionalInfo = () => {
    setAdditionalInfo([...additionalInfo, { id: Date.now().toString(), text: "" }])
  }

  const removeAdditionalInfo = (id: string) => {
    if (additionalInfo.length > 1) {
      setAdditionalInfo(additionalInfo.filter((a) => a.id !== id))
    }
  }

  const updateAdditionalInfo = (id: string, text: string) => {
    setAdditionalInfo(additionalInfo.map((a) => (a.id === id ? { ...a, text } : a)))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (!formData.location.trim()) newErrors.location = "Venue is required"

    // Validate at least one filled item in each dynamic section
    const filledHighlights = highlights.filter((h) => h.text.trim())
    if (filledHighlights.length === 0) {
      newErrors.highlights = "At least one event highlight is required"
    }

    const filledSchedule = schedule.filter((s) => s.time && s.title.trim())
    if (filledSchedule.length === 0) {
      newErrors.schedule = "At least one schedule item is required"
    }

    const filledFAQs = faqs.filter((f) => f.question.trim() && f.answer.trim())
    if (filledFAQs.length === 0) {
      newErrors.faqs = "At least one FAQ is required"
    }

    const filledAdditionalInfo = additionalInfo.filter((a) => a.text.trim())
    if (filledAdditionalInfo.length === 0) {
      newErrors.additionalInfo = "At least one additional information item is required"
    }

    // Validate schedule items have both time and title
    schedule.forEach((item) => {
      if (item.time && !item.title.trim()) {
        newErrors[`schedule_${item.id}_title`] = "Title is required when time is selected"
      }
      if (!item.time && item.title.trim()) {
        newErrors[`schedule_${item.id}_time`] = "Time is required when title is provided"
      }
    })

    // Validate FAQs have both question and answer
    faqs.forEach((faq) => {
      if (faq.question.trim() && !faq.answer.trim()) {
        newErrors[`faq_${faq.id}_answer`] = "Answer is required when question is provided"
      }
      if (!faq.question.trim() && faq.answer.trim()) {
        newErrors[`faq_${faq.id}_question`] = "Question is required when answer is provided"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "academic",
      startDate: "",
      endDate: "",
      location: "",
      notes: "",
    })
    setHighlights([{ id: "1", text: "" }])
    setSchedule([{ id: "1", time: "", title: "" }])
    setFaqs([{ id: "1", question: "", answer: "" }])
    setAdditionalInfo([{ id: "1", text: "" }])
    setErrors({})
  }

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const checkDate = new Date(dateStr)

      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const cat = eventCategories.find((c) => c.value === category)
    return (
      <Badge className={cat?.color || "bg-gray-500/10 text-gray-700 border-gray-500/20"}>
        {cat?.label || category}
      </Badge>
    )
  }

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      holiday: {
        bg: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20",
        border: "border-red-200 dark:border-red-800/50",
        text: "text-red-900 dark:text-red-100",
        icon: "text-red-600 dark:text-red-400",
      },
      academic: {
        bg: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20",
        border: "border-green-200 dark:border-green-800/50",
        text: "text-green-900 dark:text-green-100",
        icon: "text-green-600 dark:text-green-400",
      },
      "school-event": {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
        border: "border-blue-200 dark:border-blue-800/50",
        text: "text-blue-900 dark:text-blue-100",
        icon: "text-blue-600 dark:text-blue-400",
      },
      professional: {
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800/50",
        text: "text-yellow-900 dark:text-yellow-100",
        icon: "text-yellow-600 dark:text-yellow-400",
      },
      "no-class": {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
        border: "border-purple-200 dark:border-purple-800/50",
        text: "text-purple-900 dark:text-purple-100",
        icon: "text-purple-600 dark:text-purple-400",
      },
      deadline: {
        bg: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20",
        border: "border-orange-200 dark:border-orange-800/50",
        text: "text-orange-900 dark:text-orange-100",
        icon: "text-orange-600 dark:text-orange-400",
      },
    }
    return (
      styles[category] || {
        bg: "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20",
        border: "border-gray-200 dark:border-gray-800/50",
        text: "text-gray-900 dark:text-gray-100",
        icon: "text-gray-600 dark:text-gray-400",
      }
    )
  }

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, date: Date | null, event: any | null) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    const menuWidth = 240
    const menuHeight = 300
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight
    }

    setContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      date,
      event,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      date: null,
      event: null,
    })
  }

  const handleAddEvent = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newEvent = {
      id: `${Date.now()}`,
      ...formData,
      isMultiDay: formData.startDate !== formData.endDate,
      highlights: highlights.filter((h) => h.text.trim()).map((h) => h.text),
      schedule: schedule.filter((s) => s.time && s.title.trim()),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      additionalInfo: additionalInfo.filter((a) => a.text.trim()).map((a) => a.text),
    }

    setEvents((prev) => [...prev, newEvent])

    toast({
      title: "Event Added Successfully",
      description: (
        <div className="space-y-2">
          <p className="font-medium">{formData.title} has been added to the calendar</p>
          <div className="flex items-center gap-2">{getCategoryBadge(formData.category)}</div>
        </div>
      ),
      className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
    })

    setAddEventModal(false)
    resetForm()
  }

  // Handle edit event
  const handleEditEvent = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Start Date, End Date)",
        variant: "destructive",
      })
      return
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === editEventModal.event.id
          ? {
              ...e,
              ...formData,
              isMultiDay: formData.startDate !== formData.endDate,
            }
          : e,
      ),
    )

    toast({
      title: "Event Updated Successfully",
      description: (
        <div className="space-y-2">
          <p className="font-medium">{formData.title} has been updated</p>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
    })

    setEditEventModal({ isOpen: false, event: null })
    setFormData({
      title: "",
      description: "",
      category: "academic",
      startDate: "",
      endDate: "",
      location: "",
      notes: "",
    })
  }

  // Handle delete event
  const confirmDeleteEvent = () => {
    if (deleteConfirmation.event) {
      setEvents((prev) => prev.filter((e) => e.id !== deleteConfirmation.event.id))

      toast({
        title: "Event Deleted Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium">{deleteConfirmation.event.title} has been removed from the calendar</p>
          </div>
        ),
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
      })

      setDeleteConfirmation({ isOpen: false, event: null })
    }
  }

  // Handle duplicate event
  const handleDuplicateEvent = (event: any) => {
    const newEvent = {
      ...event,
      id: `${Date.now()}`,
      title: `${event.title} (Copy)`,
    }

    setEvents((prev) => [...prev, newEvent])

    toast({
      title: "Event Duplicated",
      description: (
        <div className="space-y-2">
          <p className="font-medium">{newEvent.title} has been created</p>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
    })

    closeContextMenu()
  }

  // Open add event modal with pre-filled date
  const openAddEventModal = (date?: Date) => {
    resetForm()
    if (date) {
      const dateStr = date.toISOString().split("T")[0]
      setFormData((prev) => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
      }))
    }
    setAddEventModal(true)
    closeContextMenu()
  }

  // Open edit event modal
  const openEditEventModal = (event: any) => {
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      notes: event.notes,
    })
    setEditEventModal({ isOpen: true, event })
    closeContextMenu()
  }

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Render calendar grid
  const renderCalendarGrid = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-muted/30 border border-border" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div
          key={day}
          className={`min-h-[100px] border border-border p-2 hover:bg-muted/50 transition-colors cursor-pointer ${
            isToday ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500" : "bg-card"
          }`}
          onContextMenu={(e) => handleContextMenu(e, date, null)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-foreground"}`}>{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => {
              const categoryStyle = getCategoryStyle(event.category)
              return (
                <div
                  key={event.id}
                  className={`text-xs p-2 rounded-lg cursor-pointer transition-all border shadow-sm hover:shadow-md hover:scale-[1.02] ${categoryStyle.bg} ${categoryStyle.border}`}
                  onContextMenu={(e) => {
                    e.stopPropagation()
                    handleContextMenu(e, null, event)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditEventModal(event)
                  }}
                >
                  <div className="flex items-start gap-1.5">
                    <Calendar className={`w-3 h-3 mt-0.5 flex-shrink-0 ${categoryStyle.icon}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate leading-tight ${categoryStyle.text}`}>{event.title}</div>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1 opacity-75">
                          <MapPin className={`w-2.5 h-2.5 flex-shrink-0 ${categoryStyle.icon}`} />
                          <span className={`text-[10px] truncate ${categoryStyle.text}`}>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground text-center py-1 bg-muted/50 rounded-md font-medium border border-border/30">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  // Close context menu on click outside
  useState(() => {
    const handleClick = () => closeContextMenu()
    const handleScroll = () => closeContextMenu()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu()
    }
    const handleResize = () => closeContextMenu()

    if (contextMenu.visible) {
      document.addEventListener("click", handleClick)
      document.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("keydown", handleKeyDown)
      window.addEventListener("resize", handleResize)

      return () => {
        document.removeEventListener("click", handleClick)
        document.removeEventListener("scroll", handleScroll)
        document.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("resize", handleResize)
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Academic Calendar</h1>
          <p className="text-muted-foreground">Manage school year events, holidays, and important dates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => toast({ title: "Export Calendar", description: "Export feature coming soon" })}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Print Calendar", description: "Print feature coming soon" })}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => openAddEventModal()} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Holidays</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter((e) => e.category === "holiday").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Academic Events</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter((e) => e.category === "academic").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">School Events</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter((e) => e.category === "school-event").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-bold text-foreground">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "month" ? (
            <div>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0">{renderCalendarGrid()}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onContextMenu={(e) => handleContextMenu(e, null, event)}
                    onClick={() => openEditEventModal(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          {getCategoryBadge(event.category)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString()}
                              {event.isMultiDay && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              {contextMenu.event ? (
                <>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                    onClick={() => openEditEventModal(contextMenu.event)}
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                    <span>Edit Event</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                    onClick={() => handleDuplicateEvent(contextMenu.event)}
                  >
                    <Copy className="w-4 h-4 text-purple-600" />
                    <span>Duplicate Event</span>
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                    onClick={() => {
                      setDeleteConfirmation({ isOpen: true, event: contextMenu.event })
                      closeContextMenu()
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Event</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                    onClick={() => openAddEventModal(contextMenu.date || undefined)}
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Add Event</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                    onClick={() => {
                      goToToday()
                      closeContextMenu()
                    }}
                  >
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>Go to Today</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {addEventModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setAddEventModal(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-4xl w-full animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Add Calendar Event</h3>
                      <p className="text-sm text-muted-foreground">Fill in the details to create a new event</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setAddEventModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Info className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>

                  <div className="space-y-2" data-error={!!errors.title}>
                    <Label htmlFor="title" className="text-base">
                      Event Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter event title"
                      className={cn(errors.title && "border-red-500")}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2" data-error={!!errors.description}>
                    <Label htmlFor="description" className="text-base">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter event description"
                      rows={4}
                      className={cn(errors.description && "border-red-500")}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2" data-error={!!errors.startDate}>
                      <Label htmlFor="startDate" className="text-base">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={cn(errors.startDate && "border-red-500")}
                      />
                      {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                    </div>

                    <div className="space-y-2" data-error={!!errors.endDate}>
                      <Label htmlFor="endDate" className="text-base">
                        End Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={cn(errors.endDate && "border-red-500")}
                      />
                      {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                    </div>
                  </div>

                  <div className="space-y-2" data-error={!!errors.location}>
                    <Label htmlFor="location" className="text-base">
                      Venue <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter venue location"
                        className={cn("pl-10", errors.location && "border-red-500")}
                      />
                    </div>
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>
                </div>

                {/* Event Highlights Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Event Highlights</h3>
                      <span className="text-sm text-muted-foreground">({highlights.length})</span>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addHighlight}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Highlight
                    </Button>
                  </div>
                  {errors.highlights && (
                    <p className="text-sm text-red-500 -mt-2" data-error="true">
                      {errors.highlights}
                    </p>
                  )}
                  <div className="space-y-3">
                    {highlights.map((highlight, index) => (
                      <div key={highlight.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            value={highlight.text}
                            onChange={(e) => updateHighlight(highlight.id, e.target.value)}
                            placeholder={`Highlight ${index + 1}`}
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeHighlight(highlight.id)}
                          disabled={highlights.length === 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Schedule Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Event Schedule / Program</h3>
                      <span className="text-sm text-muted-foreground">({schedule.length})</span>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addScheduleItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Schedule
                    </Button>
                  </div>
                  {errors.schedule && (
                    <p className="text-sm text-red-500 -mt-2" data-error="true">
                      {errors.schedule}
                    </p>
                  )}
                  <div className="space-y-3">
                    {schedule.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-start">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                          <div className="space-y-1" data-error={!!errors[`schedule_${item.id}_time`]}>
                            <TimePicker
                              value={item.time}
                              onChange={(time) => updateScheduleItem(item.id, "time", time)}
                              disabledTimes={usedTimes.filter((t) => t !== item.time)}
                              placeholder="Select time"
                            />
                            {errors[`schedule_${item.id}_time`] && (
                              <p className="text-xs text-red-500">{errors[`schedule_${item.id}_time`]}</p>
                            )}
                          </div>
                          <div className="md:col-span-2 space-y-1" data-error={!!errors[`schedule_${item.id}_title`]}>
                            <Input
                              value={item.title}
                              onChange={(e) => updateScheduleItem(item.id, "title", e.target.value)}
                              placeholder="e.g., Opening Ceremony"
                              className={cn(errors[`schedule_${item.id}_title`] && "border-red-500")}
                            />
                            {errors[`schedule_${item.id}_title`] && (
                              <p className="text-xs text-red-500">{errors[`schedule_${item.id}_title`]}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeScheduleItem(item.id)}
                          disabled={schedule.length === 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                      <span className="text-sm text-muted-foreground">({faqs.length})</span>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addFAQ}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                  {errors.faqs && (
                    <p className="text-sm text-red-500 -mt-2" data-error="true">
                      {errors.faqs}
                    </p>
                  )}
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <Card key={faq.id} className="p-4">
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1" data-error={!!errors[`faq_${faq.id}_question`]}>
                              <Label className="text-sm font-medium">Question {index + 1}</Label>
                              <Input
                                value={faq.question}
                                onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                                placeholder="Enter question"
                                className={cn(errors[`faq_${faq.id}_question`] && "border-red-500")}
                              />
                              {errors[`faq_${faq.id}_question`] && (
                                <p className="text-xs text-red-500">{errors[`faq_${faq.id}_question`]}</p>
                              )}
                            </div>
                            <div className="space-y-1" data-error={!!errors[`faq_${faq.id}_answer`]}>
                              <Label className="text-sm font-medium">Answer</Label>
                              <Textarea
                                value={faq.answer}
                                onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                                placeholder="Enter answer"
                                rows={2}
                                className={cn(errors[`faq_${faq.id}_answer`] && "border-red-500")}
                              />
                              {errors[`faq_${faq.id}_answer`] && (
                                <p className="text-xs text-red-500">{errors[`faq_${faq.id}_answer`]}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFAQ(faq.id)}
                            disabled={faqs.length === 1}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Additional Information</h3>
                      <span className="text-sm text-muted-foreground">({additionalInfo.length})</span>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addAdditionalInfo}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Info
                    </Button>
                  </div>
                  {errors.additionalInfo && (
                    <p className="text-sm text-red-500 -mt-2" data-error="true">
                      {errors.additionalInfo}
                    </p>
                  )}
                  <div className="space-y-3">
                    {additionalInfo.map((info, index) => (
                      <div key={info.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Textarea
                            value={info.text}
                            onChange={(e) => updateAdditionalInfo(info.id, e.target.value)}
                            placeholder={`Additional information ${index + 1}`}
                            rows={2}
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeAdditionalInfo(info.id)}
                          disabled={additionalInfo.length === 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-card/95 backdrop-blur-md border-t border-border/50 p-6">
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setAddEventModal(false)} size="lg">
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent} size="lg" className="min-w-[150px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Event Modal */}
      {editEventModal.isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setEditEventModal({ isOpen: false, event: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Edit Calendar Event</h3>
                    <p className="text-sm text-muted-foreground">Update event information</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditEventModal({ isOpen: false, event: null })}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <Textarea
                      placeholder="Enter event description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
                    <Input
                      placeholder="Enter event location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Notes</label>
                    <Textarea
                      placeholder="Additional notes or information"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setEditEventModal({ isOpen: false, event: null })}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditEvent} className="bg-primary hover:bg-primary/90">
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.event && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setDeleteConfirmation({ isOpen: false, event: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Delete Event</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">{deleteConfirmation.event.title}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{deleteConfirmation.event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{deleteConfirmation.event.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(deleteConfirmation.event.category)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(deleteConfirmation.event.startDate).toLocaleDateString()}
                          {deleteConfirmation.event.isMultiDay &&
                            ` - ${new Date(deleteConfirmation.event.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Event will be permanently deleted</li>
                          <li>• All event data will be lost</li>
                          <li>• This action cannot be reversed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmation({ isOpen: false, event: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteEvent}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AcademicCalendarPage
