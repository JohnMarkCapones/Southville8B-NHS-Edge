"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Trophy, TrendingUp, Eye, Upload, CalendarDays, ImageIcon, Award, Filter, Download, FileText, Users2, GraduationCap, BookOpen, ExternalLink } from "lucide-react"
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

import { HeroKPICard, CompactKPICard, KPIGrid, kpiConfigs } from "./kpi-cards"
import { useDashboardData, useStudentFiltering } from "./hooks"
import { sparklineData, DashboardService } from "./data-service"
import AnalyticsCards from "./analytics-cards"
import { useRouter } from "next/navigation"

// Mock student data for the table (should be moved to data service)
const allStudents = [
  {
    id: 1,
    name: "Maria Santos",
    grade: "Grade 10", 
    section: "Einstein",
    average: 98.5,
    rank: 1,
    subjects: 8,
    attendance: 98,
    status: "Highest Honors",
  },
  {
    id: 2,
    name: "John Dela Cruz",
    grade: "Grade 9",
    section: "Newton", 
    average: 97.8,
    rank: 2,
    subjects: 8,
    attendance: 97,
    status: "Highest Honors",
  },
  {
    id: 3,
    name: "Ana Reyes",
    grade: "Grade 10",
    section: "Darwin",
    average: 97.2,
    rank: 3,
    subjects: 8,
    attendance: 96,
    status: "Highest Honors",
  },
  {
    id: 4,
    name: "Carlos Lopez",
    grade: "Grade 8",
    section: "Tesla",
    average: 96.9,
    rank: 4,
    subjects: 7,
    attendance: 95,
    status: "High Honors",
  },
  {
    id: 5,
    name: "Sofia Garcia",
    grade: "Grade 9",
    section: "Curie",
    average: 96.5,
    rank: 5,
    subjects: 8,
    attendance: 98,
    status: "High Honors",
  },
  {
    id: 6,
    name: "Miguel Torres",
    grade: "Grade 11",
    section: "Hawking",
    average: 96.2,
    rank: 6,
    subjects: 9,
    attendance: 94,
    status: "High Honors",
  },
  {
    id: 7,
    name: "Isabella Cruz",
    grade: "Grade 10",
    section: "Einstein",
    average: 95.8,
    rank: 7,
    subjects: 8,
    attendance: 97,
    status: "High Honors",
  },
  {
    id: 8,
    name: "Diego Martinez",
    grade: "Grade 12",
    section: "Pascal",
    average: 95.5,
    rank: 8,
    subjects: 10,
    attendance: 93,
    status: "High Honors",
  },
  {
    id: 9,
    name: "Camila Rodriguez",
    grade: "Grade 9",
    section: "Darwin",
    average: 95.1,
    rank: 9,
    subjects: 8,
    attendance: 96,
    status: "High Honors",
  },
  {
    id: 10,
    name: "Lucas Fernandez",
    grade: "Grade 11",
    section: "Galileo",
    average: 94.8,
    rank: 10,
    subjects: 9,
    attendance: 95,
    status: "High Honors",
  },
  {
    id: 11,
    name: "Valentina Morales",
    grade: "Grade 8",
    section: "Tesla",
    average: 94.5,
    rank: 11,
    subjects: 7,
    attendance: 98,
    status: "High Honors",
  },
  {
    id: 12,
    name: "Santiago Vargas",
    grade: "Grade 10",
    section: "Newton",
    average: 94.2,
    rank: 12,
    subjects: 8,
    attendance: 92,
    status: "High Honors",
  },
  {
    id: 13,
    name: "Gabriela Jimenez",
    grade: "Grade 12",
    section: "Curie",
    average: 93.9,
    rank: 13,
    subjects: 10,
    attendance: 97,
    status: "High Honors",
  },
  {
    id: 14,
    name: "Alejandro Herrera",
    grade: "Grade 9",
    section: "Pascal",
    average: 93.6,
    rank: 14,
    subjects: 8,
    attendance: 91,
    status: "High Honors",
  },
  {
    id: 15,
    name: "Natalia Gutierrez",
    grade: "Grade 11",
    section: "Darwin",
    average: 93.3,
    rank: 15,
    subjects: 9,
    attendance: 96,
    status: "High Honors",
  },
  {
    id: 16,
    name: "Mateo Silva",
    grade: "Grade 8",
    section: "Hawking",
    average: 93.0,
    rank: 16,
    subjects: 7,
    attendance: 94,
    status: "High Honors",
  },
  {
    id: 17,
    name: "Emilia Castro",
    grade: "Grade 10",
    section: "Galileo",
    average: 92.7,
    rank: 17,
    subjects: 8,
    attendance: 95,
    status: "High Honors",
  },
  {
    id: 18,
    name: "Sebastian Ruiz",
    grade: "Grade 12",
    section: "Einstein",
    average: 92.4,
    rank: 18,
    subjects: 10,
    attendance: 89,
    status: "High Honors",
  },
  {
    id: 19,
    name: "Antonella Mendez",
    grade: "Grade 9",
    section: "Tesla",
    average: 92.1,
    rank: 19,
    subjects: 8,
    attendance: 97,
    status: "High Honors",
  },
  {
    id: 20,
    name: "Julian Romero",
    grade: "Grade 11",
    section: "Newton",
    average: 91.8,
    rank: 20,
    subjects: 9,
    attendance: 93,
    status: "High Honors",
  }
]

const sessionData = [
  { name: "Students", value: 1247, color: "#10b981", percentage: 93.3 },
  { name: "Teachers", value: 89, color: "#3b82f6", percentage: 6.7 },
]

export function OverviewSection() {
  const { data, kpiData, loading, error } = useDashboardData()
  const studentFiltering = useStudentFiltering(allStudents)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const router = useRouter()

  // Load analytics cards data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const analyticsData = await DashboardService.getAnalyticsCardsData()
        setAnalyticsData(analyticsData)
      } catch (error) {
        console.error('Failed to load analytics data:', error)
      }
    }
    loadAnalyticsData()
  }, [])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }
      
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        window.print()
      }

      // Arrow key navigation in table
      if (e.target instanceof HTMLTableCellElement) {
        const table = e.target.closest('table')
        if (!table) return

        const rows = Array.from(table.querySelectorAll('tbody tr'))
        const cells = Array.from(table.querySelectorAll('tbody td'))
        const currentIndex = cells.indexOf(e.target)
        const currentRow = e.target.closest('tr')
        const currentRowIndex = rows.indexOf(currentRow as HTMLTableRowElement)
        const cellsPerRow = cells.length / rows.length

        let targetIndex = currentIndex

        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault()
            targetIndex = Math.min(currentIndex + 1, cells.length - 1)
            break
          case 'ArrowLeft':
            e.preventDefault()
            targetIndex = Math.max(currentIndex - 1, 0)
            break
          case 'ArrowDown':
            e.preventDefault()
            targetIndex = Math.min(currentIndex + cellsPerRow, cells.length - 1)
            break
          case 'ArrowUp':
            e.preventDefault()
            targetIndex = Math.max(currentIndex - cellsPerRow, 0)
            break
        }

        if (targetIndex !== currentIndex) {
          (cells[targetIndex] as HTMLElement).focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading dashboard data: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="flex flex-col xl:flex-row gap-4 h-auto">
        {/* Hero KPI Cards (Responsive grid) */}
        <div className="flex-1">
          <KPIGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
            {/* Top Row - Hero Cards */}
            <HeroKPICard
              {...kpiConfigs.students}
              value={kpiData?.students.value || 1247}
              change={kpiData?.students.change}
              statusIndicators={kpiData?.students.statusIndicators}
              sparklineData={kpiData?.students.sparklineData}
            />
            <HeroKPICard
              {...kpiConfigs.teachers}
              value={kpiData?.teachers.value || 89}
              change={kpiData?.teachers.change}
              statusIndicators={kpiData?.teachers.statusIndicators}
              sparklineData={kpiData?.teachers.sparklineData}
            />
            <HeroKPICard
              {...kpiConfigs.sessions}
              value={kpiData?.sessions.value || "1,582"}
              change={kpiData?.sessions.change}
              sparklineData={kpiData?.sessions.sparklineData}
            />
          </KPIGrid>

          {/* Secondary KPI Cards */}
          <KPIGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <CompactKPICard
              {...kpiConfigs.subjects}
              value={kpiData?.subjects.value || 24}
              change={kpiData?.subjects.change}
              sparklineData={kpiData?.subjects.sparklineData}
            />
            <CompactKPICard
              {...kpiConfigs.clubs}
              value={kpiData?.clubs.value || 12}
              change={kpiData?.clubs.change}
              sparklineData={kpiData?.clubs.sparklineData}
            />
            <CompactKPICard
              {...kpiConfigs.sections}
              value={kpiData?.sections.value || 48}
              change={kpiData?.sections.change}
              sparklineData={kpiData?.sections.sparklineData}
            />
            <CompactKPICard
              {...kpiConfigs.modules}
              value={kpiData?.modules.value || "1,456"}
              change={kpiData?.modules.change}
              sparklineData={kpiData?.modules.sparklineData}
            />
            <CompactKPICard
              {...kpiConfigs.events}
              value={kpiData?.events.value || "28"}
              change={kpiData?.events.change}
              sparklineData={kpiData?.events.sparklineData}
            />
            <CompactKPICard
              {...kpiConfigs.galleryViews}
              value={kpiData?.galleryViews.value || "4.1K"}
              change={kpiData?.galleryViews.change}
              sparklineData={kpiData?.galleryViews.sparklineData}
            />
          </KPIGrid>
        </div>

        {/* Active Sessions Pie Chart */}
        <SessionsPieChart sessionData={sessionData} />
      </div>

      {/* Analytics Cards */}
      {analyticsData && (
        <AnalyticsCards 
          departmentData={analyticsData.departmentData}
          sectionData={analyticsData.sectionData}
          engagementData={analyticsData.engagementData}
        />
      )}

      {/* Charts Row */}
      <ChartsSection data={data} />

      {/* Top Performers and Honor Students Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TopPerformersSection 
            students={studentFiltering.paginatedStudents}
            filtering={studentFiltering}
            totalStudents={allStudents.length}
          />
        </div>
        <div className="lg:col-span-4">
          <HonorStudentsSection honorStudents={data?.honorStudents} />
        </div>
      </div>

      {/* Print-friendly styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-break-before { break-before: page; }
          .print-break-after { break-after: page; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
          body { font-size: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; }
        }
      `}</style>
    </div>
  )
}

// Extracted Sessions Pie Chart Component
function SessionsPieChart({ sessionData }: { sessionData: any[] }) {
  return (
    <Card className="w-full lg:w-64 xl:w-80 h-auto lg:h-100 relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02] group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/20"></div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">Active Sessions by Role</p>
            <p className="text-xs text-muted-foreground">Real-time user distribution</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-40 relative mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={sessionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {sessionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} users`, name]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <p className="text-2xl font-black text-gray-900 dark:text-white">1,336</p>
              <p className="text-xs text-muted-foreground font-semibold">Total Active</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          {sessionData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div
                className="w-3 h-3 rounded-full shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}40`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground font-semibold">
                  {item.value.toLocaleString()} ({item.percentage}%)
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700/30">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-purple-500 shadow-lg"
                style={{ boxShadow: "0 0 6px #a855f740" }}
              ></div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Website Visits</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">2,847</p>
              </div>
            </div>
            <div className="w-12 h-6">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={[{ v: 20 }, { v: 25 }, { v: 18 }, { v: 32 }, { v: 28 }, { v: 35 }, { v: 42 }]}
                >
                  <Line type="monotone" dataKey="v" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Extracted Charts Section
function ChartsSection({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Club Membership Growth
          </CardTitle>
          <p className="text-sm text-muted-foreground">Monthly membership trends</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data.clubGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="members" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bottom Summary Box */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-purple-500">195</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Growth</p>
              <p className="text-2xl font-bold text-purple-500 flex items-center justify-end gap-1">
                <TrendingUp className="h-4 w-4" />
                +62.5%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-500" />
            Gallery Views & Uploads
          </CardTitle>
          <p className="text-sm text-muted-foreground">Media engagement metrics</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={data.galleryData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", strokeWidth: 2, r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bottom Summary Box */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold text-cyan-500">4.1K</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-cyan-500 flex items-center justify-end gap-1">
                <TrendingUp className="h-4 w-4" />
                +68%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Extracted Top Performers Table
function TopPerformersSection({ 
  students, 
  filtering, 
  totalStudents 
}: { 
  students: any[], 
  filtering: any, 
  totalStudents: number 
}) {
  return (
    <Card className="lg:col-span-8 hover:shadow-2xl transition-all duration-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Top Performing Students
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/superadmin/students')}
            className="flex items-center gap-2"
          >
            View All Students
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Enhanced Filters Row */}
        <div className="space-y-4 mb-6">
          {/* Top Row: Search and Export */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students, ID, sections, or status... (Ctrl+F)"
                value={filtering.searchQuery}
                onChange={(e) => filtering.setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault()
                    e.currentTarget.focus()
                  }
                }}
              />
            </div>
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users2 className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom Row: Advanced Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Grade Filter */}
            <Select value={filtering.selectedGrade} onValueChange={filtering.setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-40">
                <GraduationCap className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Grades</SelectItem>
                <SelectItem value="Grade 8">Grade 8</SelectItem>
                <SelectItem value="Grade 9">Grade 9</SelectItem>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
                <SelectItem value="Grade 11">Grade 11</SelectItem>
                <SelectItem value="Grade 12">Grade 12</SelectItem>
              </SelectContent>
            </Select>

            {/* Honor Status Filter */}
            <Select value={filtering.selectedStatus} onValueChange={filtering.setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Award className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Highest Honors">Highest Honors (95%+)</SelectItem>
                <SelectItem value="High Honors">High Honors (90-94%)</SelectItem>
                <SelectItem value="With Honors">With Honors (85-89%)</SelectItem>
              </SelectContent>
            </Select>

            {/* Performance Range Filter */}
            <Select value={filtering.selectedPerformance} onValueChange={filtering.setSelectedPerformance}>
              <SelectTrigger className="w-full sm:w-44">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Performance</SelectItem>
                <SelectItem value="Excellent">Excellent (95-100%)</SelectItem>
                <SelectItem value="Very Good">Very Good (90-94%)</SelectItem>
                <SelectItem value="Good">Good (85-89%)</SelectItem>
                <SelectItem value="Satisfactory">Satisfactory (80-84%)</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Counter */}
            <div className="flex items-center px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              {students.length} of {totalStudents} students
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Rank</th>
                <th className="text-left p-3">Student Name</th>
                <th className="text-left p-3">Grade</th>
                <th className="text-left p-3">Section</th>
                <th className="text-left p-3">Average</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-accent/50">
                  <td className="p-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      student.rank === 1 ? "bg-yellow-500" : 
                      student.rank === 2 ? "bg-gray-400" :
                      student.rank === 3 ? "bg-orange-400" : "bg-blue-400"
                    }`}>
                      {student.rank}
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{student.name}</td>
                  <td className="p-3">
                    <Badge variant="outline">{student.grade}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{student.section}</td>
                  <td className="p-3 font-bold text-green-600">{student.average}%</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-purple-700">
                      {student.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filtering.startIndex + 1}-{Math.min(filtering.startIndex + filtering.studentsPerPage, students.length)} of {totalStudents} students
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => filtering.setCurrentPage(Math.max(1, filtering.currentPage - 1))}
              disabled={filtering.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => filtering.setCurrentPage(Math.min(filtering.totalPages, filtering.currentPage + 1))}
              disabled={filtering.currentPage === filtering.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Honor Students Count Section
function HonorStudentsSection({ honorStudents }: { honorStudents: any }) {
  const router = useRouter()
  
  if (!honorStudents) return null

  const honorCategories = [
    {
      level: "Highest Honors",
      count: honorStudents.highestHonors || 34,
      description: "95% and above average",
      color: "from-purple-600/30 to-purple-600/30",
      textColor: "text-purple-600",
      iconBg: "bg-purple-600"
    },
    {
      level: "High Honors", 
      count: honorStudents.highHonors || 89,
      description: "90-94% average",
      color: "from-blue-600/30 to-blue-600/30", 
      textColor: "text-blue-600",
      iconBg: "bg-blue-600"
    },
    {
      level: "With Honors",
      count: honorStudents.honors || 156,
      description: "85-89% average", 
      color: "from-emerald-600/30 to-emerald-600/30",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-600"
    }
  ]

  const totalHonorStudents = honorStudents.total || 279

  return (
    <Card className="hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Honor Students Count
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/superadmin/students')}
            className="flex items-center gap-2"
          >
            View Details
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Academic recognition breakdown</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {honorCategories.map((category, index) => (
            <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${category.color} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${category.iconBg} flex items-center justify-center`}>
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{category.level}</p>
                      <p className="text-xs text-white/80">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${category.textColor}`}>{category.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total Summary Box */}
        <Card className="mt-6 border-dashed border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-yellow-600 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-yellow-700 dark:text-yellow-300">Total Honor Students</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">22.4% of all students</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{totalHonorStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
