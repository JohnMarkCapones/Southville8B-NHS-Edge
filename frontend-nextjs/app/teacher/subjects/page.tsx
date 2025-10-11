"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Upload,
  FileText,
  Video,
  ImageIcon,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Users,
  TrendingUp,
  Star,
  MessageSquare,
  Clock,
  GraduationCap,
  BarChart3,
  Activity,
  Flame,
} from "lucide-react"

export default function SubjectsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      code: "MATH101",
      students: 32,
      modules: 12,
      progress: 75,
      status: "active",
      description: "Advanced mathematics covering algebra, geometry, and calculus",
      lastUpdated: "2024-01-15",
      color: "from-blue-500 to-indigo-600",
      icon: "📐",
      engagement: 92,
      assignments: 8,
      avgGrade: 85,
      nextClass: "Today 2:00 PM",
    },
    {
      id: 2,
      name: "Science",
      code: "SCI101",
      students: 28,
      modules: 8,
      progress: 60,
      status: "active",
      description: "General science covering physics, chemistry, and biology",
      lastUpdated: "2024-01-12",
      color: "from-green-500 to-emerald-600",
      icon: "🔬",
      engagement: 88,
      assignments: 6,
      avgGrade: 78,
      nextClass: "Tomorrow 10:00 AM",
    },
    {
      id: 3,
      name: "English",
      code: "ENG101",
      students: 35,
      modules: 15,
      progress: 85,
      status: "active",
      description: "English language and literature studies",
      lastUpdated: "2024-01-18",
      color: "from-purple-500 to-pink-600",
      icon: "📚",
      engagement: 95,
      assignments: 12,
      avgGrade: 89,
      nextClass: "Today 4:30 PM",
    },
  ]

  const modules = [
    {
      id: 1,
      title: "Introduction to Algebra",
      subject: "Mathematics",
      type: "document",
      size: "2.4 MB",
      downloads: 45,
      uploadDate: "2024-01-10",
      status: "published",
    },
    {
      id: 2,
      title: "Geometry Basics Video",
      subject: "Mathematics",
      type: "video",
      size: "125 MB",
      downloads: 32,
      uploadDate: "2024-01-08",
      status: "published",
    },
    {
      id: 3,
      title: "Physics Lab Manual",
      subject: "Science",
      type: "document",
      size: "5.1 MB",
      downloads: 28,
      uploadDate: "2024-01-05",
      status: "draft",
    },
  ]

  const analytics = {
    totalSubjects: 3,
    totalStudents: 95,
    totalModules: 35,
    avgProgress: 73,
    topPerformingSubject: "English",
    mostDownloadedModule: "Introduction to Algebra",
    weeklyEngagement: 91,
    completionRate: 87,
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Subject Management</h1>
                <p className="text-white/90 text-lg">
                  Manage your subjects, upload modules, and track student progress
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Active Subjects</p>
                    <p className="text-white font-bold text-lg">{subjects.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Total Students</p>
                    <p className="text-white font-bold text-lg">{analytics.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Engagement</p>
                    <p className="text-white font-bold text-lg">{analytics.weeklyEngagement}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Create New Subject
                  </DialogTitle>
                  <DialogDescription>Add a new subject to your curriculum</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject-name">Subject Name</Label>
                    <Input id="subject-name" placeholder="Enter subject name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="subject-code">Subject Code</Label>
                    <Input id="subject-code" placeholder="e.g., MATH101" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Subject description" className="mt-1" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Create Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-1 shadow-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="modules"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="w-4 h-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <Card
                key={subject.id}
                className={`group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer rounded-2xl ${
                  hoveredCard === subject.id ? "ring-2 ring-indigo-500/50" : ""
                }`}
                onMouseEnter={() => setHoveredCard(subject.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${subject.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        {subject.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {subject.name}
                        </CardTitle>
                        <CardDescription className="font-medium">{subject.code}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={subject.status === "active" ? "default" : "secondary"}
                      className={`${subject.status === "active" ? "bg-green-500 hover:bg-green-600" : ""} shadow-sm`}
                    >
                      {subject.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{subject.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Course Progress</span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {subject.progress}%
                      </span>
                    </div>
                    <Progress value={subject.progress} className="h-3 bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{subject.students}</span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">Students</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{subject.modules}</span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">Modules</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-slate-600 dark:text-slate-400">Engagement</span>
                      </div>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{subject.engagement}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-600 dark:text-slate-400">Next Class</span>
                      </div>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{subject.nextClass}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--teacher-muted-foreground))]" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[hsl(var(--teacher-primary))] hover:bg-[hsl(var(--teacher-primary))]/90">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Module</DialogTitle>
                  <DialogDescription>Add learning materials to your subjects</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="module-title">Module Title</Label>
                    <Input id="module-title" placeholder="Enter module title" />
                  </div>
                  <div>
                    <Label htmlFor="module-subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="module-file">File Upload</Label>
                    <Input id="module-file" type="file" />
                  </div>
                  <Button className="w-full bg-[hsl(var(--teacher-primary))] hover:bg-[hsl(var(--teacher-primary))]/90">
                    Upload Module
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {modules.map((module) => (
              <Card key={module.id} className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(module.type)}
                      <div>
                        <h3 className="font-medium">{module.title}</h3>
                        <p className="text-sm text-[hsl(var(--teacher-muted-foreground))]">
                          {module.subject} • {module.size} • {module.downloads} downloads
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={module.status === "published" ? "default" : "secondary"}>{module.status}</Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-[hsl(var(--teacher-primary))]" />
                    <span>{subject.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--teacher-muted-foreground))]">Enrolled Students</span>
                    <span className="font-medium">{subject.students}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--teacher-muted-foreground))]">Average Progress</span>
                    <span className="font-medium">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Users className="h-4 w-4 mr-1" />
                      View Students
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Subjects</p>
                    <p className="text-3xl font-bold">{analytics.totalSubjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold">{analytics.totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Modules</p>
                    <p className="text-3xl font-bold">{analytics.totalModules}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Avg Progress</p>
                    <p className="text-3xl font-bold">{analytics.avgProgress}%</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Top Performing Subject</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg">
                    📚
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analytics.topPerformingSubject}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Highest student engagement and completion rate
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg text-green-600">95%</div>
                      <div className="text-slate-500">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-blue-600">89%</div>
                      <div className="text-slate-500">Avg Grade</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Most Downloaded Module</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg">
                    📐
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analytics.mostDownloadedModule}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">45 downloads this month</p>
                  </div>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg text-indigo-600">45</div>
                      <div className="text-slate-500">Downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-purple-600">4.8</div>
                      <div className="text-slate-500">Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
