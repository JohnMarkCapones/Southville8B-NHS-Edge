-- Migration: Create alert_reads table for per-user read tracking
-- Run this in your Supabase SQL editor or as a migration

-- Create alert_reads table
CREATE TABLE IF NOT EXISTS public.alert_reads (
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one read record per user per alert
  CONSTRAINT alert_reads_pkey PRIMARY KEY (alert_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_alert_reads_user_id ON public.alert_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_reads_alert_id ON public.alert_reads(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_reads_read_at ON public.alert_reads(read_at);

-- Enable Row Level Security
ALTER TABLE public.alert_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own read records
CREATE POLICY "Users can insert their own alert reads"
ON public.alert_reads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can select their own read records
CREATE POLICY "Users can select their own alert reads"
ON public.alert_reads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Admins can select all read records (for analytics)
CREATE POLICY "Admins can select all alert reads"
ON public.alert_reads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Admin'
  )
);

-- RLS Policy: Users can update their own read records (in case we need to update read_at)
CREATE POLICY "Users can update their own alert reads"
ON public.alert_reads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_reads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER alert_reads_updated_at
  BEFORE UPDATE ON public.alert_reads
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_reads_updated_at();

-- Add comment
COMMENT ON TABLE public.alert_reads IS 'Tracks which users have read which alerts';
COMMENT ON COLUMN public.alert_reads.alert_id IS 'Reference to the alert that was read';
COMMENT ON COLUMN public.alert_reads.user_id IS 'Reference to the user who read the alert';
COMMENT ON COLUMN public.alert_reads.read_at IS 'Timestamp when the alert was marked as read';

