import { apiRequest } from '@/lib/api-client';
import type { StudentRanking } from '@/lib/types/ranking';

/**
 * Fetches the latest student ranking from REST API
 * @param studentId - The student's UUID from the students table
 * @returns The most recent ranking record or null if none exists
 */
export async function fetchStudentRanking(
  studentId: string
): Promise<StudentRanking | null> {
  try {
    // Call REST API endpoint: GET /api/v1/public/students/:studentId/rankings
    // Returns array of rankings ordered by school_year DESC, quarter DESC (latest first)
    const rankings = await apiRequest<StudentRanking[]>(
      `/public/students/${studentId}/rankings`
    );

    if (!rankings || rankings.length === 0) {
      console.log('[rankings] No ranking found for student:', studentId);
      return null;
    }

    // Return the first ranking (most recent based on backend ordering)
    return rankings[0];
  } catch (err) {
    console.error('[rankings] Failed to fetch student ranking:', err);
    return null;
  }
}

