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
} from "lucide-react"
import { useState, useEffect } from "react"

export default function SubjectsPage() {
  const [showAllSubjects, setShowAllSubjects] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      teacher: "Ms. Garcia",
      schedule: "Mon, Wed, Fri - 5:30 AM",
      scheduleTime: { days: [1, 3, 5], hour: 5, minute: 30 }, // Mon=1, Wed=3, Fri=5
      progress: 78,
      grade: 96,
      assignments: 12,
      nextClass: "Tomorrow 5:30 AM",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      description: "Advanced algebra and geometry concepts",
      status: "active",
    },
    {
      id: 2,
      name: "Science",
      teacher: "Mr. Santos",
      schedule: "Tue, Thu - 9:30 AM",
      scheduleTime: { days: [2, 4], hour: 9, minute: 30 }, // Tue=2, Thu=4
      progress: 85,
      grade: 94,
      assignments: 8,
      nextClass: "Today 9:30 AM",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      description: "Physics and chemistry fundamentals",
      status: "upcoming",
    },
    {
      id: 3,
      name: "English",
      teacher: "Mrs. Cruz",
      schedule: "Mon, Wed, Fri - 11:00 AM",
      scheduleTime: { days: [1, 3, 5], hour: 11, minute: 0 },
      progress: 72,
      grade: 92,
      assignments: 15,
      nextClass: "Tomorrow 11:00 AM",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      description: "Literature analysis and creative writing",
      status: "active",
    },
    {
      id: 4,
      name: "Filipino",
      teacher: "Ms. Reyes",
      schedule: "Tue, Thu - 1:00 PM",
      scheduleTime: { days: [2, 4], hour: 13, minute: 0 },
      progress: 90,
      grade: 95,
      assignments: 10,
      nextClass: "Today 1:00 PM",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      description: "Filipino literature and language studies",
      status: "upcoming",
    },
    {
      id: 5,
      name: "TLE (Technology and Livelihood Education)",
      teacher: "Mr. Dela Cruz",
      schedule: "Mon, Wed - 2:00 PM",
      scheduleTime: { days: [1, 3], hour: 14, minute: 0 },
      progress: 88,
      grade: 93,
      assignments: 6,
      nextClass: "Tomorrow 2:00 PM",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      description: "Practical skills and entrepreneurship",
      status: "active",
    },
    {
      id: 6,
      name: "Araling Panlipunan",
      teacher: "Mrs. Mendoza",
      schedule: "Tue, Fri - 10:00 AM",
      scheduleTime: { days: [2, 5], hour: 10, minute: 0 },
      progress: 82,
      grade: 91,
      assignments: 9,
      nextClass: "Friday 10:00 AM",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      description: "Philippine history and social studies",
      status: "active",
    },
    {
      id: 7,
      name: "ESP (Edukasyon sa Pagpapakatao)",
      teacher: "Ms. Torres",
      schedule: "Thu - 3:00 PM",
      scheduleTime: { days: [4], hour: 15, minute: 0 },
      progress: 95,
      grade: 98,
      assignments: 4,
      nextClass: "Thursday 3:00 PM",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      description: "Values education and character development",
      status: "completed",
    },
    {
      id: 8,
      name: "MAPEH (Music, Arts, Physical Education, Health)",
      teacher: "Mr. Villanueva",
      schedule: "Mon, Wed, Fri - 3:30 PM",
      scheduleTime: { days: [1, 3, 5], hour: 15, minute: 30 },
      progress: 87,
      grade: 94,
      assignments: 7,
      nextClass: "Tomorrow 3:30 PM",
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      description: "Creative arts, physical fitness, and health education",
      status: "active",
    },
  ]

  const isCurrentSubject = (subject: any) => {
    const now = currentTime
    const currentDay = now.getDay() // 0=Sunday, 1=Monday, etc.
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Check if today is a scheduled day for this subject
    if (!subject.scheduleTime.days.includes(currentDay)) return false

    // Check if current time is within class period (assuming 1-hour classes)
    const classStartInMinutes = subject.scheduleTime.hour * 60 + subject.scheduleTime.minute
    const classEndInMinutes = classStartInMinutes + 60 // 1-hour class duration

    return currentTimeInMinutes >= classStartInMinutes && currentTimeInMinutes <= classEndInMinutes
  }

  const displayedSubjects = showAllSubjects ? subjects : subjects.slice(0, 4)

  const overallGrade = Math.round(subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length)
  const overallProgress = Math.round(subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length)
  const totalAssignments = subjects.reduce((sum, subject) => sum + subject.assignments, 0)

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
                        <Badge
                          variant="outline"
                          className="text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md px-2 py-1"
                        >
                          {subject.grade}
                        </Badge>
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

                    <div className="space-y-2">
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
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400 text-sm">Next</span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm text-right">
                          {subject.nextClass}
                        </span>
                      </div>
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
