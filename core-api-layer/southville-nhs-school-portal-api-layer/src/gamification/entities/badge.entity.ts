export interface Badge {
  id: string;

  // Identification
  badge_key: string;
  name: string;
  description: string | null;

  // Visual
  icon: string | null;
  color: string | null;
  image_url: string | null;

  // Classification
  category: BadgeCategory;
  tier: BadgeTier;
  rarity: BadgeRarity;

  // Rewards
  points_reward: number;

  // Criteria (JSON)
  criteria: BadgeCriteria | null;

  // Progressive badges
  is_progressive: boolean;
  progress_target: number | null;

  // Status
  is_active: boolean;
  is_hidden: boolean;

  // Display order
  display_order: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export type BadgeCategory = 'academic' | 'participation' | 'streak' | 'social' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface BadgeCriteria {
  type: string;
  count?: number;
  days?: number;
  points?: number;
  level?: number;
  min_score?: number;
  max_rank?: number;
  scope?: string;
  time_percentage?: number;
  percentage?: number;
  status?: string;
  conditions?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

export interface BadgeWithProgress extends Badge {
  progress?: number;
  progress_count?: number;
  earned?: boolean;
  earned_at?: string;
}
