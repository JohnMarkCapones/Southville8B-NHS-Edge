"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Clock,
  MapPin,
  Users,
  BookOpen,
  Plus,
  Filter,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Search,
  Grid3x3,
  List,
  CalendarDays,
  School,
  User,
  DoorOpen,
  Eye,
  CalendarPlus,
  AlertTriangle,
  UserCircle,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Sample data
const initialSchedules = [
  {
    id: "SCH001",
    subject: "Mathematics",
    teacher: "Ms. Garcia",
    grade: "Grade 8",
    section: "Einstein",
    room: "Room 201",
    day: "Monday",
    startTime: "08:00",
    endTime: "09:00",
    students: 32,
    color: "bg-blue-500",
    status: "active",
    recurring: "weekly",
  },
  {
    id: "SCH002",
    subject: "Science",
    teacher: "Mr. Santos",
    grade: "Grade 8",
    section: "Newton",
    room: "Lab 1",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    students: 28,
    color: "bg-green-500",
    status: "active",
    recurring: "weekly",
  },
  {
    id: "SCH003",
    subject: "English",
    teacher: "Mrs. Cruz",
    grade: "Grade 8",
    section: "Einstein",
    room: "Room 105",
    day: "Monday",
    startTime: "10:00",
    endTime: "11:00",
    students: 32,
    color: "bg-purple-500",
    status: "active",
    recurring: "weekly",
  },
  {
    id: "SCH004",
    subject: "Filipino",
    teacher: "Mrs. Reyes",
    grade: "Grade 8",
    section: "Einstein",
    room: "Room 103",
    day: "Monday",
    startTime: "13:00",
    endTime: "14:00",
    students: 32,
    color: "bg-yellow-500",
    status: "active",
    recurring: "weekly",
  },
  {
    id: "SCH005",
    subject: "PE",
    teacher: "Coach Martinez",
    grade: "Grade 8",
    section: "Einstein",
    room: "Gymnasium",
    day: "Monday",
    startTime: "14:00",
    endTime: "15:00",
    students: 32,
    color: "bg-red-500",
    status: "active",
    recurring: "weekly",
  },
]

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
]

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const subjects = ["Mathematics", "Science", "English", "Filipino", "Araling Panlipunan", "MAPEH", "TLE", "ESP"]
const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"]
const sections = ["Einstein", "Newton", "Darwin", "Curie", "Tesla"]
const rooms = ["Room 101", "Room 102", "Room 103", "Room 201", "Room 202", "Lab 1", "Lab 2", "Gymnasium", "Music Room"]

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState(initialSchedules)
  const [viewMode, setViewMode] = useState<"calendar" | "week" | "list">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGrade, setFilterGrade] = useState("all")
  const [filterSection, setFilterSection] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  // Teacher search and autocomplete states
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false)
  const teacherInputRef = useRef<HTMLInputElement>(null)
  const [conflicts, setConflicts] = useState<string[]>([])

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    day: string | null
    time: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    day: null,
    time: null,
  })

  const { toast } = useToast()

  const [newSchedule, setNewSchedule] = useState({
    subject: "",
    teacher: "",
    grade: "",
    section: "",
    room: "",
    day: "Monday",
    startTime: "08:00",
    endTime: "09:00",
    students: 0,
    recurring: "weekly",
    color: "bg-blue-500",
  })

  const [addConfirmation, setAddConfirmation] = useState<{
    isOpen: boolean
    schedule: any
  }>({ isOpen: false, schedule: null })

  const [editConfirmation, setEditConfirmation] = useState<{
    isOpen: boolean
    schedule: any
  }>({ isOpen: false, schedule: null })

  // Detect scheduling conflicts
  const detectConflicts = (schedule: any, allSchedules: any[]) => {
    return allSchedules.filter(
      (s) =>
        s.id !== schedule.id &&
        s.day === schedule.day &&
        s.room === schedule.room &&
        ((s.startTime >= schedule.startTime && s.startTime < schedule.endTime) ||
          (s.endTime > schedule.startTime && s.endTime <= schedule.endTime) ||
          (s.startTime <= schedule.startTime && s.endTime >= schedule.endTime)),
    )
  }

  const validateSchedule = (schedule: any) => {
    const errors: string[] = []

    if (!schedule.subject || schedule.subject.trim() === "") {
      errors.push("Subject is required")
    }
    if (!schedule.teacher || schedule.teacher.trim() === "") {
      errors.push("Teacher is required")
    }
    if (!schedule.grade || schedule.grade.trim() === "") {
      errors.push("Grade is required")
    }
    if (!schedule.section || schedule.section.trim() === "") {
      errors.push("Section is required")
    }
    if (!schedule.room || schedule.room.trim() === "") {
      errors.push("Room is required")
    }
    if (!schedule.day || schedule.day.trim() === "") {
      errors.push("Day is required")
    }
    if (!schedule.startTime || schedule.startTime.trim() === "") {
      errors.push("Start time is required")
    }
    if (!schedule.endTime || schedule.endTime.trim() === "") {
      errors.push("End time is required")
    }
    if (schedule.students <= 0) {
      errors.push("Number of students must be greater than 0")
    }

    return errors
  }

  const getAvailableTeachers = () => {
    let filteredSchedules = schedules

    // Filter by grade if selected
    if (filterGrade !== "all") {
      filteredSchedules = filteredSchedules.filter((s) => s.grade === filterGrade)
    }

    // Filter by section if selected
    if (filterSection !== "all") {
      filteredSchedules = filteredSchedules.filter((s) => s.section === filterSection)
    }

    return Array.from(new Set(filteredSchedules.map((s) => s.teacher)))
  }

  const getFilteredTeachers = () => {
    const availableTeachers = getAvailableTeachers()

    if (!teacherSearchQuery.trim()) {
      return availableTeachers
    }

    return availableTeachers.filter((teacher) => teacher.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
  }

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    // For performance: only show schedules when a teacher is selected
    if (!selectedTeacher) return false

    const matchesSearch =
      schedule.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.room.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGrade = filterGrade === "all" || schedule.grade === filterGrade
    const matchesSection = filterSection === "all" || schedule.section === filterSection
    const matchesSubject = filterSubject === "all" || schedule.subject === filterSubject
    const matchesTeacher = schedule.teacher === selectedTeacher

    return matchesSearch && matchesGrade && matchesSection && matchesSubject && matchesTeacher
  })

  // Get unique teachers (This might be redundant now with getAvailableTeachers, but kept for backward compatibility or specific uses)
  const teachers = Array.from(new Set(schedules.map((s) => s.teacher)))

  // Calculate statistics
  const totalClasses = schedules.length
  const totalSubjects = new Set(schedules.map((s) => s.subject)).size
  const totalConflicts =
    schedules.reduce((acc, schedule) => {
      return acc + detectConflicts(schedule, schedules).length
    }, 0) / 2 // Divide by 2 because each conflict is counted twice

  const roomUtilization = Math.round((schedules.length / (rooms.length * weekDays.length * 8)) * 100)

  const handleAddSchedule = () => {
    const errors = validateSchedule(newSchedule)

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div className="space-y-1">
            <p className="font-medium">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    const id = `SCH${String(schedules.length + 1).padStart(3, "0")}`
    const schedule = { ...newSchedule, id, status: "active" }

    const conflictingSchedules = detectConflicts(schedule, schedules)
    if (conflictingSchedules.length > 0) {
      toast({
        title: "Scheduling Conflict Detected",
        description: `${schedule.room} is already booked at this time. Please choose a different room or time.`,
        variant: "destructive",
      })
      return
    }

    // Show confirmation modal
    setAddConfirmation({ isOpen: true, schedule })
  }

  const confirmAddSchedule = () => {
    if (addConfirmation.schedule) {
      setSchedules([...schedules, addConfirmation.schedule])
      toast({
        title: "✅ Schedule Added Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {addConfirmation.schedule.subject} has been scheduled successfully.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                <CalendarDays className="w-3 h-3" />
              </div>
              <span>
                {addConfirmation.schedule.grade} - {addConfirmation.schedule.section}
              </span>
              <span>•</span>
              <span>{addConfirmation.schedule.teacher}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle2 className="w-3 h-3" />
              <span>Schedule created successfully</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 6000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      setNewSchedule({
        subject: "",
        teacher: "",
        grade: "",
        section: "",
        room: "",
        day: "Monday",
        startTime: "08:00",
        endTime: "09:00",
        students: 0,
        recurring: "weekly",
        color: "bg-blue-500",
      })
      setIsAddDialogOpen(false)
      setAddConfirmation({ isOpen: false, schedule: null })
    }
  }

  const handleEditSchedule = () => {
    if (!selectedSchedule) return

    const errors = validateSchedule(selectedSchedule)

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div className="space-y-1">
            <p className="font-medium">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    const conflictingSchedules = detectConflicts(selectedSchedule, schedules)
    if (conflictingSchedules.length > 0) {
      toast({
        title: "Scheduling Conflict Detected",
        description: `${selectedSchedule.room} is already booked at this time.`,
        variant: "destructive",
      })
      return
    }

    // Show confirmation modal
    setEditConfirmation({ isOpen: true, schedule: selectedSchedule })
  }

  const confirmEditSchedule = () => {
    if (editConfirmation.schedule) {
      setSchedules(schedules.map((s) => (s.id === editConfirmation.schedule.id ? editConfirmation.schedule : s)))
      toast({
        title: "✅ Schedule Updated Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium">Schedule has been updated successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="font-medium">{editConfirmation.schedule.subject}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {editConfirmation.schedule.grade} - {editConfirmation.schedule.section}
              </span>
            </div>
          </div>
        ),
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setIsEditDialogOpen(false)
      setSelectedSchedule(null)
      setEditConfirmation({ isOpen: false, schedule: null })
    }
  }

  const handleDeleteSchedule = () => {
    if (!selectedSchedule) return

    setSchedules(schedules.filter((s) => s.id !== selectedSchedule.id))
    toast({
      title: "Schedule Deleted",
      description: `${selectedSchedule.subject} schedule has been removed.`,
    })
    setIsDeleteDialogOpen(false)
    setSelectedSchedule(null)
  }

  const handleDuplicateSchedule = (schedule: any) => {
    const id = `SCH${String(schedules.length + 1).padStart(3, "0")}`
    const newSchedule = { ...schedule, id }
    setSchedules([...schedules, newSchedule])
    toast({
      title: "Schedule Duplicated",
      description: `${schedule.subject} schedule has been duplicated.`,
    })
  }

  const handleContextMenuAddSchedule = (e: React.MouseEvent, day: string, time: string) => {
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

    setContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      day,
      time,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      day: null,
      time: null,
    })
  }

  useEffect(() => {
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
  }, [contextMenu.visible])

  const openAddDialogFromContext = () => {
    if (contextMenu.day && contextMenu.time) {
      setNewSchedule({
        ...newSchedule,
        day: contextMenu.day,
        startTime: contextMenu.time,
        endTime: timeSlots[timeSlots.indexOf(contextMenu.time) + 2] || "09:00",
      })
      setIsAddDialogOpen(true)
      closeContextMenu()
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (teacherInputRef.current && !teacherInputRef.current.contains(e.target as Node)) {
        setShowTeacherSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectTeacher = (teacher: string) => {
    setSelectedTeacher(teacher)
    setTeacherSearchQuery(teacher)
    setShowTeacherSuggestions(false)
  }

  const handleClearTeacher = () => {
    setSelectedTeacher(null)
    setTeacherSearchQuery("")
    setShowTeacherSuggestions(false)
  }

  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <UserCircle className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Search for a teacher to view their schedule
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Use the teacher search bar above to find and select a teacher
          </p>
          {filterGrade !== "all" && (
            <p className="text-xs text-blue-600 dark:text-blue-400">Showing teachers for {filterGrade} only</p>
          )}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    if (!selectedTeacher) {
      return renderEmptyState()
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-2 mb-4">
          <div className="text-sm font-semibold text-gray-600 p-3 text-center dark:text-gray-400">Time</div>
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-sm font-semibold p-3 text-center rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {timeSlots
            .filter((_, i) => i % 2 === 0)
            .map((time) => (
              <div key={time} className="grid grid-cols-6 gap-2 min-h-[80px]">
                <div className="text-xs font-medium text-gray-500 p-3 border-r border-gray-200 bg-gray-50/50 rounded-l-lg flex items-center justify-center dark:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
                  {time}
                </div>
                {weekDays.map((day) => {
                  const daySchedules = filteredSchedules.filter((s) => s.day === day && s.startTime === time)
                  const hasConflict = daySchedules.some((s) => detectConflicts(s, schedules).length > 0)

                  if (daySchedules.length === 0) {
                    return (
                      <div
                        key={`${day}-${time}`}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-blue-50/50 transition-all duration-200 dark:border-gray-700 dark:hover:bg-blue-900/20 cursor-context-menu"
                        onContextMenu={(e) => handleContextMenuAddSchedule(e, day, time)}
                      />
                    )
                  }

                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`p-2 border border-gray-200 rounded-lg hover:bg-blue-50/50 transition-all duration-200 dark:border-gray-700 dark:hover:bg-blue-900/20 ${
                        hasConflict ? "ring-2 ring-red-500 dark:ring-red-400" : ""
                      }`}
                    >
                      {daySchedules.map((schedule) => (
                        <DropdownMenu key={schedule.id}>
                          <DropdownMenuTrigger asChild>
                            <div
                              className={`text-xs p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${schedule.color} text-white relative`}
                            >
                              {hasConflict && <AlertCircle className="w-3 h-3 absolute top-1 right-1 text-red-300" />}
                              <div className="font-semibold truncate">{schedule.subject}</div>
                              <div className="text-xs opacity-90 truncate flex items-center gap-1 mt-1">
                                <MapPin className="w-2 h-2" />
                                {schedule.room}
                              </div>
                              <div className="text-xs opacity-75 truncate flex items-center gap-1">
                                <Users className="w-2 h-2" />
                                {schedule.section}
                              </div>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSchedule(schedule)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateSchedule(schedule)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedSchedule(schedule)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

  const renderListView = () => {
    if (!selectedTeacher) {
      return renderEmptyState()
    }

    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Grade & Section</TableHead>
              <TableHead>Day & Time</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.map((schedule) => {
              const hasConflict = detectConflicts(schedule, schedules).length > 0
              return (
                <TableRow key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${schedule.color}`} />
                      <span className="font-medium">{schedule.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {schedule.teacher}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-gray-400" />
                      {schedule.grade} - {schedule.section}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {schedule.day}, {schedule.startTime}-{schedule.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-gray-400" />
                      {schedule.room}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.students}</TableCell>
                  <TableCell>
                    {hasConflict ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Conflict
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 bg-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSchedule(schedule)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateSchedule(schedule)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedSchedule(schedule)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 min-h-screen dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
            Schedule & Calendar Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage class schedules, detect conflicts, and optimize room utilization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 gap-2">
                <Plus className="w-4 h-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
                <DialogDescription>
                  Create a new class schedule. The system will automatically detect conflicts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={newSchedule.subject}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Input
                    value={newSchedule.teacher}
                    onChange={(e) => setNewSchedule({ ...newSchedule, teacher: e.target.value })}
                    placeholder="Teacher name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select
                    value={newSchedule.grade}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, grade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select
                    value={newSchedule.section}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Select
                    value={newSchedule.room}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, room: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select
                    value={newSchedule.day}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, day: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select
                    value={newSchedule.startTime}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select
                    value={newSchedule.endTime}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, endTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Students</Label>
                  <Input
                    type="number"
                    value={newSchedule.students}
                    onChange={(e) => setNewSchedule({ ...newSchedule, students: Number.parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select
                    value={newSchedule.color}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-500">Blue</SelectItem>
                      <SelectItem value="bg-green-500">Green</SelectItem>
                      <SelectItem value="bg-purple-500">Purple</SelectItem>
                      <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                      <SelectItem value="bg-red-500">Red</SelectItem>
                      <SelectItem value="bg-pink-500">Pink</SelectItem>
                      <SelectItem value="bg-indigo-500">Indigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Classes</p>
                <p className="text-3xl font-bold">{totalClasses}</p>
                <p className="text-blue-100 text-xs">Scheduled</p>
              </div>
              <CalendarDays className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Subjects</p>
                <p className="text-3xl font-bold">{totalSubjects}</p>
                <p className="text-green-100 text-xs">Active subjects</p>
              </div>
              <BookOpen className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Conflicts</p>
                <p className="text-3xl font-bold">{totalConflicts}</p>
                <p className="text-orange-100 text-xs">Need resolution</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Room Utilization</p>
                <p className="text-3xl font-bold">{roomUtilization}%</p>
                <p className="text-purple-100 text-xs">Average usage</p>
              </div>
              <MapPin className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dynamic Filters based on View Mode */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Teacher Search with Autocomplete */}
            <div className="space-y-2 relative" ref={teacherInputRef}>
              <Label className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Search Teacher <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Type teacher name..."
                  value={teacherSearchQuery}
                  onChange={(e) => {
                    setTeacherSearchQuery(e.target.value)
                    setShowTeacherSuggestions(true)
                    if (!e.target.value.trim()) {
                      setSelectedTeacher(null)
                    }
                  }}
                  onFocus={() => setShowTeacherSuggestions(true)}
                  className="pl-10 pr-10"
                />
                {selectedTeacher && (
                  <button
                    onClick={handleClearTeacher}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions */}
              {showTeacherSuggestions && teacherSearchQuery && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredTeachers().length > 0 ? (
                    <div className="p-1">
                      {getFilteredTeachers().map((teacher) => (
                        <button
                          key={teacher}
                          onClick={() => handleSelectTeacher(teacher)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{teacher}</span>
                          {selectedTeacher === teacher && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No teachers found
                      {filterGrade !== "all" && <p className="text-xs mt-1">for {filterGrade}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grade Filter */}
            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Select
                value={filterGrade}
                onValueChange={(value) => {
                  setFilterGrade(value)
                  // Clear teacher selection when grade changes
                  setSelectedTeacher(null)
                  setTeacherSearchQuery("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Filter */}
            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={filterSection}
                onValueChange={(value) => {
                  setFilterSection(value)
                  // Clear teacher selection when section changes
                  setSelectedTeacher(null)
                  setTeacherSearchQuery("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* General Search */}
            <div className="space-y-2">
              <Label>Search Schedules</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search subject, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* selected teacher indicator */}
          {selectedTeacher && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <UserCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Viewing schedule for: {selectedTeacher}
              </span>
              {filterGrade !== "all" && (
                <>
                  <span className="text-blue-400">•</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{filterGrade}</span>
                </>
              )}
              {filterSection !== "all" && (
                <>
                  <span className="text-blue-400">•</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{filterSection}</span>
                </>
              )}
              <button
                onClick={handleClearTeacher}
                className="ml-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Toggle and Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Schedule View</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                Week
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "week" && renderWeekView()}
          {viewMode === "list" && renderListView()}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the schedule details. Conflicts will be detected automatically.
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={selectedSchedule.subject}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Input
                  value={selectedSchedule.teacher}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, teacher: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select
                  value={selectedSchedule.grade}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={selectedSchedule.section}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={selectedSchedule.room}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, room: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Select
                  value={selectedSchedule.day}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, day: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={selectedSchedule.startTime}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={selectedSchedule.endTime}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, endTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <strong>Subject:</strong> {selectedSchedule.subject}
              </p>
              <p className="text-sm">
                <strong>Teacher:</strong> {selectedSchedule.teacher}
              </p>
              <p className="text-sm">
                <strong>Grade & Section:</strong> {selectedSchedule.grade} - {selectedSchedule.section}
              </p>
              <p className="text-sm">
                <strong>Time:</strong> {selectedSchedule.day}, {selectedSchedule.startTime}-{selectedSchedule.endTime}
              </p>
              <p className="text-sm">
                <strong>Room:</strong> {selectedSchedule.room}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchedule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {contextMenu.visible && contextMenu.day && contextMenu.time && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          {/* Context Menu */}
          <div
            className="fixed z-50 min-w-[220px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              {/* Date Header */}
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1">
                {contextMenu.day} at {contextMenu.time}
              </div>

              {/* Add Schedule */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={openAddDialogFromContext}
              >
                <Plus className="w-4 h-4 text-green-600" />
                <span>Add Schedule</span>
              </button>

              {/* Quick Event */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("Quick event for:", contextMenu.day, contextMenu.time)
                  closeContextMenu()
                }}
              >
                <CalendarPlus className="w-4 h-4 text-blue-600" />
                <span>Quick Schedule</span>
              </button>

              <div className="h-px bg-border my-1" />

              {/* View Day */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  console.log("View day:", contextMenu.day)
                  closeContextMenu()
                }}
              >
                <Eye className="w-4 h-4 text-purple-600" />
                <span>View Day Details</span>
              </button>

              {/* Copy Time Slot */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  navigator.clipboard.writeText(`${contextMenu.day} at ${contextMenu.time}`)
                  toast({
                    title: "Copied to clipboard",
                    description: `${contextMenu.day} at ${contextMenu.time}`,
                  })
                  closeContextMenu()
                }}
              >
                <Copy className="w-4 h-4 text-orange-600" />
                <span>Copy Time Slot</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Confirmation Modal */}
      {addConfirmation.isOpen && addConfirmation.schedule && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setAddConfirmation({ isOpen: false, schedule: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mr-4">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Add Schedule</h3>
                    <p className="text-sm text-muted-foreground">Confirm schedule creation</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to add this schedule for{" "}
                    <span className="font-semibold text-green-600">{addConfirmation.schedule.subject}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{addConfirmation.schedule.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">by {addConfirmation.schedule.teacher}</p>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4" />
                          <span>
                            {addConfirmation.schedule.grade} - {addConfirmation.schedule.section}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {addConfirmation.schedule.day}, {addConfirmation.schedule.startTime} -{" "}
                            {addConfirmation.schedule.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{addConfirmation.schedule.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{addConfirmation.schedule.students} students</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-700 dark:text-green-400">
                        <p className="font-medium mb-1">Ready to Schedule</p>
                        <ul className="space-y-1 text-xs">
                          <li>• No scheduling conflicts detected</li>
                          <li>• Room is available at this time</li>
                          <li>• Schedule will be added to the timetable</li>
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
                    onClick={() => setAddConfirmation({ isOpen: false, schedule: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAddSchedule}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Confirmation Modal */}
      {editConfirmation.isOpen && editConfirmation.schedule && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setEditConfirmation({ isOpen: false, schedule: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <Edit className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Update Schedule</h3>
                    <p className="text-sm text-muted-foreground">Confirm schedule changes</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to update the schedule for{" "}
                    <span className="font-semibold text-blue-600">{editConfirmation.schedule.subject}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{editConfirmation.schedule.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">by {editConfirmation.schedule.teacher}</p>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4" />
                          <span>
                            {editConfirmation.schedule.grade} - {editConfirmation.schedule.section}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {editConfirmation.schedule.day}, {editConfirmation.schedule.startTime} -{" "}
                            {editConfirmation.schedule.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{editConfirmation.schedule.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{editConfirmation.schedule.students} students</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Schedule details will be updated</li>
                          <li>• Changes will be reflected immediately</li>
                          <li>• Students and teachers will see the updated schedule</li>
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
                    onClick={() => setEditConfirmation({ isOpen: false, schedule: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmEditSchedule}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Update Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Toaster />
    </div>
  )
}
