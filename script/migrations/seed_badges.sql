-- ============================================================================
-- Badge Definitions Seed Data
-- Southville 8B NHS Edge - Gamification System
-- Created: 2025-11-20
-- Description: Initial catalog of badges across all categories
-- ============================================================================

-- Clear existing badges (optional - comment out if you want to preserve custom badges)
-- DELETE FROM badges;

-- ============================================================================
-- ACADEMIC BADGES
-- ============================================================================

-- Quiz Completion Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('quiz-novice', 'Quiz Novice', 'Complete your first 5 quizzes', 'BookOpen', 'text-blue-500', 'academic', 'bronze', 'common', 50,
 '{"type": "quiz_completion", "count": 5}'::jsonb, true, 5, 1),

('quiz-enthusiast', 'Quiz Enthusiast', 'Complete 20 quizzes', 'BookMarked', 'text-blue-600', 'academic', 'silver', 'uncommon', 150,
 '{"type": "quiz_completion", "count": 20}'::jsonb, true, 20, 2),

('quiz-champion', 'Quiz Champion', 'Complete 50 quizzes', 'Trophy', 'text-amber-500', 'academic', 'gold', 'rare', 400,
 '{"type": "quiz_completion", "count": 50}'::jsonb, true, 50, 3);

-- Perfect Score Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('first-perfect', 'First Perfect!', 'Achieve your first perfect quiz score', 'Star', 'text-yellow-500', 'academic', 'bronze', 'common', 100,
 '{"type": "quiz_perfect_score", "count": 1}'::jsonb, false, NULL, 10),

('quiz-master-bronze', 'Quiz Master (Bronze)', 'Achieve 10 perfect quiz scores', 'Trophy', 'text-amber-600', 'academic', 'bronze', 'uncommon', 200,
 '{"type": "quiz_perfect_score", "count": 10}'::jsonb, true, 10, 11),

('quiz-master-silver', 'Quiz Master (Silver)', 'Achieve 25 perfect quiz scores', 'Trophy', 'text-gray-400', 'academic', 'silver', 'rare', 500,
 '{"type": "quiz_perfect_score", "count": 25}'::jsonb, true, 25, 12),

('quiz-master-gold', 'Quiz Master (Gold)', 'Achieve 50 perfect quiz scores', 'Trophy', 'text-yellow-500', 'academic', 'gold', 'epic', 1000,
 '{"type": "quiz_perfect_score", "count": 50}'::jsonb, true, 50, 13),

('quiz-master-platinum', 'Quiz Master (Platinum)', 'Achieve 100 perfect quiz scores', 'Trophy', 'text-cyan-400', 'academic', 'platinum', 'legendary', 2500,
 '{"type": "quiz_perfect_score", "count": 100}'::jsonb, true, 100, 14);

-- Speed Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('speed-demon', 'Speed Demon', 'Complete 10 quizzes in less than 50% of time limit', 'Zap', 'text-orange-500', 'academic', 'silver', 'uncommon', 300,
 '{"type": "quiz_speed", "count": 10, "time_percentage": 50}'::jsonb, true, 10, 20),

('lightning-fast', 'Lightning Fast', 'Complete a quiz in under 25% of time limit', 'Bolt', 'text-yellow-400', 'academic', 'gold', 'rare', 500,
 '{"type": "quiz_speed_single", "time_percentage": 25}'::jsonb, false, NULL, 21);

-- First Attempt Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('perfectionist', 'Perfectionist', 'Score 100% on first attempt for 20 quizzes', 'Target', 'text-red-500', 'academic', 'gold', 'rare', 600,
 '{"type": "quiz_first_attempt_perfect", "count": 20}'::jsonb, true, 20, 30);

-- Cumulative Points Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('scholar-bronze', 'Scholar (Bronze)', 'Earn 500 quiz points', 'GraduationCap', 'text-amber-600', 'academic', 'bronze', 'common', 100,
 '{"type": "quiz_points_earned", "points": 500}'::jsonb, true, 500, 40),

('scholar-silver', 'Scholar (Silver)', 'Earn 1500 quiz points', 'GraduationCap', 'text-gray-400', 'academic', 'silver', 'uncommon', 300,
 '{"type": "quiz_points_earned", "points": 1500}'::jsonb, true, 1500, 41),

('scholar-gold', 'Scholar (Gold)', 'Earn 3000 quiz points', 'GraduationCap', 'text-yellow-500', 'academic', 'gold', 'rare', 600,
 '{"type": "quiz_points_earned", "points": 3000}'::jsonb, true, 3000, 42),

('scholar-platinum', 'Scholar (Platinum)', 'Earn 5000 quiz points', 'GraduationCap', 'text-cyan-400', 'academic', 'platinum', 'epic', 1000,
 '{"type": "quiz_points_earned", "points": 5000}'::jsonb, true, 5000, 43);

-- ============================================================================
-- PARTICIPATION BADGES
-- ============================================================================

-- Login Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('early-bird', 'Early Bird', 'Login before 7 AM on 10 different days', 'Sunrise', 'text-orange-400', 'participation', 'bronze', 'uncommon', 100,
 '{"type": "early_login", "count": 10, "before_hour": 7}'::jsonb, true, 10, 100),

('night-owl', 'Night Owl', 'Study after 9 PM on 10 different days', 'Moon', 'text-indigo-400', 'participation', 'bronze', 'uncommon', 100,
 '{"type": "late_activity", "count": 10, "after_hour": 21}'::jsonb, true, 10, 101);

-- Club Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('club-member', 'Club Member', 'Join your first club', 'Users', 'text-green-500', 'participation', 'bronze', 'common', 50,
 '{"type": "club_joined", "count": 1}'::jsonb, false, NULL, 110),

('club-enthusiast', 'Club Enthusiast', 'Join 3 different clubs', 'Users', 'text-green-600', 'participation', 'silver', 'uncommon', 150,
 '{"type": "club_joined", "count": 3}'::jsonb, true, 3, 111),

('club-leader', 'Club Leader', 'Become an officer in a club', 'Shield', 'text-purple-500', 'participation', 'gold', 'rare', 400,
 '{"type": "club_officer", "count": 1}'::jsonb, false, NULL, 112);

-- Event Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('event-goer', 'Event Goer', 'Attend 5 school events', 'Calendar', 'text-blue-500', 'participation', 'bronze', 'common', 100,
 '{"type": "event_attended", "count": 5}'::jsonb, true, 5, 120),

('event-enthusiast', 'Event Enthusiast', 'Attend 15 school events', 'CalendarCheck', 'text-blue-600', 'participation', 'silver', 'uncommon', 300,
 '{"type": "event_attended", "count": 15}'::jsonb, true, 15, 121),

('event-champion', 'Event Champion', 'Attend 30 school events', 'CalendarHeart', 'text-blue-700', 'participation', 'gold', 'rare', 600,
 '{"type": "event_attended", "count": 30}'::jsonb, true, 30, 122);

-- Journalism/Publishing Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('junior-journalist', 'Junior Journalist', 'Publish your first article', 'Pen', 'text-purple-500', 'participation', 'bronze', 'uncommon', 100,
 '{"type": "article_published", "count": 1}'::jsonb, false, NULL, 130),

('journalist', 'Journalist', 'Publish 10 articles', 'Newspaper', 'text-purple-600', 'participation', 'silver', 'rare', 300,
 '{"type": "article_published", "count": 10}'::jsonb, true, 10, 131),

('senior-journalist', 'Senior Journalist', 'Publish 25 articles', 'BookText', 'text-purple-700', 'participation', 'gold', 'epic', 750,
 '{"type": "article_published", "count": 25}'::jsonb, true, 25, 132);

-- Module Engagement Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('avid-learner', 'Avid Learner', 'Download 20 learning modules', 'Download', 'text-teal-500', 'participation', 'bronze', 'common', 100,
 '{"type": "module_downloaded", "count": 20}'::jsonb, true, 20, 140);

-- ============================================================================
-- STREAK BADGES
-- ============================================================================

INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('streak-3-day', '3-Day Streak', 'Maintain a 3-day login streak', 'Flame', 'text-orange-400', 'streak', 'bronze', 'common', 30,
 '{"type": "streak_milestone", "days": 3}'::jsonb, false, NULL, 200),

('streak-week', 'Week Warrior', 'Maintain a 7-day login streak', 'Flame', 'text-orange-500', 'streak', 'bronze', 'common', 70,
 '{"type": "streak_milestone", "days": 7}'::jsonb, false, NULL, 201),

('streak-two-weeks', 'Two Week Champion', 'Maintain a 14-day login streak', 'Flame', 'text-orange-600', 'streak', 'silver', 'uncommon', 150,
 '{"type": "streak_milestone", "days": 14}'::jsonb, false, NULL, 202),

('streak-month', 'Monthly Master', 'Maintain a 30-day login streak', 'Flame', 'text-red-500', 'streak', 'silver', 'uncommon', 300,
 '{"type": "streak_milestone", "days": 30}'::jsonb, false, NULL, 203),

('streak-quarter', 'Quarterly Champion', 'Maintain a 90-day login streak', 'Flame', 'text-red-600', 'streak', 'gold', 'rare', 1000,
 '{"type": "streak_milestone", "days": 90}'::jsonb, false, NULL, 204),

('streak-half-year', 'Half-Year Hero', 'Maintain a 180-day login streak', 'Flame', 'text-red-700', 'streak', 'platinum', 'epic', 2000,
 '{"type": "streak_milestone", "days": 180}'::jsonb, false, NULL, 205),

('streak-year', 'Yearly Legend', 'Maintain a 365-day login streak', 'Flame', 'text-yellow-500', 'streak', 'diamond', 'legendary', 5000,
 '{"type": "streak_milestone", "days": 365}'::jsonb, false, NULL, 206);

-- Streak Recovery
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('comeback-king', 'Comeback King/Queen', 'Rebuild a 30+ day streak after losing one', 'TrendingUp', 'text-green-500', 'streak', 'silver', 'uncommon', 400,
 '{"type": "streak_rebuilt", "days": 30}'::jsonb, false, NULL, 210);

-- ============================================================================
-- SOCIAL BADGES
-- ============================================================================

INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('helper', 'Helpful Friend', 'Help 5 peers (teacher-awarded)', 'Heart', 'text-pink-500', 'social', 'bronze', 'uncommon', 100,
 '{"type": "peer_help", "count": 5}'::jsonb, true, 5, 300),

('mentor', 'Peer Mentor', 'Help 20 peers (teacher-awarded)', 'HeartHandshake', 'text-pink-600', 'social', 'silver', 'rare', 400,
 '{"type": "peer_help", "count": 20}'::jsonb, true, 20, 301),

('inspiration', 'Inspiration', 'Help 50 peers (teacher-awarded)', 'Sparkles', 'text-pink-700', 'social', 'gold', 'epic', 1000,
 '{"type": "peer_help", "count": 50}'::jsonb, true, 50, 302);

-- ============================================================================
-- LEVEL BADGES
-- ============================================================================

INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('level-10', 'Apprentice (Level 10)', 'Reach level 10', 'Award', 'text-blue-500', 'special', 'bronze', 'common', 200,
 '{"type": "level_reached", "level": 10}'::jsonb, false, NULL, 400),

('level-25', 'Expert (Level 25)', 'Reach level 25', 'Award', 'text-purple-500', 'special', 'silver', 'uncommon', 500,
 '{"type": "level_reached", "level": 25}'::jsonb, false, NULL, 401),

('level-50', 'Master (Level 50)', 'Reach level 50', 'Award', 'text-orange-500', 'special', 'gold', 'rare', 1500,
 '{"type": "level_reached", "level": 50}'::jsonb, false, NULL, 402),

('level-75', 'Legend (Level 75)', 'Reach level 75', 'Award', 'text-red-500', 'special', 'platinum', 'epic', 3000,
 '{"type": "level_reached", "level": 75}'::jsonb, false, NULL, 403),

('level-100', 'Immortal (Level 100)', 'Reach level 100 - The ultimate achievement', 'Crown', 'text-yellow-500', 'special', 'diamond', 'legendary', 10000,
 '{"type": "level_reached", "level": 100}'::jsonb, false, NULL, 404);

-- ============================================================================
-- SPECIAL/RARE BADGES
-- ============================================================================

-- Milestone Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('pioneer', 'Pioneer', 'One of the first 50 students to join the gamification system', 'Rocket', 'text-indigo-500', 'special', 'gold', 'epic', 1000,
 '{"type": "early_adopter", "max_rank": 50}'::jsonb, false, NULL, 500),

('first-100-points', 'Century', 'Earn your first 100 points', 'Target', 'text-blue-500', 'special', 'bronze', 'common', 50,
 '{"type": "points_milestone", "points": 100}'::jsonb, false, NULL, 510),

('first-1000-points', 'Millennium', 'Earn 1000 total points', 'Target', 'text-purple-500', 'special', 'silver', 'uncommon', 200,
 '{"type": "points_milestone", "points": 1000}'::jsonb, false, NULL, 511),

('first-5000-points', 'Elite', 'Earn 5000 total points', 'Target', 'text-orange-500', 'special', 'gold', 'rare', 500,
 '{"type": "points_milestone", "points": 5000}'::jsonb, false, NULL, 512);

-- Leaderboard Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('top-100-global', 'Top 100', 'Reach top 100 in global leaderboard', 'TrendingUp', 'text-green-500', 'special', 'silver', 'uncommon', 500,
 '{"type": "leaderboard_rank", "scope": "global", "max_rank": 100}'::jsonb, false, NULL, 520),

('top-50-global', 'Top 50', 'Reach top 50 in global leaderboard', 'TrendingUp', 'text-green-600', 'special', 'gold', 'rare', 1000,
 '{"type": "leaderboard_rank", "scope": "global", "max_rank": 50}'::jsonb, false, NULL, 521),

('top-10-global', 'Top 10', 'Reach top 10 in global leaderboard', 'TrendingUp', 'text-yellow-500', 'special', 'platinum', 'epic', 2500,
 '{"type": "leaderboard_rank", "scope": "global", "max_rank": 10}'::jsonb, false, NULL, 522),

('rank-1-global', 'Champion', 'Reach #1 in global leaderboard', 'Crown', 'text-yellow-600', 'special', 'diamond', 'legendary', 5000,
 '{"type": "leaderboard_rank", "scope": "global", "max_rank": 1}'::jsonb, false, NULL, 523),

('top-10-grade', 'Grade Top 10', 'Reach top 10 in your grade level', 'Medal', 'text-blue-500', 'special', 'silver', 'uncommon', 400,
 '{"type": "leaderboard_rank", "scope": "grade", "max_rank": 10}'::jsonb, false, NULL, 530),

('rank-1-grade', 'Grade Champion', 'Reach #1 in your grade level', 'Medal', 'text-yellow-500', 'special', 'gold', 'rare', 1000,
 '{"type": "leaderboard_rank", "scope": "grade", "max_rank": 1}'::jsonb, false, NULL, 531),

('rank-1-section', 'Section Champion', 'Reach #1 in your section', 'Award', 'text-green-500', 'special', 'silver', 'uncommon', 300,
 '{"type": "leaderboard_rank", "scope": "section", "max_rank": 1}'::jsonb, false, NULL, 540);

-- GWA Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('honor-student', 'Honor Student', 'Achieve honor roll status', 'GraduationCap', 'text-yellow-500', 'special', 'gold', 'rare', 1000,
 '{"type": "honor_status", "status": "honor"}'::jsonb, false, NULL, 550),

('high-honor-student', 'High Honor Student', 'Achieve high honor roll status', 'GraduationCap', 'text-yellow-600', 'special', 'platinum', 'epic', 2000,
 '{"type": "honor_status", "status": "high_honor"}'::jsonb, false, NULL, 551);

-- Collection Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, display_order) VALUES
('badge-collector', 'Badge Collector', 'Earn 10 different badges', 'Package', 'text-purple-500', 'special', 'silver', 'uncommon', 500,
 '{"type": "badge_count", "count": 10}'::jsonb, true, 10, 560),

('badge-master', 'Badge Master', 'Earn 25 different badges', 'PackageCheck', 'text-purple-600', 'special', 'gold', 'rare', 1500,
 '{"type": "badge_count", "count": 25}'::jsonb, true, 25, 561),

('completionist', 'Completionist', 'Earn all available badges', 'CheckCheck', 'text-rainbow-500', 'special', 'diamond', 'legendary', 10000,
 '{"type": "badge_completion", "percentage": 100}'::jsonb, false, NULL, 562);

-- Hidden/Easter Egg Badges
INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, is_progressive, progress_target, is_hidden, display_order) VALUES
('midnight-scholar', 'Midnight Scholar', 'Complete a quiz at exactly midnight', 'Clock', 'text-indigo-500', 'special', 'gold', 'epic', 500,
 '{"type": "quiz_time", "hour": 0, "minute": 0}'::jsonb, false, NULL, true, 600),

('weekend-warrior', 'Weekend Warrior', 'Maintain a 10-day streak including weekends only', 'Swords', 'text-red-500', 'special', 'gold', 'epic', 750,
 '{"type": "weekend_streak", "days": 10}'::jsonb, false, NULL, true, 601);

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================

-- Success message
DO $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count FROM badges;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Badge seed data loaded successfully!';
  RAISE NOTICE 'Total badges: %', badge_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Categories:';
  RAISE NOTICE '  - Academic: Quiz and learning achievements';
  RAISE NOTICE '  - Participation: Engagement activities';
  RAISE NOTICE '  - Streak: Consistency rewards';
  RAISE NOTICE '  - Social: Helping and collaboration';
  RAISE NOTICE '  - Special: Milestones and rare achievements';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tiers: Bronze, Silver, Gold, Platinum, Diamond';
  RAISE NOTICE 'Rarity: Common, Uncommon, Rare, Epic, Legendary';
  RAISE NOTICE '========================================';
END $$;
