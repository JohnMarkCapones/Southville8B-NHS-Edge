-- ============================================================================
-- QUICK FIX: Gamification System - Essential Tables Only
-- Run this first to get the system working
-- ============================================================================

-- 1. Create student_gamification table
CREATE TABLE IF NOT EXISTS student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  level_progress INTEGER NOT NULL DEFAULT 0 CHECK (level_progress >= 0 AND level_progress <= 100),
  points_to_next_level INTEGER NOT NULL DEFAULT 100,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  total_badges INTEGER NOT NULL DEFAULT 0 CHECK (total_badges >= 0),
  quiz_points INTEGER NOT NULL DEFAULT 0 CHECK (quiz_points >= 0),
  activity_points INTEGER NOT NULL DEFAULT 0 CHECK (activity_points >= 0),
  streak_points INTEGER NOT NULL DEFAULT 0 CHECK (streak_points >= 0),
  bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
  global_rank INTEGER,
  grade_rank INTEGER,
  section_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

-- 2. Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(50),
  image_url TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'academic',
  tier VARCHAR(50) NOT NULL DEFAULT 'bronze',
  rarity VARCHAR(50) NOT NULL DEFAULT 'common',
  points_reward INTEGER DEFAULT 0 CHECK (points_reward >= 0),
  criteria JSONB,
  is_progressive BOOLEAN DEFAULT FALSE,
  progress_target INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create student_badges table
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 100 CHECK (current_progress >= 0 AND current_progress <= 100),
  progress_count INTEGER DEFAULT 0 CHECK (progress_count >= 0),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_showcased BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  UNIQUE(student_id, badge_id)
);

-- 4. Create point_transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  reason TEXT,
  metadata JSONB,
  related_entity_id UUID,
  related_entity_type VARCHAR(50),
  created_by UUID,
  is_manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance_after INTEGER
);

-- 5. Create leaderboard_cache table
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR(50) NOT NULL,
  scope_value VARCHAR(100),
  data JSONB NOT NULL,
  total_students INTEGER DEFAULT 0,
  last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scope, scope_value)
);

-- 6. Add essential indexes
CREATE INDEX IF NOT EXISTS idx_student_gamification_student_id ON student_gamification(student_id);
CREATE INDEX IF NOT EXISTS idx_student_gamification_total_points ON student_gamification(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_student_id ON point_transactions(student_id, created_at DESC);

-- 7. Enable RLS
ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (simple read-all for now)
DROP POLICY IF EXISTS "Students can view all gamification data" ON student_gamification;
CREATE POLICY "Students can view all gamification data"
  ON student_gamification FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view active badges" ON badges;
CREATE POLICY "Anyone can view active badges"
  ON badges FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Students can view all badges" ON student_badges;
CREATE POLICY "Students can view all badges"
  ON student_badges FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Students can view all transactions" ON point_transactions;
CREATE POLICY "Students can view all transactions"
  ON point_transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_cache;
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_cache FOR SELECT TO authenticated USING (true);

-- 9. **CRITICAL**: Initialize profiles for EXISTING students
INSERT INTO student_gamification (student_id, last_activity_date)
SELECT id, CURRENT_DATE
FROM students
WHERE deleted_at IS NULL
ON CONFLICT (student_id) DO NOTHING;

-- 10. Auto-initialize for NEW students (trigger)
CREATE OR REPLACE FUNCTION initialize_student_gamification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_gamification (student_id, last_activity_date)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (student_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_initialize_student_gamification ON students;
CREATE TRIGGER trigger_initialize_student_gamification
AFTER INSERT ON students
FOR EACH ROW EXECUTE FUNCTION initialize_student_gamification();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Gamification tables created successfully!';
  RAISE NOTICE '✅ Existing students initialized!';
  RAISE NOTICE 'Next: Run seed_badges.sql to add badges';
END $$;
