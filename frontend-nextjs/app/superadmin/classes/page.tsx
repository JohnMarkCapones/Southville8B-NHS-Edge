"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  GraduationCap,
  Users,
  Building,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  MapPin,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const initialGradeLevelsData = [
  {
    grade: 7,
    totalSections: 4,
    totalStudents: 128,
    advisers: 4,
    status: "active",
    sections: [
      {
        id: 1,
        name: "7-A",
        adviser: "Ms. Maria Santos",
        room: "Room 101",
        students: 32,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 2,
        name: "7-B",
        adviser: "Mr. John Reyes",
        room: "Room 102",
        students: 30,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 3,
        name: "7-Einstein",
        adviser: "Ms. Ana Cruz",
        room: "Room 103",
        students: 35,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 4,
        name: "7-Newton",
        adviser: "Mr. Pedro Garcia",
        room: "Room 104",
        students: 31,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
    ],
  },
  {
    grade: 8,
    totalSections: 5,
    totalStudents: 165,
    advisers: 5,
    status: "active",
    sections: [
      {
        id: 5,
        name: "8-A",
        adviser: "Ms. Rosa Mendoza",
        room: "Room 201",
        students: 33,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 6,
        name: "8-B",
        adviser: "Mr. Carlos Lopez",
        room: "Room 202",
        students: 32,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 7,
        name: "8-C",
        adviser: "Ms. Linda Torres",
        room: "Room 203",
        students: 34,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 8,
        name: "8-Darwin",
        adviser: "Mr. Miguel Ramos",
        room: "Room 204",
        students: 33,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 9,
        name: "8-Curie",
        adviser: "Ms. Sofia Diaz",
        room: "Room 205",
        students: 33,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
    ],
  },
  {
    grade: 9,
    totalSections: 5,
    totalStudents: 160,
    advisers: 5,
    status: "active",
    sections: [
      {
        id: 10,
        name: "9-A",
        adviser: "Ms. Elena Fernandez",
        room: "Room 301",
        students: 32,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 11,
        name: "9-B",
        adviser: "Mr. Roberto Silva",
        room: "Room 302",
        students: 31,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 12,
        name: "9-C",
        adviser: "Ms. Carmen Flores",
        room: "Room 303",
        students: 33,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 13,
        name: "9-Tesla",
        adviser: "Mr. Antonio Morales",
        room: "Room 304",
        students: 32,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 14,
        name: "9-Galileo",
        adviser: "Ms. Patricia Gomez",
        room: "Room 305",
        students: 32,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
    ],
  },
  {
    grade: 10,
    totalSections: 4,
    totalStudents: 132,
    advisers: 4,
    status: "active",
    sections: [
      {
        id: 15,
        name: "10-A",
        adviser: "Ms. Isabel Navarro",
        room: "Room 401",
        students: 33,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 16,
        name: "10-B",
        adviser: "Mr. Francisco Ortiz",
        room: "Room 402",
        students: 34,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 17,
        name: "10-Hawking",
        adviser: "Ms. Gloria Castillo",
        room: "Room 403",
        students: 32,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
      {
        id: 18,
        name: "10-Pasteur",
        adviser: "Mr. Luis Herrera",
        room: "Room 404",
        students: 33,
        schedule: "Mon-Fri 7:30 AM",
        status: "active",
      },
    ],
  },
]

export default function GradeLevelsPage() {
  const [gradeLevelsData, setGradeLevelsData] = useState(initialGradeLevelsData)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSections, setSelectedSections] = useState<number[]>([])

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; sectionId: number | null; sectionName: string }>({
    open: false,
    sectionId: null,
    sectionName: "",
  })
  const [statusModal, setStatusModal] = useState<{
    open: boolean
    sectionId: number | null
    currentStatus: string
    newStatus: string
  }>({
    open: false,
    sectionId: null,
    currentStatus: "",
    newStatus: "",
  })
  const [createSectionModal, setCreateSectionModal] = useState(false)
  const [assignAdviserModal, setAssignAdviserModal] = useState<{ open: boolean; sectionId: number | null }>({
    open: false,
    sectionId: null,
  })

  // Calculate totals
  const totalSections = gradeLevelsData.reduce((sum, grade) => sum + grade.totalSections, 0)
  const totalStudents = gradeLevelsData.reduce((sum, grade) => sum + grade.totalStudents, 0)
  const avgClassSize = Math.round(totalStudents / totalSections)

  // Get current sections based on selected grade
  const currentSections = selectedGrade ? gradeLevelsData.find((g) => g.grade === selectedGrade)?.sections || [] : []

  // Filter sections
  const filteredSections = currentSections.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.adviser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.room.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || section.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle section selection
  const handleSelectSection = (sectionId: number) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const handleSelectAll = () => {
    if (selectedSections.length === filteredSections.length) {
      setSelectedSections([])
    } else {
      setSelectedSections(filteredSections.map((s) => s.id))
    }
  }

  // Handle delete
  const handleDeleteSection = (sectionId: number, sectionName: string) => {
    setDeleteModal({ open: true, sectionId, sectionName })
  }

  const confirmDelete = () => {
    if (deleteModal.sectionId && selectedGrade) {
      setGradeLevelsData((prevData) =>
        prevData.map((grade) => {
          if (grade.grade === selectedGrade) {
            return {
              ...grade,
              sections: grade.sections.filter((s) => s.id !== deleteModal.sectionId),
              totalSections: grade.totalSections - 1,
            }
          }
          return grade
        }),
      )
    }
    setDeleteModal({ open: false, sectionId: null, sectionName: "" })
  }

  const handleStatusChange = (sectionId: number, currentStatus: string, newStatus: string) => {
    setStatusModal({ open: true, sectionId, currentStatus, newStatus })
  }

  const confirmStatusChange = () => {
    if (statusModal.sectionId && selectedGrade) {
      setGradeLevelsData((prevData) =>
        prevData.map((grade) => {
          if (grade.grade === selectedGrade) {
            return {
              ...grade,
              sections: grade.sections.map((section) =>
                section.id === statusModal.sectionId ? { ...section, status: statusModal.newStatus } : section,
              ),
            }
          }
          return grade
        }),
      )
    }
    setStatusModal({ open: false, sectionId: null, currentStatus: "", newStatus: "" })
  }

  // Handle assign adviser
  const handleAssignAdviser = (sectionId: number) => {
    setAssignAdviserModal({ open: true, sectionId })
  }

  const confirmAssignAdviser = () => {
    console.log("[v0] Assigning adviser to section:", assignAdviserModal.sectionId)
    setAssignAdviserModal({ open: false, sectionId: null })
  }

  const StatusBadge = ({ status, sectionId }: { status: string; sectionId: number }) => {
    const getStatusColor = (status: string) => {
      return status === "active"
        ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
        : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge className={`${getStatusColor(status)} cursor-pointer transition-colors border`}>
            {status === "active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatusChange(sectionId, status, "active")}>
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Set as Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange(sectionId, status, "inactive")}>
            <XCircle className="w-4 h-4 mr-2 text-gray-600" />
            Set as Inactive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // If no grade selected, show grade level overview
  if (!selectedGrade) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grade Levels Management</h1>
            <p className="text-muted-foreground mt-1">Manage grade levels and their sections</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Grade Levels</p>
                  <p className="text-2xl font-bold text-foreground">{gradeLevelsData.length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sections</p>
                  <p className="text-2xl font-bold text-foreground">{totalSections}</p>
                </div>
                <Building className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Class Size</p>
                  <p className="text-2xl font-bold text-foreground">{avgClassSize}</p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gradeLevelsData.map((gradeLevel) => (
            <Card
              key={gradeLevel.grade}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary"
              onClick={() => setSelectedGrade(gradeLevel.grade)}
            >
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {gradeLevel.grade}
                    </div>
                    <div>
                      <CardTitle className="text-xl">Grade {gradeLevel.grade}</CardTitle>
                      <p className="text-sm text-muted-foreground">{gradeLevel.totalSections} sections</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <span className="font-semibold text-foreground">{gradeLevel.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Advisers</span>
                    <span className="font-semibold text-foreground">{gradeLevel.advisers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  View Sections
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show sections view for selected grade
  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedGrade(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grade {selectedGrade} Sections</h1>
            <p className="text-muted-foreground mt-1">
              {currentSections.length} sections • {currentSections.reduce((sum, s) => sum + s.students, 0)} students
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateSectionModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Section
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search sections, advisers, or rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedSections.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{selectedSections.length} section(s) selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedSections.length === filteredSections.length && filteredSections.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Section Name</TableHead>
              <TableHead>Adviser</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSections.map((section) => (
              <TableRow
                key={section.id}
                className="cursor-pointer hover:bg-muted/50"
                onContextMenu={(e) => {
                  e.preventDefault()
                  // Context menu would be handled here
                }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSelectSection(section.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{section.name}</TableCell>
                <TableCell>{section.adviser}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {section.room}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {section.students}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {section.schedule}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={section.status} sectionId={section.id} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Section
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignAdviser(section.id)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Adviser
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Change Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleStatusChange(section.id, section.status, "active")}>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(section.id, section.status, "inactive")}>
                            <XCircle className="w-4 h-4 mr-2 text-gray-600" />
                            Inactive
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteSection(section.id, section.name)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Section
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete section <strong>{deleteModal.sectionName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
            <div className="flex gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm text-red-700 dark:text-red-200">
                  Deleting this section will remove all associated data including student assignments and records.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, sectionId: null, sectionName: "" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusModal.open} onOpenChange={(open) => setStatusModal({ ...statusModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Section Status</DialogTitle>
            <DialogDescription>
              Change the status from{" "}
              <strong className="text-foreground">
                {statusModal.currentStatus.charAt(0).toUpperCase() + statusModal.currentStatus.slice(1)}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground">
                {statusModal.newStatus.charAt(0).toUpperCase() + statusModal.newStatus.slice(1)}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Status Change Information</p>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {statusModal.newStatus === "active"
                    ? "Activating this section will make it visible and accessible to students and teachers."
                    : "Deactivating this section will hide it from students and teachers, but data will be preserved."}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusModal({ open: false, sectionId: null, currentStatus: "", newStatus: "" })}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Section Modal */}
      <Dialog open={createSectionModal} onOpenChange={setCreateSectionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>Add a new section to Grade {selectedGrade}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section Name *</Label>
                <Input placeholder="e.g., 7-A, 7-Einstein" />
              </div>
              <div className="space-y-2">
                <Label>Room *</Label>
                <Input placeholder="e.g., Room 101" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adviser *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select adviser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ms. Maria Santos</SelectItem>
                  <SelectItem value="2">Mr. John Reyes</SelectItem>
                  <SelectItem value="3">Ms. Ana Cruz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Schedule *</Label>
              <Input placeholder="e.g., Mon-Fri 7:30 AM" />
            </div>
            <div className="space-y-2">
              <Label>Maximum Students</Label>
              <Input type="number" placeholder="35" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSectionModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateSectionModal(false)}>Create Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Adviser Modal */}
      <Dialog
        open={assignAdviserModal.open}
        onOpenChange={(open) => setAssignAdviserModal({ ...assignAdviserModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Adviser</DialogTitle>
            <DialogDescription>Select a teacher to be the adviser for this section</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Adviser *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ms. Maria Santos</SelectItem>
                  <SelectItem value="2">Mr. John Reyes</SelectItem>
                  <SelectItem value="3">Ms. Ana Cruz</SelectItem>
                  <SelectItem value="4">Mr. Pedro Garcia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignAdviserModal({ open: false, sectionId: null })}>
              Cancel
            </Button>
            <Button onClick={confirmAssignAdviser}>Assign Adviser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
