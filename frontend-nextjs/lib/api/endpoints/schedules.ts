import { apiClient } from "../client"
import type { Schedule } from "../types/schedules"

// Minimal types for schedules and roster responses
export interface ScheduleItem {
  id: string
  subject?: string
  section_id?: string
  period?: string
  room?: string
  day?: string
}

export interface RosterStudent {
  id: string
  first_name: string
  last_name: string
  student_id: string
}

// ========================================
// Data transformation
// ========================================

function transformBackendScheduleToFrontend(raw: any): Schedule {
  return {
    id: raw.id,
    subjectId: raw.subject_id ?? raw.subjectId,
    teacherId: raw.teacher_id ?? raw.teacherId,
    sectionId: raw.section_id ?? raw.sectionId,
    roomId: raw.room_id ?? raw.roomId,
    buildingId: raw.building_id ?? raw.buildingId,
    dayOfWeek: raw.day_of_week ?? raw.dayOfWeek,
    startTime: raw.start_time ?? raw.startTime,
    endTime: raw.end_time ?? raw.endTime,
    schoolYear: raw.school_year ?? raw.schoolYear,
    semester: raw.semester,
    // @ts-expect-error: extend Schedule type later to include gradingPeriod
    gradingPeriod: raw.grading_period ?? raw.gradingPeriod,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,

    subject: raw.subject
      ? {
          id: raw.subject.id,
          subjectName: raw.subject.subject_name ?? raw.subject.subjectName,
          description: raw.subject.description,
          gradeLevel: raw.subject.grade_level ?? raw.subject.gradeLevel,
          colorHex: raw.subject.color_hex ?? raw.subject.colorHex,
        }
      : undefined,
    teacher: raw.teacher
      ? {
          id: raw.teacher.id,
          firstName: raw.teacher.first_name ?? raw.teacher.firstName,
          lastName: raw.teacher.last_name ?? raw.teacher.lastName,
          middleName: raw.teacher.middle_name ?? raw.teacher.middleName,
          user: raw.teacher.user
            ? {
                id: raw.teacher.user.id,
                fullName: raw.teacher.user.full_name ?? raw.teacher.user.fullName,
                email: raw.teacher.user.email,
              }
            : undefined,
        }
      : undefined,
    section: raw.section
      ? {
          id: raw.section.id,
          name: raw.section.name,
          gradeLevel: raw.section.grade_level ?? raw.section.gradeLevel,
          teacherId: raw.section.teacher_id ?? raw.section.teacherId,
        }
      : undefined,
    room: raw.room
      ? {
          id: raw.room.id,
          roomNumber: raw.room.room_number ?? raw.room.roomNumber,
          capacity: raw.room.capacity,
          floorId: raw.room.floor_id ?? raw.room.floorId,
          floor: raw.room.floor
            ? {
                id: raw.room.floor.id,
                floorNumber: raw.room.floor.number ?? raw.room.floor.floorNumber,
                building: raw.room.floor.building
                  ? {
                      id: raw.room.floor.building.id,
                      name: raw.room.floor.building.building_name ?? raw.room.floor.building.name,
                    }
                  : undefined,
              }
            : undefined,
        }
      : undefined,
    building: raw.building
      ? {
          id: raw.building.id,
          name: raw.building.building_name ?? raw.building.name,
        }
      : undefined,
  }
}

function transformScheduleList(rawList: any[]): Schedule[] {
  if (!Array.isArray(rawList)) return []
  return rawList.map(transformBackendScheduleToFrontend)
}

/**
 * Get all schedules/classes taught by a teacher
 * Backend: GET /schedules/teacher/:teacherId
 */
export async function getTeacherSchedules(teacherUserId: string): Promise<Schedule[]> {
  const data = await apiClient.get<any[]>(`/schedules/teacher/${teacherUserId}`)
  return transformScheduleList(data)
}

/**
 * Get roster for a specific schedule (if schedule-level enrollment is enabled)
 * Backend (recommended): GET /schedules/:scheduleId/students
 */
export async function getScheduleRoster(scheduleId: string): Promise<RosterStudent[]> {
  return apiClient.get<RosterStudent[]>(`/schedules/${scheduleId}/students`)
}

/**
 * Schedules API Endpoints
 * Handles schedule-related operations
 */

 

/**
 * Get all schedules for a specific student
 * @param studentId - The student's ID
 */
export async function getStudentSchedules(studentId: string): Promise<Schedule[]> {
  const data = await apiClient.get<any[]>(`/schedules/student/${studentId}`)
  return transformScheduleList(data)
}

/**
 * Get the current logged-in student's schedule
 * Uses the /my-schedule endpoint which automatically gets the schedule for the authenticated student
 */
export async function getMySchedule(): Promise<Schedule[]> {
  const data = await apiClient.get<any[]>('/schedules/my-schedule')
  return transformScheduleList(data)
}

// ==============================
// Admin endpoints (Superadmin)
// ==============================

export async function adminListScheduleTemplates(): Promise<any[]> {
  return apiClient.get<any[]>('/schedules/templates')
}

export async function adminCreateScheduleTemplate(payload: { name: string; description?: string; grade_level?: string; payload: any }): Promise<any> {
  return apiClient.post<any>('/schedules/templates', payload)
}

export async function adminSetSchedulePublish(id: string, publish: boolean): Promise<{ id: string; status: string; is_published: boolean; published_at: string | null }> {
  return apiClient.post(`/schedules/${id}/publish?publish=${publish}`)
}

export async function adminListSchedules(filters?: { status?: 'draft' | 'published' | 'archived'; teacherId?: string; sectionId?: string; dayOfWeek?: string; schoolYear?: string; semester?: string; page?: number; limit?: number; search?: string }): Promise<{ data: any[]; pagination: any }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.teacherId) params.set('teacherId', filters.teacherId)
  if (filters?.sectionId) params.set('sectionId', filters.sectionId)
  if (filters?.dayOfWeek) params.set('dayOfWeek', filters.dayOfWeek)
  if (filters?.schoolYear) params.set('schoolYear', filters.schoolYear)
  if (filters?.semester) params.set('semester', filters.semester)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiClient.get(`/schedules${query}`)
}

export async function adminCheckConflicts(payload: any): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
  return apiClient.post('/schedules/check-conflicts', payload)
}

export async function adminCreateSchedule(payload: {
  subjectId: string;
  teacherId: string;
  sectionId: string;
  roomId?: string;
  buildingId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  schoolYear: string;
  gradingPeriod: 'Q1'|'Q2'|'Q3'|'Q4';
}): Promise<any> {
  return apiClient.post('/schedules', payload)
}

export async function adminUpdateSchedule(id: string, payload: Partial<{
  subjectId: string;
  teacherId: string;
  sectionId: string;
  roomId?: string;
  buildingId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  schoolYear: string;
  gradingPeriod: 'Q1'|'Q2'|'Q3'|'Q4';
}>): Promise<any> {
  return apiClient.patch(`/schedules/${id}`, payload)
}

export async function adminDeleteSchedule(id: string): Promise<void> {
  await apiClient.delete(`/schedules/${id}`)
}

export async function adminGetScheduleAudit(id: string): Promise<any[]> {
  return apiClient.get<any[]>(`/schedules/${id}/audit`)
}

// ==============================
// Reference data endpoints for Wizard pickers
// ==============================

export async function adminListSections(params?: { search?: string; limit?: number; page?: number }): Promise<{ data: any[]; pagination: any }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set('search', params.search)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.page) sp.set('page', String(params.page))
  const q = sp.toString() ? `?${sp.toString()}` : ''
  return apiClient.get(`/sections${q}`)
}

export async function adminListSubjects(params?: { search?: string; limit?: number; page?: number }): Promise<{ data: any[]; pagination: any }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set('search', params.search)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.page) sp.set('page', String(params.page))
  const q = sp.toString() ? `?${sp.toString()}` : ''
  return apiClient.get(`/subjects${q}`)
}

export async function adminListRooms(params?: { search?: string; buildingId?: string; floorId?: string; limit?: number; page?: number }): Promise<{ data: any[]; pagination: any }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set('search', params.search)
  if (params?.buildingId) sp.set('buildingId', params.buildingId)
  if (params?.floorId) sp.set('floorId', params.floorId)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.page) sp.set('page', String(params.page))
  const q = sp.toString() ? `?${sp.toString()}` : ''
  return apiClient.get(`/rooms${q}`)
}

export async function adminListTeachers(params?: { search?: string; limit?: number; page?: number; subjectId?: string }): Promise<{ data: any[]; pagination: any }> {
  // Always use /schedules/teachers endpoint to get teacher IDs (not user IDs)
  const sp = new URLSearchParams()
  if (params?.subjectId) {
    sp.set('subjectId', params.subjectId)
  }
  if (params?.search) sp.set('search', params.search)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.page) sp.set('page', String(params.page))

  const q = sp.toString() ? `?${sp.toString()}` : ''
  console.log('[adminListTeachers] Fetching teachers with params:', params)

  try {
    const data = await apiClient.get<any[]>(`/schedules/teachers${q}`)
    console.log('[adminListTeachers] Received teachers data:', {
      count: Array.isArray(data) ? data.length : 0,
      isArray: Array.isArray(data),
      firstTeacher: Array.isArray(data) && data.length > 0 ? data[0] : null
    })
    // Ensure we return an array even if backend returns something else
    const teachersArray = Array.isArray(data) ? data : []
    return { data: teachersArray, pagination: { total: teachersArray.length, page: 1, limit: teachersArray.length, pages: 1 } }
  } catch (error) {
    console.error('[adminListTeachers] Error fetching teachers:', error)
    return { data: [], pagination: { total: 0, page: 1, limit: 0, pages: 1 } }
  }
}

export async function adminListBuildings(params?: { search?: string; limit?: number; page?: number }): Promise<{ data: any[]; pagination: any }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set('search', params.search)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.page) sp.set('page', String(params.page))
  const q = sp.toString() ? `?${sp.toString()}` : ''
  return apiClient.get(`/buildings${q}`)
}

export async function adminListFloors(params?: { buildingId?: string; search?: string; limit?: number; page?: number }): Promise<{ data: any[]; pagination: any }> {
  const sp = new URLSearchParams()
  if (params?.buildingId) sp.set('buildingId', params.buildingId)
  if (params?.search) sp.set('search', params.search)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.page) sp.set('page', String(params.page))
  const q = sp.toString() ? `?${sp.toString()}` : ''
  return apiClient.get(`/floors${q}`)
}
