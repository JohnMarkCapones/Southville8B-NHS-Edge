export interface StudentGamification {
  id: string;
  student_id: string;

  // Points & Level
  total_points: number;
  level: number;
  level_progress: number; // 0-100
  points_to_next_level: number;

  // Streaks
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;

  // Statistics
  total_badges: number;
  quiz_points: number;
  activity_points: number;
  streak_points: number;
  bonus_points: number;

  // Leaderboard Rankings (cached)
  global_rank: number | null;
  grade_rank: number | null;
  section_rank: number | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface StudentGamificationWithDetails extends StudentGamification {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    grade_level: string;
    section_id: string;
    student_id: string;
  };
  level_title?: string;
  recent_badges?: any[];
}
