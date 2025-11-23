/**
 * Gamification API Endpoints
 * Handles points, badges, leaderboards, and student achievements
 */

import { apiClient } from "../client";

// ============================================================================
// Type Definitions
// ============================================================================

export interface GamificationProfile {
  student_id: string;
  points: {
    total: number;
    quiz: number;
    activity: number;
    streak: number;
    bonus: number;
  };
  level: {
    current: number;
    title: string;
    progress: number; // 0-100
    currentXP: number;
    nextLevelXP: number;
  };
  streak: {
    current: number;
    longest: number;
    lastActivity: string | null;
  };
  badges: {
    total: number;
    recent: RecentBadge[];
  };
  ranks: {
    global: number | null;
    grade: number | null;
    section: number | null;
  };
}

export interface RecentBadge {
  id: string;
  badge: Badge;
  earnedAt: string;
}

export interface Badge {
  id: string;
  badge_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  category: BadgeCategory;
  tier: BadgeTier;
  rarity: BadgeRarity;
  points_reward: number;
  is_progressive: boolean;
  progress_target: number | null;
}

export type BadgeCategory = 'academic' | 'participation' | 'streak' | 'social' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface StudentBadge {
  id: string;
  badge: Badge;
  earnedAt: string;
  progress: number; // 0-100
  progressCount?: number;
  isShowcased: boolean;
}

export interface BadgeWithProgress extends Badge {
  earned: boolean;
  earnedAt?: string;
  progress: number;
  progressCount?: number;
}

export interface MyBadgesResponse {
  earned: BadgeWithProgress[];
  unearned: BadgeWithProgress[];
  categories: {
    academic: number;
    participation: number;
    streak: number;
    social: number;
    special: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  student: {
    id: string;
    name: string;
    gradeLevel?: number;
    section?: string;
    avatarUrl?: string;
  };
  stats: {
    totalPoints: number;
    level: number;
    currentStreak: number;
    totalBadges: number;
  };
  trend: 'up' | 'down' | 'same';
  trendChange?: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  currentUser: LeaderboardEntry | null;
  lastUpdated: string;
}

export interface LeaderboardQuery {
  scope?: 'global' | 'grade' | 'section';
  scopeValue?: string;
  page?: number;
  limit?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface PointTransaction {
  id: string;
  points: number;
  type: string;
  category: 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';
  reason: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  balanceAfter: number | null;
}

export interface PointHistoryResponse {
  transactions: PointTransaction[];
  summary: {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PointHistoryQuery {
  page?: number;
  limit?: number;
  category?: 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';
  startDate?: string;
  endDate?: string;
}

export interface AwardPointsRequest {
  studentId: string;
  points: number;
  reason: string;
  category: 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';
  transactionType: string;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isManual?: boolean;
}

export interface AwardPointsResponse {
  success: boolean;
  old_total: number;
  new_total: number;
  points_awarded: number;
  level_up?: boolean;
  new_level?: number;
  badges_earned?: string[];
}

export interface ShowcaseBadgeRequest {
  studentBadgeId: string;
  isShowcased: boolean;
}

// ============================================================================
// Student Endpoints
// ============================================================================

/**
 * Get current student's gamification profile
 * GET /gamification/my-profile
 */
export async function getMyProfile(): Promise<GamificationProfile> {
  return apiClient.get<GamificationProfile>('/gamification/my-profile');
}

/**
 * Get my badges (earned and unearned)
 * GET /gamification/my-badges
 */
export async function getMyBadges(filter?: 'earned' | 'unearned' | 'all'): Promise<MyBadgesResponse> {
  const params = filter ? { filter } : undefined;
  return apiClient.get<MyBadgesResponse>('/gamification/my-badges', { params });
}

/**
 * Get leaderboard rankings
 * GET /gamification/leaderboard
 */
export async function getLeaderboard(query?: LeaderboardQuery): Promise<LeaderboardResponse> {
  return apiClient.get<LeaderboardResponse>('/gamification/leaderboard', { params: query });
}

/**
 * Get point transaction history
 * GET /gamification/point-history
 */
export async function getPointHistory(query?: PointHistoryQuery): Promise<PointHistoryResponse> {
  return apiClient.get<PointHistoryResponse>('/gamification/point-history', { params: query });
}

/**
 * Toggle badge showcase status
 * POST /gamification/showcase-badge
 */
export async function showcaseBadge(request: ShowcaseBadgeRequest): Promise<{ success: boolean }> {
  return apiClient.post<{ success: boolean }>('/gamification/showcase-badge', request);
}

// ============================================================================
// Teacher/Admin Endpoints
// ============================================================================

/**
 * Manually award points to a student (Teacher/Admin only)
 * POST /gamification/award-points
 */
export async function awardPoints(request: AwardPointsRequest): Promise<AwardPointsResponse> {
  return apiClient.post<AwardPointsResponse>('/gamification/award-points', request);
}

/**
 * Get gamification analytics (Admin only)
 * GET /gamification/analytics
 */
export async function getAnalytics(): Promise<{
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalPointsAwarded: number;
    averagePointsPerStudent: number;
    averageLevel: string;
    totalBadgesEarned: number;
  };
  topPerformers: LeaderboardEntry[];
}> {
  return apiClient.get('/gamification/analytics');
}

// ============================================================================
// Badge Management Endpoints (Admin)
// ============================================================================

/**
 * Get all badges
 * GET /badges
 */
export async function getAllBadges(includeInactive = false): Promise<Badge[]> {
  const params = includeInactive ? { includeInactive: 'true' } : undefined;
  return apiClient.get<Badge[]>('/badges', { params });
}

/**
 * Get badge by ID
 * GET /badges/:id
 */
export async function getBadgeById(id: string): Promise<Badge> {
  return apiClient.get<Badge>(`/badges/${id}`);
}

/**
 * Create new badge (Admin only)
 * POST /badges
 */
export async function createBadge(badge: Partial<Badge>): Promise<Badge> {
  return apiClient.post<Badge>('/badges', badge);
}

/**
 * Update badge (Admin only)
 * PUT /badges/:id
 */
export async function updateBadge(id: string, updates: Partial<Badge>): Promise<Badge> {
  return apiClient.put<Badge>(`/badges/${id}`, updates);
}

/**
 * Delete badge (Admin only)
 * DELETE /badges/:id
 */
export async function deleteBadge(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`/badges/${id}`);
}

/**
 * Get badge statistics (Admin/Teacher)
 * GET /badges/:id/stats
 */
export async function getBadgeStats(id: string): Promise<{
  badge: Badge;
  stats: {
    totalEarned: number;
    totalStudents: number;
    earnedPercentage: number;
  };
  recentEarners: Array<{
    earned_at: string;
    student: {
      first_name: string;
      last_name: string;
      grade_level: number;
    };
  }>;
}> {
  return apiClient.get(`/badges/${id}/stats`);
}

/**
 * Manually award badge to student (Admin/Teacher)
 * POST /badges/:id/award
 */
export async function awardBadge(badgeId: string, studentId: string): Promise<{ success: boolean; data: any }> {
  return apiClient.post(`/badges/${badgeId}/award`, { studentId });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get level title from level number
 */
export function getLevelTitle(level: number): string {
  if (level >= 100) return 'Immortal';
  if (level >= 91) return 'Supreme';
  if (level >= 81) return 'Elite';
  if (level >= 71) return 'Hero';
  if (level >= 61) return 'Champion';
  if (level >= 51) return 'Legend';
  if (level >= 41) return 'Grand Master';
  if (level >= 31) return 'Master';
  if (level >= 21) return 'Expert';
  if (level >= 11) return 'Scholar';
  if (level >= 6) return 'Apprentice';
  return 'Novice';
}

/**
 * Get level icon from level number
 */
export function getLevelIcon(level: number): string {
  if (level >= 100) return 'Infinity';
  if (level >= 91) return 'Sparkles';
  if (level >= 81) return 'Zap';
  if (level >= 71) return 'Shield';
  if (level >= 61) return 'Trophy';
  if (level >= 51) return 'Crown';
  if (level >= 41) return 'Stars';
  if (level >= 31) return 'Star';
  if (level >= 21) return 'Brain';
  if (level >= 11) return 'GraduationCap';
  if (level >= 6) return 'BookOpen';
  return 'Sprout';
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Get tier color class
 */
export function getTierColor(tier: BadgeTier): string {
  const colors: Record<BadgeTier, string> = {
    bronze: 'text-amber-600',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    platinum: 'text-cyan-400',
    diamond: 'text-blue-400',
  };
  return colors[tier] || 'text-gray-500';
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity: BadgeRarity): string {
  const colors: Record<BadgeRarity, string> = {
    common: 'text-gray-500',
    uncommon: 'text-green-500',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-orange-500',
  };
  return colors[rarity] || 'text-gray-500';
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
