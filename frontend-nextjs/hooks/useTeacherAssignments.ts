/**
 * useTeacherAssignments Hook
 *
 * React Query hook for fetching teacher's assigned subjects, sections, and grades
 * Extracts unique assignments from teacher's schedule
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeacherSchedules } from '@/lib/api/endpoints/schedules';
import type { Schedule } from '@/lib/api/types/schedules';
import { useMemo } from 'react';

interface TeacherAssignment {
  subject: {
    id: string;
    name: string;
    gradeLevel?: number;
  };
  section: {
    id: string;
    name: string;
    gradeLevel?: string;
  };
  gradeLevel: string;
}

interface UseTeacherAssignmentsReturn {
  // Raw schedules
  schedules: Schedule[];

  // Extracted unique values
  subjects: Array<{ id: string; name: string; gradeLevel?: number }>;
  sections: Array<{ id: string; name: string; gradeLevel?: string }>;
  gradeLevels: string[];

  // Combined assignments
  assignments: TeacherAssignment[];

  // Query states
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch teacher's assigned subjects, sections, and grade levels
 *
 * @param teacherUserId - Teacher's user ID (from auth)
 *
 * @example
 * ```typescript
 * const { subjects, sections, gradeLevels, isLoading } = useTeacherAssignments(teacherId);
 *
 * // Teacher can only select from their assigned subjects
 * subjects.map(s => <option value={s.id}>{s.name}</option>)
 * ```
 */
export function useTeacherAssignments(teacherUserId: string | null): UseTeacherAssignmentsReturn {
  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Schedule[], Error>({
    queryKey: ['teacher-assignments', teacherUserId],
    queryFn: () => {
      if (!teacherUserId) {
        throw new Error('Teacher user ID is required');
      }
      return getTeacherSchedules(teacherUserId);
    },
    enabled: !!teacherUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Extract unique subjects, sections, and grade levels from schedules
  const { subjects, sections, gradeLevels, assignments } = useMemo(() => {
    const subjectsMap = new Map<string, { id: string; name: string; gradeLevel?: number }>();
    const sectionsMap = new Map<string, { id: string; name: string; gradeLevel?: string }>();
    const gradeLevelsSet = new Set<string>();
    const assignmentsList: TeacherAssignment[] = [];

    schedules.forEach((schedule) => {
      // Extract subject
      if (schedule.subject) {
        subjectsMap.set(schedule.subject.id, {
          id: schedule.subject.id,
          name: schedule.subject.subjectName,
          gradeLevel: schedule.subject.gradeLevel,
        });
      }

      // Extract section
      if (schedule.section) {
        sectionsMap.set(schedule.section.id, {
          id: schedule.section.id,
          name: schedule.section.name,
          gradeLevel: schedule.section.gradeLevel,
        });

        // Extract grade level from section
        if (schedule.section.gradeLevel) {
          gradeLevelsSet.add(schedule.section.gradeLevel);
        }
      }

      // Create full assignment record
      if (schedule.subject && schedule.section) {
        const gradeLevel = schedule.section.gradeLevel ||
                          (schedule.subject.gradeLevel ? `Grade ${schedule.subject.gradeLevel}` : 'Unknown');

        assignmentsList.push({
          subject: {
            id: schedule.subject.id,
            name: schedule.subject.subjectName,
            gradeLevel: schedule.subject.gradeLevel,
          },
          section: {
            id: schedule.section.id,
            name: schedule.section.name,
            gradeLevel: schedule.section.gradeLevel,
          },
          gradeLevel,
        });
      }
    });

    return {
      subjects: Array.from(subjectsMap.values()),
      sections: Array.from(sectionsMap.values()),
      gradeLevels: Array.from(gradeLevelsSet).sort(),
      assignments: assignmentsList,
    };
  }, [schedules]);

  return {
    schedules,
    subjects,
    sections,
    gradeLevels,
    assignments,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
