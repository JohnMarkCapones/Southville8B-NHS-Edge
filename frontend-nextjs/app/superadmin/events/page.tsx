"use client"

import type React from "react"
import { useState, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Link2,
  Check,
  CalendarCheck,
  CalendarX,
  UserCheck,
  FileText,
  ChevronRightIcon,
  AlertTriangle,
  Star,
  Copy,
  Archive,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react"
import { EventsCalendar } from "@/components/superadmin/events-calendar"

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Annual Science Fair 2024",
    organizer: "Science Department",
    category: "Academic",
    status: "Upcoming",
    startDate: "2025-02-15T09:00:00",
    endDate: "2025-02-15T17:00:00",
    location: "School Gymnasium",
    attendees: 250,
    capacity: 300,
    description: "Annual science fair showcasing student projects and innovations...",
    featured: true,
    visibility: "Public",
    registrationRequired: true,
  },
  {
    id: "2",
    title: "Basketball Championship Finals",
    organizer: "Sports Department",
    category: "Sports",
    status: "Ongoing",
    startDate: "2025-02-05T14:00:00",
    endDate: "2025-02-05T18:00:00",
    location: "Basketball Court",
    attendees: 180,
    capacity: 200,
    description: "Final match of the inter-school basketball championship...",
    featured: false,
    visibility: "Public",
    registrationRequired: false,
  },
  {
    id: "3",
    title: "Parent-Teacher Conference",
    organizer: "Admin Office",
    category: "Meeting",
    status: "Upcoming",
    startDate: "2025-02-10T08:00:00",
    endDate: "2025-02-10T16:00:00",
    location: "Various Classrooms",
    attendees: 0,
    capacity: 500,
    description: "Quarterly parent-teacher conference for academic progress discussion...",
    featured: false,
    visibility: "Parents Only",
    registrationRequired: true,
  },
  {
    id: "4",
    title: "Cultural Festival",
    organizer: "Student Council",
    category: "Cultural",
    status: "Upcoming",
    startDate: "2025-02-20T10:00:00",
    endDate: "2025-02-20T20:00:00",
    location: "School Grounds",
    attendees: 120,
    capacity: 500,
    description: "Annual cultural festival celebrating diversity and traditions...",
    featured: true,
    visibility: "Public",
    registrationRequired: false,
  },
  {
    id: "5",
    title: "Teacher Training Workshop",
    organizer: "HR Department",
    category: "Professional Development",
    status: "Completed",
    startDate: "2025-01-10T09:00:00",
    endDate: "2025-01-10T15:00:00",
    location: "Conference Room",
    attendees: 45,
    capacity: 50,
    description: "Professional development workshop on modern teaching methodologies...",
    featured: false,
    visibility: "Teachers Only",
    registrationRequired: true,
  },
  {
    id: "6",
    title: "Math Olympiad Preparation",
    organizer: "Math Department",
    category: "Academic",
    status: "Upcoming",
    startDate: "2025-02-08T13:00:00",
    endDate: "2025-02-08T16:00:00",
    location: "Room 301",
    attendees: 35,
    capacity: 40,
    description: "Intensive preparation session for upcoming Math Olympiad competition...",
    featured: false,
    visibility: "Students Only",
    registrationRequired: true,
  },
  {
    id: "7",
    title: "School Musical Rehearsal",
    organizer: "Arts Department",
    category: "Cultural",
    status: "Ongoing",
    startDate: "2025-02-12T15:00:00",
    endDate: "2025-02-12T18:00:00",
    location: "Auditorium",
    attendees: 60,
    capacity: 80,
    description: "Final rehearsal for the spring musical production...",
    featured: true,
    visibility: "Students Only",
    registrationRequired: true,
  },
  {
    id: "8",
    title: "Football Team Practice",
    organizer: "Sports Department",
    category: "Sports",
    status: "Upcoming",
    startDate: "2025-02-18T16:00:00",
    endDate: "2025-02-18T18:00:00",
    location: "Football Field",
    attendees: 25,
    capacity: 30,
    description: "Regular practice session for the varsity football team...",
    featured: false,
    visibility: "Students Only",
    registrationRequired: false,
  },
  {
    id: "9",
    title: "Career Guidance Seminar",
    organizer: "Guidance Office",
    category: "Academic",
    status: "Upcoming",
    startDate: "2025-02-22T10:00:00",
    endDate: "2025-02-22T14:00:00",
    location: "Conference Hall",
    attendees: 150,
    capacity: 200,
    description: "Career guidance and college preparation seminar for senior students...",
    featured: true,
    visibility: "Students Only",
    registrationRequired: true,
  },
  {
    id: "10",
    title: "Board Meeting",
    organizer: "Administration",
    category: "Meeting",
    status: "Upcoming",
    startDate: "2025-02-25T09:00:00",
    endDate: "2025-02-25T12:00:00",
    location: "Board Room",
    attendees: 12,
    capacity: 15,
    description: "Monthly board meeting to discuss school policies and budget...",
    featured: false,
    visibility: "Teachers Only",
    registrationRequired: false,
  },
  {
    id: "11",
    title: "Art Exhibition Opening",
    organizer: "Arts Department",
    category: "Cultural",
    status: "Upcoming",
    startDate: "2025-02-28T17:00:00",
    endDate: "2025-02-28T20:00:00",
    location: "Art Gallery",
    attendees: 85,
    capacity: 100,
    description: "Opening night for student art exhibition featuring works from all grade levels...",
    featured: true,
    visibility: "Public",
    registrationRequired: false,
  },
  {
    id: "12",
    title: "Volleyball Tournament",
    organizer: "Sports Department",
    category: "Sports",
    status: "Upcoming",
    startDate: "2025-02-14T13:00:00",
    endDate: "2025-02-14T17:00:00",
    location: "Gymnasium",
    attendees: 95,
    capacity: 120,
    description: "Inter-class volleyball tournament for all grade levels...",
    featured: false,
    visibility: "Public",
    registrationRequired: false,
  },
]

const mockArchivedEvents = [
  {
    id: "archived-1",
    title: "Summer Camp 2024",
    organizer: "Student Affairs",
    category: "Cultural",
    status: "Completed",
    startDate: "2024-06-15T09:00:00",
    endDate: "2024-06-15T17:00:00",
    location: "School Campus",
    attendees: 180,
    capacity: 200,
    description: "Annual summer camp for students...",
    featured: false,
    visibility: "Public",
    registrationRequired: true,
    deletedAt: "2025-01-15T10:30:00",
    deletedBy: "Admin User",
    deletionReason: "Event completed and archived",
  },
  {
    id: "archived-2",
    title: "Old Science Fair",
    organizer: "Science Department",
    category: "Academic",
    status: "Cancelled",
    startDate: "2024-12-10T09:00:00",
    endDate: "2024-12-10T17:00:00",
    location: "Science Lab",
    attendees: 0,
    capacity: 100,
    description: "Cancelled science fair event...",
    featured: false,
    visibility: "Students Only",
    registrationRequired: true,
    deletedAt: "2024-12-05T14:20:00",
    deletedBy: "Science Coordinator",
    deletionReason: "Insufficient registrations",
  },
]

const EventsPage = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [events, setEvents] = useState(mockEvents)
  const [archivedEvents, setArchivedEvents] = useState(mockArchivedEvents)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  const [showArchivedEvents, setShowArchivedEvents] = useState(false)
  const [archivedSearchTerm, setArchivedSearchTerm] = useState("")
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState("all")
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1)
  const [archivedItemsPerPage, setArchivedItemsPerPage] = useState(10)
  const [selectedArchivedEvents, setSelectedArchivedEvents] = useState<string[]>([])

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    event: any | null
    submenu: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    event: null,
    submenu: null,
  })

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    event: any
  }>({ isOpen: false, event: null })

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean
    event: any
    newStatus: string
  }>({ isOpen: false, event: null, newStatus: "" })

  const [visibilityConfirmation, setVisibilityConfirmation] = useState<{
    isOpen: boolean
    event: any
    newVisibility: string
  }>({ isOpen: false, event: null, newVisibility: "" })

  const [featuredConfirmation, setFeaturedConfirmation] = useState<{
    isOpen: boolean
    event: any
  }>({ isOpen: false, event: null })

  const [restoreConfirmation, setRestoreConfirmation] = useState<{
    isOpen: boolean
    event: any
  }>({ isOpen: false, event: null })

  const [permanentDeleteConfirmation, setPermanentDeleteConfirmation] = useState<{
    isOpen: boolean
    event: any
  }>({ isOpen: false, event: null })

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || event.category.toLowerCase() === categoryFilter
    const matchesStatus = statusFilter === "all" || event.status.toLowerCase() === statusFilter
    const matchesVisibility =
      visibilityFilter === "all" || event.visibility.toLowerCase().includes(visibilityFilter.toLowerCase())

    return matchesSearch && matchesCategory && matchesStatus && matchesVisibility
  })

  const filteredArchivedEvents = archivedEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      event.deletionReason?.toLowerCase().includes(archivedSearchTerm.toLowerCase())
    const matchesCategory = archivedCategoryFilter === "all" || event.category.toLowerCase() === archivedCategoryFilter

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

  const archivedTotalPages = Math.ceil(filteredArchivedEvents.length / archivedItemsPerPage)
  const archivedStartIndex = (archivedCurrentPage - 1) * archivedItemsPerPage
  const archivedEndIndex = archivedStartIndex + archivedItemsPerPage
  const paginatedArchivedEvents = filteredArchivedEvents.slice(archivedStartIndex, archivedEndIndex)

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case "category":
        setCategoryFilter(value)
        break
      case "status":
        setStatusFilter(value)
        break
      case "visibility":
        setVisibilityFilter(value)
        break
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(paginatedEvents.map((event) => event.id))
    } else {
      setSelectedEvents([])
    }
  }

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents((prev) => [...prev, eventId])
    } else {
      setSelectedEvents((prev) => prev.filter((id) => id !== eventId))
    }
  }

  const handleSelectAllArchived = (checked: boolean) => {
    if (checked) {
      setSelectedArchivedEvents(paginatedArchivedEvents.map((event) => event.id))
    } else {
      setSelectedArchivedEvents([])
    }
  }

  const handleSelectArchivedEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedArchivedEvents((prev) => [...prev, eventId])
    } else {
      setSelectedArchivedEvents((prev) => prev.filter((id) => id !== eventId))
    }
  }

  const getStatusBadge = (status: string, event?: any) => {
    const badge = (() => {
      switch (status) {
        case "Upcoming":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <CalendarCheck className="w-3 h-3 mr-1" />
              Upcoming
            </Badge>
          )
        case "Ongoing":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Ongoing
            </Badge>
          )
        case "Completed":
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )
        case "Cancelled":
          return (
            <Badge className="bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20">
              <CalendarX className="w-3 h-3 mr-1" />
              Cancelled
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{status}</Badge>
          )
      }
    })()

    // If event is provided, wrap in dropdown
    if (event) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${status === "Upcoming" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(event, "Upcoming")
              }}
            >
              <CalendarCheck className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Upcoming</span>
              {status === "Upcoming" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Ongoing" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(event, "Ongoing")
              }}
            >
              <Clock className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Ongoing</span>
              {status === "Ongoing" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Completed" ? "bg-gray-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(event, "Completed")
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2 text-gray-600" />
              <span className="flex-1">Completed</span>
              {status === "Completed" && <Check className="w-4 h-4 text-gray-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Cancelled" ? "bg-red-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(event, "Cancelled")
              }}
            >
              <CalendarX className="w-4 h-4 mr-2 text-red-600" />
              <span className="flex-1">Cancelled</span>
              {status === "Cancelled" && <Check className="w-4 h-4 text-red-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Academic: "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20",
      Sports: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20",
      Cultural: "bg-pink-500/10 text-pink-700 border-pink-500/20 hover:bg-pink-500/20",
      Meeting: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20",
      "Professional Development": "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20",
    }

    return (
      <Badge
        className={
          colors[category as keyof typeof colors] ||
          "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20"
        }
      >
        {category}
      </Badge>
    )
  }

  const getVisibilityBadge = (visibility: string, event?: any) => {
    const badge = (() => {
      switch (visibility) {
        case "Public":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <Users className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )
        case "Students Only":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <Users className="w-3 h-3 mr-1" />
              Students
            </Badge>
          )
        case "Teachers Only":
          return (
            <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20">
              <Users className="w-3 h-3 mr-1" />
              Teachers
            </Badge>
          )
        case "Parents Only":
          return (
            <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 hover:bg-indigo-500/20">
              <Users className="w-3 h-3 mr-1" />
              Parents
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{visibility}</Badge>
          )
      }
    })()

    // If event is provided, wrap in dropdown
    if (event) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Public" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(event, "Public")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Public</span>
              {visibility === "Public" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Students Only" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(event, "Students Only")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Students Only</span>
              {visibility === "Students Only" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Teachers Only" ? "bg-purple-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(event, "Teachers Only")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              <span className="flex-1">Teachers Only</span>
              {visibility === "Teachers Only" && <Check className="w-4 h-4 text-purple-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Parents Only" ? "bg-indigo-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(event, "Parents Only")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-indigo-600" />
              <span className="flex-1">Parents Only</span>
              {visibility === "Parents Only" && <Check className="w-4 h-4 text-indigo-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const handleViewEvent = (event: any) => {
    toast({
      title: "📅 Event Details",
      description: `Opening details for "${event.title}"`,
      duration: 3000,
    })
  }

  const handleEditEvent = (event: any) => {
    router.push(`/superadmin/events/edit/${event.id}`)
  }

  const handleDeleteEvent = (event: any) => {
    setDeleteConfirmation({ isOpen: true, event })
    closeContextMenu()
  }

  const handleCreateEvent = () => {
    router.push("/superadmin/events/create")
  }

  const handleContextMenu = (e: React.MouseEvent, event: any) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    // Adjust position if menu would go off screen
    const menuWidth = 240
    const menuHeight = 400
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
      event,
      submenu: null,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      event: null,
      submenu: null,
    })
  }

  const confirmDeleteEvent = () => {
    if (deleteConfirmation.event) {
      const eventToArchive = {
        ...deleteConfirmation.event,
        deletedAt: new Date().toISOString(),
        deletedBy: "Current Admin",
        deletionReason: "Archived by admin",
      }

      setArchivedEvents((prev) => [eventToArchive, ...prev])
      setEvents((prev) => prev.filter((e) => e.id !== deleteConfirmation.event.id))

      toast({
        title: "✅ Event Archived Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {deleteConfirmation.event.title} has been moved to archived events.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">
                <Archive className="w-3 h-3" />
              </div>
              <span>{deleteConfirmation.event.organizer}</span>
              <span>•</span>
              <span>{deleteConfirmation.event.category}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle className="w-3 h-3" />
              <span>Event can be restored from archived section</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 6000,
        className: "border-orange-500/20 bg-orange-500/5 backdrop-blur-md",
      })

      setDeleteConfirmation({ isOpen: false, event: null })
    }
  }

  const handleRestoreEvent = (event: any) => {
    setRestoreConfirmation({ isOpen: true, event })
  }

  const confirmRestoreEvent = () => {
    if (restoreConfirmation.event) {
      const { deletedAt, deletedBy, deletionReason, ...restoredEvent } = restoreConfirmation.event

      setEvents((prev) => [restoredEvent, ...prev])
      setArchivedEvents((prev) => prev.filter((e) => e.id !== restoreConfirmation.event.id))

      toast({
        title: "✅ Event Restored Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">{restoreConfirmation.event.title} has been restored.</p>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <RotateCcw className="w-3 h-3" />
              <span>Event is now active again</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 4000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      setRestoreConfirmation({ isOpen: false, event: null })
    }
  }

  const handlePermanentDelete = (event: any) => {
    setPermanentDeleteConfirmation({ isOpen: true, event })
  }

  const confirmPermanentDelete = () => {
    if (permanentDeleteConfirmation.event) {
      setArchivedEvents((prev) => prev.filter((e) => e.id !== permanentDeleteConfirmation.event.id))

      toast({
        title: "✅ Event Permanently Deleted",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {permanentDeleteConfirmation.event.title} has been permanently removed.
            </p>
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-500/10 px-2 py-1 rounded-md w-fit">
              <AlertTriangle className="w-3 h-3" />
              <span>This action cannot be undone</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 4000,
        className: "border-red-500/20 bg-red-500/5 backdrop-blur-md",
      })

      setPermanentDeleteConfirmation({ isOpen: false, event: null })
    }
  }

  const handleBulkRestore = () => {
    const eventsToRestore = archivedEvents.filter((e) => selectedArchivedEvents.includes(e.id))

    eventsToRestore.forEach((event) => {
      const { deletedAt, deletedBy, deletionReason, ...restoredEvent } = event
      setEvents((prev) => [restoredEvent, ...prev])
    })

    setArchivedEvents((prev) => prev.filter((e) => !selectedArchivedEvents.includes(e.id)))
    setSelectedArchivedEvents([])

    toast({
      title: `✅ ${eventsToRestore.length} Event(s) Restored`,
      description: "Selected events have been restored successfully.",
      duration: 4000,
    })
  }

  const handleBulkPermanentDelete = () => {
    const count = selectedArchivedEvents.length
    setArchivedEvents((prev) => prev.filter((e) => !selectedArchivedEvents.includes(e.id)))
    setSelectedArchivedEvents([])

    toast({
      title: `✅ ${count} Event(s) Permanently Deleted`,
      description: "Selected events have been permanently removed.",
      duration: 4000,
      className: "border-red-500/20 bg-red-500/5",
    })
  }

  const handleStatusChange = (event: any, newStatus: string) => {
    setStatusConfirmation({ isOpen: true, event, newStatus })
    closeContextMenu()
  }

  const confirmStatusChange = () => {
    if (statusConfirmation.event) {
      setEvents((prev) =>
        prev.map((e) => (e.id === statusConfirmation.event.id ? { ...e, status: statusConfirmation.newStatus } : e)),
      )

      toast({
        title: `✅ Status Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Event status changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="font-medium">{statusConfirmation.event.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New status:</span>
              <div className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 font-medium">
                {statusConfirmation.newStatus}
              </div>
            </div>
          </div>
        ),
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setStatusConfirmation({ isOpen: false, event: null, newStatus: "" })
    }
  }

  const handleVisibilityChange = (event: any, newVisibility: string) => {
    setVisibilityConfirmation({ isOpen: true, event, newVisibility })
    closeContextMenu()
  }

  const confirmVisibilityChange = () => {
    if (visibilityConfirmation.event) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === visibilityConfirmation.event.id ? { ...e, visibility: visibilityConfirmation.newVisibility } : e,
        ),
      )

      toast({
        title: `✅ Visibility Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Event visibility changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="font-medium">{visibilityConfirmation.event.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New visibility:</span>
              <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 font-medium">
                {visibilityConfirmation.newVisibility}
              </div>
            </div>
          </div>
        ),
        className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setVisibilityConfirmation({ isOpen: false, event: null, newVisibility: "" })
    }
  }

  const handleToggleFeatured = (event: any) => {
    setFeaturedConfirmation({ isOpen: true, event })
    closeContextMenu()
  }

  const confirmToggleFeatured = () => {
    if (featuredConfirmation.event) {
      setEvents((prev) =>
        prev.map((e) => (e.id === featuredConfirmation.event.id ? { ...e, featured: !e.featured } : e)),
      )

      toast({
        title: featuredConfirmation.event.featured ? `⭐ Removed from Featured` : `⭐ Added to Featured`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">
              {featuredConfirmation.event.featured
                ? "Event removed from featured section"
                : "Event added to featured section"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">{featuredConfirmation.event.title}</span>
              </div>
            </div>
          </div>
        ),
        className: "border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setFeaturedConfirmation({ isOpen: false, event: null })
    }
  }

  const handleDuplicateEvent = (event: any) => {
    const newEvent = {
      ...event,
      id: `${Date.now()}`,
      title: `${event.title} (Copy)`,
      status: "Upcoming",
      attendees: 0,
    }

    setEvents((prev) => [newEvent, ...prev])

    toast({
      title: `📋 Event Duplicated`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">Event copied successfully</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{newEvent.title}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">The duplicate has been created as upcoming</div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleCopyLink = (event: any) => {
    const link = `${window.location.origin}/events/${event.id}`
    navigator.clipboard.writeText(link)

    toast({
      title: `🔗 Link Copied`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">Event link copied to clipboard</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{link}</span>
            </div>
          </div>
        </div>
      ),
      className: "border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleViewAttendees = (event: any) => {
    toast({
      title: `👥 Event Attendees`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">{event.title}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{event.attendees} registered</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10">
              <Users className="w-3.5 h-3.5" />
              <span>{event.capacity} capacity</span>
            </div>
          </div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 5000,
    })

    closeContextMenu()
  }

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
          <h1 className="text-3xl font-bold text-foreground">School Events Management</h1>
          <p className="text-muted-foreground">Create, manage, and organize school events and activities</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
              <FileText className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>
          <Button onClick={handleCreateEvent} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarDays className="h-8 w-8 text-blue-600" />
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
              <CalendarCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter((e) => e.status === "Upcoming").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ongoing</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter((e) => e.status === "Ongoing").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.reduce((sum, e) => sum + e.attendees, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Event Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search, filter, and manage events across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events by title, organizer, or location..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="professional development">Professional Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={(value) => handleFilterChange("visibility", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="students">Students Only</SelectItem>
                <SelectItem value="teachers">Teachers Only</SelectItem>
                <SelectItem value="parents">Parents Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEvents.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">
                {selectedEvents.length} event{selectedEvents.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <CalendarX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Events Table */}
          {viewMode === "calendar" ? (
            <EventsCalendar events={filteredEvents} onEventClick={handleViewEvent} />
          ) : (
            <div className="border border-border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedEvents.length === paginatedEvents.length && paginatedEvents.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-foreground">Event</TableHead>
                    <TableHead className="text-foreground">Organizer</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Date & Time</TableHead>
                    <TableHead className="text-foreground">Location</TableHead>
                    <TableHead className="text-foreground">Visibility</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      className="border-border cursor-pointer hover:bg-muted/50"
                      onContextMenu={(e) => handleContextMenu(e, event)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="flex items-center">
                            <div className="font-medium text-foreground">{event.title}</div>
                            {event.featured && (
                              <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{event.organizer}</TableCell>
                      <TableCell>{getCategoryBadge(event.category)}</TableCell>
                      <TableCell>{getStatusBadge(event.status, event)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                      </TableCell>
                      <TableCell>{getVisibilityBadge(event.visibility, event)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="text-foreground" onClick={() => handleViewEvent(event)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Event
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground" onClick={() => handleEditEvent(event)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteEvent(event)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredEvents.length} total events)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-border bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "" : "border-border bg-transparent"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={currentPage === totalPages ? "" : "border-border bg-transparent"}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-border bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Archive className="w-5 h-5 text-orange-600" />
                Archived Events
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage archived events. Events are kept for 90 days before permanent deletion.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchivedEvents(!showArchivedEvents)}
              className="border-border"
            >
              {showArchivedEvents ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Archived
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Archived ({archivedEvents.length})
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showArchivedEvents && (
          <CardContent className="space-y-4">
            {/* Warning Notice */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-700 dark:text-orange-400">
                  <p className="font-medium mb-1">Archived Events Policy</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Archived events are kept for 90 days before automatic permanent deletion</li>
                    <li>• You can restore archived events to make them active again</li>
                    <li>• Permanent deletion cannot be undone</li>
                    <li>• All event data and registrations will be lost after permanent deletion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search archived events..."
                    value={archivedSearchTerm}
                    onChange={(e) => {
                      setArchivedSearchTerm(e.target.value)
                      setArchivedCurrentPage(1)
                    }}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <Select
                value={archivedCategoryFilter}
                onValueChange={(value) => {
                  setArchivedCategoryFilter(value)
                  setArchivedCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="professional development">Professional Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items per page and count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={archivedItemsPerPage.toString()}
                  onValueChange={(value) => {
                    setArchivedItemsPerPage(Number(value))
                    setArchivedCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {archivedStartIndex + 1} to {Math.min(archivedEndIndex, filteredArchivedEvents.length)} of{" "}
                {filteredArchivedEvents.length} archived events
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedArchivedEvents.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <span className="text-sm text-foreground">
                  {selectedArchivedEvents.length} event{selectedArchivedEvents.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkRestore}
                    className="border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkPermanentDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Archived Events Table */}
            <div className="border border-border rounded-lg opacity-70">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedArchivedEvents.length === paginatedArchivedEvents.length &&
                          paginatedArchivedEvents.length > 0
                        }
                        onCheckedChange={handleSelectAllArchived}
                      />
                    </TableHead>
                    <TableHead className="text-foreground">Event</TableHead>
                    <TableHead className="text-foreground">Organizer</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Deleted Date</TableHead>
                    <TableHead className="text-foreground">Deleted By</TableHead>
                    <TableHead className="text-foreground">Reason</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedArchivedEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <Archive className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No archived events found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedArchivedEvents.map((event) => (
                      <TableRow key={event.id} className="border-border hover:bg-muted/30">
                        <TableCell>
                          <Checkbox
                            checked={selectedArchivedEvents.includes(event.id)}
                            onCheckedChange={(checked) => handleSelectArchivedEvent(event.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="font-medium text-foreground">{event.title}</div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{event.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{event.organizer}</TableCell>
                        <TableCell>{getCategoryBadge(event.category)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(event.deletedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(event.deletedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{event.deletedBy}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{event.deletionReason}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem className="text-foreground" onClick={() => handleViewEvent(event)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-green-600" onClick={() => handleRestoreEvent(event)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore Event
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handlePermanentDelete(event)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Permanently Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {archivedTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {archivedCurrentPage} of {archivedTotalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivedCurrentPage === 1}
                    onClick={() => setArchivedCurrentPage(archivedCurrentPage - 1)}
                    className="border-border bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivedCurrentPage === archivedTotalPages}
                    onClick={() => setArchivedCurrentPage(archivedCurrentPage + 1)}
                    className="border-border bg-transparent"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Context Menu and Confirmation Modals */}
      {contextMenu.visible && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          {/* Context Menu */}
          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              {/* View Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleViewEvent(contextMenu.event)
                  closeContextMenu()
                }}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Event</span>
              </button>

              {/* Edit Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleEditEvent(contextMenu.event)
                  closeContextMenu()
                }}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Event</span>
              </button>

              {/* Duplicate Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleDuplicateEvent(contextMenu.event)}
              >
                <Copy className="w-4 h-4 text-purple-600" />
                <span>Duplicate Event</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* Change Status - Submenu */}
              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "status" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Change Status</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Status Submenu */}
                {contextMenu.submenu === "status" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.status === "Upcoming" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.event, "Upcoming")}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarCheck className="w-4 h-4 text-blue-600" />
                        <span>Upcoming</span>
                      </div>
                      {contextMenu.event?.status === "Upcoming" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.status === "Ongoing" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.event, "Ongoing")}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>Ongoing</span>
                      </div>
                      {contextMenu.event?.status === "Ongoing" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.status === "Completed" ? "bg-gray-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.event, "Completed")}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                        <span>Completed</span>
                      </div>
                      {contextMenu.event?.status === "Completed" && <Check className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.status === "Cancelled" ? "bg-red-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.event, "Cancelled")}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarX className="w-4 h-4 text-red-600" />
                        <span>Cancelled</span>
                      </div>
                      {contextMenu.event?.status === "Cancelled" && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Change Visibility - Submenu */}
              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "visibility" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Change Visibility</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Visibility Submenu */}
                {contextMenu.submenu === "visibility" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.visibility === "Public" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.event, "Public")}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-green-600" />
                        <span>Public</span>
                      </div>
                      {contextMenu.event?.visibility === "Public" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.visibility === "Students Only" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.event, "Students Only")}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Students Only</span>
                      </div>
                      {contextMenu.event?.visibility === "Students Only" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.visibility === "Teachers Only" ? "bg-purple-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.event, "Teachers Only")}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Teachers Only</span>
                      </div>
                      {contextMenu.event?.visibility === "Teachers Only" && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.event?.visibility === "Parents Only" ? "bg-indigo-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.event, "Parents Only")}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Parents Only</span>
                      </div>
                      {contextMenu.event?.visibility === "Parents Only" && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-border my-1" />

              {/* Toggle Featured */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleToggleFeatured(contextMenu.event)}
              >
                <Star
                  className={`w-4 h-4 ${contextMenu.event?.featured ? "text-yellow-600 fill-yellow-600" : "text-gray-600"}`}
                />
                <span>{contextMenu.event?.featured ? "Remove from Featured" : "Add to Featured"}</span>
              </button>

              {/* Copy Link */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleCopyLink(contextMenu.event)}
              >
                <Link2 className="w-4 h-4 text-purple-600" />
                <span>Copy Link</span>
              </button>

              {/* View Attendees */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleViewAttendees(contextMenu.event)}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>View Attendees</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* Delete Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                onClick={() => {
                  handleDeleteEvent(contextMenu.event)
                  closeContextMenu()
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Event</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Context Menu and Confirmation Modals - Similar to News page */}
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{deleteConfirmation.event.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">by {deleteConfirmation.event.organizer}</p>
                        </div>
                        {deleteConfirmation.event.featured && (
                          <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 border-yellow-500/20 flex-shrink-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(deleteConfirmation.event.category)}
                        {getStatusBadge(deleteConfirmation.event.status)}
                        {getVisibilityBadge(deleteConfirmation.event.visibility)}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(deleteConfirmation.event.startDate).toLocaleDateString()} at{" "}
                            {new Date(deleteConfirmation.event.startDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{deleteConfirmation.event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {deleteConfirmation.event.attendees} / {deleteConfirmation.event.capacity} attendees
                          </span>
                        </div>
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
                          <li>• All event data and registrations will be lost</li>
                          <li>• Attendees will no longer see this event</li>
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

      {/* Status Confirmation Modal */}
      {statusConfirmation.isOpen && statusConfirmation.event && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setStatusConfirmation({ isOpen: false, event: null, newStatus: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Event Status</h3>
                    <p className="text-sm text-muted-foreground">Confirm status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change status of{" "}
                    <span className="font-semibold text-blue-600">{statusConfirmation.event.title}</span> to{" "}
                    <span className="font-semibold text-green-600">{statusConfirmation.newStatus}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{statusConfirmation.event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">by {statusConfirmation.event.organizer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current status:</span>
                        {getStatusBadge(statusConfirmation.event.status)}
                        <span className="text-muted-foreground">→</span>
                        {getStatusBadge(statusConfirmation.newStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {statusConfirmation.newStatus === "Upcoming" && (
                            <>
                              <li>• Event will be marked as upcoming</li>
                              <li>• Attendees can register for the event</li>
                              <li>• Event will appear in upcoming events list</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Ongoing" && (
                            <>
                              <li>• Event will be marked as currently happening</li>
                              <li>• Event will be highlighted as active</li>
                              <li>• Registration may be closed</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Completed" && (
                            <>
                              <li>• Event will be marked as finished</li>
                              <li>• Event will move to past events</li>
                              <li>• No further registrations allowed</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Cancelled" && (
                            <>
                              <li>• Event will be marked as cancelled</li>
                              <li>• Attendees will be notified</li>
                              <li>• Event will be removed from active listings</li>
                            </>
                          )}
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
                    onClick={() => setStatusConfirmation({ isOpen: false, event: null, newStatus: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmStatusChange}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Visibility Confirmation Modal */}
      {visibilityConfirmation.isOpen && visibilityConfirmation.event && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setVisibilityConfirmation({ isOpen: false, event: null, newVisibility: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Event Visibility</h3>
                    <p className="text-sm text-muted-foreground">Confirm visibility change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change visibility of{" "}
                    <span className="font-semibold text-purple-600">{visibilityConfirmation.event.title}</span> to{" "}
                    <span className="font-semibold text-blue-600">{visibilityConfirmation.newVisibility}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{visibilityConfirmation.event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {visibilityConfirmation.event.organizer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current visibility:</span>
                        {getVisibilityBadge(visibilityConfirmation.event.visibility)}
                        <span className="text-muted-foreground">→</span>
                        {getVisibilityBadge(visibilityConfirmation.newVisibility)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-700 dark:text-purple-400">
                        <p className="font-medium mb-1">Who can see this event:</p>
                        <ul className="space-y-1 text-xs">
                          {visibilityConfirmation.newVisibility === "Public" && (
                            <>
                              <li>• Everyone can view this event</li>
                              <li>• Event appears in public calendar</li>
                              <li>• No login required to see details</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Students Only" && (
                            <>
                              <li>• Only students can view this event</li>
                              <li>• Students must be logged in</li>
                              <li>• Teachers and admins can also view</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Teachers Only" && (
                            <>
                              <li>• Only teachers can view this event</li>
                              <li>• Teachers must be logged in</li>
                              <li>• Admins can also view</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Parents Only" && (
                            <>
                              <li>• Only parents can view this event</li>
                              <li>• Parents must be logged in</li>
                              <li>• Admins can also view</li>
                            </>
                          )}
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
                    onClick={() => setVisibilityConfirmation({ isOpen: false, event: null, newVisibility: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmVisibilityChange}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Change Visibility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Featured Confirmation Modal */}
      {featuredConfirmation.isOpen && featuredConfirmation.event && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setFeaturedConfirmation({ isOpen: false, event: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mr-4">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {featuredConfirmation.event.featured ? "Remove from Featured" : "Add to Featured"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Confirm featured status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    {featuredConfirmation.event.featured ? "Remove" : "Add"}
                    <span className="font-semibold text-yellow-600">{featuredConfirmation.event.title}</span>
                    {featuredConfirmation.event.featured ? " from" : " to"} featured events?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{featuredConfirmation.event.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            by {featuredConfirmation.event.organizer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(featuredConfirmation.event.category)}
                        {getStatusBadge(featuredConfirmation.event.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredConfirmation.event.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {featuredConfirmation.event.featured ? (
                            <>
                              <li>• Event will be removed from featured section</li>
                              <li>• Event will no longer appear in featured carousel</li>
                              <li>• Event remains published and accessible</li>
                            </>
                          ) : (
                            <>
                              <li>• Event will appear in featured section</li>
                              <li>• Event will be highlighted on homepage</li>
                              <li>• Event gets more visibility to users</li>
                            </>
                          )}
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
                    onClick={() => setFeaturedConfirmation({ isOpen: false, event: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmToggleFeatured}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {featuredConfirmation.event.featured ? "Remove from Featured" : "Add to Featured"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {restoreConfirmation.isOpen && restoreConfirmation.event && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setRestoreConfirmation({ isOpen: false, event: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mr-4">
                    <RotateCcw className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Restore Event</h3>
                    <p className="text-sm text-muted-foreground">Bring this event back to active status</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to restore{" "}
                    <span className="font-semibold text-green-600">{restoreConfirmation.event.title}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{restoreConfirmation.event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">by {restoreConfirmation.event.organizer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(restoreConfirmation.event.category)}
                        {getStatusBadge(restoreConfirmation.event.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Archive className="w-4 h-4" />
                          <span>
                            Archived on {new Date(restoreConfirmation.event.deletedAt).toLocaleDateString()} by{" "}
                            {restoreConfirmation.event.deletedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-700 dark:text-green-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Event will be restored to active status</li>
                          <li>• Event will appear in the main events list</li>
                          <li>• All event data will be preserved</li>
                          <li>• Users can view and register for the event again</li>
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
                    onClick={() => setRestoreConfirmation({ isOpen: false, event: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmRestoreEvent}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {permanentDeleteConfirmation.isOpen && permanentDeleteConfirmation.event && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setPermanentDeleteConfirmation({ isOpen: false, event: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Permanently Delete Event</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you absolutely sure you want to permanently delete{" "}
                    <span className="font-semibold text-red-600">{permanentDeleteConfirmation.event.title}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{permanentDeleteConfirmation.event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {permanentDeleteConfirmation.event.organizer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(permanentDeleteConfirmation.event.category)}
                        {getStatusBadge(permanentDeleteConfirmation.event.status)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Event will be permanently deleted from the database</li>
                          <li>• All event data and registrations will be lost forever</li>
                          <li>• This action cannot be reversed or undone</li>
                          <li>• Event cannot be restored after permanent deletion</li>
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
                    onClick={() => setPermanentDeleteConfirmation({ isOpen: false, event: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPermanentDelete}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
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

export default EventsPage
