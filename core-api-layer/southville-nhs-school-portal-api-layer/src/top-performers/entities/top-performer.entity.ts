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
