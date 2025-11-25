"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"
import { adminListSchedules, adminListSections } from "@/lib/api/endpoints/schedules"
import { academicYearsApi } from "@/lib/api/endpoints/academic-years"
import {
  Calendar,
  Clock,
  Filter,
  BookOpen,
  Users,
  MapPin,
  Building2,
  Eye,
  Loader2,
  Check,
  ChevronsUpDown,
  GraduationCap,
  Download,
} from "lucide-react"

export default function TeacherClassSchedulePage() {
  const { data: user } = useUser()
  const teacherId = user?.teacher?.id || user?.id

  // Active academic year and semester
  const { data: activeYear } = useQuery({ queryKey: ['active-year'], queryFn: () => academicYearsApi.getActive() })
  const { data: currentPeriod } = useQuery({ queryKey: ['current-period'], queryFn: () => academicYearsApi.getCurrentPeriod() })
  const defaultSchoolYear = activeYear?.year_name || ''
  const defaultSemester = (() => {
    const n = (currentPeriod?.period_name || '').toLowerCase()
    if (n.includes('first') || n.includes('1st')) return '1st'
    if (n.includes('second') || n.includes('2nd')) return '2nd'
    if (n.includes('summer')) return 'Summer'
    return currentPeriod?.period_name || ''
  })()

  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear)
  const [semester, setSemester] = useState(defaultSemester)
  const [sectionId, setSectionId] = useState('')
  const [sectionOpen, setSectionOpen] = useState(false)
  const [startHour, setStartHour] = useState(7)
  const [endHour, setEndHour] = useState(17)

  useEffect(() => { if (!schoolYear && defaultSchoolYear) setSchoolYear(defaultSchoolYear) }, [defaultSchoolYear])
  useEffect(() => { if (!semester && defaultSemester) setSemester(defaultSemester) }, [defaultSemester])

  // Fetch sections for filter
  const { data: sectionsData } = useQuery({ queryKey: ['teacher-sections'], queryFn: () => adminListSections({ limit: 1000 }) })
  const sectionOpts = sectionsData?.data || []

  // Fetch schedules - automatically filtered to current teacher
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-class-schedule", teacherId, schoolYear, semester, sectionId],
    queryFn: () => {
      return adminListSchedules({
        teacherId: teacherId || undefined,
        schoolYear: schoolYear || undefined,
        semester: semester || undefined,
        sectionId: sectionId || undefined,
        status: 'published', // Only show published schedules
        limit: 200
      })
    },
    enabled: !!teacherId,
  })

  const schedules = data?.data || []

  // Download schedule as PDF
  const downloadScheduleAsPDF = async () => {
    if (schedules.length === 0) return

    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const formatTime12h = (time24: string) => {
        if (!time24) return ''
        const [hours, minutes] = time24.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        return `${h12}:${minutes} ${ampm}`
      }

      // Group schedules by day
      const schedulesByDay: Record<string, any[]> = {}
      days.forEach(d => schedulesByDay[d] = [])
      
      schedules.forEach(s => {
        const day = s.day_of_week || s.dayOfWeek
        if (schedulesByDay[day]) {
          schedulesByDay[day].push(s)
        }
      })

      // Sort schedules by time within each day
      days.forEach(day => {
        schedulesByDay[day].sort((a, b) => {
          const timeA = a.start_time || a.startTime || '00:00'
          const timeB = b.start_time || b.startTime || '00:00'
          return timeA.localeCompare(timeB)
        })
      })

      const teacherName = user?.full_name || (user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'Teacher')

      let yPos = 15

      // Header
      doc.setFontSize(18)
      doc.setTextColor(37, 99, 235) // Blue color
      doc.text('My Class Schedule', 148, yPos, { align: 'center' })
      
      yPos += 8
      doc.setFontSize(14)
      doc.setTextColor(30, 64, 175) // Darker blue
      doc.text(teacherName, 148, yPos, { align: 'center' })
      
      yPos += 7
      doc.setFontSize(11)
      doc.setTextColor(107, 114, 128) // Gray
      doc.text('Southville 8B National High School', 148, yPos, { align: 'center' })

      // Filter info
      if (schoolYear || semester) {
        yPos += 7
        doc.setFontSize(9)
        doc.setTextColor(75, 85, 99)
        const filterText = [schoolYear && `School Year: ${schoolYear}`, semester && `Semester: ${semester}`].filter(Boolean).join(' | ')
        doc.text(filterText, 148, yPos, { align: 'center' })
      }

      yPos += 12

      // Define column positions and widths
      const colDay = { x: 12, width: 25 }
      const colTime = { x: 40, width: 35 }
      const colSubject = { x: 78, width: 45 }
      const colSection = { x: 126, width: 50 }
      const colRoom = { x: 179, width: 60 }

      // Table header
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255) // White text
      doc.setFillColor(37, 99, 235) // Blue background
      doc.rect(10, yPos - 6, 278, 7, 'F')
      
      doc.text('Day', colDay.x + colDay.width / 2, yPos, { align: 'center' })
      doc.text('Time', colTime.x + colTime.width / 2, yPos, { align: 'center' })
      doc.text('Subject', colSubject.x + colSubject.width / 2, yPos, { align: 'center' })
      doc.text('Section', colSection.x + colSection.width / 2, yPos, { align: 'center' })
      doc.text('Room', colRoom.x + colRoom.width / 2, yPos, { align: 'center' })

      yPos += 8

      // Table rows
      doc.setTextColor(0, 0, 0) // Black text
      doc.setFontSize(9)
      const pageHeight = 185 // A4 landscape height minus margins
      const lineHeight = 5
      const cellPadding = 2

      days.forEach(day => {
        const daySchedules = schedulesByDay[day] || []
        
        if (daySchedules.length === 0) {
          // Check if we need a new page
          if (yPos > pageHeight) {
            doc.addPage()
            yPos = 15
          }
          
          const rowHeight = 8
          doc.setDrawColor(229, 231, 235)
          doc.rect(10, yPos - 5, 278, rowHeight, 'D')
          
          doc.setFont('helvetica', 'bold')
          doc.text(day, colDay.x + colDay.width / 2, yPos + 2, { align: 'center' })
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(156, 163, 175)
          doc.text('No classes scheduled', 148, yPos + 2, { align: 'center' })
          doc.setTextColor(0, 0, 0)
          yPos += rowHeight + 1
        } else {
          daySchedules.forEach((s, index) => {
            // Check if we need a new page
            if (yPos > pageHeight) {
              doc.addPage()
              yPos = 15
            }

            const subjectName = s.subject?.subject_name || s.subject?.subjectName || 'Class'
            const sectionName = s.section?.name || 'TBA'
            const roomNumber = s.room?.roomNumber || s.room?.room_number || 'TBA'
            const buildingName = s.room?.floor?.building?.building_name || s.room?.floor?.building?.name || s.building?.building_name || s.building?.name || ''
            const startTime = s.start_time || s.startTime || ''
            const endTime = s.end_time || s.endTime || ''

            // Calculate row height based on content
            const timeText = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`
            const subjectLines = doc.splitTextToSize(subjectName, colSubject.width - cellPadding * 2)
            const sectionLines = doc.splitTextToSize(sectionName, colSection.width - cellPadding * 2)
            const roomText = buildingName ? `${roomNumber} (${buildingName})` : roomNumber
            const roomLines = doc.splitTextToSize(roomText, colRoom.width - cellPadding * 2)
            
            const maxLines = Math.max(subjectLines.length, sectionLines.length, roomLines.length, 1)
            const rowHeight = Math.max(8, maxLines * lineHeight + cellPadding * 2)

            // Draw cell borders
            doc.setDrawColor(229, 231, 235)
            doc.rect(10, yPos - 5, 278, rowHeight, 'D')
            
            // Vertical lines between columns
            doc.line(colDay.x + colDay.width, yPos - 5, colDay.x + colDay.width, yPos - 5 + rowHeight)
            doc.line(colTime.x + colTime.width, yPos - 5, colTime.x + colTime.width, yPos - 5 + rowHeight)
            doc.line(colSubject.x + colSubject.width, yPos - 5, colSubject.x + colSubject.width, yPos - 5 + rowHeight)
            doc.line(colSection.x + colSection.width, yPos - 5, colSection.x + colSection.width, yPos - 5 + rowHeight)

            let currentY = yPos + 2

            // Day (only for first row of each day, centered vertically)
            if (index === 0) {
              doc.setFont('helvetica', 'bold')
              const dayY = yPos + (rowHeight / 2) - 2
              doc.text(day, colDay.x + colDay.width / 2, dayY, { align: 'center' })
              doc.setFont('helvetica', 'normal')
            }

            // Time
            doc.setTextColor(37, 99, 235)
            doc.setFont('helvetica', 'bold')
            const timeY = yPos + (rowHeight / 2) - 2
            const timeLines = doc.splitTextToSize(timeText, colTime.width - cellPadding * 2)
            doc.text(timeLines, colTime.x + colTime.width / 2, timeY, { align: 'center', maxWidth: colTime.width - cellPadding * 2 })
            
            // Subject
            doc.setTextColor(30, 64, 175)
            doc.setFont('helvetica', 'bold')
            doc.text(subjectLines, colSubject.x + cellPadding, currentY, { maxWidth: colSubject.width - cellPadding * 2 })
            
            // Section
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')
            doc.text(sectionLines, colSection.x + cellPadding, currentY, { maxWidth: colSection.width - cellPadding * 2 })
            
            // Room - handle wrapping properly
            doc.setFontSize(8)
            doc.text(roomLines, colRoom.x + cellPadding, currentY, { maxWidth: colRoom.width - cellPadding * 2 })
            doc.setFontSize(9)

            yPos += rowHeight + 1
          })
        }
      })

      // Footer
      const footerY = 195
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}`,
        148,
        footerY,
        { align: 'center' }
      )
      doc.text(`Total Classes: ${schedules.length}`, 148, footerY + 4, { align: 'center' })

      // Generate filename
      const fileName = `Class_Schedule_${teacherName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Save the PDF
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to print dialog if jsPDF fails
      alert('Error generating PDF. Please try again or use the browser print function.')
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 min-h-screen dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Calendar className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
              My Class Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your weekly teaching schedule
            </p>
          </div>
        </div>
        {schedules.length > 0 && (
          <Button
            onClick={downloadScheduleAsPDF}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {(schoolYear || semester || sectionId) && (
              <Badge variant="secondary" className="text-xs">
                {[schoolYear, semester, sectionId].filter(Boolean).length} active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder={defaultSchoolYear ? "School Year" : "-"}
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="h-10 border-2 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <Input
              placeholder={defaultSemester ? "Semester" : "-"}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="h-10 border-2 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />

            {/* Section Filter */}
            <Popover open={sectionOpen} onOpenChange={setSectionOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={sectionOpen}
                  className={cn(
                    "h-10 w-full justify-between border-2 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700",
                    !sectionId && "text-muted-foreground"
                  )}
                >
                  {sectionId
                    ? sectionOpts.find((s: any) => s.id === sectionId)?.name || "Selected Section"
                    : "Filter by Section..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
                <Command className="dark:bg-gray-800">
                  <CommandInput placeholder="Search sections..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No section found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSectionId('')
                          setSectionOpen(false)
                        }}
                        className="dark:text-white dark:aria-selected:bg-gray-700"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            sectionId === '' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Sections
                      </CommandItem>
                      {sectionOpts.map((s: any) => (
                        <CommandItem
                          key={s.id}
                          value={`${s.name || ''} ${s.id}`}
                          onSelect={() => {
                            setSectionId(s.id)
                            setSectionOpen(false)
                          }}
                          className="dark:text-white dark:aria-selected:bg-gray-700"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              sectionId === s.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.name || s.id.slice(0, 8)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSchoolYear('')
                setSemester('')
                setSectionId('')
              }}
              className="h-10"
            >
              Clear Filters
            </Button>
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Display Hours:</span>
            <Input
              type="number"
              min={0}
              max={23}
              value={startHour}
              onChange={(e) => setStartHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              className="w-16 h-8 text-center"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">to</span>
            <Input
              type="number"
              min={0}
              max={23}
              value={endHour}
              onChange={(e) => setEndHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              className="w-16 h-8 text-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Weekly Schedule</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {schedules.length} {schedules.length === 1 ? 'class' : 'classes'} this week
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Read-only
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading schedule...</span>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
              <GraduationCap className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-center">No classes scheduled</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 text-center">
                Try adjusting your filters or contact your administrator
              </p>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="max-h-[70vh] overflow-auto">
                <WeeklyScheduleGrid
                  schedules={schedules}
                  startHour={startHour}
                  endHour={endHour}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Weekly Schedule Grid Component (Read-only)
function WeeklyScheduleGrid({ schedules, startHour, endHour }: { schedules: any[]; startHour: number; endHour: number }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const dayStartMinutes = startHour * 60
  const dayEndMinutes = endHour * 60
  const pxPerMinute = 2
  const header = 56
  const topPadding = 140 // Space below headers
  const height = header + topPadding + (dayEndMinutes - dayStartMinutes) * pxPerMinute

  const parseMin = (t: string) => (parseInt(t.slice(0, 2)) * 60) + parseInt(t.slice(3, 5))

  const formatTime12h = (time24: string) => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  // Build events by day
  const byDay = useMemo(() => {
    const result: Record<string, any[]> = {}
    days.forEach(d => result[d] = [])

    for (const s of schedules) {
      const start = parseMin((s.start_time || s.startTime))
      const end = parseMin((s.end_time || s.endTime))
      const day = s.day_of_week || s.dayOfWeek
      const startTime = s.start_time || s.startTime
      const endTime = s.end_time || s.endTime

      const sectionName = s.section?.name || 'TBA'
      const roomNumber = s.room?.roomNumber || s.room?.room_number || 'TBA'
      const buildingName = s.room?.floor?.building?.building_name || s.building?.building_name || s.building?.name || ''

      result[day]?.push({
        id: s.id,
        startMin: start,
        endMin: end,
        label: s.subject?.subject_name || s.subject?.subjectName || 'Class',
        timeRange: `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`,
        section: sectionName,
        room: roomNumber,
        building: buildingName,
        color: s.subject?.color_hex || '#4f46e5',
      })
    }
    return result
  }, [schedules])

  // Calculate lanes for overlapping classes
  for (const day of days) {
    const evs = byDay[day]
    evs.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)
    const active: Array<{ end: number; lane: number }> = []
    let maxLanes = 0
    for (const e of evs) {
      for (let i = active.length - 1; i >= 0; i--) if (active[i].end <= e.startMin) active.splice(i, 1)
      const used = new Set(active.map(a => a.lane))
      let lane = 0
      while (used.has(lane)) lane++
      e.lane = lane
      active.push({ end: e.endMin, lane })
      if (active.length > maxLanes) maxLanes = active.length
      e.totalLanes = maxLanes
    }
    evs.forEach(e => e.totalLanes = Math.max(e.totalLanes, maxLanes))
  }

  const now = new Date()
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="min-w-[1000px]">
      <div className="grid grid-cols-[120px_repeat(5,1fr)] relative">
        {/* Time ruler */}
        <div className="relative border-r bg-white dark:bg-gray-900" style={{ minHeight: height }}>
          <div className="sticky top-0 z-20 h-14 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">
            Time
          </div>
          {Array.from({ length: (endHour - startHour) + 1 }).map((_, i) => {
            const m = startHour * 60 + i * 60
            const label = new Date(0, 0, 0, Math.floor(m / 60)).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
            return (
              <div key={i} className="absolute left-0 right-0" style={{ top: header + topPadding + (m - dayStartMinutes) * pxPerMinute }}>
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                <div className="-mt-2 pl-2 text-[10px] text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            )
          })}
        </div>

        {/* Day columns */}
        {days.map((day, idx) => (
          <div key={day} className="relative border-r last:border-r-0 bg-white dark:bg-gray-900" style={{ minHeight: height }}>
            <div className="sticky top-0 z-20 h-14 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
              {day}
            </div>

            {/* Zebra stripes */}
            {Array.from({ length: endHour - startHour }).map((_, i) => (
              <div
                key={i}
                className={`absolute left-0 right-0 ${i % 2 ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-transparent'}`}
                style={{ top: header + topPadding + i * 60 * pxPerMinute, height: 60 * pxPerMinute }}
              />
            ))}

            {/* Current time indicator */}
            {day === todayName && nowMinutes >= dayStartMinutes && nowMinutes <= dayEndMinutes && (
              <div className="absolute left-0 right-0 z-10" style={{ top: header + topPadding + (nowMinutes - dayStartMinutes) * pxPerMinute }}>
                <div className="h-0.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              </div>
            )}

            {/* Schedule events (read-only) */}
            {(byDay[day] || []).map(evt => {
              const topPos = header + topPadding + (evt.startMin - dayStartMinutes) * pxPerMinute
              const eventHeight = Math.max(60, (evt.endMin - evt.startMin) * pxPerMinute)
              const widthPct = 100 / evt.totalLanes
              const leftPct = evt.lane * widthPct

              return (
                <div
                  key={evt.id}
                  className="absolute rounded-lg overflow-hidden shadow-md border-2 border-white/20 transition-all duration-200 hover:shadow-lg hover:z-10"
                  style={{
                    top: topPos,
                    height: eventHeight,
                    backgroundColor: evt.color,
                    color: '#ffffff',
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    paddingLeft: '4px',
                    paddingRight: '4px',
                  }}
                >
                  <div className="px-2 py-1.5 h-full overflow-hidden flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BookOpen className="w-3 h-3 flex-shrink-0" />
                      <span className="font-bold text-xs truncate">{evt.label}</span>
                    </div>
                    <div className="text-[10px] opacity-90 space-y-0.5 flex-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{evt.timeRange}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{evt.section}</span>
                      </div>
                      {evt.room !== 'TBA' && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{evt.room}</span>
                        </div>
                      )}
                      {evt.building && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate text-[9px]">{evt.building}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
