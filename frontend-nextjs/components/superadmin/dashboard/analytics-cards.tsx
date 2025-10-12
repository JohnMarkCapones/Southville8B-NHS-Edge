"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart, Tooltip } from "recharts"
import {
  Users,
  Trophy,
  Activity,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ExternalLink,
  BarChart3,
  FileText,
  Settings,
  GraduationCap,
  UserCheck,
  Star,
  Medal,
  Crown,
  Award,
  Filter,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Types
interface DepartmentData {
  name: string
  teachers: number
  subjects: number
  color: string
}

interface SectionData {
  name: string
  grade: string
  average: number
  students: number
  teacher: string
}

interface EngagementData {
  metric: string
  value: string
  change: number
  trend: number[]
  color: string
}

interface AnalyticsCardsProps {
  departmentData: DepartmentData[]
  sectionData: SectionData[]
  engagementData: EngagementData[]
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ departmentData, sectionData, engagementData }) => {
  const router = useRouter()
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL")

  const filteredSections =
    selectedGrade === "ALL" ? sectionData : sectionData.filter((section) => section.grade === selectedGrade)

  const sortedSections = [...filteredSections].sort((a, b) => b.average - a.average)

  const podiumSections = sortedSections.slice(0, 3)
  const cardSections = sortedSections.slice(3)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Teachers by Department Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border-emerald-500/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 group hover:scale-[1.02] hover:border-emerald-400/50">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  Teachers by Department
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Faculty distribution & insights
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition-all duration-200 hover:scale-110"
                onClick={() => router.push("/superadmin/teachers")}
                title="View All Teachers"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition-all duration-200 hover:scale-110"
                    title="More Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-emerald-200 dark:border-emerald-800"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/superadmin/teachers")}
                    className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 text-emerald-600" />
                    View All Teachers
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <BarChart3 className="mr-2 h-4 w-4 text-emerald-600" />
                    Department Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <FileText className="mr-2 h-4 w-4 text-emerald-600" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <Settings className="mr-2 h-4 w-4 text-emerald-600" />
                    Manage Departments
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-start justify-between gap-6">
            {/* Grid layout for departments */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {departmentData.map((dept, index) => (
                  <div
                    key={dept.name}
                    className={`group/item relative p-3 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                      hoveredDept === dept.name
                        ? "bg-white/80 dark:bg-gray-800/80 shadow-lg shadow-emerald-500/10"
                        : "bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                    }`}
                    onMouseEnter={() => setHoveredDept(dept.name)}
                    onMouseLeave={() => setHoveredDept(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <div
                            className="w-3 h-3 rounded-full shadow-lg transition-all duration-300 group-hover/item:scale-125"
                            style={{
                              backgroundColor: dept.color,
                              boxShadow: `0 0 8px ${dept.color}40`,
                            }}
                          />
                          {hoveredDept === dept.name && (
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping"
                              style={{ backgroundColor: dept.color }}
                            />
                          )}
                        </div>
                        <div>
                          <span className="text-gray-900 dark:text-white text-sm font-semibold group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors duration-200">
                            {dept.name}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{dept.subjects} subjects</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors duration-200">
                          {dept.teachers}
                        </div>
                      </div>
                    </div>

                    {/* Compact progress bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${(dept.teachers / Math.max(...departmentData.map((d) => d.teachers))) * 100}%`,
                            backgroundColor: dept.color,
                            boxShadow: `0 0 6px ${dept.color}40`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tag-style summary */}
              <div className="flex flex-wrap gap-2 pt-2">
                {departmentData.slice(0, 4).map((dept) => (
                  <div
                    key={`tag-${dept.name}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: `${dept.color}15`,
                      color: dept.color,
                      border: `1px solid ${dept.color}30`,
                    }}
                    onMouseEnter={() => setHoveredDept(dept.name)}
                    onMouseLeave={() => setHoveredDept(null)}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    {dept.name}: {dept.teachers}
                  </div>
                ))}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  +{departmentData.length - 4} more
                </div>
              </div>
            </div>

            {/* Enhanced Pie Chart */}
            <div className="relative">
              <div className="w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData as any}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="teachers"
                      stroke="none"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          style={{
                            filter: hoveredDept === entry.name ? `drop-shadow(0 0 8px ${entry.color}60)` : "none",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [`${value} teachers`, props.payload.name]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #10b981",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.2)",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Center total with enhanced styling */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3 shadow-xl border border-emerald-200 dark:border-emerald-700/30 hover:scale-105 transition-transform duration-200">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {departmentData.reduce((sum, dept) => sum + dept.teachers, 0)}
                  </p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Summary Section */}
          <div className="mt-6 pt-4 border-t border-emerald-200 dark:border-emerald-700/50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/30 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {departmentData.reduce((sum, dept) => sum + dept.subjects, 0)}
                </div>
                <div className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">Subjects</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/30 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(
                    (departmentData.reduce((sum, dept) => sum + dept.teachers, 0) / departmentData.length) * 10,
                  ) / 10}
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">Avg/Dept</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/30 hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{departmentData.length}</div>
                <div className="text-xs text-purple-500 dark:text-purple-400 font-medium">Departments</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Performing Sections Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-red-500/20 border-amber-500/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 group hover:scale-[1.02] hover:border-amber-400/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300 group-hover:scale-110">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                  Top Performing Sections
                </h3>
                <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Academic excellence rankings</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-200 hover:scale-110"
                onClick={() => router.push("/superadmin/students")}
                title="View All Students"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-200 hover:scale-110"
                    title="More Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-amber-200 dark:border-amber-800"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/superadmin/students")}
                    className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 text-amber-600" />
                    View All Students
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <BarChart3 className="mr-2 h-4 w-4 text-amber-600" />
                    Performance Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <FileText className="mr-2 h-4 w-4 text-amber-600" />
                    Export Grades
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <Settings className="mr-2 h-4 w-4 text-amber-600" />
                    Manage Sections
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Grade Filter Buttons */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="flex gap-1">
              {["ALL", "7", "8", "9", "10"].map((grade) => (
                <Button
                  key={grade}
                  variant={selectedGrade === grade ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                    selectedGrade === grade
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-amber-500/30"
                      : "text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  }`}
                  onClick={() => setSelectedGrade(grade)}
                >
                  {grade === "ALL" ? "All Grades" : `Grade ${grade}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {/* Fixed height container with internal scrolling */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 dark:scrollbar-thumb-amber-600 scrollbar-track-transparent hover:scrollbar-thumb-amber-400 dark:hover:scrollbar-thumb-amber-500 transition-colors duration-200">
              <div className="space-y-3 pr-2">
                {sortedSections.map((section, index) => (
                  <div
                    key={section.name}
                    className={`group/card relative p-3 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border ${
                      index < 7
                        ? "bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border-amber-200/50 dark:border-amber-700/50 hover:border-amber-300/70 dark:hover:border-amber-600/70"
                        : "bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 border-amber-200/30 dark:border-amber-700/30 hover:border-amber-300/50 dark:hover:border-amber-600/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shadow-lg transition-all duration-300 ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-500 to-yellow-600 group-hover/card:shadow-yellow-500/30"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-400 to-gray-500 group-hover/card:shadow-gray-400/30"
                                : index === 2
                                  ? "bg-gradient-to-br from-amber-600 to-amber-700 group-hover/card:shadow-amber-600/30"
                                  : "bg-gradient-to-br from-amber-500 to-orange-500 group-hover/card:shadow-amber-500/30"
                          }`}
                        >
                          {index === 0 && <Crown className="h-4 w-4" />}
                          {index === 1 && <Medal className="h-4 w-4" />}
                          {index === 2 && <Award className="h-4 w-4" />}
                          {index > 2 && index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900 dark:text-white text-sm font-semibold group-hover/card:text-amber-600 dark:group-hover/card:text-amber-400 transition-colors duration-200">
                              {section.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              • {section.students} students
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{section.teacher}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold transition-colors duration-200 ${
                            index === 0
                              ? "text-yellow-600 dark:text-yellow-400"
                              : index === 1
                                ? "text-gray-600 dark:text-gray-400"
                                : index === 2
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-gray-900 dark:text-white group-hover/card:text-amber-600 dark:group-hover/card:text-amber-400"
                          }`}
                        >
                          {section.average}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ease-out ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : index === 2
                                  ? "bg-gradient-to-r from-amber-600 to-amber-700"
                                  : "bg-gradient-to-r from-amber-500 to-orange-500"
                          }`}
                          style={{
                            width: `${section.average}%`,
                            boxShadow:
                              index < 3
                                ? `0 0 8px ${index === 0 ? "rgba(234, 179, 8, 0.4)" : index === 1 ? "rgba(156, 163, 175, 0.4)" : "rgba(217, 119, 6, 0.4)"}`
                                : "0 0 8px rgba(245, 158, 11, 0.4)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Special ranking indicators for top 3 */}
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-6 pt-4 border-t border-amber-200 dark:border-amber-700/50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/30 hover:scale-105 transition-transform duration-200">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{filteredSections.length}</div>
                <div className="text-xs text-amber-500 dark:text-amber-400 font-medium">Sections</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/30 hover:scale-105 transition-transform duration-200">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {Math.round(
                    (filteredSections.reduce((sum, section) => sum + section.average, 0) / filteredSections.length) *
                      10,
                  ) / 10}
                  %
                </div>
                <div className="text-xs text-green-500 dark:text-green-400 font-medium">Avg Grade</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/30 hover:scale-105 transition-transform duration-200">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {filteredSections.reduce((sum, section) => sum + section.students, 0)}
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">Students</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Metrics Card */}
      <Card
        className="relative overflow-hidden bg-gradient-to-br from-violet-500/30 to-purple-600/30 border-violet-500/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105"
        onClick={() => router.push("/superadmin/system-status")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-500/100 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Engagement Metrics</h3>
                <p className="text-violet-100 text-sm">User activity insights</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"
                onClick={() => router.push("/superadmin/system-status")}
                title="View System Status"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"
                    title="More Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/superadmin/system-status")}>
                    <ExternalLink className="mr-2 h-4 w-4 text-white" />
                    System Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-gray-900/20">
                    <BarChart3 className="mr-2 h-4 w-4 text-white" />
                    Detailed Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-gray-900/20">
                    <FileText className="mr-2 h-4 w-4 text-white" />
                    Export Metrics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-gray-900/20">
                    <Settings className="mr-2 h-4 w-4 text-white" />
                    Configure Tracking
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-4">
            {engagementData.map((metric, index) => (
              <div key={metric.metric} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{metric.metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold">{metric.value}</span>
                      <div
                        className={`flex items-center space-x-1 ${
                          metric.change >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {metric.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="text-xs font-medium">
                          {metric.change >= 0 ? "+" : ""}
                          {metric.change}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.trend.map((value, i) => ({ value, index: i }))}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={metric.color}
                          strokeWidth={1.5}
                          fill={`url(#gradient-${index})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-violet-500/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {engagementData.filter((m) => m.change > 0).length}/{engagementData.length}
              </div>
              <div className="text-violet-100 text-sm">Metrics Improving</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AnalyticsCards
