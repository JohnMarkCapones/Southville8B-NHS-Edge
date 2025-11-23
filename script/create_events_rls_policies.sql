-- ========================================
-- Create RLS Policies for Events Table
-- ========================================
-- This migration creates Row-Level Security policies for the events table
-- to allow proper access control for different roles.
--
-- Policies:
-- 1. Anyone can view non-deleted published events (SELECT)
-- 2. Admin, Super Admin, and Teacher can manage events (INSERT, UPDATE, DELETE)
-- ========================================

-- First, check if RLS is enabled (run this to verify)
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'events';

-- Enable RLS on events table (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Admins and Teachers can manage events" ON events;

-- Policy 1: Allow everyone to view non-deleted events
-- This is important for public viewing of events
CREATE POLICY "Anyone can view non-deleted events"
ON events
FOR SELECT
USING (deleted_at IS NULL);

-- Policy 2: Allow Admin, Super Admin, and Teacher to INSERT, UPDATE, DELETE events
-- This allows teachers to create, edit, and delete events for their clubs
CREATE POLICY "Admins and Teachers can manage events"
ON events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('Admin', 'Super Admin', 'Teacher')
  )
  AND deleted_at IS NULL
);

-- Add comments to document the policies
COMMENT ON POLICY "Anyone can view non-deleted events" ON events IS
'Allows anyone (including unauthenticated users) to view events that have not been soft-deleted.';

COMMENT ON POLICY "Admins and Teachers can manage events" ON events IS
'Allows Admin, Super Admin, and Teacher roles to INSERT, UPDATE, and DELETE events. Only non-deleted events can be managed.';

-- ========================================
-- Verification Queries
-- ========================================

-- 1. Check if RLS is enabled
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'events';

-- 2. List all policies on events table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;

-- 3. Test query to see what you can access
-- (Run this as your teacher user to test)
-- SELECT id, title, status FROM events WHERE deleted_at IS NULL LIMIT 5;

-- ========================================
-- Rollback Script (if needed)
-- ========================================
/*
-- CAUTION: This will remove RLS and all policies from the events table

DROP POLICY IF EXISTS "Anyone can view non-deleted events" ON events;
DROP POLICY IF EXISTS "Admins and Teachers can manage events" ON events;

-- Optionally disable RLS entirely (not recommended for production)
-- ALTER TABLE events DISABLE ROW LEVEL SECURITY;
*/
