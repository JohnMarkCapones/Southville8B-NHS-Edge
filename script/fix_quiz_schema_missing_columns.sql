-- =====================================================
-- Fix Quiz System Schema - Add Missing Columns
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Fix quiz_questions table
-- =====================================================
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS correct_answer JSONB;

ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS settings JSONB;

-- =====================================================
-- 2. Fix quiz_active_sessions table
-- =====================================================
ALTER TABLE quiz_active_sessions
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ;

ALTER TABLE quiz_active_sessions
ADD COLUMN IF NOT EXISTS current_device_fingerprint TEXT;

ALTER TABLE quiz_active_sessions
ADD COLUMN IF NOT EXISTS current_ip_address INET;

ALTER TABLE quiz_active_sessions
ADD COLUMN IF NOT EXISTS current_user_agent TEXT;

ALTER TABLE quiz_active_sessions
ADD COLUMN IF NOT EXISTS terminated_reason TEXT;

-- =====================================================
-- Verify columns were added
-- =====================================================
SELECT 'quiz_questions columns:' as info, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
AND column_name IN ('correct_answer', 'settings')

UNION ALL

SELECT 'quiz_active_sessions columns:' as info, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quiz_active_sessions'
AND column_name IN (
  'last_heartbeat',
  'current_device_fingerprint', 
  'current_ip_address',
  'current_user_agent',
  'terminated_reason'
)
ORDER BY info, column_name;
