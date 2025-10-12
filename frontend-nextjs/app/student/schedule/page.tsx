"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Printer,
  Share2,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const timeSlots = [
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

  const scheduleData = {
    Monday: {
      "8:00 AM": { subject: "Mathematics", teacher: "Ms. Garcia", room: "Room 201", color: "bg-blue-500" },
      "9:00 AM": { subject: "Science", teacher: "Mr. Santos", room: "Lab 1", color: "bg-green-500" },
      "10:00 AM": { subject: "English", teacher: "Mrs. Cruz", room: "Room 105", color: "bg-purple-500" },
      "11:00 AM": { subject: "Break", teacher: "", room: "", color: "bg-gray-300" },
      "1:00 PM": { subject: "Filipino", teacher: "Mrs. Reyes", room: "Room 103", color: "bg-yellow-500" },
      "2:00 PM": { subject: "PE", teacher: "Coach Martinez", room: "Gymnasium", color: "bg-red-500" },
    },
    Tuesday: {
      "8:00 AM": { subject: "Araling Panlipunan", teacher: "Mr. Dela Cruz", room: "Room 204", color: "bg-cyan-500" },
      "9:00 AM": { subject: "Mathematics", teacher: "Ms. Garcia", room: "Room 201", color: "bg-blue-500" },
      "10:00 AM": { subject: "Science", teacher: "Mr. Santos", room: "Lab 1", color: "bg-green-500" },
      "11:00 AM": { subject: "Break", teacher: "", room: "", color: "bg-gray-300" },
      "1:00 PM": { subject: "English", teacher: "Mrs. Cruz", room: "Room 105", color: "bg-purple-500" },
      "2:00 PM": { subject: "TLE", teacher: "Mr. Aquino", room: "Workshop", color: "bg-lime-500" },
    },
    Wednesday: {
      "8:00 AM": { subject: "Filipino", teacher: "Mrs. Reyes", room: "Room 103", color: "bg-yellow-500" },
      "9:00 AM": { subject: "Mathematics", teacher: "Ms. Garcia", room: "Room 201", color: "bg-blue-500" },
      "10:00 AM": { subject: "MAPEH", teacher: "Ms. Torres", room: "Music Room", color: "bg-pink-500" },
      "11:00 AM": { subject: "Break", teacher: "", room: "", color: "bg-gray-300" },
      "1:00 PM": { subject: "Science", teacher: "Mr. Santos", room: "Lab 1", color: "bg-green-500" },
      "2:00 PM": { subject: "ESP", teacher: "Mrs. Morales", room: "Room 102", color: "bg-indigo-500" },
    },
    Thursday: {
      "8:00 AM": { subject: "English", teacher: "Mrs. Cruz", room: "Room 105", color: "bg-purple-500" },
      "9:00 AM": { subject: "Araling Panlipunan", teacher: "Mr. Dela Cruz", room: "Room 204", color: "bg-cyan-500" },
      "10:00 AM": { subject: "Mathematics", teacher: "Ms. Garcia", room: "Room 201", color: "bg-blue-500" },
      "11:00 AM": { subject: "Break", teacher: "", room: "", color: "bg-gray-300" },
      "1:00 PM": { subject: "TLE", teacher: "Mr. Aquino", room: "Workshop", color: "bg-lime-500" },
      "2:00 PM": { subject: "PE", teacher: "Coach Martinez", room: "Gymnasium", color: "bg-red-500" },
    },
    Friday: {
      "8:00 AM": { subject: "Science", teacher: "Mr. Santos", room: "Lab 1", color: "bg-green-500" },
      "9:00 AM": { subject: "Filipino", teacher: "Mrs. Reyes", room: "Room 103", color: "bg-yellow-500" },
      "10:00 AM": { subject: "ESP", teacher: "Mrs. Morales", room: "Room 102", color: "bg-indigo-500" },
      "11:00 AM": { subject: "Break", teacher: "", room: "", color: "bg-gray-300" },
      "1:00 PM": { subject: "MAPEH", teacher: "Ms. Torres", room: "Music Room", color: "bg-pink-500" },
      "2:00 PM": { subject: "Club Activities", teacher: "", room: "Various", color: "bg-orange-500" },
    },
  }

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
          <title>Class Schedule - Precious Danielle Mañalac</title>
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
            <h2>Precious Danielle Mañalac</h2>
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
                      const classData = scheduleData[day]?.[time]
                      if (!classData) {
                        return "<td></td>"
                      }
                      if (classData.subject === "Break") {
                        return '<td class="break-cell">Break</td>'
                      }
                      return `
                      <td>
                        <div class="subject-cell">${classData.subject}</div>
                        <div class="teacher-cell">${classData.teacher}</div>
                        <div class="room-cell">${classData.room}</div>
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

  return (
    <StudentLayout>
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800/50 min-h-screen">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Class Schedule
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Your weekly academic schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={downloadScheduleAsPDF}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-slate-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-slate-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-slate-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 shadow-lg">
          <Button
            variant="outline"
            onClick={() => {
              const newWeek = new Date(currentWeek)
              newWeek.setDate(currentWeek.getDate() - 7)
              setCurrentWeek(newWeek)
            }}
            className="bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-600/90 border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 dark:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Week
          </Button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Week of {weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
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
            className="bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-600/90 border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 dark:text-slate-200"
          >
            Next Week
            <ChevronRight className="w-4 h-4 ml-2" />
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-200/50 dark:border-slate-600/50">
                    <th className="p-6 text-left font-bold text-slate-700 dark:text-slate-200 w-32">Time</th>
                    {weekDays.map((day, index) => (
                      <th key={day} className="p-6 text-center font-bold text-slate-700 dark:text-slate-200 min-w-48">
                        <div className="space-y-1">
                          <div className="text-lg">{day}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                            {weekDates[index]?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr
                      key={time}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors duration-200"
                    >
                      <td className="p-6 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-700/30 border-r border-slate-200/50 dark:border-slate-600/50">
                        {time}
                      </td>
                      {weekDays.map((day) => {
                        const classData = scheduleData[day]?.[time]
                        return (
                          <td key={`${day}-${time}`} className="p-3">
                            {classData ? (
                              <div
                                className={`${classData.color} text-white rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                                  classData.subject === "Break"
                                    ? "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                                    : ""
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="font-bold text-sm">{classData.subject}</div>
                                  {classData.teacher && (
                                    <div className="text-xs opacity-90 flex items-center">
                                      <User className="w-3 h-3 mr-1" />
                                      {classData.teacher}
                                    </div>
                                  )}
                                  {classData.room && (
                                    <div className="text-xs opacity-90 flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {classData.room}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                Free
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">Total Classes</p>
                  <p className="text-3xl font-bold">25</p>
                  <p className="text-blue-100 dark:text-blue-200 text-xs">Per week</p>
                </div>
                <BookOpen className="w-12 h-12 text-blue-200 dark:text-blue-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 dark:text-green-200 text-sm font-medium">Subjects</p>
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-green-100 dark:text-green-200 text-xs">Active subjects</p>
                </div>
                <BookOpen className="w-12 h-12 text-green-200 dark:text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 dark:text-purple-200 text-sm font-medium">Daily Average</p>
                  <p className="text-3xl font-bold">5</p>
                  <p className="text-purple-100 dark:text-purple-200 text-xs">Classes per day</p>
                </div>
                <Clock className="w-12 h-12 text-purple-200 dark:text-purple-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}
