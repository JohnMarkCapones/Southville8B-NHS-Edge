"use client"

import type React from "react"
import Link from "next/link"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Clock,
  MapPin,
  BookOpen,
  Calendar,
  Search,
  MoreVertical,
  UserCheck,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const classesData = [
  {
    id: 1,
    section: "NEUTRON-10",
    subject: "Advanced Mathematics",
    room: "Room 301",
    time: "8:00 AM - 9:30 AM",
    students: 32,
    present: 28,
    avgScore: 87,
    status: "active",
    nextClass: "Today",
    color: "from-blue-500 to-purple-600",
    performance: "excellent",
    assignments: 3,
    announcements: 2,
  },
  {
    id: 2,
    section: "PROTON-9",
    subject: "Physics Laboratory",
    room: "Lab 205",
    time: "10:00 AM - 11:30 AM",
    students: 28,
    present: 26,
    avgScore: 82,
    status: "active",
    nextClass: "Today",
    color: "from-green-500 to-teal-600",
    performance: "good",
    assignments: 2,
    announcements: 1,
  },
  {
    id: 3,
    section: "ELECTRON-11",
    subject: "Chemistry",
    room: "Room 402",
    time: "1:00 PM - 2:30 PM",
    students: 30,
    present: 29,
    avgScore: 91,
    status: "active",
    nextClass: "Tomorrow",
    color: "from-orange-500 to-red-600",
    performance: "excellent",
    assignments: 4,
    announcements: 3,
  },
  {
    id: 4,
    section: "PHOTON-8",
    subject: "Biology",
    room: "Room 103",
    time: "3:00 PM - 4:30 PM",
    students: 25,
    present: 23,
    avgScore: 78,
    status: "completed",
    nextClass: "Monday",
    color: "from-purple-500 to-pink-600",
    performance: "good",
    assignments: 1,
    announcements: 0,
  },
  {
    id: 5,
    section: "QUARK-12",
    subject: "English Literature",
    room: "Room 201",
    time: "9:00 AM - 10:30 AM",
    students: 35,
    present: 32,
    avgScore: 85,
    status: "active",
    nextClass: "Today",
    color: "from-indigo-500 to-blue-600",
    performance: "good",
    assignments: 5,
    announcements: 1,
  },
  {
    id: 6,
    section: "ATOM-7",
    subject: "History",
    room: "Room 304",
    time: "11:00 AM - 12:30 PM",
    students: 29,
    present: 27,
    avgScore: 89,
    status: "active",
    nextClass: "Tomorrow",
    color: "from-teal-500 to-green-600",
    performance: "excellent",
    assignments: 2,
    announcements: 2,
  },
]

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ type: string; value: string; icon: any }>>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const generateSuggestions = (term: string) => {
    if (!term.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const allSuggestions = [
      // Sections
      ...classesData.map((cls) => ({ type: "Section", value: cls.section, icon: BookOpen })),
      // Subjects
      ...classesData.map((cls) => ({ type: "Subject", value: cls.subject, icon: BookOpen })),
      // Rooms
      ...classesData.map((cls) => ({ type: "Room", value: cls.room, icon: MapPin })),
      // Times
      ...classesData.map((cls) => ({ type: "Time", value: cls.time, icon: Clock })),
    ]

    const filtered = allSuggestions
      .filter((suggestion) => suggestion.value.toLowerCase().includes(term.toLowerCase()))
      .reduce(
        (unique, current) => {
          return unique.find((item) => item.value === current.value) ? unique : [...unique, current]
        },
        [] as Array<{ type: string; value: string; icon: any }>,
      )
      .slice(0, 6)

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    generateSuggestions(value)
  }

  const handleSuggestionClick = (suggestion: { type: string; value: string; icon: any }) => {
    setSearchTerm(suggestion.value)
    setShowSuggestions(false)
  }

  const filteredClasses = classesData.filter((classItem) => {
    const matchesSearch =
      classItem.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.time.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || classItem.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "needs-improvement":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const totalStudents = classesData.reduce((sum, cls) => sum + cls.students, 0)
  const activeClasses = classesData.filter((cls) => cls.status === "active").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and monitor your classroom sections</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg dark:shadow-blue-500/25">
          <Calendar className="w-4 h-4 mr-2" />
          View Schedule
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeClasses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-500 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 z-10" />
          <Input
            placeholder="Search classes, subjects, rooms, or times..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm && generateSuggestions(searchTerm)}
            className="pl-10 dark:bg-gray-800/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 backdrop-blur-sm"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-sm">
              <div className="p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">Suggestions</p>
                {suggestions.map((suggestion, index) => {
                  const IconComponent = suggestion.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                    >
                      <IconComponent className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-900 dark:text-white">{suggestion.value}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({suggestion.type})</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
            size="sm"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            onClick={() => setFilterStatus("completed")}
            size="sm"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card
            key={classItem.id}
            className="hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 border-0 shadow-md dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm"
          >
            <CardHeader
              className={`bg-gradient-to-r ${classItem.color} text-white rounded-t-lg relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
              <div className="relative flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold drop-shadow-sm">{classItem.section}</CardTitle>
                  <p className="text-white/90 text-sm mt-1 drop-shadow-sm">{classItem.subject}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-600">
                    <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Take Attendance
                    </DropdownMenuItem>
                    <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Assignment
                    </DropdownMenuItem>
                    <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Announcement
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Class Info */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  {classItem.room}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {classItem.time}
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(classItem.status)}>
                    {classItem.status === "active" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    )}
                    {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Next: {classItem.nextClass}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {classItem.assignments} assignments
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {classItem.announcements} announcements
                  </span>
                </div>
                <Link href={`/teacher/classes/${classItem.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50 backdrop-blur-sm"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}
