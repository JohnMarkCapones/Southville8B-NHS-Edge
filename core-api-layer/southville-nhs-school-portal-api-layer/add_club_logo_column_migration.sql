-- =====================================================
-- MIGRATION: Add Club Logo Column to clubs table
-- Description: Adds club_logo column to store club logo URL (e.g., Cloudflare Images)
-- Date: 2025-10-29
-- =====================================================

-- Add club_logo column to store the public URL for the club logo
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS club_logo TEXT;

-- Document the column purpose
COMMENT ON COLUMN clubs.club_logo IS 'Public URL to the club logo (e.g., Cloudflare Images)';

-- Permissions can be managed via existing RLS policies; grant statements may be added if needed
-- Example: GRANT UPDATE (club_logo) ON clubs TO authenticated;











