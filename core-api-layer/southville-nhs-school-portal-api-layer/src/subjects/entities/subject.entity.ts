export interface Subject {
  id: string;
  code: string;
  subject_name: string;
  description?: string;
  department_id?: string;
  grade_levels: string[];
  status: 'active' | 'inactive' | 'archived';
  visibility: 'public' | 'students' | 'restricted';
  color_hex?: string;
  created_at: string;
  updated_at: string;
}








