"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  BarChart3,
  FileText,
  Mail,
  Calendar,
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Loader2,
} from "lucide-react"
import { StudentDetailPanel } from "../panels/student-detail-panel"
import { useAllStudents, type Student } from "@/hooks/useAllStudents"

export const StudentManagementSection = () => {
  // ✅ Use API hook instead of mock data
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // ✅ Fetch students from API with filters
  const {
    students,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    goToPage,
    nextPage,
    previousPage,
    setFilters,
  } = useAllStudents({
    initialPage: 1,
    limit: itemsPerPage,
  })

  // ✅ Update search query with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, setSearchQuery])

  // ✅ Update filters when grade or status filter changes
  useEffect(() => {
    setFilters({
      gradeLevel: gradeFilter === 'all' ? undefined : gradeFilter,
    })
  }, [gradeFilter, setFilters])

  // ✅ Update limit when itemsPerPage changes
  useEffect(() => {
    setFilters({ limit: itemsPerPage })
  }, [itemsPerPage, setFilters])

  const openStudentPanel = useCallback((student: any) => {
    setSelectedStudent(student)
    setIsPanelOpen(true)
  }, [])

  const closeStudentPanel = useCallback(() => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedStudent(null), 500)
  }, [])

  // ✅ Calculate stats from API data
  const stats = useMemo(() => {
    if (!pagination) return { total: 0, active: 0, inactive: 0, suspended: 0 }

    // For now, use the data we have. Ideally we'd have dedicated count endpoints
    const activeCount = students.filter(s => s.user?.status === 'Active').length
    const inactiveCount = students.filter(s => s.user?.status === 'Inactive').length
    const suspendedCount = students.filter(s => s.user?.status === 'Suspended').length

    return {
      total: pagination.total,
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount,
    }
  }, [students, pagination])

  // ✅ Calculate grade distribution from API data
  const gradeDistribution = useMemo(() => {
    const distribution = [
      { grade: "Grade 7", level: "7", count: 0, color: "bg-blue-500" },
      { grade: "Grade 8", level: "8", count: 0, color: "bg-green-500" },
      { grade: "Grade 9", level: "9", count: 0, color: "bg-yellow-500" },
      { grade: "Grade 10", level: "10", count: 0, color: "bg-orange-500" },
    ]

    students.forEach((student) => {
      const gradeLevel = student.grade_level || student.section?.grade_level
      if (gradeLevel) {
        const gradeItem = distribution.find(g => g.level === gradeLevel)
        if (gradeItem) {
          gradeItem.count++
        }
      }
    })

    return distribution
  }, [students])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const maxCount = Math.max(...gradeDistribution.map((g) => g.count), 1) // Ensure at least 1 to avoid division by zero

  // Show loading state
  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">Failed to load students</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Student Management</h2>
          <p className="text-muted-foreground mt-1">Manage and monitor all student accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border/50 hover:bg-muted bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* ✅ Enhanced Stats Cards - Using API Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[12, 19, 15, 22, 18, 25, 20, 24, 21, 28].map((height, i) => (
                <div key={i} className="flex-1 bg-blue-400/60 rounded-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {stats.active}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[15, 22, 18, 25, 20, 28, 24, 30, 26, 32].map((height, i) => (
                <div key={i} className="flex-1 bg-emerald-400/60 rounded-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Inactive</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {stats.inactive}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <UserX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[8, 12, 6, 15, 10, 18, 14, 20, 16, 22].map((height, i) => (
                <div key={i} className="flex-1 bg-orange-400/60 rounded-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Suspended</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {stats.suspended}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[3, 5, 2, 7, 4, 8, 6, 9, 7, 10].map((height, i) => (
                <div key={i} className="flex-1 bg-red-400/60 rounded-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Grade Distribution</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Student Count by Grade Level
              </div>
            </div>
            <div className="space-y-4">
              {gradeDistribution.map((grade) => (
                <div key={grade.grade} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-foreground">{grade.grade}</div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full ${grade.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${(grade.count / maxCount) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{grade.count}</span>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-muted-foreground text-right">
                    {stats.total > 0 ? Math.round((grade.count / stats.total) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-border/50 hover:bg-muted bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/50 hover:bg-muted bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Send Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/50 hover:bg-muted bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/50 hover:bg-muted bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  New student enrolled
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Grade updated
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Status changed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="border-border/50 shadow-lg bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full md:w-40 shadow-sm">
                  <SelectValue placeholder="Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number.parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" className="border-border/50 hover:bg-muted bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Students Table */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/80 to-muted/40 border-b border-border/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Student ID</th>
                  <th className="text-left p-4 font-semibold text-foreground">Name</th>
                  <th className="text-left p-4 font-semibold text-foreground">Grade</th>
                  <th className="text-left p-4 font-semibold text-foreground">Section</th>
                  <th className="text-left p-4 font-semibold text-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  // ✅ Map API student data to component format
                  const fullName = student.user?.full_name || `${student.first_name} ${student.last_name}`
                  const gradeLevel = student.grade_level || student.section?.grade_level
                  const gradeDisplay = gradeLevel ? `Grade ${gradeLevel}` : '-'
                  const sectionName = student.section?.name || '-'
                  const status = student.user?.status || 'Unknown'

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {student.student_id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{fullName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-sm">
                          {gradeDisplay}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {sectionName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                            onClick={() => openStudentPanel(student)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full"
                          >
                            <Edit className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Pagination - Using API Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground">
          {pagination && (
            <>
              Showing <span className="font-medium text-foreground">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
              <span className="font-medium text-foreground">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium text-foreground">{pagination.total}</span> students
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={!pagination || currentPage === 1}
            className="border-border/50 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {pagination && Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className={
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border-border/50 hover:bg-muted"
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
            {pagination && pagination.totalPages > 5 && (
              <>
                <span className="px-2 text-muted-foreground">...</span>
                <Button
                  variant={currentPage === pagination.totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pagination.totalPages)}
                  className={
                    currentPage === pagination.totalPages
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border-border/50 hover:bg-muted"
                  }
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!pagination || currentPage === pagination.totalPages}
            className="border-border/50 hover:bg-muted"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isPanelOpen && (
        <StudentDetailPanel selectedStudent={selectedStudent} isPanelOpen={isPanelOpen} onClose={closeStudentPanel} />
      )}
    </div>
  )
}
