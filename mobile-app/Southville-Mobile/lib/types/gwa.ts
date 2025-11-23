export enum GradingPeriod {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum HonorStatus {
  NONE = 'None',
  WITH_HONORS = 'With Honors',
  WITH_HIGH_HONORS = 'With High Honors',
  WITH_HIGHEST_HONORS = 'With Highest Honors',
}

export interface Gwa {
  id: string;
  student_id: string;
  gwa: number;
  grading_period: GradingPeriod;
  school_year: string;
  remarks?: string;
  honor_status: HonorStatus;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface GwaParams {
  grading_period?: GradingPeriod;
  school_year?: string;
}
