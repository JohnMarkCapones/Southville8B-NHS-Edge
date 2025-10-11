"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Award,
  UserPlus,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Calendar,
  Activity,
  BarChart3,
  Check,
  ChevronsUpDown,
  GraduationCap,
  BookOpen,
} from "lucide-react"
import { newsTeamData, type NewsTeamMember } from "@/components/superadmin/data/news-team-data"
import { studentData, type StudentData } from "@/components/superadmin/data/student-data"
import { cn } from "@/lib/utils"

export default function TeacherNewsTeamPage() {
  const { toast } = useToast()
  const [members, setMembers] = useState<NewsTeamMember[]>(newsTeamData)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false)
  const [viewMemberDialogOpen, setViewMemberDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<NewsTeamMember | null>(null)

  const [studentSearchOpen, setStudentSearchOpen] = useState(false)
  const [studentSearchValue, setStudentSearchValue] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    position: "Staff Writer",
    department: "English",
  })

  // Calculate statistics
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "Active").length,
    avgArticlesPerMonth: Math.round(members.reduce((sum, m) => sum + m.articlesWritten, 0) / members.length) || 0,
    avgApprovalRate:
      Math.round(
        members.reduce(
          (sum, m) => sum + (m.articlesWritten > 0 ? (m.articlesPublished / m.articlesWritten) * 100 : 0),
          0,
        ) / members.length,
      ) || 0,
  }

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPosition = positionFilter === "all" || member.position === positionFilter
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter

    return matchesSearch && matchesPosition && matchesDepartment && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

  const handleSelectMember = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, id])
    } else {
      setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(paginatedMembers.map((m) => m.id))
    } else {
      setSelectedMembers([])
    }
  }

  const handleAddMember = () => {
    const getDefaultPermissions = (position: string): ("approve" | "publish" | "edit" | "write" | "review")[] => {
      switch (position) {
        case "Editor-in-Chief":
          return ["approve", "publish", "edit", "write", "review"]
        case "Managing Editor":
          return ["approve", "publish", "edit", "write", "review"]
        case "Section Editor":
          return ["edit", "write", "review"]
        case "Staff Writer":
          return ["write"]
        case "Photographer":
          return ["write"]
        case "Layout Designer":
          return ["edit"]
        case "Faculty Adviser":
          return ["approve", "publish", "edit", "write", "review"]
        default:
          return ["write"]
      }
    }

    const member: NewsTeamMember = {
      id: `T${members.length + 1}`,
      name: newMember.name,
      email: newMember.email,
      employeeId: `EMP${String(members.length + 1).padStart(4, "0")}`,
      position: newMember.position as any,
      department: newMember.department,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40",
      permissions: getDefaultPermissions(newMember.position),
      articlesWritten: 0,
      articlesEdited: 0,
      articlesPublished: 0,
      monthlyQuota: 0,
      performance: 0,
      specialization: [],
    }

    setMembers([...members, member])
    setAddMemberDialogOpen(false)
    setSelectedStudent(null)
    setStudentSearchValue("")
    setNewMember({
      name: "",
      email: "",
      phone: "",
      position: "Staff Writer",
      department: "English",
    })

    toast({
      title: "Member Added",
      description: `${member.name} has been added to the news team.`,
    })
  }

  const handleEditMember = (member: NewsTeamMember) => {
    setSelectedMember(member)
    setEditMemberDialogOpen(true)
  }

  const handleUpdateMember = () => {
    if (!selectedMember) return

    setMembers(members.map((m) => (m.id === selectedMember.id ? selectedMember : m)))
    setEditMemberDialogOpen(false)
    setSelectedMember(null)

    toast({
      title: "Member Updated",
      description: "Member information has been updated successfully.",
    })
  }

  const handleDeleteMember = (member: NewsTeamMember) => {
    setSelectedMember(member)
    setDeleteMemberDialogOpen(true)
  }

  const confirmDeleteMember = () => {
    if (!selectedMember) return

    setMembers(members.filter((m) => m.id !== selectedMember.id))
    setDeleteMemberDialogOpen(false)
    setSelectedMember(null)

    toast({
      title: "Member Removed",
      description: "Member has been removed from the news team.",
      variant: "destructive",
    })
  }

  const handleViewMember = (member: NewsTeamMember) => {
    setSelectedMember(member)
    setViewMemberDialogOpen(true)
  }

  const handleBulkStatusChange = (status: "Active" | "Inactive") => {
    setMembers(members.map((m) => (selectedMembers.includes(m.id) ? { ...m, status } : m)))
    setSelectedMembers([])

    toast({
      title: "Status Updated",
      description: `${selectedMembers.length} member(s) status changed to ${status}.`,
    })
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Exporting news team data...",
    })
  }

  const getPositionBadge = (position: string) => {
    const colors: Record<string, string> = {
      "Editor-in-Chief": "bg-purple-100 text-purple-700 border-purple-300",
      "Managing Editor": "bg-blue-100 text-blue-700 border-blue-300",
      "Section Editor": "bg-green-100 text-green-700 border-green-300",
      "Staff Writer": "bg-gray-100 text-gray-700 border-gray-300",
      Photographer: "bg-orange-100 text-orange-700 border-orange-300",
      "Layout Designer": "bg-pink-100 text-pink-700 border-pink-300",
      "Faculty Adviser": "bg-indigo-100 text-indigo-700 border-indigo-300",
    }

    return (
      <Badge variant="outline" className={`${colors[position] || "bg-gray-100 text-gray-700"} border`}>
        {position}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-700 border-green-300 border">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700 border-gray-300 border">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const handleStudentSelect = (student: StudentData) => {
    setSelectedStudent(student)
    setStudentSearchValue(student.name)
    setNewMember({
      ...newMember,
      name: student.name,
      email: student.email,
      phone: student.phone,
    })
    setStudentSearchOpen(false)
  }

  const filteredStudents = studentData.filter((student) => {
    const searchLower = studentSearchValue.toLowerCase()
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.id.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.grade.toLowerCase().includes(searchLower) ||
      student.section.toLowerCase().includes(searchLower)
    )
  })

  const getRecommendedStudents = () => {
    return studentData
      .filter((student) => {
        if (!student.grades || !Array.isArray(student.grades) || student.grades.length === 0) {
          return false
        }
        const avgGrade = student.grades.reduce((sum, g) => sum + g.grade, 0) / student.grades.length
        return avgGrade >= 85 && student.attendance >= 90
      })
      .slice(0, 5)
  }

  const recommendedStudents = getRecommendedStudents()

  return (
    <div className="space-y-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto py-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">News Team Management</h1>
                <p className="text-purple-100 mt-1 text-lg">Manage student contributors and their roles</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setAddMemberDialogOpen(true)}
            size="lg"
            className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-100">Total Members</p>
                <p className="text-3xl font-bold">{stats.totalMembers}</p>
                <p className="text-xs text-blue-100">News team size</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-100">Active Members</p>
                <p className="text-3xl font-bold">{stats.activeMembers}</p>
                <p className="text-xs text-green-100">Currently contributing</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-100">Avg Articles/Month</p>
                <p className="text-3xl font-bold">{stats.avgArticlesPerMonth}</p>
                <p className="text-xs text-orange-100">Per member</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-100">Avg Approval Rate</p>
                <p className="text-3xl font-bold">{stats.avgApprovalRate}%</p>
                <p className="text-xs text-purple-100">Team performance</p>
              </div>
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Award className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Team Members</CardTitle>
              <CardDescription>Manage teacher news contributors and their permissions</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-11 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <Select value={positionFilter} onValueChange={(value) => setPositionFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 border-gray-300">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Editor-in-Chief">Editor-in-Chief</SelectItem>
                <SelectItem value="Managing Editor">Managing Editor</SelectItem>
                <SelectItem value="Section Editor">Section Editor</SelectItem>
                <SelectItem value="Staff Writer">Staff Writer</SelectItem>
                <SelectItem value="Photographer">Photographer</SelectItem>
                <SelectItem value="Layout Designer">Layout Designer</SelectItem>
                <SelectItem value="Faculty Adviser">Faculty Adviser</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Filipino">Filipino</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[150px] h-11 border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedMembers.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("Active")}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("Inactive")}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => setSelectedMembers([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMembers.length === paginatedMembers.length && paginatedMembers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Member</TableHead>
                  <TableHead className="font-semibold">Position</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Performance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors cursor-pointer"
                    onClick={() => handleViewMember(member)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPositionBadge(member.position)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{member.department}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {/* Updated to show articlesWritten */}
                        <div className="text-sm font-medium">{member.articlesWritten} articles</div>
                        {/* Updated to correctly calculate and display approval rate */}
                        <div className="text-xs text-muted-foreground">
                          {Math.round((member.articlesPublished / member.articlesWritten) * 100) || 0}% approval rate
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewMember(member)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditMember(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
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
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-foreground font-semibold">{startIndex + 1}</span> to{" "}
              <span className="text-foreground font-semibold">{Math.min(endIndex, filteredMembers.length)}</span> of{" "}
              <span className="text-foreground font-semibold">{filteredMembers.length}</span> members
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add News Team Member</DialogTitle>
            <DialogDescription>
              Search and select a student from the database to add to the news team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="student-search" className="text-base font-semibold">
                Search Student
              </Label>
              <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentSearchOpen}
                    className="w-full justify-between h-12 bg-transparent border-2 hover:border-purple-300 transition-colors"
                  >
                    {selectedStudent ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                            {selectedStudent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate font-medium">{selectedStudent.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {selectedStudent.id}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Search for a student...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput
                      placeholder="Search by name, ID, grade, or section..."
                      value={studentSearchValue}
                      onValueChange={setStudentSearchValue}
                      className="h-12"
                    />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>

                      {!studentSearchValue && recommendedStudents.length > 0 && (
                        <CommandGroup heading="Recommended Students (High Performers)">
                          {recommendedStudents.map((student) => {
                            const avgGrade =
                              student.grades && student.grades.length > 0
                                ? student.grades.reduce((sum, g) => sum + g.grade, 0) / student.grades.length
                                : 0
                            return (
                              <CommandItem
                                key={student.id}
                                value={student.name}
                                onSelect={() => handleStudentSelect(student)}
                                className="cursor-pointer py-3"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="text-sm bg-purple-100 text-purple-700">
                                      {student.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate flex items-center gap-2">
                                      {student.name}
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-300 text-xs"
                                      >
                                        {avgGrade.toFixed(1)}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {student.id} • {student.grade} - {student.section} • {student.attendance}%
                                      attendance
                                    </div>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      selectedStudent?.id === student.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      )}

                      <CommandGroup heading={studentSearchValue ? "Search Results" : "All Students"}>
                        {filteredStudents.slice(0, 10).map((student) => {
                          const avgGrade =
                            student.grades && student.grades.length > 0
                              ? student.grades.reduce((sum, g) => sum + g.grade, 0) / student.grades.length
                              : 0
                          return (
                            <CommandItem
                              key={student.id}
                              value={student.name}
                              onSelect={() => handleStudentSelect(student)}
                              className="cursor-pointer py-3"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="text-sm">{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{student.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {student.id} • {student.grade} - {student.section} • Avg: {avgGrade.toFixed(1)}
                                  </div>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedStudent?.id === student.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedStudent && (
                <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                      <AvatarFallback className="text-lg bg-purple-600 text-white">
                        {selectedStudent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{selectedStudent.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{selectedStudent.email}</div>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="bg-white">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {selectedStudent.grade} - {selectedStudent.section}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Avg:{" "}
                          {selectedStudent.grades && selectedStudent.grades.length > 0
                            ? (
                                selectedStudent.grades.reduce((sum, g) => sum + g.grade, 0) /
                                selectedStudent.grades.length
                              ).toFixed(1)
                            : "N/A"}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {selectedStudent.attendance}% attendance
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter full name"
                  disabled={!!selectedStudent}
                  className={selectedStudent ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@example.com"
                  disabled={!!selectedStudent}
                  className={selectedStudent ? "bg-muted" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="+63 XXX XXX XXXX"
                  disabled={!!selectedStudent}
                  className={selectedStudent ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={newMember.position}
                  onValueChange={(value) => setNewMember({ ...newMember, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Editor-in-Chief">Editor-in-Chief</SelectItem>
                    <SelectItem value="Managing Editor">Managing Editor</SelectItem>
                    <SelectItem value="Section Editor">Section Editor</SelectItem>
                    <SelectItem value="Staff Writer">Staff Writer</SelectItem>
                    <SelectItem value="Photographer">Photographer</SelectItem>
                    <SelectItem value="Layout Designer">Layout Designer</SelectItem>
                    <SelectItem value="Faculty Adviser">Faculty Adviser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newMember.department}
                onValueChange={(value) => setNewMember({ ...newMember, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Permissions are automatically assigned based on position
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    You can edit permissions later from the member details page.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddMemberDialogOpen(false)
                setSelectedStudent(null)
                setStudentSearchValue("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember} className="bg-purple-600 hover:bg-purple-700" disabled={!newMember.name}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update member information and permissions.</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedMember.name}
                    onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedMember.email}
                    onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedMember.phone}
                    onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position</Label>
                  <Select
                    value={selectedMember.position}
                    onValueChange={(value) => setSelectedMember({ ...selectedMember, position: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor-in-Chief">Editor-in-Chief</SelectItem>
                      <SelectItem value="Managing Editor">Managing Editor</SelectItem>
                      <SelectItem value="Section Editor">Section Editor</SelectItem>
                      <SelectItem value="Staff Writer">Staff Writer</SelectItem>
                      <SelectItem value="Photographer">Photographer</SelectItem>
                      <SelectItem value="Layout Designer">Layout Designer</SelectItem>
                      <SelectItem value="Faculty Adviser">Faculty Adviser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={selectedMember.department}
                  onValueChange={(value) => setSelectedMember({ ...selectedMember, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Filipino">Filipino</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-canWrite"
                      checked={selectedMember.permissions.includes("write")}
                      onCheckedChange={(checked) => {
                        const perms = checked
                          ? [...selectedMember.permissions, "write"]
                          : selectedMember.permissions.filter((p) => p !== "write")
                        setSelectedMember({ ...selectedMember, permissions: perms as any })
                      }}
                    />
                    <Label htmlFor="edit-canWrite" className="font-normal">
                      Can Write Articles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-canEdit"
                      checked={selectedMember.permissions.includes("edit")}
                      onCheckedChange={(checked) => {
                        const perms = checked
                          ? [...selectedMember.permissions, "edit"]
                          : selectedMember.permissions.filter((p) => p !== "edit")
                        setSelectedMember({ ...selectedMember, permissions: perms as any })
                      }}
                    />
                    <Label htmlFor="edit-canEdit" className="font-normal">
                      Can Edit Articles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-canReview"
                      checked={selectedMember.permissions.includes("review")}
                      onCheckedChange={(checked) => {
                        const perms = checked
                          ? [...selectedMember.permissions, "review"]
                          : selectedMember.permissions.filter((p) => p !== "review")
                        setSelectedMember({ ...selectedMember, permissions: perms as any })
                      }}
                    />
                    <Label htmlFor="edit-canReview" className="font-normal">
                      Can Review Articles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-canApprove"
                      checked={selectedMember.permissions.includes("approve")}
                      onCheckedChange={(checked) => {
                        const perms = checked
                          ? [...selectedMember.permissions, "approve"]
                          : selectedMember.permissions.filter((p) => p !== "approve")
                        setSelectedMember({ ...selectedMember, permissions: perms as any })
                      }}
                    />
                    <Label htmlFor="edit-canApprove" className="font-normal">
                      Can Approve Articles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-canPublish"
                      checked={selectedMember.permissions.includes("publish")}
                      onCheckedChange={(checked) => {
                        const perms = checked
                          ? [...selectedMember.permissions, "publish"]
                          : selectedMember.permissions.filter((p) => p !== "publish")
                        setSelectedMember({ ...selectedMember, permissions: perms as any })
                      }}
                    />
                    <Label htmlFor="edit-canPublish" className="font-normal">
                      Can Publish Articles
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMember} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={viewMemberDialogOpen} onOpenChange={setViewMemberDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>View detailed information about this news team member.</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6 py-4">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedMember.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {getPositionBadge(selectedMember.position)}
                    {getStatusBadge(selectedMember.status)}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedMember.email}
                    </div>
                    {/* Updated to use joinedDate */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(selectedMember.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      {/* Updated to show articlesWritten */}
                      <div className="text-2xl font-bold text-blue-600">{selectedMember.articlesWritten}</div>
                      <div className="text-xs text-muted-foreground">Articles Written</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{selectedMember.articlesPublished}</div>
                      <div className="text-xs text-muted-foreground">Published</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      {/* Updated to correctly calculate and display approval rate */}
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((selectedMember.articlesPublished / selectedMember.articlesWritten) * 100) || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Approval Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      {/* Updated to show performance */}
                      <div className="text-2xl font-bold text-orange-600">{selectedMember.performance}%</div>
                      <div className="text-xs text-muted-foreground">Performance</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permissions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Updated to check for permission strings */}
                  <div className="flex items-center gap-2">
                    {selectedMember.permissions.includes("write") ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm">Can Write Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMember.permissions.includes("edit") ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm">Can Edit Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMember.permissions.includes("review") ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm">Can Review Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMember.permissions.includes("approve") ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm">Can Approve Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMember.permissions.includes("publish") ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm">Can Publish Articles</span>
                  </div>
                </div>
              </div>

              {/* Monthly Quota */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Monthly Quota
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{selectedMember.monthlyQuota}</div>
                      <div className="text-xs text-muted-foreground">Target</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{selectedMember.articlesPublished}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      {/* Updated to calculate pending articles */}
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedMember.articlesWritten - selectedMember.articlesPublished}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMemberDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewMemberDialogOpen(false)
                if (selectedMember) handleEditMember(selectedMember)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteMemberDialogOpen} onOpenChange={setDeleteMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the news team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMember} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
