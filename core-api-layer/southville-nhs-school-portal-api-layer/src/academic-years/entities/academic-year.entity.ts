export interface AcademicYear {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  structure: 'quarters'; // System always uses quarters
  is_active: boolean;
  is_archived: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  periods?: AcademicPeriod[];
}

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

export interface AcademicYearTemplate {
  id: string;
  template_name: string;
  structure: 'quarters' | 'semesters' | 'trimesters';
  description?: string;
  periods_config: any; // JSONB
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AcademicYearSetting {
  id: string;
  setting_key: string;
  setting_value: any; // JSONB
  description?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}
