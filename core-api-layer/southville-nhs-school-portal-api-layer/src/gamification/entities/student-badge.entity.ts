export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;

  // Progress tracking
  current_progress: number; // 0-100
  progress_count: number;

  // Earned status
  earned_at: string;
  is_showcased: boolean;

  // Metadata
  metadata: Record<string, any> | null;
}

export interface StudentBadgeWithDetails extends StudentBadge {
  badge?: {
    id: string;
    badge_key: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    category: string;
    tier: string;
    rarity: string;
    points_reward: number;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
