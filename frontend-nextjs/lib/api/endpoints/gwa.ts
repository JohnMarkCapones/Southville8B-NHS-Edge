import { apiClient } from "../client"

export interface GwaRecord {
  id: string
  student_id: string
  grading_period?: string
  school_year?: string
  gwa: number
  created_at?: string
}

/** Get full GWA history for a student */
export async function getStudentGwaHistory(studentUuid: string): Promise<GwaRecord[]> {
  return apiClient.get<GwaRecord[]>(`/gwa/student/${studentUuid}`)
}

/**
 * Get authenticated student's GWA records
 * @param gradingPeriod Optional grading period filter (Q1, Q2, Q3, Q4)
 * @param schoolYear Optional school year filter (e.g., "2024-2025")
 */
export async function getMyGwa(gradingPeriod?: string, schoolYear?: string): Promise<GwaRecord[]> {
  const params = new URLSearchParams()
  if (gradingPeriod) params.append('grading_period', gradingPeriod)
  if (schoolYear) params.append('school_year', schoolYear)
  
  const queryString = params.toString()
  return apiClient.get<GwaRecord[]>(`/gwa/my-gwa${queryString ? `?${queryString}` : ''}`)
}


