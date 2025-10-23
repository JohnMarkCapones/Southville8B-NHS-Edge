"use client"

import { useState, useEffect } from "react"
import { DashboardData } from "./types"
import { DashboardService } from "./data-service"
import { useUserCounts } from "@/hooks/useUserCounts"
import { useEntityCounts } from "@/hooks/useEntityCounts"

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [kpiData, setKpiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real user counts from API
  const { counts: userCounts, loading: userCountsLoading, error: userCountsError } = useUserCounts({
    enabled: true,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes for more accurate data
    enableCache: true,
  });

  // Fetch real entity counts from API
  const { counts: entityCounts, loading: entityCountsLoading, error: entityCountsError } = useEntityCounts({
    enabled: true,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes for more accurate data
    enableCache: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Wait for all counts to be loaded
        if (userCountsLoading || entityCountsLoading) {
          return;
        }

        // Prepare real counts for KPI data
        const realCounts = {
          students: userCounts.students ? {
            total: userCounts.students.total,
            active: userCounts.students.active,
            inactive: userCounts.students.inactive,
          } : undefined,
          teachers: userCounts.teachers ? {
            total: userCounts.teachers.total,
            active: userCounts.teachers.active,
            inactive: userCounts.teachers.inactive,
          } : undefined,
          departments: entityCounts.departments ? {
            total: entityCounts.departments.total,
            active: entityCounts.departments.active,
          } : undefined,
          clubs: entityCounts.clubs ? {
            total: entityCounts.clubs.total,
            active: entityCounts.clubs.active,
          } : undefined,
          sections: entityCounts.sections ? {
            total: entityCounts.sections.total,
          } : undefined,
          modules: entityCounts.modules ? {
            total: entityCounts.modules.total,
            active: entityCounts.modules.active, // global modules
          } : undefined,
          events: entityCounts.events ? {
            total: entityCounts.events.total,
            active: entityCounts.events.active, // published events
            inactive: entityCounts.events.inactive, // upcoming events
          } : undefined,
        };

        const [dashboardData, kpiMetrics] = await Promise.all([
          DashboardService.getDashboardData(),
          DashboardService.getKPIData(realCounts)
        ])

        setData(dashboardData)
        setKpiData(kpiMetrics)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userCountsLoading, entityCountsLoading, userCounts, entityCounts])

  return {
    data,
    kpiData,
    loading: loading || userCountsLoading || entityCountsLoading,
    error: error || (userCountsError?.message ?? null) || (entityCountsError?.message ?? null),
    refresh: async () => {
      setLoading(true)
      setError(null)
      // Data will auto-refresh via useEffect when dependencies change
    }
  }
}

// Hook for student search and filtering (extracted from the monolithic component)
export function useStudentFiltering(students: any[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedPerformance, setSelectedPerformance] = useState("All")
  const [sortField, setSortField] = useState("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 5

  const filteredAndSortedStudents = students
    .filter((student) => {
      // Search filter (enhanced)
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toString().includes(searchQuery.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchQuery.toLowerCase())

      // Grade filter
      const matchesGrade = selectedGrade === "All" || student.grade === selectedGrade

      // Honor Status filter  
      const matchesStatus = selectedStatus === "All" || student.status === selectedStatus

      // Performance Range filter
      const matchesPerformance = (() => {
        if (selectedPerformance === "All") return true
        const avg = student.average
        switch (selectedPerformance) {
          case "Excellent": return avg >= 95 && avg <= 100
          case "Very Good": return avg >= 90 && avg < 95
          case "Good": return avg >= 85 && avg < 90
          case "Satisfactory": return avg >= 80 && avg < 85
          default: return true
        }
      })()

      return matchesSearch && matchesGrade && matchesStatus && matchesPerformance
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()

      if (sortDirection === "asc") {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
      }
    })

  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const paginatedStudents = filteredAndSortedStudents.slice(startIndex, startIndex + studentsPerPage)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? "↑" : "↓"
  }

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedGrade,
    setSelectedGrade: handleGradeChange,
    selectedStatus,
    setSelectedStatus: (status: string) => {
      setSelectedStatus(status)
      setCurrentPage(1)
    },
    selectedPerformance,
    setSelectedPerformance: (performance: string) => {
      setSelectedPerformance(performance)
      setCurrentPage(1)
    },
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    paginatedStudents,
    handleSort,
    getSortIcon,
    studentsPerPage
  }
}
