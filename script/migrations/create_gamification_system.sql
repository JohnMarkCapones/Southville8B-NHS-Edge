-- ============================================================================
-- Gamification System Migration
-- Southville 8B NHS Edge
-- Created: 2025-11-20
-- Description: Complete gamification system with points, badges, levels,
--              streaks, and leaderboards
-- ============================================================================

-- ============================================================================
-- 1. STUDENT GAMIFICATION PROFILE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Points & Level
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  level_progress INTEGER NOT NULL DEFAULT 0 CHECK (level_progress >= 0 AND level_progress <= 100),
  points_to_next_level INTEGER NOT NULL DEFAULT 100,

  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,

  -- Statistics
  total_badges INTEGER NOT NULL DEFAULT 0 CHECK (total_badges >= 0),
  quiz_points INTEGER NOT NULL DEFAULT 0 CHECK (quiz_points >= 0),
  activity_points INTEGER NOT NULL DEFAULT 0 CHECK (activity_points >= 0),
  streak_points INTEGER NOT NULL DEFAULT 0 CHECK (streak_points >= 0),
  bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),

  -- Leaderboard Rankings (cached for performance)
  global_rank INTEGER,
  grade_rank INTEGER,
  section_rank INTEGER,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_gamification_student_id ON student_gamification(student_id);
CREATE INDEX IF NOT EXISTS idx_student_gamification_total_points ON student_gamification(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_student_gamification_level ON student_gamification(level DESC);
CREATE INDEX IF NOT EXISTS idx_student_gamification_streak ON student_gamification(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_student_gamification_last_activity ON student_gamification(last_activity_date DESC);

COMMENT ON TABLE student_gamification IS 'Core gamification profile for each student tracking points, level, and streaks';
COMMENT ON COLUMN student_gamification.total_points IS 'Total points earned across all activities';
COMMENT ON COLUMN student_gamification.level IS 'Current level based on total points';
COMMENT ON COLUMN student_gamification.level_progress IS 'Progress to next level (0-100 percentage)';
COMMENT ON COLUMN student_gamification.current_streak IS 'Current consecutive days of activity';
COMMENT ON COLUMN student_gamification.longest_streak IS 'All-time longest streak achieved';

-- ============================================================================
-- 2. BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  badge_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Visual
  icon VARCHAR(100),
  color VARCHAR(50),
  image_url TEXT,

  -- Classification
  category VARCHAR(50) NOT NULL DEFAULT 'academic',
  tier VARCHAR(50) NOT NULL DEFAULT 'bronze',
  rarity VARCHAR(50) NOT NULL DEFAULT 'common',

  -- Rewards
  points_reward INTEGER DEFAULT 0 CHECK (points_reward >= 0),

  -- Criteria (JSON for flexibility)
  criteria JSONB,

  -- Progressive badges
  is_progressive BOOLEAN DEFAULT FALSE,
  progress_target INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_tier ON badges(tier);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_badges_display_order ON badges(display_order);
CREATE INDEX IF NOT EXISTS idx_badges_key ON badges(badge_key);

COMMENT ON TABLE badges IS 'Badge definitions catalog with criteria and rewards';
COMMENT ON COLUMN badges.badge_key IS 'Unique identifier for badge (e.g., quiz-master-bronze)';
COMMENT ON COLUMN badges.criteria IS 'JSON criteria for earning badge (e.g., {"type": "quiz_score", "min_score": 95, "count": 10})';
COMMENT ON COLUMN badges.is_progressive IS 'Whether badge has incremental progress tracking';
COMMENT ON COLUMN badges.is_hidden IS 'Hide badge until earned (secret achievements)';

-- ============================================================================
-- 3. STUDENT BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  -- Progress tracking
  current_progress INTEGER DEFAULT 100 CHECK (current_progress >= 0 AND current_progress <= 100),
  progress_count INTEGER DEFAULT 0 CHECK (progress_count >= 0),

  -- Earned status
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_showcased BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB,

  UNIQUE(student_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_badge_id ON student_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_earned_at ON student_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_badges_showcased ON student_badges(student_id, is_showcased) WHERE is_showcased = TRUE;

COMMENT ON TABLE student_badges IS 'Junction table tracking earned badges per student';
COMMENT ON COLUMN student_badges.current_progress IS '0-100 percentage for progressive badges';
COMMENT ON COLUMN student_badges.progress_count IS 'Actual count for progressive badges (e.g., 7 of 10 quizzes)';
COMMENT ON COLUMN student_badges.is_showcased IS 'Whether student has showcased this badge on profile';

-- ============================================================================
-- 4. POINT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Transaction details
  points INTEGER NOT NULL,
  transaction_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,

  -- Context
  reason TEXT,
  metadata JSONB,

  -- Related entities
  related_entity_id UUID,
  related_entity_type VARCHAR(50),

  -- Attribution
  created_by UUID,
  is_manual BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Balance snapshot (for reconciliation)
  balance_after INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_student_id ON point_transactions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_category ON point_transactions(category);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_related_entity ON point_transactions(related_entity_id, related_entity_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_by ON point_transactions(created_by);

COMMENT ON TABLE point_transactions IS 'Audit trail for all point awards and deductions';
COMMENT ON COLUMN point_transactions.points IS 'Points awarded (positive) or deducted (negative)';
COMMENT ON COLUMN point_transactions.transaction_type IS 'Specific type (e.g., quiz_completion, badge_earned)';
COMMENT ON COLUMN point_transactions.category IS 'Broad category (quiz, activity, streak, bonus, penalty)';
COMMENT ON COLUMN point_transactions.balance_after IS 'Student total points after this transaction';

-- ============================================================================
-- 5. LEADERBOARD CACHE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope
  scope VARCHAR(50) NOT NULL,
  scope_value VARCHAR(100),

  -- Leaderboard data (JSON array of ranked students)
  data JSONB NOT NULL,

  -- Metadata
  total_students INTEGER DEFAULT 0,
  last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(scope, scope_value)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_scope ON leaderboard_cache(scope, scope_value);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_refreshed ON leaderboard_cache(last_refreshed_at DESC);

COMMENT ON TABLE leaderboard_cache IS 'Cached leaderboard data for performance optimization';
COMMENT ON COLUMN leaderboard_cache.scope IS 'Leaderboard type: global, grade, section, daily, weekly, monthly';
COMMENT ON COLUMN leaderboard_cache.scope_value IS 'Scope identifier (e.g., grade level 7, section A)';

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Update timestamp trigger for student_gamification
CREATE OR REPLACE FUNCTION update_student_gamification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_student_gamification_timestamp ON student_gamification;
CREATE TRIGGER trigger_update_student_gamification_timestamp
BEFORE UPDATE ON student_gamification
FOR EACH ROW EXECUTE FUNCTION update_student_gamification_timestamp();

-- Update timestamp trigger for badges
CREATE OR REPLACE FUNCTION update_badges_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_badges_timestamp ON badges;
CREATE TRIGGER trigger_update_badges_timestamp
BEFORE UPDATE ON badges
FOR EACH ROW EXECUTE FUNCTION update_badges_timestamp();

-- Auto-initialize student_gamification when student is created
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

-- Update total_badges count when badge is earned
CREATE OR REPLACE FUNCTION update_total_badges_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE student_gamification
    SET total_badges = total_badges + 1
    WHERE student_id = NEW.student_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE student_gamification
    SET total_badges = GREATEST(0, total_badges - 1)
    WHERE student_id = OLD.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_badges_count ON student_badges;
CREATE TRIGGER trigger_update_total_badges_count
AFTER INSERT OR DELETE ON student_badges
FOR EACH ROW EXECUTE FUNCTION update_total_badges_count();

-- ============================================================================
-- 7. DATABASE FUNCTIONS
-- ============================================================================

-- Function to award points (atomic transaction)
CREATE OR REPLACE FUNCTION award_points_transaction(
  p_student_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR,
  p_category VARCHAR,
  p_reason TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_related_entity_type VARCHAR DEFAULT NULL,
  p_created_by UUID DEFAULT NULL,
  p_is_manual BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
  v_new_total INTEGER;
  v_old_total INTEGER;
  v_category_points INTEGER := 0;
BEGIN
  -- Get current total
  SELECT total_points INTO v_old_total
  FROM student_gamification
  WHERE student_id = p_student_id;

  -- Calculate new total
  v_new_total := v_old_total + p_points;

  -- Ensure non-negative
  IF v_new_total < 0 THEN
    v_new_total := 0;
  END IF;

  -- Update student points and category-specific points
  UPDATE student_gamification
  SET
    total_points = v_new_total,
    quiz_points = CASE WHEN p_category = 'quiz' THEN quiz_points + p_points ELSE quiz_points END,
    activity_points = CASE WHEN p_category = 'activity' THEN activity_points + p_points ELSE activity_points END,
    streak_points = CASE WHEN p_category = 'streak' THEN streak_points + p_points ELSE streak_points END,
    bonus_points = CASE WHEN p_category = 'bonus' THEN bonus_points + p_points ELSE bonus_points END
  WHERE student_id = p_student_id;

  -- Insert transaction record
  INSERT INTO point_transactions (
    student_id, points, transaction_type, category, reason, metadata,
    related_entity_id, related_entity_type, created_by, is_manual, balance_after
  ) VALUES (
    p_student_id, p_points, p_transaction_type, p_category, p_reason, p_metadata,
    p_related_entity_id, p_related_entity_type, p_created_by, p_is_manual, v_new_total
  );

  -- Return result
  RETURN jsonb_build_object(
    'success', TRUE,
    'old_total', v_old_total,
    'new_total', v_new_total,
    'points_awarded', p_points
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION award_points_transaction IS 'Atomically award points and create transaction record';

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION calculate_level(p_total_points INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_level INTEGER := 1;
  v_xp_remaining INTEGER := p_total_points;
  v_xp_for_next_level INTEGER;
  v_current_level_xp INTEGER;
  v_progress INTEGER;
BEGIN
  -- Find current level
  LOOP
    v_xp_for_next_level := ROUND(100 * POWER(v_level, 1.5));

    EXIT WHEN v_xp_remaining < v_xp_for_next_level;

    v_xp_remaining := v_xp_remaining - v_xp_for_next_level;
    v_level := v_level + 1;
  END LOOP;

  -- Calculate progress percentage
  v_xp_for_next_level := ROUND(100 * POWER(v_level, 1.5));
  v_progress := ROUND((v_xp_remaining::FLOAT / v_xp_for_next_level) * 100);

  RETURN jsonb_build_object(
    'level', v_level,
    'current_level_xp', v_xp_remaining,
    'next_level_xp', v_xp_for_next_level,
    'progress', v_progress
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_level IS 'Calculate level, XP, and progress from total points';

-- Function to update student level
CREATE OR REPLACE FUNCTION update_student_level(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_points INTEGER;
  v_level_data JSONB;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current data
  SELECT total_points, level INTO v_total_points, v_old_level
  FROM student_gamification
  WHERE student_id = p_student_id;

  -- Calculate new level
  v_level_data := calculate_level(v_total_points);
  v_new_level := (v_level_data->>'level')::INTEGER;

  -- Update if level changed
  IF v_new_level != v_old_level THEN
    UPDATE student_gamification
    SET
      level = v_new_level,
      level_progress = (v_level_data->>'progress')::INTEGER,
      points_to_next_level = (v_level_data->>'next_level_xp')::INTEGER
    WHERE student_id = p_student_id;
  ELSE
    -- Update progress even if level didn't change
    UPDATE student_gamification
    SET
      level_progress = (v_level_data->>'progress')::INTEGER,
      points_to_next_level = (v_level_data->>'next_level_xp')::INTEGER
    WHERE student_id = p_student_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_student_level IS 'Update student level and progress based on total points';

-- Function to refresh leaderboard cache
CREATE OR REPLACE FUNCTION refresh_leaderboard_cache(
  p_scope VARCHAR,
  p_scope_value VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_data JSONB;
  v_total INTEGER;
BEGIN
  -- Build leaderboard data based on scope
  IF p_scope = 'global' THEN
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'rank', rank,
          'student_id', student_id,
          'name', first_name || ' ' || SUBSTRING(last_name, 1, 1) || '.',
          'grade_level', grade_level,
          'section', section_name,
          'points', total_points,
          'level', level,
          'streak', current_streak,
          'badges', total_badges
        ) ORDER BY rank
      ),
      COUNT(*)
    INTO v_data, v_total
    FROM (
      SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.grade_level,
        sec.name AS section_name,
        sg.total_points,
        sg.level,
        sg.current_streak,
        sg.total_badges,
        RANK() OVER (ORDER BY sg.total_points DESC, sg.level DESC, sg.current_streak DESC) AS rank
      FROM students s
      JOIN student_gamification sg ON s.id = sg.student_id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.deleted_at IS NULL
      LIMIT 100
    ) leaderboard;

  ELSIF p_scope = 'grade' THEN
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'rank', rank,
          'student_id', student_id,
          'name', first_name || ' ' || SUBSTRING(last_name, 1, 1) || '.',
          'section', section_name,
          'points', total_points,
          'level', level,
          'streak', current_streak,
          'badges', total_badges
        ) ORDER BY rank
      ),
      COUNT(*)
    INTO v_data, v_total
    FROM (
      SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        sec.name AS section_name,
        sg.total_points,
        sg.level,
        sg.current_streak,
        sg.total_badges,
        RANK() OVER (ORDER BY sg.total_points DESC, sg.level DESC) AS rank
      FROM students s
      JOIN student_gamification sg ON s.id = sg.student_id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.deleted_at IS NULL
        AND s.grade_level = p_scope_value::INTEGER
      LIMIT 100
    ) leaderboard;

  ELSIF p_scope = 'section' THEN
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'rank', rank,
          'student_id', student_id,
          'name', first_name || ' ' || SUBSTRING(last_name, 1, 1) || '.',
          'points', total_points,
          'level', level,
          'streak', current_streak,
          'badges', total_badges
        ) ORDER BY rank
      ),
      COUNT(*)
    INTO v_data, v_total
    FROM (
      SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        sg.total_points,
        sg.level,
        sg.current_streak,
        sg.total_badges,
        RANK() OVER (ORDER BY sg.total_points DESC, sg.level DESC) AS rank
      FROM students s
      JOIN student_gamification sg ON s.id = sg.student_id
      WHERE s.deleted_at IS NULL
        AND s.section_id = p_scope_value::UUID
      LIMIT 100
    ) leaderboard;
  END IF;

  -- Upsert cache
  INSERT INTO leaderboard_cache (scope, scope_value, data, total_students, last_refreshed_at)
  VALUES (p_scope, p_scope_value, v_data, v_total, NOW())
  ON CONFLICT (scope, scope_value)
  DO UPDATE SET
    data = EXCLUDED.data,
    total_students = EXCLUDED.total_students,
    last_refreshed_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_leaderboard_cache IS 'Refresh cached leaderboard data for given scope';


DROP POLICY IF EXISTS "Students can update own badge showcase" ON student_badges;
CREATE POLICY "Students can update own badge showcase"
  ON student_badges FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s WHERE s.user_id = auth.uid()
    )
  );



-- Create gamification profiles for all existing students
INSERT INTO student_gamification (student_id, last_activity_date)
SELECT id, CURRENT_DATE
FROM students
WHERE deleted_at IS NULL
ON CONFLICT (student_id) DO NOTHING;

-- ============================================================================
-- 10. INITIAL LEADERBOARD CACHE
-- ============================================================================

-- Refresh global leaderboard
SELECT refresh_leaderboard_cache('global');

-- Refresh grade-level leaderboards
SELECT refresh_leaderboard_cache('grade', '7');
SELECT refresh_leaderboard_cache('grade', '8');
SELECT refresh_leaderboard_cache('grade', '9');
SELECT refresh_leaderboard_cache('grade', '10');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Grant necessary permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE ON student_gamification TO authenticated;
-- GRANT SELECT ON badges TO authenticated;
-- GRANT SELECT ON student_badges TO authenticated;
-- GRANT SELECT ON point_transactions TO authenticated;
-- GRANT SELECT ON leaderboard_cache TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Gamification system migration completed successfully!';
  RAISE NOTICE 'Tables created: student_gamification, badges, student_badges, point_transactions, leaderboard_cache';
  RAISE NOTICE 'Functions created: award_points_transaction, calculate_level, update_student_level, refresh_leaderboard_cache';
  RAISE NOTICE 'Triggers created: Auto-initialize student gamification, auto-update badges count';
  RAISE NOTICE 'RLS policies enabled for security';
  RAISE NOTICE 'Next steps: Run seed_badges.sql to populate initial badges';
END $$;
