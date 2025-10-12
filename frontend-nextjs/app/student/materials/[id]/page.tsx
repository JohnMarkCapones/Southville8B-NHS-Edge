"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import StudentLayout from "@/components/student/student-layout"
import {
  Download,
  Star,
  Award,
  Users,
  ArrowLeft,
  Eye,
  Heart,
  Bookmark,
  Trophy,
  Target,
  Zap,
  GraduationCap,
} from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function SubjectMaterialsPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = Number.parseInt(params.id as string)
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([])
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<{ id: number; title: string } | null>(null)

  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      teacher: "Ms. Garcia",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      description: "Advanced algebra and geometry concepts",
      totalModules: 8,
      completedModules: 5,
      totalPDFs: 12,
      downloadedPDFs: 8,
    },
    {
      id: 2,
      name: "Science",
      teacher: "Mr. Santos",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      description: "Physics and chemistry fundamentals",
      totalModules: 6,
      completedModules: 3,
      totalPDFs: 10,
      downloadedPDFs: 5,
    },
    {
      id: 3,
      name: "English",
      teacher: "Mrs. Cruz",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      description: "Literature analysis and creative writing",
      totalModules: 7,
      completedModules: 4,
      totalPDFs: 15,
      downloadedPDFs: 10,
    },
    {
      id: 4,
      name: "Filipino",
      teacher: "Ms. Reyes",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      description: "Filipino literature and language studies",
      totalModules: 6,
      completedModules: 6,
      totalPDFs: 8,
      downloadedPDFs: 8,
    },
    {
      id: 5,
      name: "TLE (Technology and Livelihood Education)",
      teacher: "Mr. Dela Cruz",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      description: "Practical skills and entrepreneurship",
      totalModules: 5,
      completedModules: 3,
      totalPDFs: 6,
      downloadedPDFs: 4,
    },
  ]

  const subject = subjects.find((s) => s.id === subjectId)

  if (!subject) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Subject Not Found</h1>
            <Button onClick={() => router.push("/student/courses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const pdfs = [
    {
      id: 1,
      title: "Quadratic Equations Formula Sheet",
      description: "Quick reference guide with all essential formulas",
      pages: 4,
      size: "2.1 MB",
      type: "Reference",
      downloadCount: 1500,
      rating: 4.9,
      isBookmarked: false,
      thumbnail: "/mathematics-formula-sheet-pdf.jpg",
    },
    {
      id: 2,
      title: "Practice Problems Set 1",
      description: "50 practice problems with detailed solutions",
      pages: 25,
      size: "5.8 MB",
      type: "Practice",
      downloadCount: 1200,
      rating: 4.8,
      isBookmarked: true,
      thumbnail: "/mathematics-practice-problems-workbook.jpg",
    },
    {
      id: 3,
      title: "Advanced Quadratic Applications",
      description: "Complex real-world problem solving techniques",
      pages: 18,
      size: "4.2 MB",
      type: "Advanced",
      downloadCount: 800,
      rating: 4.7,
      isBookmarked: false,
      thumbnail: "/mathematics-advanced-applications-guide.jpg",
    },
    {
      id: 4,
      title: "Visual Guide to Graphing",
      description: "Step-by-step visual guide for graphing quadratic functions",
      pages: 12,
      size: "8.5 MB",
      type: "Visual Guide",
      downloadCount: 950,
      rating: 4.9,
      isBookmarked: true,
      thumbnail: "/mathematics-graphing-visual-guide.jpg",
    },
  ]

  const progressPercentage = Math.round((subject.completedModules / subject.totalModules) * 100)

  const toggleBookmark = (id: number) => {
    setBookmarkedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleDownloadClick = (pdf: { id: number; title: string }) => {
    setSelectedPdf(pdf)
    setDownloadConfirmOpen(true)
  }

  const handleDownloadConfirm = () => {
    if (selectedPdf) {
      console.log("[v0] Downloading PDF:", selectedPdf.title)
      setDownloadConfirmOpen(false)
      setSelectedPdf(null)
    }
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary dark:from-primary/80 dark:via-accent/80 dark:to-primary/80">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/30 rounded-full blur-2xl"></div>
            <div className="absolute top-10 right-20 w-40 h-40 bg-cyan-600/35 rounded-full"></div>
            <div className="absolute top-32 right-40 w-20 h-20 bg-teal-600/40 rounded-full"></div>
            <div className="absolute bottom-10 left-32 w-32 h-32 bg-indigo-600/30 rounded-lg rotate-45"></div>
            <div className="absolute top-20 left-1/3 w-16 h-16 bg-sky-600/35 rounded-md rotate-12"></div>
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-blue-700/25 rounded-full blur-xl"></div>
            <div
              className="absolute bottom-20 right-1/4 w-24 h-24 bg-cyan-700/30 rounded-full"
              style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
            ></div>
          </div>

          <div className="relative p-8 text-white">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/student/courses")}
                className="text-white hover:bg-black/20 backdrop-blur-sm border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 ${subject.color} rounded-2xl flex items-center justify-center shadow-2xl`}>
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 text-white">{subject.name}</h1>
                  <p className="text-white/90 text-lg mb-2">{subject.description}</p>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{subject.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{progressPercentage}% Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-500/30">
                  <div className="text-2xl font-bold text-white">{subject.totalModules}</div>
                  <div className="text-sm text-white/80">Modules</div>
                </div>
                <div className="bg-cyan-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-cyan-500/30">
                  <div className="text-2xl font-bold text-white">{subject.completedModules}</div>
                  <div className="text-sm text-white/80">Completed</div>
                </div>
                <div className="bg-teal-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-teal-500/30">
                  <div className="text-2xl font-bold text-white">{subject.totalPDFs}</div>
                  <div className="text-sm text-white/80">Resources</div>
                </div>
                <div className="bg-indigo-600/40 backdrop-blur-sm rounded-xl p-4 text-center border border-indigo-500/30">
                  <div className="text-2xl font-bold text-white">{progressPercentage}%</div>
                  <div className="text-sm text-white/80">Progress</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Overall Progress</span>
                <span className="text-sm font-bold text-white">{progressPercentage}%</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-3 bg-blue-900/40" />
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Downloadable Learning Resources
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Access comprehensive study materials, practice sheets, and reference guides
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map((pdf, index) => (
                <Card
                  key={pdf.id}
                  className="group hover:-translate-y-2 transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={pdf.thumbnail || "/placeholder.svg"}
                      alt={pdf.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-white border-0">{pdf.type}</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20 backdrop-blur-sm"
                        onClick={() => toggleBookmark(pdf.id)}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedItems.includes(pdf.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white text-sm">
                        <div className="flex items-center gap-4">
                          <span>{pdf.pages} pages</span>
                          <span>{pdf.size}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          <span>{pdf.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2">
                      {pdf.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 line-clamp-2">
                      {pdf.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{pdf.downloadCount} downloads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{Math.round(pdf.rating * 100)} likes</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => router.push(`/student/modules/${pdf.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Module
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 bg-transparent"
                        onClick={() => handleDownloadClick({ id: pdf.id, title: pdf.title })}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Learning Achievements</CardTitle>
              </div>
              <CardDescription className="text-lg">Track your progress and celebrate your success!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Quick Learner</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Completed 5 modules this week</p>
                </div>
                <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Goal Achiever</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Reached 75% completion rate</p>
                </div>
                <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Top Performer</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Scored 95% average on quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={downloadConfirmOpen} onOpenChange={setDownloadConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Download Resource</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to download "{selectedPdf?.title}"? This file will be saved to your device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDownloadConfirm}>Download</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StudentLayout>
  )
}
