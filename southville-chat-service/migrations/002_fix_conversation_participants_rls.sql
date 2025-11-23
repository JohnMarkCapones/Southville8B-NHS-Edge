-- Fix infinite recursion in conversation_participants RLS policy
-- The original policy queried conversation_participants from within a policy on conversation_participants,
-- causing PostgreSQL error "infinite recursion detected in policy for relation 'conversation_participants'"

-- Create a security definer function to check participation without triggering RLS recursion
-- This function bypasses RLS to check if a user is a participant in a conversation
CREATE OR REPLACE FUNCTION check_user_is_participant(conv_id uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
    AND user_id = user_uuid
  );
END;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

-- Create new policy that avoids recursion by using the security definer function
-- Users can view participants in conversations they're part of
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  USING (
    -- Direct check: user can see their own participant record
    user_id = auth.uid()
    OR
    -- Or they can see other participants if they're in the same conversation
    -- Use security definer function to avoid RLS recursion
    check_user_is_participant(conversation_id, auth.uid())
  );

