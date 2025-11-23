-- Migration: Create daily_logins table for tracking user login streaks
-- Run this in your Supabase SQL editor or as a migration

-- Create daily_logins table
CREATE TABLE IF NOT EXISTS public.daily_logins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one login record per user per day
  CONSTRAINT daily_logins_user_date_unique UNIQUE (user_id, login_date)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_logins_user_id ON public.daily_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logins_login_date ON public.daily_logins(login_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logins_user_date ON public.daily_logins(user_id, login_date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own login records
CREATE POLICY "Users can insert their own login records"
ON public.daily_logins
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can select their own login records
CREATE POLICY "Users can select their own login records"
ON public.daily_logins
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Admins can select all login records (for analytics)
CREATE POLICY "Admins can select all login records"
ON public.daily_logins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Admin'
  )
);

-- Add comments
COMMENT ON TABLE public.daily_logins IS 'Tracks daily logins for calculating login streaks';
COMMENT ON COLUMN public.daily_logins.user_id IS 'Reference to the user who logged in';
COMMENT ON COLUMN public.daily_logins.login_date IS 'Date of the login (date-only, no time)';
COMMENT ON COLUMN public.daily_logins.created_at IS 'Timestamp when the login record was created';

