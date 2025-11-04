"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  MapPin,
  User,
  Building2,
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Printer,
  Share2,
  RefreshCw,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { useQuery } from "@tanstack/react-query"
import { getMySchedule } from "@/lib/api/endpoints/schedules"
import type { Schedule } from "@/lib/api/types/schedules"
import ScheduleSkeleton from "@/components/ui/schedule-skeleton"
import ScheduleError from "@/components/ui/schedule-error"
import ScheduleEmpty from "@/components/ui/schedule-empty"

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Auto-detect mobile and set default view mode
  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week')

  // Get current day for highlighting
  const getCurrentDay = () => {
    const today = new Date()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return dayNames[today.getDay()]
  }

  const currentDay = getCurrentDay()

  // Detect mobile and set default view mode
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 // md breakpoint
      setIsMobile(mobile)
      if (mobile && viewMode === 'week') {
        setViewMode('agenda') // Auto-switch to agenda on mobile
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Set current day index based on today
  useEffect(() => {
    const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const idx = weekDayNames.indexOf(currentDay)
    if (idx !== -1) {
      setCurrentDayIndex(idx)
    }
  }, [currentDay])

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentDayIndex < 4) {
      setCurrentDayIndex(currentDayIndex + 1)
    }
    if (isRightSwipe && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Continuous timeline config (minute-precise)
  const dayStartMinutes = 6 * 60 // 06:00
  const dayEndMinutes = 16 * 60 // 16:00
  const minutesPerDay = dayEndMinutes - dayStartMinutes
  const pxPerMinute = 2.5 // taller tracks; mobile/desktop both scroll smoothly
  const trackHeightPx = minutesPerDay * pxPerMinute
  const headerOffsetPx = 128 // extra space for sticky day headers
  const visualTrackHeightPx = headerOffsetPx + trackHeightPx

  const timeSlots = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ]

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  // Fetch live schedule with enhanced error handling
  const { 
    data: schedules = [], 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ["my-schedules"],
    queryFn: getMySchedule,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false
      }
      return failureCount < 3
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Map schedules to grid-friendly structure: day -> hour label -> item
  const scheduleData = useMemo(() => {
    const map: Record<string, Record<string, { subject: string; teacher?: string; room?: string; colorHex?: string; start: string; end: string }>> = {}
    for (const day of weekDays) map[day] = {}

    const toHourLabel = (t: string) => {
      const [h, m] = t.split(":").map((x) => parseInt(x, 10))
      const date = new Date()
      date.setHours(h, m, 0, 0)
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    }

    schedules.forEach((s: Schedule) => {
      const day = s.dayOfWeek
      const label = toHourLabel(s.startTime)
      const teacher = s.teacher ? `${s.teacher.firstName ?? (s as any).teacher?.first_name ?? ""} ${s.teacher.lastName ?? (s as any).teacher?.last_name ?? ""}`.trim() : undefined
      const room = s.room?.roomNumber || (s as any).room?.room_number
      const floorNumber = s.room?.floor?.floorNumber || (s as any).room?.floor?.number
      const buildingName = s.room?.floor?.building?.name || s.building?.name
      const locationText = buildingName ? 
        (floorNumber ? `${buildingName}, Floor ${floorNumber}` : buildingName) : 
        (room ? `Room ${room}` : 'TBA')
      const colorHex = s.subject?.colorHex
      map[day]![label] = {
        subject: s.subject?.subjectName || "Class",
        teacher,
        room: locationText,
        colorHex,
        start: s.startTime,
        end: s.endTime,
      }
    })
    return map
  }, [schedules])

  // Precompute row spans per day/time index for multi-hour classes
  const cellSpans = useMemo(() => {
    const spans: Record<string, Array<{ cell?: { data: any; span: number }; skip?: boolean }>> = {}
    for (const day of weekDays) {
      spans[day] = Array(timeSlots.length).fill(null).map(() => ({}))
      for (let i = 0; i < timeSlots.length; i++) {
        const data = (scheduleData as any)[day]?.[timeSlots[i]]
        if (data) {
          // compute span based on end-start in hours using our grid slots
          const parseToHours = (t: string) => {
            const [h, m] = t.split(":").map((x: string) => parseInt(x, 10))
            return h + (m >= 30 ? 0.5 : 0)
          }
          const startH = parseToHours(data.start)
          const endH = parseToHours(data.end)
          let rows = Math.max(1, Math.round(endH - startH))
          // clamp within grid
          rows = Math.min(rows, timeSlots.length - i)
          spans[day][i] = { cell: { data, span: rows } }
          for (let k = 1; k < rows && i + k < timeSlots.length; k++) {
            spans[day][i + k] = { skip: true }
          }
        }
      }
    }
    return spans
  }, [scheduleData, timeSlots, weekDays])

  // Utilities for minute-precise positioning
  const parseTimeToMinutes = (t: string) => {
    const [h, m, s] = t.split(":")
    return parseInt(h, 10) * 60 + parseInt(m || "0", 10)
  }

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

  const formatMinutesToLabel = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    const date = new Date()
    date.setHours(h, m, 0, 0)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const hexToRgb = (hex?: string) => {
    if (!hex) return null
    const m = hex.replace('#', '')
    const value = m.length === 3
      ? m.split('').map((c) => c + c).join('')
      : m
    const intVal = parseInt(value, 16)
    const r = (intVal >> 16) & 255
    const g = (intVal >> 8) & 255
    const b = intVal & 255
    return { r, g, b }
  }

  const getReadableTextColor = (bg?: string) => {
    const rgb = hexToRgb(bg)
    if (!rgb) return '#ffffff'
    // Relative luminance
    const srgb = [rgb.r, rgb.g, rgb.b].map((v) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
    return L > 0.55 ? '#111827' : '#ffffff' // slate-900 on light backgrounds, white otherwise
  }

  const getSubtleBorder = (bg?: string) => {
    const rgb = hexToRgb(bg)
    if (!rgb) return 'rgba(0,0,0,0.12)'
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`
  }

  // Build minute-precise events per day with lane assignment for overlaps
  const positionedByDay = useMemo(() => {
    type Positioned = {
      id: string
      subject: string
      teacher?: string
      room?: string
      building?: string
      color?: string
      textColor: string
      borderColor: string
      startMin: number
      endMin: number
      topPx: number
      heightPx: number
      lane: number
      totalLanes: number
    }

    const byDay: Record<string, Positioned[]> = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] }

    for (const s of schedules) {
      const startAbs = parseTimeToMinutes(s.startTime)
      const endAbs = parseTimeToMinutes(s.endTime)
      if (Number.isNaN(startAbs) || Number.isNaN(endAbs)) continue
      // Clamp to visible window
      const startMin = clamp(startAbs, dayStartMinutes, dayEndMinutes)
      const endMin = clamp(endAbs, dayStartMinutes, dayEndMinutes)
      if (endMin <= startMin) continue
      const topPx = (startMin - dayStartMinutes) * pxPerMinute
      const heightPx = Math.max(8, (endMin - startMin) * pxPerMinute) // ensure clickable

      const bg = s.subject?.colorHex || undefined
      const textColor = getReadableTextColor(bg)
      const borderColor = getSubtleBorder(bg)
      const teacher = s.teacher ? `${s.teacher.firstName ?? (s as any).teacher?.first_name ?? ''} ${s.teacher.lastName ?? (s as any).teacher?.last_name ?? ''}`.trim() : undefined
      const room = s.room?.roomNumber || (s as any).room?.room_number
      const floorNumber = s.room?.floor?.floorNumber || (s as any).room?.floor?.number
      const buildingName = s.room?.floor?.building?.name || s.building?.name
      const locationText = buildingName ? 
        (floorNumber ? `${buildingName}, Floor ${floorNumber}` : buildingName) : 
        (room ? `Room ${room}` : 'TBA')

      byDay[s.dayOfWeek]?.push({
        id: s.id,
        subject: s.subject?.subjectName || 'Class',
        teacher,
        room,
        building: locationText,
        color: bg,
        textColor,
        borderColor,
        startMin,
        endMin,
        topPx,
        heightPx,
        lane: 0,
        totalLanes: 1,
      })
    }

    // Lane assignment per day using sweep-line grouping
    for (const day of weekDays) {
      const evts = byDay[day] || []
      evts.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)
      let active: Array<{ end: number; lane: number; ref: Positioned }> = []
      let groupEvents: Positioned[] = []
      let groupMax = 0

      const closeFinished = (currentStart: number) => {
        active = active.filter((x) => x.end > currentStart)
      }

      const finalizeGroup = () => {
        if (groupEvents.length > 0) {
          for (const e of groupEvents) e.totalLanes = Math.max(1, groupMax)
        }
        groupEvents = []
        groupMax = 0
      }

      for (const e of evts) {
        closeFinished(e.startMin)
        if (active.length === 0) {
          finalizeGroup()
        }
        // assign smallest free lane index
        const used = new Set(active.map((a) => a.lane))
        let lane = 0
        while (used.has(lane)) lane++
        e.lane = lane
        active.push({ end: e.endMin, lane, ref: e })
        groupEvents.push(e)
        groupMax = Math.max(groupMax, active.length)
      }
      finalizeGroup()
    }

    return byDay
  }, [schedules])

  const hours = useMemo(() => {
    const arr: Array<{ label: string; topPx: number }> = []
    for (let m = dayStartMinutes; m <= dayEndMinutes; m += 60) {
      const h = Math.floor(m / 60)
      const label = new Date(0, 0, 0, h).toLocaleTimeString('en-US', { hour: 'numeric' })
      arr.push({ label, topPx: (m - dayStartMinutes) * pxPerMinute })
    }
    return arr
  }, [])

  const getDaysOfWeek = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getDaysOfWeek(currentWeek)

  const downloadScheduleAsPDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const scheduleHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Class Schedule</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 12px; text-align: center; }
            .schedule-table th { background-color: #f8f9fa; font-weight: bold; }
            .subject-cell { font-weight: bold; }
            .teacher-cell { font-size: 0.9em; color: #666; }
            .room-cell { font-size: 0.8em; color: #888; }
            .break-cell { background-color: #f0f0f0; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Class Schedule</h1>
            <h2>My Schedule</h2>
            <p>Week of ${weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Time</th>
                  ${weekDays.map((day) => `<th>${day}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${timeSlots
                .map(
                  (time) => `
                <tr>
                  <td><strong>${time}</strong></td>
                  ${weekDays
                    .map((day) => {
                      const classData = (scheduleData as any)[day]?.[time]
                      if (!classData) {
                        return "<td></td>"
                      }
                      return `
                      <td>
                        <div class="subject-cell">${classData.subject}</div>
                        <div class="teacher-cell">${classData.teacher || ''}</div>
                        <div class="room-cell">${classData.room || ''}</div>
                      </td>
                    `
                    })
                    .join("")}
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9em;">
            Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(scheduleHTML)
    printWindow.document.close()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // Show loading state
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                My Schedule
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Loading your weekly class schedule...
              </p>
            </div>
            <ScheduleSkeleton />
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Show error state
  if (isError && error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                My Schedule
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                There was an error loading your schedule.
              </p>
            </div>
            <ScheduleError 
              error={error} 
              onRetry={() => refetch()} 
              isRetrying={isRefetching}
            />
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Show empty state
  if (!isLoading && !isError && schedules.length === 0) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                My Schedule
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Your weekly class schedule will appear here once it's available.
              </p>
            </div>
            <ScheduleEmpty onRefresh={() => refetch()} />
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800/50 min-h-screen">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 sm:space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Class Schedule
              </h1>
              {isRefetching && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
              {/* View Mode Toggle - Mobile Friendly */}
              <div className="flex bg-slate-100/70 dark:bg-slate-800/70 rounded-lg p-1 border border-slate-200/60 dark:border-slate-600/60 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={viewMode==='week'? 'default':'ghost'}
                  className={`h-8 px-3 flex-1 sm:flex-initial text-xs sm:text-sm ${viewMode==='week'?'bg-white dark:bg-slate-700':''}`}
                  onClick={() => setViewMode('week')}
                >
                  Weekly
                </Button>
                <Button
                  size="sm"
                  variant={viewMode==='agenda'? 'default':'ghost'}
                  className={`h-8 px-3 flex-1 sm:flex-initial text-xs sm:text-sm ${viewMode==='agenda'?'bg-white dark:bg-slate-700':''}`}
                  onClick={() => setViewMode('agenda')}
                >
                  Agenda
                </Button>
              </div>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium">Your weekly academic schedule</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={downloadScheduleAsPDF}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-slate-200 h-9 px-3 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
            <Button
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-slate-200 h-9 px-3 text-xs sm:text-sm hidden sm:flex"
            >
              <Printer className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Print</span>
            </Button>
            <Button
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-slate-200 h-9 px-3 text-xs sm:text-sm hidden lg:flex"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Share</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200/50 dark:border-slate-600/50 shadow-lg">
          <Button
            variant="outline"
            onClick={() => {
              const newWeek = new Date(currentWeek)
              newWeek.setDate(currentWeek.getDate() - 7)
              setCurrentWeek(newWeek)
            }}
            className="bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-600/90 border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 dark:text-slate-200 h-9 px-2 sm:px-4 text-xs sm:text-sm"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Previous Week</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <div className="text-center px-2">
            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Week of {weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {weekDates[0].toLocaleDateString("en-US", { year: "numeric" })}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              const newWeek = new Date(currentWeek)
              newWeek.setDate(currentWeek.getDate() + 7)
              setCurrentWeek(newWeek)
            }}
            className="bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-600/90 border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 dark:text-slate-200 h-9 px-2 sm:px-4 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Next Week</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-2" />
          </Button>
        </div>

        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-600/50 border-b border-slate-200/50 dark:border-slate-600/50 p-8">
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <CalendarIcon className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mini day index + Now */}
            <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-b border-slate-200/60 dark:border-slate-600/60">
              {['Mon','Tue','Wed','Thu','Fri'].map((d,i)=> (
                <Button key={d} variant="outline" size="sm" onClick={()=>{
                  if (viewMode==='agenda') {
                    const el = document.querySelector(`#student-agenda-day-${i}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
                  } else {
                    const el = document.querySelector(`#student-week-day-${i}`)
                    const sc = document.querySelector('#student-week-scroll') as HTMLDivElement
                    if (el && sc) el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
                  }
                }}>
                  {d}
                </Button>
              ))}
              <Button variant="secondary" size="sm" onClick={()=>{
                const now = new Date(); const mins = now.getHours()*60+now.getMinutes();
                if (viewMode==='agenda') {
                  // Jump to current day section in agenda
                  const idx = Math.max(0, ['Monday','Tuesday','Wednesday','Thursday','Friday'].indexOf(currentDay))
                  const el = document.querySelector(`#student-agenda-day-${idx}`)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
                } else {
                  const sc = document.querySelector('#student-week-scroll') as HTMLDivElement
                  if (!sc) return
                  const y = 128 + (mins - 360) * 2.5 // headerOffsetPx + (now - 6:00) * pxPerMinute
                  sc.scrollTo({ top: Math.max(0, y-140), behavior: 'smooth' })
                }
              }}>Now</Button>
            </div>
            <div className="overflow-x-auto">
              {!isLoading && schedules.length === 0 ? (
                <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                  No schedule yet. Your schedule will appear here once it's assigned.
                </div>
              ) : (
                viewMode === 'agenda' ? (
                  isMobile ? (
                    // Mobile: Swipeable Day Cards
                    <div
                      className="relative overflow-hidden"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Day Navigation Dots */}
                      <div className="flex justify-center gap-2 py-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200/50 dark:border-slate-700/50">
                        {weekDays.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentDayIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              idx === currentDayIndex
                                ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                                : 'w-2 bg-slate-300 dark:bg-slate-600'
                            }`}
                            aria-label={`Go to ${weekDays[idx]}`}
                          />
                        ))}
                      </div>

                      {/* Current Day Card */}
                      <div className="px-4 py-6">
                        {(() => {
                          const day = weekDays[currentDayIndex]
                          const items = (positionedByDay[day] || []).slice().sort((a, b) => a.startMin - b.startMin)
                          const isCurrentDay = day === currentDay

                          return (
                            <div className="animate-fadeIn">
                              {/* Day Header */}
                              <div className={`rounded-t-xl p-4 ${
                                isCurrentDay
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                  : 'bg-gradient-to-r from-slate-700 to-slate-600'
                              }`}>
                                <div className="flex items-center justify-between text-white">
                                  <div>
                                    <h3 className="text-2xl font-bold">{day}</h3>
                                    <p className="text-sm opacity-90">
                                      {weekDates[currentDayIndex]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  </div>
                                  {isCurrentDay && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                                      Today
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Classes List */}
                              <div className="bg-white dark:bg-slate-800 rounded-b-xl shadow-lg">
                                {items.length === 0 ? (
                                  <div className="p-12 text-center">
                                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No classes today</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Enjoy your free time!</p>
                                  </div>
                                ) : (
                                  <ul className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
                                    {items.map((evt, evtIdx) => {
                                      const timeLabel = `${formatMinutesToLabel(evt.startMin)} – ${formatMinutesToLabel(evt.endMin)}`
                                      return (
                                        <li
                                          key={evt.id}
                                          className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                          style={{ animationDelay: `${evtIdx * 50}ms` }}
                                        >
                                          <div className="flex gap-4">
                                            {/* Time Badge */}
                                            <div className="flex-shrink-0">
                                              <div className="w-20 h-20 rounded-xl flex flex-col items-center justify-center text-center"
                                                style={{
                                                  backgroundColor: evt.color || '#4f46e5',
                                                  color: evt.textColor
                                                }}
                                              >
                                                <div className="text-xs font-semibold opacity-90">
                                                  {formatMinutesToLabel(evt.startMin).split(' ')[0]}
                                                </div>
                                                <div className="text-[10px] opacity-75">
                                                  {formatMinutesToLabel(evt.startMin).split(' ')[1]}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Class Details */}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                                                  {evt.subject}
                                                </h4>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                                                  {formatMinutesToLabel(evt.endMin)}
                                                </span>
                                              </div>

                                              <div className="space-y-1.5">
                                                {evt.teacher && (
                                                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                    <User className="w-4 h-4 mr-2 text-indigo-500" />
                                                    <span>{evt.teacher}</span>
                                                  </div>
                                                )}
                                                {evt.room && (
                                                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                    <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                                                    <span>{evt.room}</span>
                                                  </div>
                                                )}
                                                {evt.building && (
                                                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                    <Building2 className="w-4 h-4 mr-2 text-amber-500" />
                                                    <span>{evt.building}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </li>
                                      )
                                    })}
                                  </ul>
                                )}
                              </div>

                              {/* Swipe Hint */}
                              <div className="text-center mt-4 text-xs text-slate-400 dark:text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                  <ChevronLeft className="w-3 h-3" />
                                  Swipe to navigate days
                                  <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  ) : (
                    // Desktop: Full Agenda View
                    <div className="min-w-[720px] max-h-[calc(100vh-180px)] overflow-y-auto rounded-xl">
                      {weekDays.map((day, idx) => {
                        const items = (positionedByDay[day] || []).slice().sort((a, b) => a.startMin - b.startMin)
                        const isCurrentDay = day === currentDay
                        return (
                          <div id={`student-agenda-day-${idx}`} key={day} className={`border-b ${
                          isCurrentDay 
                            ? 'border-blue-200/70 dark:border-blue-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5' 
                            : 'border-slate-200/70 dark:border-slate-700/70'
                        }`}>
                          <div className={`sticky top-0 z-10 backdrop-blur-md px-4 py-3 flex items-center justify-between ${
                            isCurrentDay 
                              ? 'bg-gradient-to-r from-blue-100/90 to-indigo-100/80 dark:from-blue-800/40 dark:to-indigo-800/30' 
                              : 'bg-white/85 dark:bg-slate-800/85'
                          }`}>
                            <div className={`text-sm font-semibold tracking-wide ${
                              isCurrentDay 
                                ? 'text-blue-800 dark:text-blue-200' 
                                : 'text-slate-700 dark:text-slate-200'
                            }`}>
                              {day}
                              {isCurrentDay && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${
                              isCurrentDay 
                                ? 'text-blue-600 dark:text-blue-300' 
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {weekDates[idx]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          {items.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No classes</div>
                          ) : (
                            <ul className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
                              {items.map((evt) => {
                                const timeLabel = `${formatMinutesToLabel(evt.startMin)} – ${formatMinutesToLabel(evt.endMin)}`
                                return (
                                  <li key={evt.id} className="px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <div className="flex items-start gap-4">
                                      <div className="w-28 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">{timeLabel}</div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: evt.color || '#4f46e5' }} />
                                          <span className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100">{evt.subject}</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] md:text-xs text-slate-600 dark:text-slate-400">
                                          {evt.teacher && <span className="inline-flex items-center"><User className="w-3 h-3 mr-1" />{evt.teacher}</span>}
                                          {evt.room && <span className="inline-flex items-center"><MapPin className="w-3 h-3 mr-1" />{evt.room}</span>}
                                          {evt.building && <span className="inline-flex items-center"><Building2 className="w-3 h-3 mr-1" />{evt.building}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  )
                ) : (
                  <div id="student-week-scroll" className="min-w-[1000px] max-h-[calc(100vh-180px)] overflow-y-auto rounded-xl bg-gradient-to-b from-white/70 to-white/40 dark:from-slate-800/60 dark:to-slate-800/30">
                  <div className="grid grid-cols-[120px_repeat(5,1fr)]">
                  {/* Time ruler */}
                  <div className="relative border-r border-slate-200/70 dark:border-slate-700/70" style={{ height: visualTrackHeightPx }}>
                    {hours.map((h) => (
                      <div key={h.label} className="absolute left-0 right-0" style={{ top: h.topPx + headerOffsetPx }}>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 px-4 -translate-y-2 select-none">{h.label}</div>
                        <div className="h-px bg-slate-200/70 dark:bg-slate-700/70" />
                      </div>
                    ))}
                  </div>
                  {/* Day columns */}
                  {weekDays.map((day, idx) => {
                    const isCurrentDay = day === currentDay
                    return (
                      <div 
                        id={`student-week-day-${idx}`}
                        key={day} 
                        className={`relative border-r last:border-r-0 border-slate-200/70 dark:border-slate-700/70 ${
                          isCurrentDay 
                            ? 'bg-gradient-to-b from-blue-50/80 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-600/30' 
                            : ''
                        }`} 
                        style={{ height: visualTrackHeightPx }}
                      >
                        {/* Day header */}
                        <div className={`sticky top-0 z-10 backdrop-blur-md border-b px-4 py-3 ${
                          isCurrentDay 
                            ? 'bg-gradient-to-r from-blue-100/90 to-indigo-100/80 dark:from-blue-800/40 dark:to-indigo-800/30 border-blue-200/60 dark:border-blue-600/40' 
                            : 'bg-white/85 dark:bg-slate-800/85 border-slate-200/60 dark:border-slate-600/60'
                        }`}>
                          <div className="text-center">
                            <div className={`text-sm font-semibold tracking-wide ${
                              isCurrentDay 
                                ? 'text-blue-800 dark:text-blue-200' 
                                : 'text-slate-700 dark:text-slate-200'
                            }`}>
                              {day}
                              {isCurrentDay && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${
                              isCurrentDay 
                                ? 'text-blue-600 dark:text-blue-300' 
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {weekDates[idx]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      {/* Hour lines */}
                      {hours.map((h, i) => (
                        <div key={i} className="absolute left-0 right-0" style={{ top: h.topPx + headerOffsetPx }}>
                          <div className="h-px bg-slate-100/70 dark:bg-slate-700/70" />
                        </div>
                      ))}
                      {/* Subtle gradient to separate columns */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/[0.02] to-transparent" />
                      {/* Events */}
                      {(positionedByDay[day] || []).map((evt) => {
                        const laneWidthPct = 100 / Math.max(1, evt.totalLanes)
                        const leftPct = evt.lane * laneWidthPct
                        const timeLabel = `${formatMinutesToLabel(evt.startMin)} – ${formatMinutesToLabel(evt.endMin)}`
                        return (
                          <div
                            key={evt.id}
                            className="absolute rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400/60 [animation:fadeIn_300ms_ease-out_forwards]"
                            style={{
                              top: evt.topPx + headerOffsetPx,
                              height: evt.heightPx,
                              left: `${leftPct}%`,
                              width: `${laneWidthPct}%`,
                              backgroundColor: evt.color || '#4f46e5',
                              border: `1px solid ${evt.borderColor}`,
                              transformOrigin: 'center',
                            }}
                            title={`${evt.subject} • ${timeLabel}${evt.teacher ? ` • ${evt.teacher}` : ''}${evt.room ? ` • ${evt.room}` : ''}`}
                          >
                            <div className="h-full w-full p-2 md:p-3 flex flex-col justify-between group" style={{ color: evt.textColor }}>
                              <div className="text-[10px] md:text-xs opacity-90 leading-tight">{timeLabel}</div>
                              <div className="text-xs md:text-sm font-semibold truncate group-hover:tracking-wide transition-all">{evt.subject}</div>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs opacity-90">
                                {evt.teacher && (
                                  <span className="inline-flex items-center">
                                    <User className="w-3 h-3 mr-1" />{evt.teacher}
                                  </span>
                                )}
                                {evt.room && (
                                  <span className="inline-flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />{evt.room}
                                  </span>
                                )}
                                {evt.building && (
                                  <span className="inline-flex items-center">
                                    <Building2 className="w-3 h-3 mr-1" />{evt.building}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    )
                  })}
                  </div>
                </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 dark:text-blue-200 text-xs sm:text-sm font-medium">Total Classes</p>
                  <p className="text-2xl sm:text-3xl font-bold">{schedules.length}</p>
                  <p className="text-blue-100 dark:text-blue-200 text-[10px] sm:text-xs">Per week</p>
                </div>
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-200 dark:text-blue-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 dark:text-green-200 text-xs sm:text-sm font-medium">Subjects</p>
                  <p className="text-2xl sm:text-3xl font-bold">{new Set(schedules.map(s => s.subjectId)).size}</p>
                  <p className="text-green-100 dark:text-green-200 text-[10px] sm:text-xs">Active subjects</p>
                </div>
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-green-200 dark:text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 dark:text-purple-200 text-xs sm:text-sm font-medium">Daily Average</p>
                  <p className="text-2xl sm:text-3xl font-bold">{Math.round((schedules.length / 5) || 0)}</p>
                  <p className="text-purple-100 dark:text-purple-200 text-[10px] sm:text-xs">Classes per day</p>
                </div>
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-purple-200 dark:text-purple-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}
