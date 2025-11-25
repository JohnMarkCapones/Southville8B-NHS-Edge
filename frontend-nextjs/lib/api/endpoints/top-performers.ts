/**
 * Top Performers API Endpoints
 * 
 * Provides TypeScript interfaces and functions for interacting with the Top Performers API.
 * Handles data fetching, filtering, and statistics for top performing students.
 * 
 * @module lib/api/endpoints/top-performers
 */

import { apiClient } from '../client';

// ==================== TYPES ====================

export interface TopPerformer {
  id: string;
  rank: number;
  studentId: string;
  name: string;
  gradeLevel: number;
  section: string;
  gwa: number;
  recognitionDate: string;
  status: 'Active' | 'Archived';
  academicYearId?: string;
  gradingPeriod?: string;
  honorStatus?: string;
  remarks?: string;
}

export interface TopPerformersStats {
  totalHonorStudents: number;
  honorRollStudents: number;
  perfectGwaStudents: number;
  gradeDistribution: {
    grade7: number;
    grade8: number;
    grade9: number;
    grade10: number;
  };
  averageGwa: number;
  topStudent?: {
    name: string;
    gwa: number;
    gradeLevel: number;
  };
}

export interface TopPerformersListResponse {
  performers: TopPerformer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: TopPerformersStats;
}

export interface StudentPerformanceDetails {
  studentId: string;
  name: string;
  gradeLevel: number;
  section: string;
  gwa: number;
  rank: number;
  gwaHistory: {
    gradingPeriod: string;
    gwa: number;
    academicYear: string;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    date: string;
    type: string;
  }[];
  subjects: {
    subjectName: string;
    grade: number;
    credits: number;
  }[];
}

// ==================== QUERY PARAMETERS ====================

export interface TopPerformersQueryParams {
  search?: string;
  timePeriod?: 'current-quarter' | 'semester' | 'school-year' | 'all-time';
  gradeLevel?: 'all' | '7' | '8' | '9' | '10';
  category?: string;
  topN?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StatsQueryParams {
  timePeriod?: 'current-quarter' | 'semester' | 'school-year' | 'all-time';
  gradeLevel?: 'all' | '7' | '8' | '9' | '10';
  academicYearId?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get top performers with filtering and pagination
 */
export const getTopPerformers = async (
  params: TopPerformersQueryParams = {}
): Promise<TopPerformersListResponse> => {
  return apiClient.get<TopPerformersListResponse>('/top-performers', { params });
};

/**
 * Get top performers statistics
 */
export const getTopPerformersStats = async (
  params: StatsQueryParams = {}
): Promise<TopPerformersStats> => {
  return apiClient.get<TopPerformersStats>('/top-performers/stats', { params });
};

/**
 * Get detailed student performance information
 */
export const getStudentPerformanceDetails = async (
  studentId: string
): Promise<StudentPerformanceDetails> => {
  return apiClient.get<StudentPerformanceDetails>(`/top-performers/${studentId}/details`);
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format GWA value for display
 */
export const formatGwa = (gwa: number): string => {
  return gwa.toFixed(2);
};

/**
 * Get honor status based on GWA
 */
export const getHonorStatus = (gwa: number): string => {
  if (gwa === 1.0) return 'Perfect GWA';
  if (gwa <= 1.25) return 'With Highest Honors';
  if (gwa <= 1.5) return 'With High Honors';
  if (gwa <= 1.75) return 'With Honors';
  return 'Regular';
};

/**
 * Get rank icon based on position
 */
export const getRankIcon = (rank: number): string => {
  if (rank === 1) return 'crown';
  if (rank === 2) return 'medal-silver';
  if (rank === 3) return 'medal-bronze';
  return 'star';
};

/**
 * Calculate grade level distribution percentage
 */
export const calculateGradeDistributionPercentage = (
  count: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

/**
 * Validate query parameters
 */
export const validateTopPerformersQuery = (params: TopPerformersQueryParams): TopPerformersQueryParams => {
  return {
    ...params,
    page: Math.max(1, params.page || 1),
    limit: Math.min(100, Math.max(1, params.limit || 10)),
    topN: Math.min(100, Math.max(1, params.topN || 10)),
    timePeriod: params.timePeriod || 'current-quarter',
    gradeLevel: params.gradeLevel || 'all',
    sortBy: params.sortBy || 'gwa',
    sortOrder: params.sortOrder || 'asc',
  };
};
