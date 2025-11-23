-- =====================================================
-- MIGRATION: Add Club Image Column to clubs table
-- Description: Adds club_image column to store club logos/images from Cloudflare Images
-- Date: 2025-10-29
-- =====================================================

-- Add club_image column to store the Cloudflare Images URL
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS club_image TEXT;

-- Add comment to document the column
COMMENT ON COLUMN clubs.club_image IS 'Public URL to the club logo/image stored in Cloudflare Images';

-- Grant necessary permissions (adjust roles as needed)
-- Example: GRANT UPDATE ON clubs TO authenticated;
