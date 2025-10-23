'use client'

import { useQuery } from '@tanstack/react-query'
import { getTeacherSections, type SectionWithStudents } from '@/lib/api/endpoints/sections'
import { getTeacherSchedules, getScheduleRoster, type ScheduleItem, type RosterStudent } from '@/lib/api/endpoints/schedules'
import { getStudentsBySection, type PaginatedStudents } from '@/lib/api/endpoints/students'

export function useTeacherAdvisory(teacherUserId?: string) {
  return useQuery<SectionWithStudents[], Error>({
    queryKey: ['teacher','advisory', teacherUserId],
    queryFn: () => getTeacherSections(teacherUserId as string),
    enabled: Boolean(teacherUserId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeacherSchedules(teacherUserId?: string) {
  return useQuery<ScheduleItem[], Error>({
    queryKey: ['teacher','schedules', teacherUserId],
    queryFn: () => getTeacherSchedules(teacherUserId as string),
    enabled: Boolean(teacherUserId),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch a class roster by schedule. Prefers schedule-level roster endpoint; falls back to section-based roster.
 */
export function useClassRoster(options: { scheduleId?: string; sectionId?: string; page?: number; limit?: number; search?: string }) {
  const { scheduleId, sectionId, page = 1, limit = 20, search } = options

  return useQuery<{ students: RosterStudent[]; source: 'schedule' | 'section'; pagination?: PaginatedStudents['pagination'] }, Error>({
    queryKey: ['teacher','class-roster', { scheduleId, sectionId, page, limit, search }],
    enabled: Boolean(scheduleId || sectionId),
    queryFn: async () => {
      // Try schedule-level roster first if scheduleId provided
      if (scheduleId) {
        try {
          const roster = await getScheduleRoster(scheduleId)
          return { students: roster, source: 'schedule' as const }
        } catch (_err) {
          // Fallback to section roster if available
        }
      }

      if (!sectionId) {
        throw new Error('Section ID is required when schedule roster is unavailable')
      }

      const res = await getStudentsBySection(sectionId, page, limit, search)
      // Map to RosterStudent shape for consistency
      const students = res.data.map(s => ({ id: s.id, first_name: s.first_name, last_name: s.last_name, student_id: s.student_id }))
      return { students, source: 'section' as const, pagination: res.pagination }
    },
  })
}


