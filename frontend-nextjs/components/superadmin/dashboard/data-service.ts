import type {
  DashboardData,
  GradeDistribution,
  AttendanceData,
  ClubGrowthData,
  TopPerformer,
  HonorStudents,
  TeacherByDepartment,
  EngagementMetric,
} from "./types"

// Mock data that was previously inline in the monolithic component
const gradeDistribution: GradeDistribution[] = [
  { grade: "Grade 7", count: 187, color: "bg-blue-500", percentage: 15.0 },
  { grade: "Grade 8", count: 203, color: "bg-green-500", percentage: 16.3 },
  { grade: "Grade 9", count: 195, color: "bg-yellow-500", percentage: 15.6 },
  { grade: "Grade 10", count: 218, color: "bg-orange-500", percentage: 17.5 },
  { grade: "Grade 11", count: 234, color: "bg-purple-500", percentage: 18.8 },
  { grade: "Grade 12", count: 210, color: "bg-pink-500", percentage: 16.8 },
]

const attendanceData: AttendanceData[] = [
  { month: "Jan", rate: 94, students: 920 },
  { month: "Feb", rate: 96, students: 945 },
  { month: "Mar", rate: 93, students: 915 },
  { month: "Apr", rate: 95, students: 935 },
  { month: "May", rate: 97, students: 955 },
  { month: "Jun", rate: 94, students: 925 },
]

const galleryData = [
  { month: "Jan", views: 2800, uploads: 45 },
  { month: "Feb", views: 2950, uploads: 48 },
  { month: "Mar", views: 3100, uploads: 52 },
  { month: "Apr", views: 3250, uploads: 55 },
  { month: "May", views: 3600, uploads: 58 },
  { month: "Jun", views: 4100, uploads: 62 },
]

const clubGrowthData: ClubGrowthData[] = [
  { month: "Jan", members: 120, clubs: 8 },
  { month: "Feb", members: 135, clubs: 9 },
  { month: "Mar", members: 148, clubs: 10 },
  { month: "Apr", members: 162, clubs: 11 },
  { month: "May", members: 178, clubs: 12 },
  { month: "Jun", members: 195, clubs: 12 },
]

const topPerformers: TopPerformer[] = [
  { name: "Maria Santos", grade: "Grade 10", average: 98.5, rank: 1, subjects: 8 },
  { name: "John Dela Cruz", grade: "Grade 9", average: 97.8, rank: 2, subjects: 8 },
  { name: "Ana Reyes", grade: "Grade 10", average: 97.2, rank: 3, subjects: 8 },
  { name: "Carlos Lopez", grade: "Grade 8", average: 96.9, rank: 4, subjects: 8 },
  { name: "Sofia Garcia", grade: "Grade 9", average: 96.5, rank: 5, subjects: 8 },
  { name: "Miguel Torres", grade: "Grade 7", average: 96.2, rank: 6, subjects: 8 },
  { name: "Isabella Cruz", grade: "Grade 10", average: 95.8, rank: 7, subjects: 8 },
  { name: "Diego Morales", grade: "Grade 8", average: 95.5, rank: 8, subjects: 8 },
]

const honorStudents: HonorStudents = {
  honors: 156,
  highHonors: 89,
  highestHonors: 34,
  total: 279,
}

const teachersByDepartment: TeacherByDepartment[] = [
  { department: "Math", teachers: 12, subjects: 3, color: "#10b981" },
  { department: "Science", teachers: 14, subjects: 4, color: "#3b82f6" },
  { department: "English", teachers: 10, subjects: 2, color: "#8b5cf6" },
  { department: "Filipino", teachers: 8, subjects: 2, color: "#f59e0b" },
  { department: "ESP", teachers: 6, subjects: 1, color: "#ef4444" },
  { department: "MAPEH", teachers: 16, subjects: 4, color: "#06b6d4" },
  { department: "TLE", teachers: 11, subjects: 5, color: "#84cc16" },
  { department: "AP", teachers: 7, subjects: 2, color: "#f97316" },
]

const engagementMetrics: EngagementMetric[] = [
  { metric: "Daily Active Users", value: 1247, change: 12.5, trend: "up" },
  { metric: "Assignment Submissions", value: 89.3, change: 5.2, trend: "up" },
  { metric: "Forum Participation", value: 67.8, change: -2.1, trend: "down" },
  { metric: "Resource Downloads", value: 2456, change: 18.7, trend: "up" },
]

// Analytics Cards Data
const analyticsCardsData = {
  departments: [
    { name: "Math", teachers: 12, subjects: 3, color: "#10b981" },
    { name: "Science", teachers: 14, subjects: 4, color: "#3b82f6" },
    { name: "English", teachers: 10, subjects: 2, color: "#8b5cf6" },
    { name: "Filipino", teachers: 8, subjects: 2, color: "#f59e0b" },
    { name: "ESP", teachers: 6, subjects: 1, color: "#ef4444" },
    { name: "MAPEH", teachers: 16, subjects: 4, color: "#06b6d4" },
    { name: "TLE", teachers: 11, subjects: 5, color: "#84cc16" },
    { name: "AP", teachers: 7, subjects: 2, color: "#f97316" },
  ],
  sections: [
    // Grade 10 sections
    { name: "Grade 10 - Einstein", grade: "10", average: 94.2, students: 28, teacher: "Ms. Rodriguez" },
    { name: "Grade 10 - Darwin", grade: "10", average: 93.5, students: 29, teacher: "Ms. Garcia" },
    { name: "Grade 10 - Galileo", grade: "10", average: 91.8, students: 27, teacher: "Mr. Fernandez" },
    { name: "Grade 10 - Pasteur", grade: "10", average: 90.4, students: 30, teacher: "Ms. Villanueva" },

    // Grade 9 sections
    { name: "Grade 9 - Newton", grade: "9", average: 93.8, students: 30, teacher: "Mr. Santos" },
    { name: "Grade 9 - Mendel", grade: "9", average: 92.1, students: 31, teacher: "Ms. Aquino" },
    { name: "Grade 9 - Faraday", grade: "9", average: 90.7, students: 29, teacher: "Mr. Reyes" },
    { name: "Grade 9 - Kepler", grade: "9", average: 89.3, students: 32, teacher: "Ms. Torres" },

    // Grade 8 sections
    { name: "Grade 8 - Tesla", grade: "8", average: 92.9, students: 31, teacher: "Mr. Lopez" },
    { name: "Grade 8 - Edison", grade: "8", average: 91.5, students: 28, teacher: "Ms. Cruz" },
    { name: "Grade 8 - Copernicus", grade: "8", average: 90.2, students: 30, teacher: "Mr. Morales" },
    { name: "Grade 8 - Archimedes", grade: "8", average: 88.9, students: 29, teacher: "Ms. Ramos" },

    // Grade 7 sections
    { name: "Grade 7 - Curie", grade: "7", average: 92.4, students: 32, teacher: "Ms. Dela Cruz" },
    { name: "Grade 7 - Hawking", grade: "7", average: 91.2, students: 30, teacher: "Mr. Gonzales" },
    { name: "Grade 7 - Franklin", grade: "7", average: 89.8, students: 31, teacher: "Ms. Mendoza" },
    { name: "Grade 7 - Watson", grade: "7", average: 88.5, students: 33, teacher: "Mr. Castillo" },
  ],
  engagement: [
    {
      metric: "Daily Active Users",
      value: "1,247",
      change: 12.5,
      trend: [1150, 1180, 1200, 1220, 1240, 1247],
      color: "#10b981",
    },
    {
      metric: "Assignment Submissions",
      value: "89.3%",
      change: 5.2,
      trend: [84, 85, 87, 88, 89, 89.3],
      color: "#3b82f6",
    },
    {
      metric: "Forum Participation",
      value: "67.8%",
      change: -2.1,
      trend: [72, 71, 70, 68, 68, 67.8],
      color: "#f59e0b",
    },
    {
      metric: "Resource Downloads",
      value: "2,456",
      change: 18.7,
      trend: [2000, 2100, 2200, 2300, 2400, 2456],
      color: "#8b5cf6",
    },
  ],
}

// Sparkline data
export const sparklineData = {
  subjects: [12, 19, 15, 22, 18, 25, 20, 24, 21, 28, 26, 32],
  clubs: [8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45],
  sections: [25, 28, 32, 29, 35, 38, 42, 45, 48, 52, 48, 50],
  modules: [1200, 1250, 1300, 1280, 1350, 1400, 1380, 1420, 1450, 1456],
  events: [15, 18, 22, 20, 25, 28, 24, 30, 28, 32, 28, 28],
  galleryViews: [2450, 2890, 3120, 3450, 3780, 4120],
  students: [1200, 1215, 1230, 1225, 1240, 1247],
  teachers: [85, 86, 87, 88, 89, 89],
  sessions: [1450, 1480, 1520, 1550, 1580, 1582],
}

// Main service functions
export class DashboardService {
  static async getDashboardData(): Promise<DashboardData> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      studentMetrics: {
        total: 1247,
        active: 1198,
        inactive: 49,
        suspended: 12,
        newThisMonth: 23,
        trends: {
          students: sparklineData.students,
          teachers: sparklineData.teachers,
          sessions: sparklineData.sessions,
        },
      },
      systemMetrics: {
        uptime: 99.9,
        performance: 92.1,
        security: 100,
        database: 98.2,
      },
      gradeDistribution,
      attendanceData,
      galleryData,
      clubGrowthData,
      topPerformers,
      honorStudents,
      teachersByDepartment,
      engagementMetrics,
    }
  }

  /**
   * Get KPI data with support for real API data injection
   * Accepts optional real counts to override mock data
   */
  static async getKPIData(realCounts?: {
    students?: { total: number; active: number; inactive: number };
    teachers?: { total: number; active: number; inactive: number };
    departments?: { total: number; active?: number };
    clubs?: { total: number; active?: number };
    sections?: { total: number };
    modules?: { total: number; active?: number };
    events?: { total: number; active?: number; inactive?: number };
  }) {
    const data = await this.getDashboardData()

    // Use real data if provided, otherwise fall back to mock data
    const studentTotal = realCounts?.students?.total ?? data.studentMetrics.total;
    const studentActive = realCounts?.students?.active ?? data.studentMetrics.active;
    const studentInactive = realCounts?.students?.inactive ?? data.studentMetrics.inactive;

    const teacherTotal = realCounts?.teachers?.total ?? 89;
    const teacherActive = realCounts?.teachers?.active ?? 76;
    const teacherInactive = realCounts?.teachers?.inactive ?? 13;

    const departmentTotal = realCounts?.departments?.total ?? 24;
    const departmentActive = realCounts?.departments?.active ?? 22;

    const clubTotal = realCounts?.clubs?.total ?? 12;
    const clubActive = realCounts?.clubs?.active ?? 12;

    const sectionTotal = realCounts?.sections?.total ?? 48;

    const moduleTotal = realCounts?.modules?.total ?? 1456;
    const moduleGlobal = realCounts?.modules?.active ?? 1268; // global modules

    const eventTotal = realCounts?.events?.total ?? 28;
    const eventUpcoming = realCounts?.events?.inactive ?? 5; // upcoming events

    return {
      students: {
        value: studentTotal,
        change: { value: "+12%", trend: "up" as const, label: "vs last month" },
        statusIndicators: {
          active: studentActive,
          inactive: studentInactive,
        },
        sparklineData: data.studentMetrics.trends.students,
      },
      teachers: {
        value: teacherTotal,
        change: { value: "+3", trend: "up" as const, label: "new hires this month" },
        statusIndicators: { active: teacherActive, inactive: teacherInactive },
        sparklineData: data.studentMetrics.trends.teachers,
      },
      sessions: {
        value: "1,582",
        change: { value: "LIVE", trend: "up" as const, label: "active right now" },
        sparklineData: data.studentMetrics.trends.sessions,
      },
      subjects: {
        value: departmentTotal,
        change: { value: `+${departmentActive}`, trend: "up" as const, label: "Active" },
        sparklineData: sparklineData.subjects,
      },
      clubs: {
        value: clubTotal,
        change: { value: `${clubActive}`, trend: "up" as const, label: "Active Clubs" },
        sparklineData: sparklineData.clubs,
      },
      sections: {
        value: sectionTotal,
        change: { value: "26", trend: "up" as const, label: "Avg Size" },
        sparklineData: sparklineData.sections,
      },
      modules: {
        value: moduleTotal.toString(),
        change: { value: `${moduleGlobal}`, trend: "up" as const, label: "Global" },
        sparklineData: sparklineData.modules,
      },
      events: {
        value: eventTotal,
        change: { value: `${eventUpcoming}`, trend: "up" as const, label: "Upcoming" },
        sparklineData: sparklineData.events,
      },
      galleryViews: {
        value: "4.1K",
        change: { value: "+68%", trend: "up" as const, label: "Growth" },
        sparklineData: sparklineData.galleryViews,
      },
    }
  }

  static async getAnalyticsCardsData() {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 50))

    return {
      departmentData: analyticsCardsData.departments,
      sectionData: analyticsCardsData.sections,
      engagementData: analyticsCardsData.engagement,
    }
  }
}

export {
  gradeDistribution,
  attendanceData,
  galleryData,
  clubGrowthData,
  topPerformers,
  honorStudents,
  teachersByDepartment,
  engagementMetrics,
  analyticsCardsData,
}
