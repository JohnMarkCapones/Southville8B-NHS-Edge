-- ========================================
-- Fix Events RLS Policy: Allow Teachers to Delete
-- ========================================
-- This migration updates the RLS policy on the events table to allow
-- teachers (in addition to admins) to manage (INSERT, UPDATE, DELETE) events.
--
-- Issue: The current "Admins can manage events" policy only allows
-- users with 'Admin' or 'Super Admin' roles to perform write operations.
-- Teachers need to be able to delete events they create for their clubs.
--
-- Solution: Update the policy to include 'Teacher' role.
-- ========================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Recreate the policy with Teacher role included
CREATE POLICY "Admins and Teachers can manage events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.name IN ('Admin', 'Super Admin', 'Teacher')
  )
  AND deleted_at IS NULL
);

-- Add comment to document the policy
COMMENT ON POLICY "Admins and Teachers can manage events" ON events IS
'Allows Admin, Super Admin, and Teacher roles to INSERT, UPDATE, and DELETE events. Only non-deleted events can be managed.';

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the policy was created:
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;
