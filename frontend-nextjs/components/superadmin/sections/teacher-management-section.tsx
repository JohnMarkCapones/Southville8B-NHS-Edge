"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  UserCog,
  CheckCircle,
  TrendingUp,
  School,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  Calendar,
  Settings,
  BarChart3,
} from "lucide-react"
import { teacherData, type Teacher } from "../data/teacher-data"
import { TeacherDetailPanel } from "../panels/teacher-detail-panel"

// Department distribution calculated from teacher data
const departmentDistribution = [
  {
    department: "Mathematics",
    count: teacherData.filter((t) => t.department === "Mathematics").length,
    color: "bg-blue-500",
  },
  { department: "Science", count: teacherData.filter((t) => t.department === "Science").length, color: "bg-green-500" },
  {
    department: "English",
    count: teacherData.filter((t) => t.department === "English").length,
    color: "bg-yellow-500",
  },
  {
    department: "Social Studies",
    count: teacherData.filter((t) => t.department === "Social Studies").length,
    color: "bg-orange-500",
  },
  {
    department: "Filipino",
    count: teacherData.filter((t) => t.department === "Filipino").length,
    color: "bg-purple-500",
  },
  {
    department: "Physical Education",
    count: teacherData.filter((t) => t.department === "Physical Education").length,
    color: "bg-pink-500",
  },
]

export function TeacherManagementSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const departments = ["All", "Mathematics", "Science", "English", "Social Studies", "Filipino", "Physical Education"]
  const statuses = ["All", "Active", "On Leave", "Inactive"]

  const openTeacherPanel = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsDetailPanelOpen(true)
  }, [])

  const closeTeacherPanel = useCallback(() => {
    setIsDetailPanelOpen(false)
    setTimeout(() => setSelectedTeacher(null), 500)
  }, [])

  const filteredTeachers = teacherData.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "All" || teacher.department === selectedDepartment
    const matchesStatus = selectedStatus === "All" || teacher.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage)

  const activeTeachers = teacherData.filter((t) => t.status === "Active").length
  const onLeaveTeachers = teacherData.filter((t) => t.status === "On Leave").length
  const inactiveTeachers = teacherData.filter((t) => t.status === "Inactive").length
  const avgPerformance = Math.round(teacherData.reduce((sum, t) => sum + t.performance, 0) / teacherData.length)
  const totalClassLoad = teacherData.reduce((sum, t) => sum + t.classLoad, 0)

  const maxCount = Math.max(...departmentDistribution.map((d) => d.count))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Teacher Management</h2>
          <p className="text-muted-foreground mt-1">Manage teacher accounts and information</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border/50 hover:bg-muted bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Teachers</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{teacherData.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[15, 22, 18, 25, 20, 28, 24, 30, 26, 32].map((height, i) => (
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
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{activeTeachers}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[18, 25, 22, 28, 24, 32, 28, 35, 30, 38].map((height, i) => (
                <div key={i} className="flex-1 bg-emerald-400/60 rounded-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Avg Performance</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{avgPerformance}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[20, 28, 25, 32, 28, 35, 32, 38, 35, 42].map((height, i) => (
                <div key={i} className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`h-full ${height}% bg-purple-400/60 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${(height / maxCount) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">{height}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Classes</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalClassLoad}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <School className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[12, 18, 15, 22, 18, 25, 22, 28, 25, 30].map((height, i) => (
                <div key={i} className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`h-full ${height}% bg-orange-400/60 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${(height / maxCount) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">{height}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Department Distribution</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Teacher Count by Department
              </div>
            </div>
            <div className="space-y-4">
              {departmentDistribution.map((dept) => (
                <div key={dept.department} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-foreground">{dept.department}</div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full ${dept.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${(dept.count / maxCount) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{dept.count}</span>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-muted-foreground text-right">
                    {Math.round((dept.count / teacherData.length) * 100)}%
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
                  New teacher added
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Performance updated
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Department changed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-lg bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-48 shadow-sm">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48 shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
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

      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/80 to-muted/40 border-b border-border/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Teacher</th>
                  <th className="text-left p-4 font-semibold text-foreground">Department</th>
                  <th className="text-left p-4 font-semibold text-foreground">Position</th>
                  <th className="text-left p-4 font-semibold text-foreground">Experience</th>
                  <th className="text-left p-4 font-semibold text-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className={`border-b border-border/30 hover:bg-muted/30 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher.avatar || "/placeholder.svg"}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-foreground">{teacher.name}</div>
                          <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                            {teacher.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-sm">
                        {teacher.department}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {teacher.position}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-foreground">{teacher.yearsOfExperience} years</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : teacher.status === "On Leave"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                          onClick={() => openTeacherPanel(teacher)}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{" "}
          <span className="font-medium text-foreground">
            {Math.min(startIndex + itemsPerPage, filteredTeachers.length)}
          </span>{" "}
          of <span className="font-medium text-foreground">{filteredTeachers.length}</span> teachers
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="border-border/50 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
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
            {totalPages > 5 && (
              <>
                <span className="px-2 text-muted-foreground">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className={
                    currentPage === totalPages
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border-border/50 hover:bg-muted"
                  }
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="border-border/50 hover:bg-muted"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isDetailPanelOpen && (
        <TeacherDetailPanel teacher={selectedTeacher} isOpen={isDetailPanelOpen} onClose={closeTeacherPanel} />
      )}
    </div>
  )
}
