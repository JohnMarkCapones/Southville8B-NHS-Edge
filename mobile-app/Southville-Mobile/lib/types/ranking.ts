export interface StudentRanking {
  id: string | null;
  student_id: string;
  grade_level: string | null;
  rank: number | null;
  honor_status: string | null;
  quarter: string;
  school_year: string;
  created_at: string | null;
  updated_at: string | null;
  gwa?: number | null;
  total_students?: number;
  period_name?: string | null;
  academic_year_id?: string | null;
  academic_period_id?: string | null;
}
