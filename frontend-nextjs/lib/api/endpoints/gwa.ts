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


