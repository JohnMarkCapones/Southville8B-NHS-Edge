/**
 * Student Rankings API Types
 * Types for the student rankings system
 */

export interface StudentRanking {
  id: string;
  student_id: string;
  grade_level: string;
  rank: number;
  honor_status?: string;
  quarter: string;
  school_year: string;
  created_at: string;
  updated_at: string;

  // Related data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    grade_level: string;
  };
}

export interface StudentRankingResponse {
  data: StudentRanking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentRankingQueryParams {
  page?: number;
  limit?: number;
  gradeLevel?: string;
  quarter?: string;
  school_year?: string;
  topN?: number;
}

// GWA (Grade Weighted Average) related types
export interface Gwa {
  id: string;
  student_id: string;
  gwa: number;
  grading_period: string;
  school_year: string;
  remarks?: string;
  honor_status?: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;

  // Related data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    grade_level: string;
    section?: {
      id: string;
      name: string;
      grade_level: string;
    };
  };
}

export interface GwaResponse {
  data: Gwa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GwaQueryParams {
  page?: number;
  limit?: number;
  studentId?: string;
  gradingPeriod?: string;
  schoolYear?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// Honor status enum
export enum HonorStatus {
  NONE = "None",
  WITH_HONORS = "With Honors",
  WITH_HIGH_HONORS = "With High Honors",
  WITH_HIGHEST_HONORS = "With Highest Honors",
}

// Frontend component types
export interface LeaderboardStudent {
  id: string;
  name: string;
  avatar?: string;
  gradeLevel: 7 | 8 | 9 | 10;
  section: string;
  gwa: number; // 0-100 style (e.g., 98.6)
  rank: number; // global rank only as a consistent tie-breaker
  trend: number; // +/- delta
  honorStatus?: string;
  studentId?: string;
}
