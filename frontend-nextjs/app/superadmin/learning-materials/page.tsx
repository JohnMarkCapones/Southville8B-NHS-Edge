"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Search,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
  PlayCircle,
  Target,
  Brain,
  Lightbulb,
  FileText,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  File,
  GraduationCap,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for learning materials/modules
const mockModules = [
  {
    id: 1,
    title: "Introduction to Quadratic Equations",
    subject: "Mathematics",
    subjectId: 1,
    type: "video",
    difficulty: "Beginner",
    duration: "45 min",
    views: 1250,
    downloads: 450,
    rating: 4.8,
    status: "active",
    visibility: "public",
    createdDate: "2024-01-15",
    author: "Ms. Garcia",
    gradeLevels: [7, 8],
  },
  {
    id: 2,
    title: "Solving Quadratic Equations",
    subject: "Mathematics",
    subjectId: 1,
    type: "interactive",
    difficulty: "Intermediate",
    duration: "60 min",
    views: 980,
    downloads: 320,
    rating: 4.9,
    status: "active",
    visibility: "public",
    createdDate: "2024-01-20",
    author: "Ms. Garcia",
    gradeLevels: [8, 9],
  },
  {
    id: 3,
    title: "Physics: Laws of Motion",
    subject: "Science",
    subjectId: 2,
    type: "simulation",
    difficulty: "Intermediate",
    duration: "50 min",
    views: 756,
    downloads: 280,
    rating: 4.7,
    status: "active",
    visibility: "public",
    createdDate: "2024-02-01",
    author: "Mr. Santos",
    gradeLevels: [9, 10],
  },
  {
    id: 4,
    title: "Chemical Reactions Lab",
    subject: "Science",
    subjectId: 2,
    type: "simulation",
    difficulty: "Advanced",
    duration: "75 min",
    views: 432,
    downloads: 156,
    rating: 4.6,
    status: "active",
    visibility: "restricted",
    createdDate: "2024-02-10",
    author: "Mr. Santos",
    gradeLevels: [10],
  },
  {
    id: 5,
    title: "Shakespeare's Macbeth Analysis",
    subject: "English",
    subjectId: 3,
    type: "case-study",
    difficulty: "Advanced",
    duration: "90 min",
    views: 623,
    downloads: 245,
    rating: 4.8,
    status: "active",
    visibility: "public",
    createdDate: "2024-02-15",
    author: "Mrs. Cruz",
    gradeLevels: [9, 10],
  },
  {
    id: 6,
    title: "Creative Writing Workshop",
    subject: "English",
    subjectId: 3,
    type: "interactive",
    difficulty: "Beginner",
    duration: "40 min",
    views: 890,
    downloads: 367,
    rating: 4.7,
    status: "active",
    visibility: "public",
    createdDate: "2024-02-20",
    author: "Mrs. Cruz",
    gradeLevels: [7, 8, 9],
  },
  {
    id: 7,
    title: "Filipino Literature: Noli Me Tangere",
    subject: "Filipino",
    subjectId: 4,
    type: "video",
    difficulty: "Intermediate",
    duration: "55 min",
    views: 512,
    downloads: 198,
    rating: 4.5,
    status: "active",
    visibility: "public",
    createdDate: "2024-03-01",
    author: "Ms. Reyes",
    gradeLevels: [9, 10],
  },
  {
    id: 8,
    title: "Entrepreneurship Basics",
    subject: "TLE",
    subjectId: 5,
    type: "case-study",
    difficulty: "Beginner",
    duration: "45 min",
    views: 734,
    downloads: 289,
    rating: 4.6,
    status: "active",
    visibility: "public",
    createdDate: "2024-03-05",
    author: "Mr. Dela Cruz",
    gradeLevels: [8, 9, 10],
  },
  {
    id: 9,
    title: "Geometry: Triangles and Angles",
    subject: "Mathematics",
    subjectId: 1,
    type: "interactive",
    difficulty: "Beginner",
    duration: "35 min",
    views: 1120,
    downloads: 445,
    rating: 4.9,
    status: "draft",
    visibility: "restricted",
    createdDate: "2024-03-10",
    author: "Ms. Garcia",
    gradeLevels: [],
  },
  {
    id: 10,
    title: "Ecosystem and Biodiversity",
    subject: "Science",
    subjectId: 2,
    type: "video",
    difficulty: "Intermediate",
    duration: "50 min",
    views: 867,
    downloads: 334,
    rating: 4.8,
    status: "active",
    visibility: "public",
    createdDate: "2024-03-15",
    author: "Mr. Santos",
    gradeLevels: [7, 8],
  },
]

export default function LearningMaterialsPage() {
  const router = useRouter()
  const [modules, setModules] = useState(mockModules)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [itemsPerPage, setItemsPerPage] = useState("10")
  const [selectedModules, setSelectedModules] = useState<number[]>([])
  const [contextMenuModule, setContextMenuModule] = useState<number | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "video",
    difficulty: "Beginner",
    duration: "",
  })

  // Confirmation modals
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; moduleId: number | null }>({
    open: false,
    moduleId: null,
  })
  const [statusModal, setStatusModal] = useState<{
    open: boolean
    moduleId: number | null
    newStatus: string
  }>({
    open: false,
    moduleId: null,
    newStatus: "",
  })
  const [visibilityModal, setVisibilityModal] = useState<{
    open: boolean
    moduleId: number | null
    newVisibility: string
  }>({
    open: false,
    moduleId: null,
    newVisibility: "",
  })

  const [gradeLevelModal, setGradeLevelModal] = useState<{
    open: boolean
    moduleId: number | null
    selectedGrades: number[]
  }>({
    open: false,
    moduleId: null,
    selectedGrades: [],
  })

  // Calculate statistics
  const totalModules = modules.length
  const activeModules = modules.filter((m) => m.status === "active").length
  const totalDownloads = modules.reduce((sum, m) => sum + m.downloads, 0)
  const averageRating = (modules.reduce((sum, m) => sum + m.rating, 0) / modules.length).toFixed(1)

  // Filter and sort modules
  const filteredModules = modules
    .filter((module) => {
      const matchesSearch =
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.subject.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSubject = selectedSubject === "all" || module.subject === selectedSubject
      const matchesType = selectedType === "all" || module.type === selectedType
      const matchesDifficulty = selectedDifficulty === "all" || module.difficulty === selectedDifficulty
      const matchesStatus = selectedStatus === "all" || module.status === selectedStatus

      return matchesSearch && matchesSubject && matchesType && matchesDifficulty && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        case "oldest":
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "views":
          return b.views - a.views
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

  // Handle actions
  const handleUploadModule = () => {
    setUploadModalOpen(true)
  }

  const handleViewModule = (id: number) => {
    router.push(`/superadmin/learning-materials/${id}`)
  }

  const handleEditModule = (id: number) => {
    router.push(`/superadmin/learning-materials/${id}/edit`)
  }

  const handleDuplicateModule = (id: number) => {
    const moduleToDuplicate = modules.find((m) => m.id === id)
    if (moduleToDuplicate) {
      const newModule = {
        ...moduleToDuplicate,
        id: Math.max(...modules.map((m) => m.id)) + 1,
        title: `${moduleToDuplicate.title} (Copy)`,
        createdDate: new Date().toISOString().split("T")[0],
      }
      setModules([...modules, newModule])
    }
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, status: newStatus } : m)))
    setStatusModal({ open: false, moduleId: null, newStatus: "" })
  }

  const handleVisibilityChange = (id: number, newVisibility: string) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, visibility: newVisibility } : m)))
    setVisibilityModal({ open: false, moduleId: null, newVisibility: "" })
  }

  const handleDeleteModule = (id: number) => {
    setModules(modules.filter((m) => m.id !== id))
    setDeleteModal({ open: false, moduleId: null })
  }

  const handleAssignGradeLevel = (id: number) => {
    const module = modules.find((m) => m.id === id)
    if (module) {
      setGradeLevelModal({
        open: true,
        moduleId: id,
        selectedGrades: module.gradeLevels || [],
      })
    }
  }

  const handleToggleGradeLevel = (grade: number) => {
    setGradeLevelModal((prev) => {
      const isSelected = prev.selectedGrades.includes(grade)
      return {
        ...prev,
        selectedGrades: isSelected
          ? prev.selectedGrades.filter((g) => g !== grade)
          : [...prev.selectedGrades, grade].sort((a, b) => a - b),
      }
    })
  }

  const handleSaveGradeLevels = () => {
    if (gradeLevelModal.moduleId) {
      setModules(
        modules.map((m) =>
          m.id === gradeLevelModal.moduleId ? { ...m, gradeLevels: gradeLevelModal.selectedGrades } : m,
        ),
      )
      setGradeLevelModal({ open: false, moduleId: null, selectedGrades: [] })
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedModules(filteredModules.map((m) => m.id))
    } else {
      setSelectedModules([])
    }
  }

  const handleSelectModule = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedModules([...selectedModules, id])
    } else {
      setSelectedModules(selectedModules.filter((moduleId) => moduleId !== id))
    }
  }

  const handleContextMenu = (e: React.MouseEvent, moduleId: number) => {
    e.preventDefault()
    setContextMenuModule(moduleId)
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4" />
      case "interactive":
        return <Target className="w-4 h-4" />
      case "simulation":
        return <Brain className="w-4 h-4" />
      case "case-study":
        return <Lightbulb className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case "archived":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "restricted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const moduleToDelete = modules.find((m) => m.id === deleteModal.moduleId)
  const moduleToChangeStatus = modules.find((m) => m.id === statusModal.moduleId)
  const moduleToChangeVisibility = modules.find((m) => m.id === visibilityModal.moduleId)
  const moduleToAssignGrades = modules.find((m) => m.id === gradeLevelModal.moduleId)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadSubmit = () => {
    // TODO: Integrate with database
    const newModule = {
      id: Math.max(...modules.map((m) => m.id)) + 1,
      title: uploadForm.title,
      subject: uploadForm.subject,
      subjectId: 1,
      type: uploadForm.type,
      difficulty: uploadForm.difficulty,
      duration: uploadForm.duration,
      views: 0,
      downloads: 0,
      rating: 0,
      status: "draft",
      visibility: "restricted",
      createdDate: new Date().toISOString().split("T")[0],
      author: "Admin",
      gradeLevels: [],
    }
    setModules([newModule, ...modules])

    // Reset form
    setUploadModalOpen(false)
    setUploadedFile(null)
    setUploadForm({
      title: "",
      description: "",
      subject: "",
      type: "video",
      difficulty: "Beginner",
      duration: "",
    })
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Learning Materials & Modules</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage educational content, interactive modules, and learning resources
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalModules}</div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
            <p className="text-xs text-blue-100 mt-2">All learning materials</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-100">Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{activeModules}</div>
              <CheckCircle2 className="w-8 h-8 text-green-200" />
            </div>
            <p className="text-xs text-green-100 mt-2">Currently available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalDownloads.toLocaleString()}</div>
              <Download className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-xs text-purple-100 mt-2">Across all modules</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-100">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{averageRating}</div>
              <Star className="w-8 h-8 text-orange-200 fill-current" />
            </div>
            <p className="text-xs text-orange-100 mt-2">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleUploadModule} className="bg-primary hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" />
              Upload Module
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Filipino">Filipino</SelectItem>
                <SelectItem value="TLE">TLE</SelectItem>
                <SelectItem value="MAPEH">MAPEH</SelectItem>
                <SelectItem value="Araling Panlipunan">Araling Panlipunan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="interactive">Interactive</SelectItem>
                <SelectItem value="simulation">Simulation</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
                <SelectItem value="document">Document/PDF</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Bulk Actions */}
          {selectedModules.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedModules.length} module(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Activate Selected
                </Button>
                <Button size="sm" variant="outline">
                  Archive Selected
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                  Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedModules.length === filteredModules.length && filteredModules.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Module Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Grade Levels</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-slate-500">
                      No modules found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModules.map((module) => (
                    <TableRow
                      key={module.id}
                      onContextMenu={(e) => handleContextMenu(e, module.id)}
                      className="cursor-context-menu"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedModules.includes(module.id)}
                          onCheckedChange={(checked) => handleSelectModule(module.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{module.title}</TableCell>
                      <TableCell>{module.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(module.type)}
                          <span className="capitalize">{module.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          {module.duration}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {module.gradeLevels && module.gradeLevels.length > 0 ? (
                            module.gradeLevels.map((grade) => (
                              <Badge
                                key={grade}
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
                              >
                                Grade {grade}
                              </Badge>
                            ))
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignGradeLevel(module.id)}
                              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                            >
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Eye className="w-4 h-4" />
                          {module.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Download className="w-4 h-4" />
                          {module.downloads.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          <span className="font-medium">{module.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge className={`${getStatusColor(module.status)} cursor-pointer hover:opacity-80`}>
                              {module.status}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => setStatusModal({ open: true, moduleId: module.id, newStatus: "active" })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusModal({ open: true, moduleId: module.id, newStatus: "draft" })}
                            >
                              <FileText className="w-4 h-4 mr-2 text-gray-600" />
                              Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusModal({ open: true, moduleId: module.id, newStatus: "archived" })}
                            >
                              <XCircle className="w-4 h-4 mr-2 text-yellow-600" />
                              Archived
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge
                              className={`${getVisibilityColor(module.visibility)} cursor-pointer hover:opacity-80`}
                            >
                              {module.visibility}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                setVisibilityModal({ open: true, moduleId: module.id, newVisibility: "public" })
                              }
                            >
                              Public
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setVisibilityModal({ open: true, moduleId: module.id, newVisibility: "restricted" })
                              }
                            >
                              Restricted
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewModule(module.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditModule(module.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Module
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignGradeLevel(module.id)}>
                              <GraduationCap className="w-4 h-4 mr-2" />
                              Assign to Grade Level
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateModule(module.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteModal({ open: true, moduleId: module.id })}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredModules.length} of {totalModules} modules
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Items per page:</span>
              <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Learning Module</DialogTitle>
            <DialogDescription>Upload a new learning module and provide the necessary information</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Module File *</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 dark:border-slate-700 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <File className="w-8 h-8 text-primary" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="w-12 h-12 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Supports: PDF, MP4, PPTX, DOCX (Max 100MB)</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.mp4,.pptx,.docx,.zip"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Quadratic Equations"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the module content..."
                rows={4}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
            </div>

            {/* Subject and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={uploadForm.subject}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, subject: value })}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Filipino">Filipino</SelectItem>
                    <SelectItem value="TLE">TLE</SelectItem>
                    <SelectItem value="MAPEH">MAPEH</SelectItem>
                    <SelectItem value="Araling Panlipunan">Araling Panlipunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Module Type *</Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="simulation">Simulation</SelectItem>
                    <SelectItem value="case-study">Case Study</SelectItem>
                    <SelectItem value="document">Document/PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Difficulty and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select
                  value={uploadForm.difficulty}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, difficulty: value })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 45 min"
                  value={uploadForm.duration}
                  onChange={(e) => setUploadForm({ ...uploadForm, duration: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={
                !uploadedFile ||
                !uploadForm.title ||
                !uploadForm.description ||
                !uploadForm.subject ||
                !uploadForm.duration
              }
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, moduleId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {moduleToDelete && (
            <div className="py-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Module:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{moduleToDelete.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Subject:</span>
                  <span className="text-sm text-slate-900 dark:text-slate-100">{moduleToDelete.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="text-sm text-slate-900 dark:text-slate-100 capitalize">{moduleToDelete.type}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, moduleId: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteModal.moduleId && handleDeleteModule(deleteModal.moduleId)}
            >
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Modal */}
      <Dialog open={statusModal.open} onOpenChange={(open) => setStatusModal({ open, moduleId: null, newStatus: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Module Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of this module to "{statusModal.newStatus}"?
            </DialogDescription>
          </DialogHeader>
          {moduleToChangeStatus && (
            <div className="py-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Module:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {moduleToChangeStatus.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Status:</span>
                  <Badge className={getStatusColor(moduleToChangeStatus.status)}>{moduleToChangeStatus.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">New Status:</span>
                  <Badge className={getStatusColor(statusModal.newStatus)}>{statusModal.newStatus}</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModal({ open: false, moduleId: null, newStatus: "" })}>
              Cancel
            </Button>
            <Button
              onClick={() => statusModal.moduleId && handleStatusChange(statusModal.moduleId, statusModal.newStatus)}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Change Confirmation Modal */}
      <Dialog
        open={visibilityModal.open}
        onOpenChange={(open) => setVisibilityModal({ open, moduleId: null, newVisibility: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Module Visibility</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the visibility of this module to "{visibilityModal.newVisibility}"?
            </DialogDescription>
          </DialogHeader>
          {moduleToChangeVisibility && (
            <div className="py-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Module:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {moduleToChangeVisibility.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Visibility:</span>
                  <Badge className={getVisibilityColor(moduleToChangeVisibility.visibility)}>
                    {moduleToChangeVisibility.visibility}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">New Visibility:</span>
                  <Badge className={getVisibilityColor(visibilityModal.newVisibility)}>
                    {visibilityModal.newVisibility}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVisibilityModal({ open: false, moduleId: null, newVisibility: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                visibilityModal.moduleId &&
                handleVisibilityChange(visibilityModal.moduleId, visibilityModal.newVisibility)
              }
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={gradeLevelModal.open}
        onOpenChange={(open) => setGradeLevelModal({ open, moduleId: null, selectedGrades: [] })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Grade Levels</DialogTitle>
            <DialogDescription>Select which grade levels should have access to this learning module</DialogDescription>
          </DialogHeader>
          {moduleToAssignGrades && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{moduleToAssignGrades.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {moduleToAssignGrades.subject} • {moduleToAssignGrades.difficulty}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Grade Levels</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[7, 8, 9, 10].map((grade) => (
                    <div
                      key={grade}
                      onClick={() => handleToggleGradeLevel(grade)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        gradeLevelModal.selectedGrades.includes(grade)
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <Checkbox
                        checked={gradeLevelModal.selectedGrades.includes(grade)}
                        onCheckedChange={() => handleToggleGradeLevel(grade)}
                        className="pointer-events-none"
                      />
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">Grade {grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {gradeLevelModal.selectedGrades.length === 0
                    ? "No grade levels selected"
                    : `${gradeLevelModal.selectedGrades.length} grade level(s) selected`}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGradeLevelModal({ open: false, moduleId: null, selectedGrades: [] })}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveGradeLevels} disabled={gradeLevelModal.selectedGrades.length === 0}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
