"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  Copy,
  Link2,
  Star,
  CheckCircle,
  CalendarCheck,
  CalendarX,
  UserCheck,
  ChevronRightIcon,
  Check,
  Plus,
  CalendarPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  category: string
  status: string
  attendees: number
  capacity: number
  organizer?: string
  featured?: boolean
  visibility?: string
}

interface EventsCalendarProps {
  events: Event[]
  onEventClick?: (event: Event) => void
}

export function EventsCalendar({ events, onEventClick }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventContextMenu, setEventContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    event: Event | null
    submenu: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    event: null,
    submenu: null,
  })

  const [cellContextMenu, setCellContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    date: Date | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: null,
  })

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-purple-500",
      Sports: "bg-orange-500",
      Cultural: "bg-pink-500",
      Meeting: "bg-blue-500",
      "Professional Development": "bg-green-500",
    }
    return colors[category] || "bg-gray-500"
  }

  const handleEventContextMenu = (e: React.MouseEvent, event: Event) => {
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

    setEventContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      event,
      submenu: null,
    })
    setCellContextMenu({ visible: false, x: 0, y: 0, date: null })
  }

  const handleCellContextMenu = (e: React.MouseEvent, day: number) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    // Adjust position if menu would go off screen
    const menuWidth = 220
    const menuHeight = 200
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

    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    setCellContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      date: selectedDate,
    })
    setEventContextMenu({ visible: false, x: 0, y: 0, event: null, submenu: null })
  }

  const handleCreateEvent = (date?: Date) => {
    // Navigate to create event page
    // You can pass the date as a query parameter if needed
    window.location.href = "/superadmin/events/create"
  }

  const closeContextMenus = () => {
    setEventContextMenu({
      visible: false,
      x: 0,
      y: 0,
      event: null,
      submenu: null,
    })
    setCellContextMenu({
      visible: false,
      x: 0,
      y: 0,
      date: null,
    })
  }

  useState(() => {
    const handleClick = () => closeContextMenus()
    const handleScroll = () => closeContextMenus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenus()
    }
    const handleResize = () => closeContextMenus()

    if (eventContextMenu.visible || cellContextMenu.visible) {
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

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[140px] bg-muted/10 border border-border/50" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day)
    const today = isToday(day)

    days.push(
      <div
        key={day}
        className={cn(
          "min-h-[140px] border border-border/50 p-3 transition-all hover:bg-muted/30 hover:shadow-sm bg-card",
          today && "bg-blue-50/50 dark:bg-blue-950/30 border-blue-500/50 ring-2 ring-blue-500/20",
        )}
        onContextMenu={(e) => handleCellContextMenu(e, day)}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={cn(
              "text-sm font-semibold text-muted-foreground",
              today &&
                "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md",
            )}
          >
            {day}
          </span>
          {dayEvents.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-primary/10 text-primary border-primary/20 font-semibold px-2"
            >
              {dayEvents.length}
            </Badge>
          )}
        </div>
        <div className="space-y-1.5">
          {dayEvents.slice(0, 3).map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick?.(event)}
              onContextMenu={(e) => handleEventContextMenu(e, event)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-accent/50 transition-all border border-transparent hover:border-border/50 hover:shadow-sm group"
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "w-1 h-full rounded-full flex-shrink-0 mt-0.5 group-hover:w-1.5 transition-all",
                    getCategoryColor(event.category),
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="font-semibold truncate text-foreground">{event.title}</p>
                    {event.featured && <Star className="w-3 h-3 text-yellow-600 fill-yellow-600 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[10px]">
                      {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="text-[10px] truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground text-center py-1 bg-muted/30 rounded-md font-medium">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>,
    )
  }

  return (
    <>
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">Events Calendar</div>
                <div className="text-sm text-muted-foreground font-normal">View and manage events by date</div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-border bg-background hover:bg-muted/50 font-semibold"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousMonth}
                  className="hover:bg-background h-9 w-9 rounded-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-[200px] text-center px-4">
                  <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMonth}
                  className="hover:bg-background h-9 w-9 rounded-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-0 bg-border rounded-xl overflow-hidden shadow-inner">
            {dayNames.map((day) => (
              <div
                key={day}
                className="bg-gradient-to-b from-muted to-muted/70 p-3 text-center text-sm font-bold text-foreground border-b-2 border-border"
              >
                {day}
              </div>
            ))}
            {days}
          </div>

          {/* Enhanced Legend */}
          <div className="mt-8 p-4 bg-muted/20 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Event Categories</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/30">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" />
                <span className="text-sm text-foreground font-medium">Academic</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/30">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                <span className="text-sm text-foreground font-medium">Sports</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/30">
                <div className="w-3 h-3 rounded-full bg-pink-500 shadow-sm" />
                <span className="text-sm text-foreground font-medium">Cultural</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/30">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-sm text-foreground font-medium">Meeting</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/30">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                <span className="text-sm text-foreground font-medium">Prof. Dev</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {eventContextMenu.visible && eventContextMenu.event && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenus} />

          {/* Context Menu */}
          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: eventContextMenu.x,
              top: eventContextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              {/* View Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  onEventClick?.(eventContextMenu.event!)
                  closeContextMenus()
                }}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Event</span>
              </button>

              {/* Edit Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("Edit event:", eventContextMenu.event)
                  closeContextMenus()
                }}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Event</span>
              </button>

              {/* Duplicate Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("Duplicate event:", eventContextMenu.event)
                  closeContextMenus()
                }}
              >
                <Copy className="w-4 h-4 text-purple-600" />
                <span>Duplicate Event</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* Change Status - Submenu */}
              <div
                className="relative"
                onMouseEnter={() => setEventContextMenu((prev) => ({ ...prev, submenu: "status" }))}
                onMouseLeave={() => setEventContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Change Status</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Status Submenu */}
                {eventContextMenu.submenu === "status" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.status?.toLowerCase() === "upcoming" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change status to Upcoming")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarCheck className="w-4 h-4 text-blue-600" />
                        <span>Upcoming</span>
                      </div>
                      {eventContextMenu.event?.status?.toLowerCase() === "upcoming" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.status?.toLowerCase() === "published" ? "bg-emerald-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change status to Published")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Published</span>
                      </div>
                      {eventContextMenu.event?.status?.toLowerCase() === "published" && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.status?.toLowerCase() === "ongoing" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change status to Ongoing")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>Ongoing</span>
                      </div>
                      {eventContextMenu.event?.status?.toLowerCase() === "ongoing" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.status?.toLowerCase() === "completed" ? "bg-purple-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change status to Completed")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span>Completed</span>
                      </div>
                      {eventContextMenu.event?.status?.toLowerCase() === "completed" && <Check className="w-4 h-4 text-purple-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.status?.toLowerCase() === "cancelled" ? "bg-red-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change status to Cancelled")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarX className="w-4 h-4 text-red-600" />
                        <span>Cancelled</span>
                      </div>
                      {eventContextMenu.event?.status?.toLowerCase() === "cancelled" && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Change Visibility - Submenu */}
              <div
                className="relative"
                onMouseEnter={() => setEventContextMenu((prev) => ({ ...prev, submenu: "visibility" }))}
                onMouseLeave={() => setEventContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Change Visibility</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Visibility Submenu */}
                {eventContextMenu.submenu === "visibility" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.visibility?.toLowerCase() === "public" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change visibility to Public")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-green-600" />
                        <span>Public</span>
                      </div>
                      {eventContextMenu.event?.visibility?.toLowerCase() === "public" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.visibility?.toLowerCase() === "students only" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change visibility to Students Only")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Students Only</span>
                      </div>
                      {eventContextMenu.event?.visibility?.toLowerCase() === "students only" && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.visibility?.toLowerCase() === "teachers only" ? "bg-purple-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change visibility to Teachers Only")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Teachers Only</span>
                      </div>
                      {eventContextMenu.event?.visibility?.toLowerCase() === "teachers only" && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        eventContextMenu.event?.visibility?.toLowerCase() === "parents only" ? "bg-indigo-500/10" : ""
                      }`}
                      onClick={() => {
                        console.log("Change visibility to Parents Only")
                        closeContextMenus()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Parents Only</span>
                      </div>
                      {eventContextMenu.event?.visibility?.toLowerCase() === "parents only" && (
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
                onClick={() => {
                  console.log("Toggle featured:", eventContextMenu.event)
                  closeContextMenus()
                }}
              >
                <Star
                  className={`w-4 h-4 ${eventContextMenu.event?.featured ? "text-yellow-600 fill-yellow-600" : "text-gray-600"}`}
                />
                <span>{eventContextMenu.event?.featured ? "Remove from Featured" : "Add to Featured"}</span>
              </button>

              {/* Copy Link */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("Copy link:", eventContextMenu.event)
                  closeContextMenus()
                }}
              >
                <Link2 className="w-4 h-4 text-purple-600" />
                <span>Copy Link</span>
              </button>

              {/* View Attendees */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("View attendees:", eventContextMenu.event)
                  closeContextMenus()
                }}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>View Attendees</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* Delete Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                onClick={() => {
                  console.log("Delete event:", eventContextMenu.event)
                  closeContextMenus()
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Event</span>
              </button>
            </div>
          </div>
        </>
      )}

      {cellContextMenu.visible && cellContextMenu.date && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenus} />

          {/* Context Menu */}
          <div
            className="fixed z-50 min-w-[220px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: cellContextMenu.x,
              top: cellContextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              {/* Date Header */}
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1">
                {cellContextMenu.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              {/* Create Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleCreateEvent(cellContextMenu.date!)
                  closeContextMenus()
                }}
              >
                <Plus className="w-4 h-4 text-green-600" />
                <span>Create Event</span>
              </button>

              {/* Create Quick Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("Create quick event on:", cellContextMenu.date)
                  closeContextMenus()
                }}
              >
                <CalendarPlus className="w-4 h-4 text-blue-600" />
                <span>Quick Event</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* View Day */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("View day:", cellContextMenu.date)
                  closeContextMenus()
                }}
              >
                <Eye className="w-4 h-4 text-purple-600" />
                <span>View Day</span>
              </button>

              {/* Copy Date */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  navigator.clipboard.writeText(cellContextMenu.date!.toLocaleDateString())
                  console.log("Copy date:", cellContextMenu.date)
                  closeContextMenus()
                }}
              >
                <Copy className="w-4 h-4 text-orange-600" />
                <span>Copy Date</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
