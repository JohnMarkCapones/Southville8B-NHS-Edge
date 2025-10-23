import { apiClient } from "../client"

export interface StudentListItem {
  id: string
  first_name: string
  last_name: string
  student_id: string
  section_id?: string
}

export interface Student {
  id: string
  user_id: string
  first_name: string
  last_name: string
  middle_name?: string
  student_id: string
  lrn_id: string
  grade_level?: string
  section_id?: string
  age?: number
  birthday?: string
  // Relations
  sections?: {
    id: string
    name: string
    grade_level?: string
  }
}

export interface PaginatedStudents {
  data: StudentListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginatedStudentsResponse {
  data: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchStudentsParams {
  search?: string
  gradeLevel?: string
  sectionId?: string
  page?: number
  limit?: number
}

/**
 * Get students, optionally filtered by sectionId
 * Backend: GET /students?sectionId=...
 */
export async function getStudentsBySection(
  sectionId: string,
  page = 1,
  limit = 20,
  search?: string
): Promise<PaginatedStudents> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  params.set('sectionId', sectionId)
  if (search && search.trim()) params.set('search', search.trim())
  return apiClient.get<PaginatedStudents>(`/students?${params.toString()}`)
}

/**
 * Search all students with filters
 * Backend: GET /students?search=...&gradeLevel=...&page=...
 */
export async function searchStudents(
  params: SearchStudentsParams = {}
): Promise<PaginatedStudentsResponse> {
  const queryParams = new URLSearchParams()

  if (params.search) queryParams.append('search', params.search)
  if (params.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel)
  if (params.sectionId) queryParams.append('sectionId', params.sectionId)
  queryParams.append('page', String(params.page || 1))
  queryParams.append('limit', String(params.limit || 20))

  return apiClient.get<PaginatedStudentsResponse>(
    `/students?${queryParams.toString()}`,
    { requiresAuth: true }
  )
}


