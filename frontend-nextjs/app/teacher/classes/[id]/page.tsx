"use client"
import { useParams, useRouter } from "next/navigation"
import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  Calendar,
  ArrowLeft,
  UserCheck,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  Download,
  Upload,
  Edit,
  Search,
  MoreHorizontal,
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  X,
  Trash2,
  Share2,
  FolderOpen,
  File,
  ImageIcon,
  Video,
  Music,
  Copy,
  AlertTriangle,
  Link2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data - in real app, this would come from API
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
    description: "Advanced mathematical concepts including calculus, algebra, and geometry for Grade 10 students.",
    schedule: [
      { day: "Monday", time: "8:00 AM - 9:30 AM" },
      { day: "Wednesday", time: "8:00 AM - 9:30 AM" },
      { day: "Friday", time: "8:00 AM - 9:30 AM" },
    ],
  },
  // Add other classes...
]

const studentsData = [
  {
    id: 1,
    name: "John Michael Santos",
    email: "john.santos@student.edu",
    phone: "+63 912 345 6789",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 95,
    gwa: 1.25, // Changed from grade percentage to GWA
    status: "excellent",
    lastActive: "2 hours ago",
    assignments: { completed: 8, total: 10 },
    behavior: "exemplary",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 2,
    name: "Maria Clara Reyes",
    email: "maria.reyes@student.edu",
    phone: "+63 912 345 6790",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 88,
    gwa: 1.75,
    status: "good",
    lastActive: "1 day ago",
    assignments: { completed: 7, total: 10 },
    behavior: "good",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 3,
    name: "Jose Rizal Cruz",
    email: "jose.cruz@student.edu",
    phone: "+63 912 345 6791",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 92,
    gwa: 1.5,
    status: "excellent",
    lastActive: "5 hours ago",
    assignments: { completed: 9, total: 10 },
    behavior: "excellent",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 4,
    name: "Ana Lucia Garcia",
    email: "ana.garcia@student.edu",
    phone: "+63 912 345 6792",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 78,
    gwa: 2.75,
    status: "needs-improvement",
    lastActive: "3 days ago",
    assignments: { completed: 5, total: 10 },
    behavior: "fair",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 5,
    name: "Carlos Miguel Torres",
    email: "carlos.torres@student.edu",
    phone: "+63 912 345 6793",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 90,
    gwa: 1.6,
    status: "good",
    lastActive: "1 hour ago",
    assignments: { completed: 8, total: 10 },
    behavior: "good",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 6,
    name: "Isabella Marie Santos",
    email: "isabella.santos@student.edu",
    phone: "+63 912 345 6794",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 94,
    gwa: 1.3,
    status: "excellent",
    lastActive: "30 minutes ago",
    assignments: { completed: 9, total: 10 },
    behavior: "exemplary",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 7,
    name: "Miguel Angel Rodriguez",
    email: "miguel.rodriguez@student.edu",
    phone: "+63 912 345 6795",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 85,
    gwa: 2.0,
    status: "good",
    lastActive: "4 hours ago",
    assignments: { completed: 7, total: 10 },
    behavior: "good",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 8,
    name: "Sofia Elena Mendoza",
    email: "sofia.mendoza@student.edu",
    phone: "+63 912 345 6796",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 91,
    gwa: 1.45,
    status: "excellent",
    lastActive: "1 hour ago",
    assignments: { completed: 8, total: 10 },
    behavior: "excellent",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 9,
    name: "Gabriel Luis Fernandez",
    email: "gabriel.fernandez@student.edu",
    phone: "+63 912 345 6797",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 82,
    gwa: 2.25,
    status: "good",
    lastActive: "2 days ago",
    assignments: { completed: 6, total: 10 },
    behavior: "fair",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
  {
    id: 10,
    name: "Valentina Rose Castillo",
    email: "valentina.castillo@student.edu",
    phone: "+63 912 345 6798",
    avatar: "/placeholder.svg?height=40&width=40",
    attendance: 96,
    gwa: 1.2,
    status: "excellent",
    lastActive: "15 minutes ago",
    assignments: { completed: 10, total: 10 },
    behavior: "exemplary",
    section: "NEUTRON-10",
    year: "Grade 10",
  },
]

const assignmentsData = [
  {
    id: 1,
    title: "Quadratic Equations Problem Set",
    type: "homework",
    dueDate: "2024-01-15",
    submitted: 28,
    total: 32,
    avgScore: 85,
    status: "active",
  },
  {
    id: 2,
    title: "Calculus Integration Quiz",
    type: "quiz",
    dueDate: "2024-01-12",
    submitted: 32,
    total: 32,
    avgScore: 92,
    status: "completed",
  },
  {
    id: 3,
    title: "Geometry Proof Assignment",
    type: "assignment",
    dueDate: "2024-01-20",
    submitted: 15,
    total: 32,
    avgScore: 78,
    status: "active",
  },
]

const resourcesData = [
  {
    id: 1,
    title: "Lesson Plan - Week 1",
    type: "pdf",
    size: "2.4 MB",
    uploadDate: "2024-01-10",
    downloads: 28,
    category: "lesson-plan",
    description: "Comprehensive lesson plan covering quadratic equations and basic calculus concepts",
  },
  {
    id: 2,
    title: "Study Materials",
    type: "zip",
    size: "15.2 MB",
    uploadDate: "2024-01-08",
    downloads: 32,
    category: "study-material",
    description: "Complete study materials including worksheets, examples, and practice problems",
  },
  {
    id: 3,
    title: "Practice Exercises",
    type: "pdf",
    size: "1.8 MB",
    uploadDate: "2024-01-05",
    downloads: 25,
    category: "exercise",
    description: "Practice exercises for students to reinforce learning concepts",
  },
  {
    id: 4,
    title: "Video Tutorial - Calculus Basics",
    type: "mp4",
    size: "45.6 MB",
    uploadDate: "2024-01-12",
    downloads: 18,
    category: "video",
    description: "Step-by-step video tutorial explaining calculus fundamentals",
  },
  {
    id: 5,
    title: "Interactive Presentation",
    type: "pptx",
    size: "8.3 MB",
    uploadDate: "2024-01-15",
    downloads: 22,
    category: "presentation",
    description: "Interactive PowerPoint presentation with animations and examples",
  },
  {
    id: 6,
    title: "Assessment Rubric",
    type: "docx",
    size: "0.5 MB",
    uploadDate: "2024-01-03",
    downloads: 15,
    category: "assessment",
    description: "Detailed rubric for evaluating student performance and assignments",
  },
]

export default function ClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = Number.parseInt(params.id as string)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [behaviorFilter, setBehaviorFilter] = useState("all")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadCategory, setUploadCategory] = useState("study-material")
  const [resourceSearchTerm, setResourceSearchTerm] = useState("")
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState("all")

  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<(typeof resourcesData)[0] | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState("")

  // Find the class data
  const classData = classesData.find((cls) => cls.id === classId)

  const getGWAColor = (gwa: number) => {
    if (gwa <= 1.5) return "text-green-600 dark:text-green-400"
    if (gwa <= 2.0) return "text-blue-600 dark:text-blue-400"
    if (gwa <= 2.5) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getGWAStatus = (gwa: number) => {
    if (gwa <= 1.5) return "Excellent"
    if (gwa <= 2.0) return "Very Good"
    if (gwa <= 2.5) return "Good"
    if (gwa <= 3.0) return "Fair"
    return "Needs Improvement"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 dark:text-green-400"
      case "good":
        return "text-blue-600 dark:text-blue-400"
      case "needs-improvement":
        return "text-orange-600 dark:text-orange-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case "exemplary":
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "fair":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "needs-improvement":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
      case "mp3":
      case "wav":
        return <Music className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      case "pptx":
      case "ppt":
        return <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
      case "zip":
      case "rar":
        return <FolderOpen className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
      default:
        return <File className="w-8 h-8 text-gray-600 dark:text-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lesson-plan":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "study-material":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "exercise":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "presentation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "assessment":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const handlePreview = (resource: (typeof resourcesData)[0]) => {
    setSelectedResource(resource)
    setPreviewModalOpen(true)
    toast({
      title: "Opening Preview",
      description: `Loading ${resource.title}...`,
    })
  }

  const handleShareLink = (resource: (typeof resourcesData)[0]) => {
    setSelectedResource(resource)
    setShareModalOpen(true)
  }

  const handleCopyLink = () => {
    const shareLink = `https://school.edu/resources/${selectedResource?.id}`
    navigator.clipboard.writeText(shareLink)
    toast({
      title: "Link Copied!",
      description: "Resource link has been copied to clipboard.",
      variant: "default",
    })
  }

  const handleEditDetails = (resource: (typeof resourcesData)[0]) => {
    setSelectedResource(resource)
    setEditTitle(resource.title)
    setEditDescription(resource.description)
    setEditCategory(resource.category)
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Resource title is required.",
        variant: "destructive",
      })
      return
    }

    // Simulate save
    setTimeout(() => {
      toast({
        title: "Resource Updated!",
        description: `"${editTitle}" has been updated successfully.`,
        variant: "default",
      })
      setEditModalOpen(false)
    }, 500)
  }

  const handleDeleteResource = (resource: (typeof resourcesData)[0]) => {
    setSelectedResource(resource)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    // Simulate delete
    setTimeout(() => {
      toast({
        title: "Resource Deleted",
        description: `"${selectedResource?.title}" has been permanently deleted.`,
        variant: "default",
      })
      setDeleteModalOpen(false)
      setSelectedResource(null)
    }, 500)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      setUploadFile(file)
      setUploadModalOpen(true)
      toast({
        title: "File Ready",
        description: `${file.name} is ready to upload. Please fill in the details.`,
      })
    }
  }

  const handleUploadResource = () => {
    if (!uploadTitle.trim() || !uploadFile) {
      toast({
        title: "Upload Failed",
        description: "Please provide both a title and select a file to upload.",
        variant: "destructive",
      })
      return
    }

    // Simulate upload process
    setTimeout(() => {
      toast({
        title: "Resource Uploaded Successfully!",
        description: `"${uploadTitle}" has been uploaded and is now available to students.`,
        variant: "default",
      })

      // Reset form and close modal
      setUploadTitle("")
      setUploadFile(null)
      setUploadDescription("")
      setUploadCategory("study-material")
      setUploadModalOpen(false)
    }, 1000)
  }

  const filteredResources = resourcesData.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(resourceSearchTerm.toLowerCase())
    const matchesCategory = resourceCategoryFilter === "all" || resource.category === resourceCategoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = studentsData.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || student.status === statusFilter
      const matchesBehavior = behaviorFilter === "all" || student.behavior === behaviorFilter

      return matchesSearch && matchesStatus && matchesBehavior
    })

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField as keyof typeof a]
        let bValue: any = b[sortField as keyof typeof b]

        if (sortField === "name") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }

    return filtered
  }, [searchTerm, statusFilter, behaviorFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setBehaviorFilter("all")
    setSortField(null)
    setSortDirection("asc")
    setCurrentPage(1)
  }

  if (!classData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Not Found</h1>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div
      className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 min-h-screen"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/20 dark:bg-blue-400/20 backdrop-blur-sm pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-4 border-dashed border-blue-600 dark:border-blue-400 max-w-md mx-4">
            <div className="text-center">
              <Upload className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Drop your files here</h3>
              <p className="text-gray-600 dark:text-gray-300">Release to upload resource to this class</p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classes
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {classData.section}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{classData.subject}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:scale-105 transition-all duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Class
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Announcement
          </Button>
        </div>
      </div>

      {/* Class Overview Card */}
      <Card
        className={`bg-gradient-to-r ${classData.color} text-white border-0 shadow-2xl dark:shadow-3xl hover:shadow-3xl transition-all duration-300`}
      >
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{classData.students}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Present Today</p>
                <p className="text-3xl font-bold">{classData.present}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold">{classData.avgScore}%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-200">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Room & Time</p>
                <p className="text-xl font-semibold">{classData.room}</p>
                <p className="text-white/80 text-sm">{classData.time}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800/50 bg-white/70 backdrop-blur-sm shadow-lg">
          <TabsTrigger
            value="students"
            className="dark:data-[state=active]:bg-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="dark:data-[state=active]:bg-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="dark:data-[state=active]:bg-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card className="dark:bg-gray-800/50 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Class Students ({filteredAndSortedStudents.length})
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Take Attendance
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dark:bg-gray-700/50 bg-white/50 backdrop-blur-sm border-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 dark:bg-gray-700/50 bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="needs-improvement">Needs Help</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={behaviorFilter} onValueChange={setBehaviorFilter}>
                    <SelectTrigger className="w-40 dark:bg-gray-700/50 bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Behavior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Behavior</SelectItem>
                      <SelectItem value="exemplary">Exemplary</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20 dark:bg-gray-700/50 bg-white/50 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || statusFilter !== "all" || behaviorFilter !== "all" || sortField) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearFilters}
                      className="dark:border-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableHead
                        className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Student
                          {sortField === "name" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="w-4 h-4" />
                            ) : (
                              <SortDesc className="w-4 h-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Contact</TableHead>
                      <TableHead
                        className="font-semibold text-gray-900 dark:text-white text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => handleSort("gwa")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          GWA
                          {sortField === "gwa" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="w-4 h-4" />
                            ) : (
                              <SortDesc className="w-4 h-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold text-gray-900 dark:text-white text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => handleSort("behavior")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Behavior
                          {sortField === "behavior" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="w-4 h-4" />
                            ) : (
                              <SortDesc className="w-4 h-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 group"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-300 dark:group-hover:ring-blue-600 transition-all duration-200">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {student.lastActive}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span>{student.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold text-lg ${getGWAColor(student.gwa)}`}>
                              {student.gwa.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {getGWAStatus(student.gwa)}
                              </span>
                              {student.gwa <= 1.5 && <Star className="w-3 h-3 text-yellow-500" />}
                              {student.gwa > 1.5 && student.gwa <= 2.0 && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                              {student.gwa > 2.5 && <AlertCircle className="w-3 h-3 text-orange-500" />}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getBehaviorColor(student.behavior)} font-medium`}>
                            {student.behavior}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusBadge(student.status)} font-medium`}>
                            {student.status === "needs-improvement" ? "Needs Help" : student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem className="dark:hover:bg-gray-700">
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="dark:hover:bg-gray-700">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="dark:hover:bg-gray-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedStudents.length)} of{" "}
                  {filteredAndSortedStudents.length} students
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="dark:border-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "dark:border-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="dark:border-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Class Schedule</h2>

          <Card className="dark:bg-gray-800/50 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {classData.schedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{schedule.day}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{classData.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Class Resources ({filteredResources.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and share learning materials with your students
              </p>
            </div>

            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl dark:bg-gray-800 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        Upload New Resource
                      </DialogTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Share learning materials with your students
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-6">
                  {/* File Upload Area */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <File className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Upload File *
                    </Label>

                    {!uploadFile ? (
                      <div className="relative">
                        <input
                          id="file-upload"
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif,.mp3,.wav"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 group"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                              PDF, DOC, PPT, ZIP, MP4, Images, Audio files
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Maximum file size: 100MB</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative p-6 border-2 border-purple-300 dark:border-purple-600 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            {getFileTypeIcon(uploadFile.name.split(".").pop() || "")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{uploadFile.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                File ready to upload
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadFile(null)}
                            className="flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resource Title */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Resource Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Chapter 5 Study Guide, Math Quiz Solutions..."
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="h-12 dark:bg-gray-700/50 dark:border-gray-600 border-2 focus:border-purple-400 dark:focus:border-purple-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Choose a clear, descriptive title that students will easily understand
                    </p>
                  </div>

                  {/* Category and Description Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="category"
                        className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Category
                      </Label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger className="h-12 dark:bg-gray-700/50 dark:border-gray-600 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lesson-plan">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              Lesson Plan
                            </div>
                          </SelectItem>
                          <SelectItem value="study-material">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              Study Material
                            </div>
                          </SelectItem>
                          <SelectItem value="exercise">
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4 text-purple-600" />
                              Exercise
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-red-600" />
                              Video
                            </div>
                          </SelectItem>
                          <SelectItem value="presentation">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-orange-600" />
                              Presentation
                            </div>
                          </SelectItem>
                          <SelectItem value="assessment">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-600" />
                              Assessment
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Description
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
                      </Label>
                      <Input
                        id="description"
                        placeholder="Brief description..."
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        className="h-12 dark:bg-gray-700/50 dark:border-gray-600 border-2 focus:border-purple-400 dark:focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Resource Upload Tips</p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                          <li>Students will be notified when new resources are uploaded</li>
                          <li>Resources can be downloaded by all students in this class</li>
                          <li>You can edit or delete resources anytime after uploading</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadModalOpen(false)
                      setUploadFile(null)
                      setUploadTitle("")
                      setUploadDescription("")
                    }}
                    className="flex-1 h-12 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadResource}
                    disabled={!uploadTitle.trim() || !uploadFile}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resource
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search resources by title or description..."
                value={resourceSearchTerm}
                onChange={(e) => setResourceSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-800/50 dark:border-gray-600 bg-white/70 backdrop-blur-sm"
              />
            </div>

            <Select value={resourceCategoryFilter} onValueChange={setResourceCategoryFilter}>
              <SelectTrigger className="w-48 dark:bg-gray-800/50 dark:border-gray-600 bg-white/70 backdrop-blur-sm">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="lesson-plan">Lesson Plans</SelectItem>
                <SelectItem value="study-material">Study Materials</SelectItem>
                <SelectItem value="exercise">Exercises</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="presentation">Presentations</SelectItem>
                <SelectItem value="assessment">Assessments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                className="dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {getFileTypeIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {resource.type.toUpperCase()} • {resource.size}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getCategoryColor(resource.category)} text-xs`}>
                          {resource.category.replace("-", " ")}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{resource.downloads} downloads</span>
                      </div>
                    </div>
                  </div>

                  {resource.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{resource.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>Uploaded: {resource.uploadDate}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 dark:border-gray-600 dark:text-gray-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-105 transition-all duration-200"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="dark:border-gray-600 dark:text-gray-300 bg-transparent hover:scale-105 transition-all duration-200"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                        <DropdownMenuItem onClick={() => handlePreview(resource)} className="dark:hover:bg-gray-700">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareLink(resource)} className="dark:hover:bg-gray-700">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditDetails(resource)}
                          className="dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteResource(resource)}
                          className="dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {resourceSearchTerm || resourceCategoryFilter !== "all" ? "No resources found" : "No resources yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {resourceSearchTerm || resourceCategoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Upload your first resource to get started."}
              </p>
              {!resourceSearchTerm && resourceCategoryFilter === "all" && (
                <Button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-4xl dark:bg-gray-800 dark:border-gray-700 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Resource Preview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              {selectedResource && getFileTypeIcon(selectedResource.type)}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{selectedResource?.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedResource?.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={selectedResource ? getCategoryColor(selectedResource.category) : ""}>
                    {selectedResource?.category.replace("-", " ")}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedResource?.type.toUpperCase()} • {selectedResource?.size}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Preview content would appear here</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                File type: {selectedResource?.type.toUpperCase()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
              Close
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              Share Resource
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Share this resource with students or colleagues
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{selectedResource?.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedResource?.description}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://school.edu/resources/${selectedResource?.id}`}
                  className="flex-1 dark:bg-gray-700/50 dark:border-gray-600"
                />
                <Button onClick={handleCopyLink} className="bg-green-600 hover:bg-green-700">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Anyone with this link can view and download the resource
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Students in this class can access this resource directly
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Edit className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              Edit Resource Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-900 dark:text-white">
                Resource Title *
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="dark:bg-gray-700/50 dark:border-gray-600"
                placeholder="Enter resource title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-sm font-semibold text-gray-900 dark:text-white">
                Category
              </Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="dark:bg-gray-700/50 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson-plan">Lesson Plan</SelectItem>
                  <SelectItem value="study-material">Study Material</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="dark:bg-gray-700/50 dark:border-gray-600 min-h-[100px]"
                placeholder="Enter resource description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              Delete Resource?
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the resource.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">{selectedResource?.title}</h4>
              <div className="space-y-1 text-sm text-red-700 dark:text-red-400">
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {selectedResource?.downloads} students have downloaded this resource
                </p>
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Students will no longer have access to this file
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this resource? This action is permanent and cannot be reversed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
