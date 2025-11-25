-- ============================================================================
-- QUICK: Essential Badges Seed (Just 10 badges to get started)
-- ============================================================================

INSERT INTO badges (badge_key, name, description, icon, color, category, tier, rarity, points_reward, criteria, display_order) VALUES
-- Quiz badges
('quiz-novice', 'Quiz Novice', 'Complete your first 5 quizzes', 'BookOpen', 'text-blue-500', 'academic', 'bronze', 'common', 50,
 '{"type": "quiz_completion", "count": 5}'::jsonb, 1),

('first-perfect', 'First Perfect!', 'Achieve your first perfect quiz score', 'Star', 'text-yellow-500', 'academic', 'bronze', 'common', 100,
 '{"type": "quiz_perfect_score", "count": 1}'::jsonb, 10),

-- Streak badges
('streak-week', 'Week Warrior', 'Maintain a 7-day login streak', 'Flame', 'text-orange-500', 'streak', 'bronze', 'common', 70,
 '{"type": "streak_milestone", "days": 7}'::jsonb, 200),

('streak-month', 'Monthly Master', 'Maintain a 30-day login streak', 'Flame', 'text-red-500', 'streak', 'silver', 'uncommon', 300,
 '{"type": "streak_milestone", "days": 30}'::jsonb, 203),

-- Participation badges
('club-member', 'Club Member', 'Join your first club', 'Users', 'text-green-500', 'participation', 'bronze', 'common', 50,
 '{"type": "club_joined", "count": 1}'::jsonb, 110),

('event-goer', 'Event Goer', 'Attend 5 school events', 'Calendar', 'text-blue-500', 'participation', 'bronze', 'common', 100,
 '{"type": "event_attended", "count": 5}'::jsonb, 120),

-- Level badges
('level-10', 'Apprentice (Level 10)', 'Reach level 10', 'Award', 'text-blue-500', 'special', 'bronze', 'common', 200,
 '{"type": "level_reached", "level": 10}'::jsonb, 400),

-- Milestone badges
('first-100-points', 'Century', 'Earn your first 100 points', 'Target', 'text-blue-500', 'special', 'bronze', 'common', 50,
 '{"type": "points_milestone", "points": 100}'::jsonb, 510),

-- Leaderboard badges
('top-10-section', 'Section Star', 'Reach top 10 in your section', 'Award', 'text-green-500', 'special', 'silver', 'uncommon', 200,
 '{"type": "leaderboard_rank", "scope": "section", "max_rank": 10}'::jsonb, 540),

-- Social badges
('helper', 'Helpful Friend', 'Help 5 peers (teacher-awarded)', 'Heart', 'text-pink-500', 'social', 'bronze', 'uncommon', 100,
 '{"type": "peer_help", "count": 5}'::jsonb, 300)

ON CONFLICT (badge_key) DO NOTHING;

-- Success message
DO $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count FROM badges;
  RAISE NOTICE '✅ Badges seeded successfully!';
  RAISE NOTICE 'Total badges in database: %', badge_count;
END $$;
