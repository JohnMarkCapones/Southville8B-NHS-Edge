"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import StudentLayout from "@/components/student/student-layout"
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Zap,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMySchedule } from "@/lib/api/endpoints"
import type { Schedule } from "@/lib/api/types"
import { DayOfWeek } from "@/lib/api/types"

// Helper function to convert DayOfWeek enum to day number (0=Sunday, 1=Monday, etc.)
const dayOfWeekToNumber = (day: DayOfWeek | string): number => {
  // Handle both enum values and string values from API
  const dayStr = typeof day === 'string' ? day : day.toString();
  
  switch (dayStr) {
    case 'Sunday':
    case DayOfWeek.SUNDAY:
      return 0;
    case 'Monday':
    case DayOfWeek.MONDAY:
      return 1;
    case 'Tuesday':
    case DayOfWeek.TUESDAY:
      return 2;
    case 'Wednesday':
    case DayOfWeek.WEDNESDAY:
      return 3;
    case 'Thursday':
    case DayOfWeek.THURSDAY:
      return 4;
    case 'Friday':
    case DayOfWeek.FRIDAY:
      return 5;
    case 'Saturday':
    case DayOfWeek.SATURDAY:
      return 6;
    default:
      return 0;
  }
}

// Helper function to convert hex color to Tailwind gradient class
const hexToGradientClass = (hex?: string): string => {
  // Default color palette if no hex provided
  const defaultColors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-orange-500 to-orange-600",
    "bg-gradient-to-br from-red-500 to-red-600",
    "bg-gradient-to-br from-yellow-500 to-yellow-600",
    "bg-gradient-to-br from-pink-500 to-pink-600",
    "bg-gradient-to-br from-teal-500 to-teal-600",
  ]

  if (!hex) return defaultColors[Math.floor(Math.random() * defaultColors.length)]

  // For now, return default color - could enhance to convert hex to closest Tailwind color
  return defaultColors[Math.floor(Math.random() * defaultColors.length)]
}

// Helper function to format time from "HH:MM:SS" to "H:MM AM/PM"
const formatTime = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
}

// Helper function to get short day name
const getDayShortName = (day: DayOfWeek): string => {
  const mapping: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'Mon',
    [DayOfWeek.TUESDAY]: 'Tue',
    [DayOfWeek.WEDNESDAY]: 'Wed',
    [DayOfWeek.THURSDAY]: 'Thu',
    [DayOfWeek.FRIDAY]: 'Fri',
    [DayOfWeek.SATURDAY]: 'Sat',
    [DayOfWeek.SUNDAY]: 'Sun',
  }
  return mapping[day]
}

export default function SubjectsPage() {
  const [showAllSubjects, setShowAllSubjects] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Fetch schedules from API
  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ['my-schedules'],
    queryFn: getMySchedule,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Group schedules by subject and transform data
  const subjects = schedules ? Object.values(
    schedules.reduce((acc: Record<string, any>, schedule: Schedule) => {
      const subjectId = schedule.subjectId

      if (!acc[subjectId]) {
        // Create new subject entry
        const teacher = schedule.teacher
          ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
          : 'N/A'

        acc[subjectId] = {
          id: subjectId,
          name: schedule.subject?.subjectName || 'Unknown Subject',
          teacher,
          schedules: [schedule],
          scheduleTimes: [{
            day: dayOfWeekToNumber(schedule.dayOfWeek),
            dayName: schedule.dayOfWeek,
            hour: parseInt(schedule.startTime.split(':')[0]),
            minute: parseInt(schedule.startTime.split(':')[1]),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          }],
          color: hexToGradientClass(schedule.subject?.colorHex),
          description: schedule.subject?.description || 'No description available',
          progress: 0, // Placeholder - would need separate API
          grade: null, // Placeholder - would need GWA/grades API
          assignments: 0, // Placeholder - would need assignments API
          status: 'active',
        }
      } else {
        // Add schedule time to existing subject
        acc[subjectId].schedules.push(schedule)
        acc[subjectId].scheduleTimes.push({
          day: dayOfWeekToNumber(schedule.dayOfWeek),
          dayName: schedule.dayOfWeek,
          hour: parseInt(schedule.startTime.split(':')[0]),
          minute: parseInt(schedule.startTime.split(':')[1]),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })
      }

      return acc
    }, {})
  ).map((subject: any) => {
    // Sort schedule times by day
    subject.scheduleTimes.sort((a: any, b: any) => a.day - b.day)

    // Format schedule text (e.g., "Mon, Wed, Fri - 9:00 AM")
    const uniqueTimes = subject.scheduleTimes.reduce((acc: any[], curr: any) => {
      const existing = acc.find(t => t.startTime === curr.startTime)
      if (existing) {
        existing.days.push(curr.day)
        existing.dayNames.push(curr.dayName)
      } else {
        acc.push({
          startTime: curr.startTime,
          days: [curr.day],
          dayNames: [curr.dayName],
        })
      }
      return acc
    }, [])

    subject.schedule = uniqueTimes.map((time: any) => {
      const dayStr = time.dayNames.map((d: DayOfWeek) => getDayShortName(d)).join(', ')
      return `${dayStr} - ${formatTime(time.startTime)}`
    }).join(' | ')

    // For current subject detection, keep all schedule times
    subject.scheduleTime = {
      times: subject.scheduleTimes.map((t: any) => ({
        days: [t.day],
        hour: t.hour,
        minute: t.minute,
      }))
    }

    return subject
  }) : []

  const isCurrentSubject = (subject: any) => {
    const now = currentTime
    const currentDay = now.getDay() // 0=Sunday, 1=Monday, etc.
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Check all schedule times for this subject
    if (!subject.scheduleTime?.times) return false

    return subject.scheduleTime.times.some((scheduleTime: any) => {
      // Check if today is a scheduled day for this time slot
      if (!scheduleTime.days.includes(currentDay)) return false

      // Check if current time is within class period (assuming 1-hour classes)
      const classStartInMinutes = scheduleTime.hour * 60 + scheduleTime.minute
      const classEndInMinutes = classStartInMinutes + 60 // 1-hour class duration

      return currentTimeInMinutes >= classStartInMinutes && currentTimeInMinutes <= classEndInMinutes
    })
  }

  const displayedSubjects = showAllSubjects ? subjects : subjects.slice(0, 4)

  // Show loading state
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">My Subjects</h1>
                  <p className="text-blue-100 dark:text-blue-200 text-lg">
                    Track your academic progress and access materials
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-slate-600 dark:text-slate-400">Loading your subjects...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Show error state
  if (isError) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">My Subjects</h1>
                  <p className="text-blue-100 dark:text-blue-200 text-lg">
                    Track your academic progress and access materials
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-20">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 text-lg mb-4">Failed to load your subjects</p>
              <p className="text-slate-600 dark:text-slate-400">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Show empty state
  if (!subjects || subjects.length === 0) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">My Subjects</h1>
                  <p className="text-blue-100 dark:text-blue-200 text-lg">
                    Track your academic progress and access materials
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-20">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-lg">No subjects found</p>
              <p className="text-slate-500 dark:text-slate-500 mt-2">Your schedule will appear here once it's available</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-10 right-10 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="relative p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">My Subjects</h1>
                <p className="text-blue-100 dark:text-blue-200 text-lg">
                  Track your academic progress and access materials
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedSubjects.map((subject, index) => {
              const isCurrent = isCurrentSubject(subject)
              return (
                <Card
                  key={subject.id}
                  className={`group transition-all duration-500 hover:-translate-y-2 border-0 backdrop-blur-sm overflow-hidden ${
                    isCurrent
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 shadow-2xl shadow-yellow-500/20 dark:shadow-yellow-400/10 ring-2 ring-yellow-400 dark:ring-yellow-500"
                      : "bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`h-2 ${isCurrent ? "bg-gradient-to-r from-yellow-400 to-orange-500" : subject.color}`}
                  ></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
                            isCurrent ? "ring-2 ring-yellow-400 ring-offset-2" : ""
                          }`}
                        >
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                              {subject.name}
                            </CardTitle>
                            {isCurrent && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold animate-bounce">
                                <Zap className="w-3 h-3" />
                                <span>NOW</span>
                              </div>
                            )}
                          </div>
                          <CardDescription className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{subject.teacher}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {subject.grade !== null && (
                          <Badge
                            variant="outline"
                            className="text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md px-2 py-1"
                          >
                            {subject.grade}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            subject.status === "upcoming"
                              ? "default"
                              : subject.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs capitalize px-2 py-0.5"
                        >
                          {subject.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {subject.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{subject.progress}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={subject.progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
                        <div
                          className={`absolute inset-0 rounded-full opacity-80 ${
                            isCurrent
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                              : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrent
                          ? "bg-yellow-100 dark:bg-yellow-950/50 border border-yellow-300 dark:border-yellow-700"
                          : "bg-slate-50 dark:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Clock
                          className={`w-4 h-4 flex-shrink-0 ${isCurrent ? "text-yellow-600" : "text-blue-500"}`}
                        />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">Schedule</span>
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-sm text-right">
                        {subject.schedule}
                      </span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        className={`flex-1 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 text-sm h-9 ${
                          isCurrent
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        }`}
                        onClick={() => (window.location.href = `/student/materials/${subject.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Materials
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors bg-transparent h-9 px-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {subjects.length > 4 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAllSubjects(!showAllSubjects)}
                className="flex items-center space-x-2 px-8 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
              >
                {showAllSubjects ? (
                  <>
                    <ChevronUp className="w-5 h-5" />
                    <span>View Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    <span>View More ({subjects.length - 4} more subjects)</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
