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
import type { NewsTeamMember } from "@/components/superadmin/data/news-team-data"
import { useEffect, useMemo } from "react"
import { newsApi } from "@/lib/api/endpoints/news"
import type { StudentData } from "@/components/superadmin/data/student-data"
import { cn } from "@/lib/utils"
import { useStudentSearch } from "@/hooks/useStudentSearch"

export default function TeacherNewsTeamPage() {
  const { toast } = useToast()
  const [members, setMembers] = useState<NewsTeamMember[]>([])
  const [kpis, setKpis] = useState<{
    totalMembers: number
    membersByPosition: { position: string; count: number }[]
    activeContributors30d: number
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
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
   position: "Staff Writer",
 })

  // Shared: map UI role to default permissions expected by the page controls
  const getDefaultPermissions = (
    position: string,
  ): ("approve" | "publish" | "edit" | "write" | "review")[] => {
    switch (position) {
      case "Editor-in-Chief":
        return ["approve", "publish", "edit", "write", "review"]
      case "Managing Editor":
        return ["approve", "publish", "edit", "write", "review"]
      case "Section Editor":
        return ["edit", "write", "review"]
      case "Staff Writer":
      case "Photographer":
      case "Layout Designer":
        return ["write"]
      case "Faculty Adviser":
        return ["approve", "publish", "edit", "write", "review"]
      default:
        return ["write"]
    }
  }

  // Load live members and KPIs
  const fetchMembersAndKpis = async () => {
      try {
        console.log('[news-team] Fetching members and KPIs...')
        const [apiMembers, apiKpis] = await Promise.all([
          newsApi.getJournalismMembers(),
          newsApi.getJournalismKpis(),
        ])

        console.log('[news-team] API Members:', apiMembers)
        console.log('[news-team] API KPIs:', apiKpis)

        // Map API members to UI shape with safe defaults
        const mapped: NewsTeamMember[] = apiMembers.map((m) => ({
          id: m.membershipId ?? `${m.userId}:${m.position}`,
          userId: m.userId,
          name: m.userName,
          email: m.userEmail,
          position: m.position as any,
          department: "Journalism",
          status: "Active",
          articlesWritten: 0,
          articlesPublished: 0,
          joinDate: new Date().toISOString(),
          avatar: undefined,
          permissions: getDefaultPermissions(m.position),
          employeeId: m.userId,
          joinedDate: new Date().toISOString().split("T")[0],
          articlesEdited: 0,
          monthlyQuota: 0,
          performance: 0,
          specialization: [],
        }))
        
        console.log('[news-team] Mapped members:', mapped)
        setMembers(mapped)

        setKpis({
          totalMembers: apiKpis.totalMembers,
          membersByPosition: apiKpis.membersByPosition,
          activeContributors30d: apiKpis.activeContributors30d,
        })
      } catch (error: any) {
        console.error('[news-team] failed to load members/kpis', error)
        toast({ title: 'Failed to load news team', description: error?.message || 'Please try again.', variant: 'destructive' })
      }
  }

  useEffect(() => {
    fetchMembersAndKpis()
  }, [toast])

  // Calculate statistics (fallback to KPIs when available)
  const stats = {
    totalMembers: kpis?.totalMembers ?? members.length,
    activeMembers: members.filter((m) => m.status === "Active").length,
    avgArticlesPerMonth: Math.round(members.reduce((sum, m) => sum + (m.articlesWritten || 0), 0) / (members.length || 1)) || 0,
    avgApprovalRate:
      Math.round(
        members.reduce(
          (sum, m) => sum + (m.articlesWritten > 0 ? ((m.articlesPublished || 0) / (m.articlesWritten || 1)) * 100 : 0),
          0,
        ) / (members.length || 1),
      ) || 0,
  }

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPosition = positionFilter === "all" || member.position === positionFilter
    return matchesSearch && matchesPosition
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

  const mapUiPositionToBackend = (pos: string): string => {
    switch (pos) {
      case 'Staff Writer':
      case 'Photographer':
      case 'Layout Designer':
      case 'Section Editor':
      case 'Managing Editor':
        return 'Writer'
      case 'Editor-in-Chief':
        return 'Editor-in-Chief'
      case 'Faculty Adviser':
        return 'Adviser'
      default:
        return 'Writer'
    }
  }

  const handleAddMember = async () => {
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

    try {
      if (!selectedStudent?.id) throw new Error('Select a student to add')
      const backendPosition = mapUiPositionToBackend(newMember.position)
      await newsApi.addJournalismMember({ userId: selectedStudent.id, position: backendPosition })

      await fetchMembersAndKpis()

      setAddMemberDialogOpen(false)
      setSelectedStudent(null)
      setStudentSearchValue("")
      setNewMember({ position: "Staff Writer" })

      toast({ title: 'Member Added', description: `${selectedStudent.name} added as ${backendPosition}.` })
    } catch (error: any) {
      toast({ title: 'Failed to add member', description: error?.message || 'Please try again.', variant: 'destructive' })
    }
  }

  const handleEditMember = (member: NewsTeamMember) => {
    setSelectedMember(member)
    setEditMemberDialogOpen(true)
  }

  const handleUpdateMember = async () => {
    if (!selectedMember) return
    try {
      const backendPosition = mapUiPositionToBackend(selectedMember.position as unknown as string)
      const selectedUserId = (selectedMember as any).userId || selectedMember.id
      await newsApi.updateJournalismMember(selectedUserId, { position: backendPosition })
      await fetchMembersAndKpis()
      setEditMemberDialogOpen(false)
      setSelectedMember(null)
      toast({ title: 'Member Updated', description: 'Position updated successfully.' })
    } catch (error: any) {
      toast({ title: 'Failed to update member', description: error?.message || 'Please try again.', variant: 'destructive' })
    }
  }

  const handleDeleteMember = (member: NewsTeamMember) => {
    setSelectedMember(member)
    setDeleteMemberDialogOpen(true)
  }

  const confirmDeleteMember = async () => {
    if (!selectedMember) return
    try {
      const selectedUserId = (selectedMember as any).userId || selectedMember.id
      await newsApi.removeJournalismMember(selectedUserId)
      await fetchMembersAndKpis()
      setDeleteMemberDialogOpen(false)
      setSelectedMember(null)
      toast({ title: 'Member Removed', description: 'Member removed from journalism.', variant: 'destructive' })
    } catch (error: any) {
      toast({ title: 'Failed to remove member', description: error?.message || 'Please try again.', variant: 'destructive' })
    }
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
    // Toggle selection: clicking the same student deselects
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(null)
      setStudentSearchValue("")
    } else {
      setSelectedStudent(student)
      setStudentSearchValue(student.name)
    }
    // Member creation only needs user + position; keep popover closed behavior consistent
    setStudentSearchOpen(false)
  }

  // Fetch students using the hook
  const {
    data: studentsData,
    isLoading: loadingStudents,
    updateSearch: updateStudentSearch,
    updateFilters: updateStudentFilters,
  } = useStudentSearch({ limit: 100 })

  // Search and filters for student list
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentGradeFilter, setStudentGradeFilter] = useState("__all__")
  const [studentSectionFilter, setStudentSectionFilter] = useState("__all__")

  // Stable option caches so filters don't collapse after applying filters
  const [gradeOptionsAll, setGradeOptionsAll] = useState<string[]>([])
  const [sectionOptionsAll, setSectionOptionsAll] = useState<[string, string][]>([])

  // Map API students to StudentData format
  const filteredStudents: StudentData[] = useMemo(() => {
    if (!studentsData?.data) return []
    
    return studentsData.data.map((student) => ({
      id: student.user_id, // Use user_id for API calls, not student.id
      name: student.user?.full_name || `${student.first_name} ${student.last_name}`,
      email: student.user?.email || "",
      grade: student.grade_level || student.section?.grade_level || "",
      section: student.section?.name || "",
      status: student.user?.status || "Active",
      enrollmentDate: student.user?.created_at || "",
      guardian: "",
      phone: "",
      address: "",
    }))
  }, [studentsData])

  // Update caches with any newly seen grades/sections (union, never shrink)
  useEffect(() => {
    if (!studentsData?.data) return
    const nextGrades = new Set(gradeOptionsAll)
    const nextSections = new Map(sectionOptionsAll)

    studentsData.data.forEach((s) => {
      const g = s.grade_level || s.section?.grade_level
      if (g) nextGrades.add(g)
      if (s.section?.id && s.section?.name) {
        nextSections.set(s.section.id, s.section.name)
      }
    })

    const gradesArr = Array.from(nextGrades).sort()
    const sectionsArr = Array.from(nextSections.entries()).sort((a, b) => a[1].localeCompare(b[1]))

    // Only update state if changed to avoid loops
    if (gradesArr.length !== gradeOptionsAll.length || gradesArr.some((g, i) => g !== gradeOptionsAll[i])) {
      setGradeOptionsAll(gradesArr)
    }
    if (sectionsArr.length !== sectionOptionsAll.length || sectionsArr.some((e, i) => e[0] !== sectionOptionsAll[i]?.[0])) {
      setSectionOptionsAll(sectionsArr)
    }
  }, [studentsData, gradeOptionsAll, sectionOptionsAll])

  const getRecommendedStudents = () => [] as StudentData[]

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
              {/* Search and Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="col-span-2 flex gap-2">
                  <Input
                    placeholder="Search students by name or ID"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => updateStudentSearch(studentSearchTerm)}
                    disabled={loadingStudents}
                  >
                    Search
                  </Button>
                </div>
                <div>
                  <Select
                    value={studentGradeFilter}
                    onValueChange={(val) => {
                      setStudentGradeFilter(val)
                      updateStudentFilters({ gradeLevel: val === "__all__" ? undefined : val })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Grades</SelectItem>
                      {gradeOptionsAll.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={studentSectionFilter}
                    onValueChange={(val) => {
                      setStudentSectionFilter(val)
                      updateStudentFilters({ sectionId: val === "__all__" ? undefined : val })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Sections</SelectItem>
                      {sectionOptionsAll.map(([id, name]) => (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Label className="text-base font-semibold">Select Student</Label>
              <div className="max-h-72 overflow-auto rounded-lg border">
                {loadingStudents ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No students available.</div>
                ) : (
                  <div className="divide-y">
                    {filteredStudents.slice(0, 50).map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleStudentSelect(student)}
                        className={cn(
                          "w-full text-left p-3 hover:bg-purple-50 dark:hover:bg-purple-950/20",
                          selectedStudent?.id === student.id && "bg-purple-50 dark:bg-purple-950/30",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.id}</div>
                          </div>
                          {selectedStudent?.id === student.id && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                          Avg: N/A
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <Button onClick={handleAddMember} className="bg-purple-600 hover:bg-purple-700" disabled={!selectedStudent || !newMember.position}>
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
                    value={selectedMember?.name || ""}
                    onChange={(e) => setSelectedMember(selectedMember ? { ...selectedMember, name: e.target.value } : selectedMember)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={selectedMember?.email || ""}
                    onChange={(e) => setSelectedMember(selectedMember ? { ...selectedMember, email: e.target.value } : selectedMember)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
