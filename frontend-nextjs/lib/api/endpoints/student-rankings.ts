/**
 * Student Rankings API Endpoints
 * API client functions for student rankings and GWA
 */

import { apiClient } from '../client';
import type {
  StudentRanking,
  StudentRankingResponse,
  StudentRankingQueryParams,
  Gwa,
  GwaResponse,
  GwaQueryParams,
} from '../types/student-rankings';

/**
 * Get student rankings with filters and pagination
 */
export async function getStudentRankings(
  params?: StudentRankingQueryParams
): Promise<StudentRankingResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);
  if (params?.quarter) queryParams.append('quarter', params.quarter);
  if (params?.school_year) queryParams.append('schoolYear', params.school_year);
  if (params?.topN) queryParams.append('topN', params.topN.toString());

  const queryString = queryParams.toString();
  const endpoint = `/public/students/rankings${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<StudentRankingResponse>(endpoint, { requiresAuth: false });
}

/**
 * Get a specific student ranking by ID
 */
export async function getStudentRankingById(id: string): Promise<StudentRanking> {
  return apiClient.get<StudentRanking>(`/public/students/rankings/${id}`, { requiresAuth: false });
}

/**
 * Get all rankings for a specific student
 */
export async function getStudentRankingsByStudent(studentId: string): Promise<StudentRanking[]> {
  return apiClient.get<StudentRanking[]>(`/public/students/${studentId}/rankings`, { requiresAuth: false });
}

/**
 * Get GWA records with filters and pagination
 */
export async function getGwaRecords(
  params?: GwaQueryParams
): Promise<GwaResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.studentId) queryParams.append('studentId', params.studentId);
  if (params?.gradingPeriod) queryParams.append('gradingPeriod', params.gradingPeriod);
  if (params?.schoolYear) queryParams.append('schoolYear', params.schoolYear);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/gwa${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<GwaResponse>(endpoint, { requiresAuth: false });
}

/**
 * Get GWA history for a specific student
 */
export async function getStudentGwaHistory(studentId: string): Promise<Gwa[]> {
  return apiClient.get<Gwa[]>(`/gwa/student/${studentId}`, { requiresAuth: false });
}

/**
 * Get top students by GWA for leaderboard
 */
export async function getTopStudentsByGwa(
  params?: {
    gradeLevel?: string;
    quarter?: string;
    schoolYear?: string;
    limit?: number;
  }
): Promise<Gwa[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);
  if (params?.quarter) queryParams.append('quarter', params.quarter);
  if (params?.schoolYear) queryParams.append('schoolYear', params.schoolYear);
  if (params?.limit) queryParams.append('limit', (params.limit || 10).toString());

  const queryString = queryParams.toString();
  const endpoint = `/public/gwa/top${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<Gwa[]>(endpoint, { requiresAuth: false });
}
