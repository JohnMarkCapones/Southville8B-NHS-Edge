"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle,
  Copy,
  UserPlus,
  GraduationCap,
  BookMarked,
  ChevronRightIcon,
  Check,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
} from "lucide-react"

// Mock data for subjects
const mockSubjects = [
  {
    id: "1",
    code: "MATH-8A",
    name: "Mathematics 8",
    description: "Advanced mathematics covering algebra, geometry, and problem-solving",
    category: "Core",
    gradeLevels: ["Grade 8"],
    department: "Mathematics",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    credits: 4,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "2",
    code: "SCI-8B",
    name: "Science 8",
    description: "Integrated science covering physics, chemistry, and biology",
    category: "Core",
    gradeLevels: ["Grade 8"],
    department: "Science",
    schedule: "Tue, Thu - 10:00 AM",
    credits: 4,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "3",
    code: "ENG-8A",
    name: "English 8",
    description: "English language arts focusing on literature and composition",
    category: "Core",
    gradeLevels: ["Grade 8"],
    department: "English",
    schedule: "Mon, Wed, Fri - 11:00 AM",
    credits: 4,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "4",
    code: "ART-101",
    name: "Visual Arts",
    description: "Introduction to visual arts including drawing, painting, and sculpture",
    category: "Elective",
    gradeLevels: ["Grade 7", "Grade 8"],
    department: "Arts",
    schedule: "Tue, Thu - 2:00 PM",
    credits: 2,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "5",
    code: "MUS-101",
    name: "Music Appreciation",
    description: "Introduction to music theory and appreciation",
    category: "Elective",
    gradeLevels: ["Grade 7", "Grade 8"],
    department: "Arts",
    schedule: "Mon, Wed - 3:00 PM",
    credits: 2,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "6",
    code: "PE-8A",
    name: "Physical Education 8",
    description: "Physical fitness and sports activities",
    category: "Core",
    gradeLevels: ["Grade 8"],
    department: "Physical Education",
    schedule: "Tue, Thu - 1:00 PM",
    credits: 2,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "7",
    code: "COMP-201",
    name: "Computer Programming",
    description: "Introduction to programming concepts and web development",
    category: "Specialized",
    gradeLevels: ["Grade 8"],
    department: "Technology",
    schedule: "Mon, Wed, Fri - 2:00 PM",
    credits: 3,
    status: "Active",
    visibility: "Students Only",
  },
  {
    id: "8",
    code: "FIL-8A",
    name: "Filipino 8",
    description: "Filipino language and literature",
    category: "Core",
    gradeLevels: ["Grade 8"],
    department: "Filipino",
    schedule: "Mon, Wed, Fri - 8:00 AM",
    credits: 4,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "9",
    code: "HIST-8A",
    name: "Philippine History",
    description: "Study of Philippine history and culture",
    category: "Core",
    gradeLevels: ["Grade 8"],
    department: "Social Studies",
    schedule: "Tue, Thu - 9:00 AM",
    credits: 3,
    status: "Active",
    visibility: "Public",
  },
  {
    id: "10",
    code: "ROBO-301",
    name: "Robotics Club",
    description: "Advanced robotics and automation",
    category: "Specialized",
    gradeLevels: ["Grade 7", "Grade 8"],
    department: "Technology",
    schedule: "Fri - 3:00 PM",
    credits: 1,
    status: "Active",
    visibility: "Students Only",
  },
  {
    id: "11",
    code: "CHEM-ADV",
    name: "Advanced Chemistry",
    description: "Advanced chemistry for high-performing students",
    category: "Specialized",
    gradeLevels: ["Grade 8"],
    department: "Science",
    schedule: "TBA",
    credits: 3,
    status: "Inactive",
    visibility: "Restricted",
  },
  {
    id: "12",
    code: "ECON-101",
    name: "Basic Economics",
    description: "Introduction to economic principles",
    category: "Elective",
    gradeLevels: ["Grade 8"],
    department: "Social Studies",
    schedule: "Mon, Wed - 1:00 PM",
    credits: 2,
    status: "Active",
    visibility: "Public",
  },
]

const SubjectsPage = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [subjects, setSubjects] = useState(mockSubjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [gradeLevelFilter, setGradeLevelFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    subject: any | null
    submenu: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    subject: null,
    submenu: null,
  })

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    subject: any
  }>({ isOpen: false, subject: null })

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean
    subject: any
    newStatus: string
  }>({ isOpen: false, subject: null, newStatus: "" })

  const [visibilityConfirmation, setVisibilityConfirmation] = useState<{
    isOpen: boolean
    subject: any
    newVisibility: string
  }>({ isOpen: false, subject: null, newVisibility: "" })

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || subject.category.toLowerCase() === categoryFilter
    const matchesStatus = statusFilter === "all" || subject.status.toLowerCase() === statusFilter
    const matchesGradeLevel =
      gradeLevelFilter === "all" || subject.gradeLevels.some((level) => level.toLowerCase() === gradeLevelFilter)
    const matchesDepartment = departmentFilter === "all" || subject.department.toLowerCase() === departmentFilter

    return matchesSearch && matchesCategory && matchesStatus && matchesGradeLevel && matchesDepartment
  })

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSubjects = filteredSubjects.slice(startIndex, endIndex)

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case "category":
        setCategoryFilter(value)
        break
      case "status":
        setStatusFilter(value)
        break
      case "gradeLevel":
        setGradeLevelFilter(value)
        break
      case "department":
        setDepartmentFilter(value)
        break
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubjects(paginatedSubjects.map((subject) => subject.id))
    } else {
      setSelectedSubjects([])
    }
  }

  const handleSelectSubject = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects((prev) => [...prev, subjectId])
    } else {
      setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId))
    }
  }

  const getStatusBadge = (status: string, subject?: any) => {
    const badge = (() => {
      switch (status) {
        case "Active":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )
        case "Inactive":
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Inactive
            </Badge>
          )
        case "Archived":
          return (
            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20">
              <FileText className="w-3 h-3 mr-1" />
              Archived
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{status}</Badge>
          )
      }
    })()

    if (subject) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${status === "Active" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(subject, "Active")
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Active</span>
              {status === "Active" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Inactive" ? "bg-gray-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(subject, "Inactive")
              }}
            >
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              <span className="flex-1">Inactive</span>
              {status === "Inactive" && <Check className="w-4 h-4 text-gray-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Archived" ? "bg-yellow-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(subject, "Archived")
              }}
            >
              <FileText className="w-4 h-4 mr-2 text-yellow-600" />
              <span className="flex-1">Archived</span>
              {status === "Archived" && <Check className="w-4 h-4 text-yellow-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Core: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20",
      Elective: "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20",
      Specialized: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20",
    }

    return (
      <Badge
        className={
          colors[category as keyof typeof colors] ||
          "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20"
        }
      >
        {category}
      </Badge>
    )
  }

  const getVisibilityBadge = (visibility: string, subject?: any) => {
    const badge = (() => {
      switch (visibility) {
        case "Public":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <Users className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )
        case "Students Only":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <GraduationCap className="w-3 h-3 mr-1" />
              Students
            </Badge>
          )
        case "Restricted":
          return (
            <Badge className="bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20">
              <XCircle className="w-3 h-3 mr-1" />
              Restricted
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{visibility}</Badge>
          )
      }
    })()

    if (subject) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Public" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(subject, "Public")
              }}
            >
              <Users className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Public</span>
              {visibility === "Public" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Students Only" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(subject, "Students Only")
              }}
            >
              <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Students Only</span>
              {visibility === "Students Only" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${visibility === "Restricted" ? "bg-red-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleVisibilityChange(subject, "Restricted")
              }}
            >
              <XCircle className="w-4 h-4 mr-2 text-red-600" />
              <span className="flex-1">Restricted</span>
              {visibility === "Restricted" && <Check className="w-4 h-4 text-red-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const handleViewSubject = (subject: any) => {
    toast({
      title: "📚 Subject Details",
      description: `Opening details for "${subject.name}"`,
      duration: 3000,
    })
  }

  const handleEditSubject = (subject: any) => {
    router.push(`/superadmin/subjects/edit/${subject.id}`)
  }

  const handleDeleteSubject = (subject: any) => {
    setDeleteConfirmation({ isOpen: true, subject })
    closeContextMenu()
  }

  const handleCreateSubject = () => {
    router.push("/superadmin/subjects/create")
  }

  const handleContextMenu = (e: React.MouseEvent, subject: any) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    const menuWidth = 240
    const menuHeight = 400
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight
    }

    setContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      subject,
      submenu: null,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      subject: null,
      submenu: null,
    })
  }

  const confirmDeleteSubject = () => {
    if (deleteConfirmation.subject) {
      setSubjects((prev) => prev.filter((s) => s.id !== deleteConfirmation.subject.id))

      toast({
        title: "✅ Subject Deleted Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {deleteConfirmation.subject.name} has been permanently removed.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                <BookOpen className="w-3 h-3" />
              </div>
              <span>{deleteConfirmation.subject.code}</span>
              <span>•</span>
              <span>{deleteConfirmation.subject.department}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle className="w-3 h-3" />
              <span>Subject permanently removed</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 6000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      setDeleteConfirmation({ isOpen: false, subject: null })
    }
  }

  const handleStatusChange = (subject: any, newStatus: string) => {
    setStatusConfirmation({ isOpen: true, subject, newStatus })
    closeContextMenu()
  }

  const confirmStatusChange = () => {
    if (statusConfirmation.subject) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === statusConfirmation.subject.id ? { ...s, status: statusConfirmation.newStatus } : s)),
      )

      toast({
        title: `✅ Status Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Subject status changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-medium">{statusConfirmation.subject.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New status:</span>
              <div className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 font-medium">
                {statusConfirmation.newStatus}
              </div>
            </div>
          </div>
        ),
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setStatusConfirmation({ isOpen: false, subject: null, newStatus: "" })
    }
  }

  const handleVisibilityChange = (subject: any, newVisibility: string) => {
    setVisibilityConfirmation({ isOpen: true, subject, newVisibility })
    closeContextMenu()
  }

  const confirmVisibilityChange = () => {
    if (visibilityConfirmation.subject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === visibilityConfirmation.subject.id ? { ...s, visibility: visibilityConfirmation.newVisibility } : s,
        ),
      )

      toast({
        title: `✅ Visibility Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Subject visibility changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-medium">{visibilityConfirmation.subject.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New visibility:</span>
              <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 font-medium">
                {visibilityConfirmation.newVisibility}
              </div>
            </div>
          </div>
        ),
        className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setVisibilityConfirmation({ isOpen: false, subject: null, newVisibility: "" })
    }
  }

  const handleDuplicateSubject = (subject: any) => {
    const newSubject = {
      ...subject,
      id: `${Date.now()}`,
      code: `${subject.code}-COPY`,
      name: `${subject.name} (Copy)`,
      status: "Inactive",
      studentsEnrolled: 0,
      teacherId: "",
      teacherName: "Unassigned",
    }

    setSubjects((prev) => [newSubject, ...prev])

    toast({
      title: `📋 Subject Duplicated`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">Subject copied successfully</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{newSubject.name}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">The duplicate has been created as inactive</div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleAssignTeacher = (subject: any) => {
    toast({
      title: `👨‍🏫 Assign Teacher`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">{subject.name}</p>
          <div className="text-sm text-muted-foreground">Teacher assignment feature coming soon</div>
        </div>
      ),
      className: "border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleViewStudents = (subject: any) => {
    toast({
      title: `👥 Enrolled Students`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">{subject.name}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10">
              <Users className="w-3.5 h-3.5" />
              <span>{subject.studentsEnrolled} enrolled</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{subject.maxCapacity} capacity</span>
            </div>
          </div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 5000,
    })

    closeContextMenu()
  }

  useState(() => {
    const handleClick = () => closeContextMenu()
    const handleScroll = () => closeContextMenu()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu()
    }
    const handleResize = () => closeContextMenu()

    if (contextMenu.visible) {
      document.addEventListener("click", handleClick)
      document.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("keydown", handleKeyDown)
      window.addEventListener("resize", handleResize)

      return () => {
        document.removeEventListener("click", handleClick)
        document.removeEventListener("scroll", handleScroll)
        document.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("resize", handleResize)
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects Management</h1>
          <p className="text-muted-foreground">Create, manage, and organize academic subjects and courses</p>
        </div>
        <Button onClick={handleCreateSubject} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Subject
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Subjects</p>
                <p className="text-2xl font-bold text-foreground">
                  {subjects.filter((s) => s.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{new Set(subjects.map((s) => s.department)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Subject Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search, filter, and manage subjects across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search subjects by name, code, or department..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
                <SelectItem value="specialized">Specialized</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeLevelFilter} onValueChange={(value) => handleFilterChange("gradeLevel", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="grade 7">Grade 7</SelectItem>
                <SelectItem value="grade 8">Grade 8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredSubjects.length)} of {filteredSubjects.length}{" "}
              subjects
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSubjects.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">
                {selectedSubjects.length} subject{selectedSubjects.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <Clock className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Subjects Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSubjects.length === paginatedSubjects.length && paginatedSubjects.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-foreground">Subject Code</TableHead>
                  <TableHead className="text-foreground">Subject Name</TableHead>
                  <TableHead className="text-foreground">Category</TableHead>
                  <TableHead className="text-foreground">Grade Level</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Visibility</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    className="border-border cursor-pointer hover:bg-muted/50"
                    onContextMenu={(e) => handleContextMenu(e, subject)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSelectSubject(subject.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-foreground">{subject.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium text-foreground">{subject.name}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{subject.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(subject.category)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subject.gradeLevels.map((level, idx) => (
                          <Badge key={idx} className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subject.status, subject)}</TableCell>
                    <TableCell>{getVisibilityBadge(subject.visibility, subject)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem className="text-foreground" onClick={() => handleViewSubject(subject)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Subject
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground" onClick={() => handleEditSubject(subject)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Subject
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteSubject(subject)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Subject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredSubjects.length} total subjects)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-border bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "" : "border-border bg-transparent"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={currentPage === totalPages ? "" : "border-border bg-transparent"}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-border bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleViewSubject(contextMenu.subject)
                  closeContextMenu()
                }}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Subject</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleEditSubject(contextMenu.subject)
                  closeContextMenu()
                }}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Subject</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleDuplicateSubject(contextMenu.subject)}
              >
                <Copy className="w-4 h-4 text-purple-600" />
                <span>Duplicate Subject</span>
              </button>

              <div className="h-px bg-border my-1" />

              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "status" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Change Status</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {contextMenu.submenu === "status" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.subject?.status === "Active" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.subject, "Active")}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Active</span>
                      </div>
                      {contextMenu.subject?.status === "Active" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.subject?.status === "Inactive" ? "bg-gray-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.subject, "Inactive")}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span>Inactive</span>
                      </div>
                      {contextMenu.subject?.status === "Inactive" && <Check className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.subject?.status === "Archived" ? "bg-yellow-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.subject, "Archived")}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-yellow-600" />
                        <span>Archived</span>
                      </div>
                      {contextMenu.subject?.status === "Archived" && <Check className="w-4 h-4 text-yellow-600" />}
                    </button>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "visibility" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Change Visibility</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {contextMenu.submenu === "visibility" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.subject?.visibility === "Public" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.subject, "Public")}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-green-600" />
                        <span>Public</span>
                      </div>
                      {contextMenu.subject?.visibility === "Public" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.subject?.visibility === "Students Only" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.subject, "Students Only")}
                    >
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>Students Only</span>
                      </div>
                      {contextMenu.subject?.visibility === "Students Only" && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.subject?.visibility === "Restricted" ? "bg-red-500/10" : ""
                      }`}
                      onClick={() => handleVisibilityChange(contextMenu.subject, "Restricted")}
                    >
                      <div className="flex items-center gap-3">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Restricted</span>
                      </div>
                      {contextMenu.subject?.visibility === "Restricted" && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleAssignTeacher(contextMenu.subject)}
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span>Assign Teacher</span>
              </button>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                onClick={() => {
                  handleDeleteSubject(contextMenu.subject)
                  closeContextMenu()
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Subject</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.subject && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setDeleteConfirmation({ isOpen: false, subject: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Delete Subject</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">{deleteConfirmation.subject.name}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{deleteConfirmation.subject.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">Code: {deleteConfirmation.subject.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(deleteConfirmation.subject.category)}
                        {getStatusBadge(deleteConfirmation.subject.status)}
                        {getVisibilityBadge(deleteConfirmation.subject.visibility)}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BookMarked className="w-4 h-4" />
                          <span>{deleteConfirmation.subject.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Subject will be permanently deleted</li>
                          <li>• All subject data and materials will be lost</li>
                          <li>• This action cannot be reversed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmation({ isOpen: false, subject: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteSubject}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Subject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status Confirmation Modal */}
      {statusConfirmation.isOpen && statusConfirmation.subject && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setStatusConfirmation({ isOpen: false, subject: null, newStatus: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Subject Status</h3>
                    <p className="text-sm text-muted-foreground">Confirm status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change status of{" "}
                    <span className="font-semibold text-blue-600">{statusConfirmation.subject.name}</span> to{" "}
                    <span className="font-semibold text-green-600">{statusConfirmation.newStatus}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{statusConfirmation.subject.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">Code: {statusConfirmation.subject.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current status:</span>
                        {getStatusBadge(statusConfirmation.subject.status)}
                        <span className="text-muted-foreground">→</span>
                        {getStatusBadge(statusConfirmation.newStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {statusConfirmation.newStatus === "Active" && (
                            <>
                              <li>• Subject will be available for enrollment</li>
                              <li>• Students can view and access materials</li>
                              <li>• Subject appears in active listings</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Inactive" && (
                            <>
                              <li>• Subject will be hidden from enrollment</li>
                              <li>• Current students retain access</li>
                              <li>• No new enrollments allowed</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Archived" && (
                            <>
                              <li>• Subject will be moved to archives</li>
                              <li>• Read-only access for enrolled students</li>
                              <li>• Cannot be modified or enrolled in</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStatusConfirmation({ isOpen: false, subject: null, newStatus: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmStatusChange}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Visibility Confirmation Modal */}
      {visibilityConfirmation.isOpen && visibilityConfirmation.subject && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setVisibilityConfirmation({ isOpen: false, subject: null, newVisibility: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Subject Visibility</h3>
                    <p className="text-sm text-muted-foreground">Confirm visibility change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change visibility of{" "}
                    <span className="font-semibold text-purple-600">{visibilityConfirmation.subject.name}</span> to{" "}
                    <span className="font-semibold text-blue-600">{visibilityConfirmation.newVisibility}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">{visibilityConfirmation.subject.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Code: {visibilityConfirmation.subject.code}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current visibility:</span>
                        {getVisibilityBadge(visibilityConfirmation.subject.visibility)}
                        <span className="text-muted-foreground">→</span>
                        {getVisibilityBadge(visibilityConfirmation.newVisibility)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-700 dark:text-purple-400">
                        <p className="font-medium mb-1">Who can see this subject:</p>
                        <ul className="space-y-1 text-xs">
                          {visibilityConfirmation.newVisibility === "Public" && (
                            <>
                              <li>• Everyone can view this subject</li>
                              <li>• Subject appears in public catalog</li>
                              <li>• No login required to see details</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Students Only" && (
                            <>
                              <li>• Only students can view this subject</li>
                              <li>• Students must be logged in</li>
                              <li>• Teachers and admins can also view</li>
                            </>
                          )}
                          {visibilityConfirmation.newVisibility === "Restricted" && (
                            <>
                              <li>• Only specific users can view</li>
                              <li>• Requires special permissions</li>
                              <li>• Hidden from general listings</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setVisibilityConfirmation({ isOpen: false, subject: null, newVisibility: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmVisibilityChange}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Change Visibility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SubjectsPage
