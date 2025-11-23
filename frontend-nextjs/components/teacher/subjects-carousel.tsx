"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, MapPin, ChevronLeft, ChevronRight, Play, Pause, School, Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { getTeacherSections, type SectionWithStudents } from "@/lib/api/endpoints"
import { getTeacherSchedules } from "@/lib/api/endpoints/schedules"
import { type Schedule } from "@/lib/api/types/schedules"
import { apiClient } from "@/lib/api/client"
import Link from "next/link"

interface ClassroomSection {
  id: string
  sectionName: string
  subject: string
  room: string
  time: string
  students: number
  status: "current" | "next" | "previous"
  color: string
  gradientFrom: string
  gradientTo: string
  teacher: string
  duration: string
  day: string
  sectionId: string
}

// Color palette matching the classes page
const colorPalette = [
  { color: "from-blue-500 to-blue-600", gradientFrom: "from-blue-400", gradientTo: "to-blue-600" },
  { color: "from-green-500 to-green-600", gradientFrom: "from-green-400", gradientTo: "to-green-600" },
  { color: "from-orange-500 to-orange-600", gradientFrom: "from-orange-400", gradientTo: "to-orange-600" },
  { color: "from-purple-500 to-purple-600", gradientFrom: "from-purple-400", gradientTo: "to-purple-600" },
  { color: "from-indigo-500 to-blue-600", gradientFrom: "from-indigo-400", gradientTo: "to-blue-600" },
  { color: "from-teal-500 to-green-600", gradientFrom: "from-teal-400", gradientTo: "to-green-600" },
  { color: "from-pink-500 to-rose-600", gradientFrom: "from-pink-400", gradientTo: "to-rose-600" },
  { color: "from-cyan-500 to-blue-600", gradientFrom: "from-cyan-400", gradientTo: "to-blue-600" },
  { color: "from-amber-500 to-amber-600", gradientFrom: "from-amber-400", gradientTo: "to-amber-600" },
  { color: "from-emerald-500 to-emerald-600", gradientFrom: "from-emerald-400", gradientTo: "to-emerald-600" },
]

export default function SubjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [classroomSections, setClassroomSections] = useState<ClassroomSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: user } = useUser()

  // Get current day name
  const getCurrentDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  // Transform API data to ClassroomSection format
  const transformToClassroomSection = (
    section: SectionWithStudents,
    schedules: Schedule[],
    index: number,
    todayDayName: string
  ): ClassroomSection | null => {
    const sectionSchedules = schedules.filter(s => s.sectionId === section.id)
    
    // If no schedules at all for this section, don't show it
    if (sectionSchedules.length === 0) {
      return null
    }
    
    // Find schedule for today - MUST match today's day exactly
    const scheduleDayNormalized = (day: string) => day.trim().toLowerCase()
    const todaySchedule = sectionSchedules.find(s => {
      return scheduleDayNormalized(s.dayOfWeek) === scheduleDayNormalized(todayDayName)
    })
    
    // If no schedule for today, return null - don't show this section
    if (!todaySchedule) {
      return null
    }
    
    const primarySchedule = todaySchedule
    
    const colorInfo = colorPalette[index % colorPalette.length]
    
    // Get subject name
    const subject = primarySchedule?.subject?.subjectName || 'Subject TBA'
    
    // Get room info
    const room = primarySchedule?.room?.roomNumber
      ? `Room ${primarySchedule.room.roomNumber}${primarySchedule.room.floor?.building?.name ? ` (${primarySchedule.room.floor.building.name})` : ''}`
      : section.room_number
        ? `Room ${section.room_number}${section.room_name ? ` (${section.room_name})` : ''}`
        : 'Room TBA'
    
    // Get time info
    const time = primarySchedule
      ? `${primarySchedule.startTime.slice(0, 5)}`
      : 'TBA'
    
    // Calculate duration
    let duration = 'TBA'
    if (primarySchedule?.startTime && primarySchedule?.endTime) {
      const start = new Date(`2000-01-01T${primarySchedule.startTime}`)
      const end = new Date(`2000-01-01T${primarySchedule.endTime}`)
      const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      duration = `${diffMinutes} min`
    }
    
    // Determine status based on current time (only for today's schedule)
    let status: "current" | "next" | "previous" = "next"
    if (primarySchedule && primarySchedule.dayOfWeek.toLowerCase() === todayDayName.toLowerCase()) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const startTime = primarySchedule.startTime.split(':').map(Number)
      const endTime = primarySchedule.endTime.split(':').map(Number)
      const scheduleStart = startTime[0] * 60 + startTime[1]
      const scheduleEnd = endTime[0] * 60 + endTime[1]
      
      if (currentTime >= scheduleStart && currentTime <= scheduleEnd) {
        status = "current"
      } else if (currentTime < scheduleStart) {
        status = "next"
      } else {
        status = "previous"
      }
    }
    
    // Get teacher name (from section or schedule)
    const teacher = section.teacher?.user?.full_name || 
                   section.teacher?.user?.first_name && section.teacher?.user?.last_name
                     ? `${section.teacher.user.first_name} ${section.teacher.user.last_name}`
                     : 'Teacher TBA'
    
    return {
      id: section.id,
      sectionId: section.id,
      sectionName: section.name,
      subject,
      room,
      time,
      students: section.students?.length || 0,
      status,
      color: colorInfo.color,
      gradientFrom: colorInfo.gradientFrom,
      gradientTo: colorInfo.gradientTo,
      teacher,
      duration,
      day: primarySchedule?.dayOfWeek || 'TBA',
    }
  }

  // Fetch sections and schedules
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Get teacher ID
        const userProfile = await apiClient.get<any>('/users/me')
        const teacherId = userProfile.teacher?.id

        if (!teacherId) {
          setClassroomSections([])
          setIsLoading(false)
          return
        }

        // Fetch both sections and schedules
        const [sections, schedules] = await Promise.all([
          getTeacherSections(user.id),
          getTeacherSchedules(teacherId)
        ])

        // Get today's day name
        const todayDayName = getCurrentDayName()
        
        // Check if today is a weekday - if weekend, show nothing
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        const isWeekday = weekdays.includes(todayDayName)
        
        if (!isWeekday) {
          // Weekend (Saturday or Sunday) - no classes, clear sections
          setClassroomSections([])
          setIsLoading(false)
          return
        }

        // Transform data - only include sections with classes scheduled for TODAY
        const transformed = sections
          .map((section, index) => transformToClassroomSection(section, schedules, index, todayDayName))
          .filter((section): section is ClassroomSection => section !== null)

        // Sort by status: current first, then next, then previous
        const sorted = transformed.sort((a, b) => {
          const statusOrder = { current: 0, next: 1, previous: 2 }
          return statusOrder[a.status] - statusOrder[b.status]
        })

        setClassroomSections(sorted)
        
        // Set initial index to current class if available
        const currentIndex = sorted.findIndex(s => s.status === 'current')
        if (currentIndex >= 0) {
          setCurrentIndex(currentIndex)
        } else {
          setCurrentIndex(0)
        }
      } catch (error) {
        console.error('[SubjectsCarousel] Error loading data:', error)
        setClassroomSections([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  useEffect(() => {
    if (!isAutoPlay || classroomSections.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % classroomSections.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlay, classroomSections.length])

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex
    const absIndex = Math.abs(diff)

    if (absIndex === 0) {
      // Current card - center, full size
      return {
        transform: "translateX(0%) rotateY(0deg) scale(1)",
        zIndex: 10,
        opacity: 1,
      }
    } else if (diff > 0) {
      // Right side cards
      return {
        transform: `translateX(${50 + (absIndex - 1) * 20}%) rotateY(-45deg) scale(${0.8 - (absIndex - 1) * 0.1})`,
        zIndex: 10 - absIndex,
        opacity: absIndex <= 2 ? 0.7 - (absIndex - 1) * 0.2 : 0,
      }
    } else {
      // Left side cards
      return {
        transform: `translateX(${-50 - (absIndex - 1) * 20}%) rotateY(45deg) scale(${0.8 - (absIndex - 1) * 0.1})`,
        zIndex: 10 - absIndex,
        opacity: absIndex <= 2 ? 0.7 - (absIndex - 1) * 0.2 : 0,
      }
    }
  }

  const nextSlide = () => {
    if (classroomSections.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % classroomSections.length)
  }

  const prevSlide = () => {
    if (classroomSections.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + classroomSections.length) % classroomSections.length)
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < classroomSections.length) {
      setCurrentIndex(index)
    }
  }

  const currentSection = classroomSections[currentIndex]

  return (
    <Card className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Classroom Sections</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Navigate through your teaching sections</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-80 mb-6">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading sections...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && classroomSections.length === 0 && (
          <div className="flex items-center justify-center h-80 mb-6">
            <div className="text-center">
              <School className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                {!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(getCurrentDayName())
                  ? `No class - Enjoy your weekend!`
                  : 'No classes scheduled for today'}
              </p>
              {!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(getCurrentDayName()) && (
                <p className="text-xs text-slate-500 dark:text-slate-500">Classes resume on Monday</p>
              )}
            </div>
          </div>
        )}

        {/* 3D Carousel */}
        {!isLoading && classroomSections.length > 0 && (
          <div className="relative h-80 mb-6" style={{ perspective: "1000px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {classroomSections.map((section, index) => (
              <div
                key={section.id}
                className="absolute w-72 h-64 cursor-pointer transition-all duration-700 ease-in-out"
                style={getCardStyle(index)}
                onClick={() => goToSlide(index)}
              >
                <Card
                  className={`w-full h-full bg-gradient-to-br ${section.gradientFrom} ${section.gradientTo} border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105`}
                >
                  <CardContent className="p-6 h-full flex flex-col justify-between text-white">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-2xl font-bold text-white tracking-wider">{section.sectionName}</h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-1 ${
                            section.status === "current"
                              ? "bg-white/20 text-white border-white/30"
                              : section.status === "next"
                                ? "bg-yellow-500/20 text-yellow-100 border-yellow-400/30"
                                : "bg-green-500/20 text-green-100 border-green-400/30"
                          }`}
                        >
                          {section.status === "current" && (
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                          )}
                          {section.status === "current" ? "NOW" : section.status === "next" ? "NEXT" : "DONE"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-lg font-semibold text-white/95">{section.subject}</h5>
                        <div className="flex items-center space-x-4 text-white/90 text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{section.room}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{section.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-white/90">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">{section.students} students</span>
                        </div>
                        <div className="text-sm font-medium">{section.duration}</div>
                      </div>

                      <div className="text-xs text-white/80">
                        <div className="flex items-center justify-between">
                          <span>{section.day}</span>
                          <span className="font-medium">
                            {section.time} - {section.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && classroomSections.length > 0 && currentSection && (
          <>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{currentSection.sectionName}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentSection.subject} • {currentSection.room}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {currentSection.day} at {currentSection.time} ({currentSection.duration})
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentSection.students}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Students</div>
                  </div>
                  <Link href={`/teacher/classes/${currentSection.sectionId}`}>
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${currentSection.color} hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all duration-300`}
                    >
                      View Section
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-4" role="tablist" aria-label="Subject slides">
              {classroomSections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-indigo-500 w-6"
                  : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
              role="tab"
              aria-label={`Go to slide ${index + 1} of ${classroomSections.length}`}
                aria-selected={index === currentIndex}
              >
                <span className="sr-only">{index === currentIndex ? `Slide ${index + 1} (current)` : `Slide ${index + 1}`}</span>
              </button>
            ))}
          </div>
          </>
        )}
      </div>
    </Card>
  )
}
