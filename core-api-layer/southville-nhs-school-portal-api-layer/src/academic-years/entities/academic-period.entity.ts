// Academic Period Entity Interface for Supabase
export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  period_name: string;
  period_order: number;
  start_date: string;
  end_date: string;
  is_grading_period: boolean;
  weight: number;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}
