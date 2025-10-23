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

/**
 * Get all schedules/classes taught by a teacher
 * Backend: GET /schedules/teacher/:teacherId
 */
export async function getTeacherSchedules(teacherUserId: string): Promise<ScheduleItem[]> {
  return apiClient.get<ScheduleItem[]>(`/schedules/teacher/${teacherUserId}`)
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
  return apiClient.get<Schedule[]>(`/schedules/student/${studentId}`);
}

/**
 * Get the current logged-in student's schedule
 * Uses the /my-schedule endpoint which automatically gets the schedule for the authenticated student
 */
export async function getMySchedule(): Promise<Schedule[]> {
  return apiClient.get<Schedule[]>('/schedules/my-schedule');
}
