"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import StudentLayout from "@/components/student/student-layout"
import {
  BookOpen,
  Play,
  FileText,
  Clock,
  Star,
  ArrowLeft,
  Eye,
  Bookmark,
  RotateCcw,
  Download,
  ZoomIn,
  ZoomOut,
  FullscreenIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  Trophy,
  Award,
  Brain,
  Lightbulb,
  GraduationCap,
  Users,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ModuleViewerPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = Number.parseInt(params.id as string)
  const [currentPage, setCurrentPage] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [readingTime, setReadingTime] = useState(0)

  // Mock module data - in real app, this would come from API
  const modules = [
    {
      id: 1,
      title: "Quadratic Equations Formula Sheet",
      subject: "Mathematics",
      subjectId: 1,
      description: "Comprehensive guide to quadratic equations with formulas, examples, and practice problems",
      totalPages: 24,
      estimatedTime: "45 min",
      difficulty: "Intermediate",
      type: "Reference Guide",
      author: "Ms. Garcia",
      lastUpdated: "2024-01-15",
      rating: 4.8,
      downloads: 1250,
      thumbnail: "/mathematics-formula-sheet-pdf.jpg",
      tags: ["Algebra", "Formulas", "Practice"],
      chapters: [
        { id: 1, title: "Introduction to Quadratic Equations", pages: "1-3", duration: "8 min" },
        { id: 2, title: "Standard Form and Vertex Form", pages: "4-8", duration: "12 min" },
        { id: 3, title: "Solving Methods", pages: "9-16", duration: "18 min" },
        { id: 4, title: "Real-World Applications", pages: "17-21", duration: "15 min" },
        { id: 5, title: "Practice Problems", pages: "22-24", duration: "12 min" },
      ],
    },
    {
      id: 2,
      title: "Science Lab Safety Manual",
      subject: "Science",
      subjectId: 2,
      description: "Essential safety protocols and procedures for laboratory work",
      totalPages: 18,
      estimatedTime: "30 min",
      difficulty: "Beginner",
      type: "Safety Manual",
      author: "Mr. Santos",
      lastUpdated: "2024-01-10",
      rating: 4.9,
      downloads: 980,
      thumbnail: "/science-lab-safety-manual.jpg",
      tags: ["Safety", "Laboratory", "Protocols"],
      chapters: [
        { id: 1, title: "General Safety Rules", pages: "1-4", duration: "8 min" },
        { id: 2, title: "Equipment Handling", pages: "5-10", duration: "12 min" },
        { id: 3, title: "Chemical Safety", pages: "11-15", duration: "10 min" },
        { id: 4, title: "Emergency Procedures", pages: "16-18", duration: "8 min" },
      ],
    },
  ]

  const module = modules.find((m) => m.id === moduleId)

  useEffect(() => {
    if (module) {
      // Calculate progress based on current page
      const newProgress = Math.round((currentPage / module.totalPages) * 100)
      setProgress(newProgress)
    }
  }, [currentPage, module])

  useEffect(() => {
    // Reading time tracker
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!module) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Module Not Found</h1>
            <Button onClick={() => router.push("/student/courses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary dark:from-primary/80 dark:via-accent/80 dark:to-primary/80">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-10 right-10 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="relative p-6 text-white">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/student/materials/${module.subjectId}`)}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {module.subject}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{module.title}</h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 backdrop-blur-sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                  <p className="text-blue-100 dark:text-blue-200 text-lg mb-3">{module.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{module.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{module.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{module.totalPages} pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span>{module.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {module.type}
                    </Badge>
                    {module.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:min-w-[200px]">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold">{progress}%</div>
                  <div className="text-sm text-blue-100">Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold">{formatTime(readingTime)}</div>
                  <div className="text-sm text-blue-100">Reading Time</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reading Progress</span>
                <span className="text-sm font-bold">
                  Page {currentPage} of {module.totalPages}
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-white/20" />
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Table of Contents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        index === 0 ? "bg-primary text-white shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <div className="font-medium text-sm line-clamp-2">{chapter.title}</div>
                      <div className="flex items-center justify-between mt-1 text-xs opacity-75">
                        <span>Pages {chapter.pages}</span>
                        <span>{chapter.duration}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    Print Preview
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Target className="w-4 h-4 mr-2" />
                    Take Notes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main PDF Viewer */}
            <div className="lg:col-span-3">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle>PDF Viewer</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}>
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[60px] text-center">{zoomLevel}%</span>
                        <Button size="sm" variant="outline" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
                          <FullscreenIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* PDF Viewer Placeholder */}
                  <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden min-h-[600px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-12 h-12 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                          Ready to Start Learning?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                          Click one of the buttons below to begin reading this module
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                            onClick={() => setCurrentPage(1)}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Start Learning
                          </Button>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                            onClick={() =>
                              setCurrentPage(Math.max(1, Math.floor(module.totalPages * (progress / 100))))
                            }
                          >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Page {currentPage} of {module.totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={module.totalPages}
                          value={currentPage}
                          onChange={(e) =>
                            setCurrentPage(
                              Math.min(module.totalPages, Math.max(1, Number.parseInt(e.target.value) || 1)),
                            )
                          }
                          className="w-16 px-2 py-1 text-sm border rounded text-center"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Go to page</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(module.totalPages, currentPage + 1))}
                      disabled={currentPage === module.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Achievement */}
              {progress >= 100 && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-0 shadow-xl mt-6">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
                        Module Completed!
                      </CardTitle>
                    </div>
                    <CardDescription className="text-lg text-green-700 dark:text-green-300">
                      Congratulations! You've successfully completed this learning module.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Knowledge Gained</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Mastered key concepts</p>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Achievement</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Module completed</p>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Ready for More</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Continue learning</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-6">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent text-white"
                        onClick={() => router.push(`/student/materials/${module.subjectId}`)}
                      >
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Explore More Modules
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
