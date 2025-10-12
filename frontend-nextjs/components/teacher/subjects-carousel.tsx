"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, MapPin, ChevronLeft, ChevronRight, Play, Pause, School } from "lucide-react"

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
}

const classroomSections: ClassroomSection[] = [
  {
    id: "1",
    sectionName: "NEUTRON-10",
    subject: "Advanced Mathematics",
    room: "Room 201",
    time: "8:00 AM",
    students: 35,
    status: "previous",
    color: "from-blue-500 to-blue-600",
    gradientFrom: "from-blue-400",
    gradientTo: "to-blue-600",
    teacher: "Ms. Rodriguez",
    duration: "90 min",
    day: "Monday",
  },
  {
    id: "2",
    sectionName: "PROTON-9",
    subject: "Physics Laboratory",
    room: "Lab 105",
    time: "9:45 AM",
    students: 28,
    status: "previous",
    color: "from-green-500 to-green-600",
    gradientFrom: "from-green-400",
    gradientTo: "to-green-600",
    teacher: "Dr. Chen",
    duration: "120 min",
    day: "Monday",
  },
  {
    id: "3",
    sectionName: "ELECTRON-11",
    subject: "English Literature",
    room: "Room 304",
    time: "11:30 AM",
    students: 32,
    status: "previous",
    color: "from-purple-500 to-purple-600",
    gradientFrom: "from-purple-400",
    gradientTo: "to-purple-600",
    teacher: "Mr. Thompson",
    duration: "75 min",
    day: "Monday",
  },
  {
    id: "4",
    sectionName: "PHOTON-8",
    subject: "Chemistry",
    room: "Lab 203",
    time: "1:30 PM",
    students: 30,
    status: "current",
    color: "from-orange-500 to-orange-600",
    gradientFrom: "from-orange-400",
    gradientTo: "to-orange-600",
    teacher: "Ms. Johnson",
    duration: "90 min",
    day: "Monday",
  },
  {
    id: "5",
    sectionName: "QUARK-12",
    subject: "Biology",
    room: "Room 108",
    time: "3:15 PM",
    students: 26,
    status: "next",
    color: "from-red-500 to-red-600",
    gradientFrom: "from-red-400",
    gradientTo: "to-red-600",
    teacher: "Dr. Williams",
    duration: "60 min",
    day: "Monday",
  },
  {
    id: "6",
    sectionName: "ATOM-7",
    subject: "Computer Science",
    room: "Lab 301",
    time: "4:30 PM",
    students: 24,
    status: "next",
    color: "from-cyan-500 to-cyan-600",
    gradientFrom: "from-cyan-400",
    gradientTo: "to-cyan-600",
    teacher: "Mr. Davis",
    duration: "105 min",
    day: "Monday",
  },
  {
    id: "7",
    sectionName: "BOSON-6",
    subject: "History",
    room: "Room 205",
    time: "6:00 PM",
    students: 29,
    status: "next",
    color: "from-amber-500 to-amber-600",
    gradientFrom: "from-amber-400",
    gradientTo: "to-amber-600",
    teacher: "Ms. Garcia",
    duration: "80 min",
    day: "Monday",
  },
  {
    id: "8",
    sectionName: "MUON-5",
    subject: "Art & Design",
    room: "Studio 102",
    time: "7:30 PM",
    students: 22,
    status: "next",
    color: "from-pink-500 to-pink-600",
    gradientFrom: "from-pink-400",
    gradientTo: "to-pink-600",
    teacher: "Mr. Lee",
    duration: "120 min",
    day: "Monday",
  },
  {
    id: "9",
    sectionName: "GLUON-4",
    subject: "Physical Education",
    room: "Gymnasium",
    time: "9:00 PM",
    students: 40,
    status: "next",
    color: "from-emerald-500 to-emerald-600",
    gradientFrom: "from-emerald-400",
    gradientTo: "to-emerald-600",
    teacher: "Coach Martinez",
    duration: "90 min",
    day: "Monday",
  },
  {
    id: "10",
    sectionName: "LEPTON-3",
    subject: "Music Theory",
    room: "Music Hall",
    time: "10:45 PM",
    students: 18,
    status: "next",
    color: "from-violet-500 to-violet-600",
    gradientFrom: "from-violet-400",
    gradientTo: "to-violet-600",
    teacher: "Ms. Anderson",
    duration: "75 min",
    day: "Monday",
  },
]

export default function SubjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(3) // Start with current class (PHOTON-8)
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % classroomSections.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

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
    setCurrentIndex((prev) => (prev + 1) % classroomSections.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + classroomSections.length) % classroomSections.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
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

        {/* 3D Carousel */}
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

                      <div className="text-xs text-white/80 space-y-1">
                        <div>Teacher: {section.teacher}</div>
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
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {currentSection.teacher.split(" ")[1]}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Teacher</div>
              </div>
              <Button
                size="sm"
                className={`bg-gradient-to-r ${currentSection.color} hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all duration-300`}
              >
                View Section
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {classroomSections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-indigo-500 w-6"
                  : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
