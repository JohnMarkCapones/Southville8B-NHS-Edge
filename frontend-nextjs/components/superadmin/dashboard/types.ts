// Dashboard data types
export interface KPIMetric {
  title: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down'
    label: string
  }
  sparklineData?: number[]
}

export interface StudentMetrics {
  total: number
  active: number
  inactive: number
  suspended: number
  newThisMonth: number
  trends: {
    students: number[]
    teachers: number[]
    sessions: number[]
  }
}

export interface SystemMetrics {
  uptime: number
  performance: number
  security: number
  database: number
}

export interface GradeDistribution {
  grade: string
  count: number
  color: string
  percentage: number
}

export interface AttendanceData {
  month: string
  rate: number
  students: number
}

export interface ClubGrowthData {
  month: string
  members: number
  clubs: number
}

export interface TopPerformer {
  name: string
  grade: string
  average: number
  rank: number
  subjects: number
}

export interface HonorStudents {
  honors: number
  highHonors: number
  highestHonors: number
  total: number
}

export interface TeacherByDepartment {
  department: string
  teachers: number
  subjects: number
  color: string
}

export interface EngagementMetric {
  metric: string
  value: number
  change: number
  trend: 'up' | 'down'
}

export interface GalleryData {
  month: string
  views: number
  uploads: number
}

export interface DashboardData {
  studentMetrics: StudentMetrics
  systemMetrics: SystemMetrics
  gradeDistribution: GradeDistribution[]
  attendanceData: AttendanceData[]
  galleryData: GalleryData[]
  clubGrowthData: ClubGrowthData[]
  topPerformers: TopPerformer[]
  honorStudents: HonorStudents
  teachersByDepartment: TeacherByDepartment[]
  engagementMetrics: EngagementMetric[]
}
