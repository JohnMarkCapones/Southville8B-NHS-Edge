-- ========================================
-- CLUB ANNOUNCEMENTS TABLE MIGRATION
-- ========================================
-- Simple CRUD table for club announcements
-- Create, Update, Delete: Teachers & Admins only
-- Read: Everyone can view
-- ========================================

CREATE TABLE IF NOT EXISTS club_announcements (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to clubs
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,

  -- Announcement data
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,

  -- Priority/Importance
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Author tracking
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT club_announcements_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT club_announcements_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Index for fetching announcements by club
CREATE INDEX IF NOT EXISTS idx_club_announcements_club_id
  ON club_announcements(club_id);

-- Index for fetching announcements by creator
CREATE INDEX IF NOT EXISTS idx_club_announcements_created_by
  ON club_announcements(created_by);

-- Composite index for sorting by club and creation date
CREATE INDEX IF NOT EXISTS idx_club_announcements_club_created
  ON club_announcements(club_id, created_at DESC);

-- Index for filtering by priority
CREATE INDEX IF NOT EXISTS idx_club_announcements_priority
  ON club_announcements(priority);

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE club_announcements IS 'Club announcements - CRUD by teachers/admins, viewable by everyone';
COMMENT ON COLUMN club_announcements.id IS 'Unique announcement identifier';
COMMENT ON COLUMN club_announcements.club_id IS 'Foreign key to clubs table';
COMMENT ON COLUMN club_announcements.title IS 'Announcement title (max 200 characters)';
COMMENT ON COLUMN club_announcements.content IS 'Announcement content (text)';
COMMENT ON COLUMN club_announcements.priority IS 'Announcement priority: low, normal, high, urgent';
COMMENT ON COLUMN club_announcements.created_by IS 'User ID of the announcement creator';
COMMENT ON COLUMN club_announcements.created_at IS 'Timestamp when announcement was created';
COMMENT ON COLUMN club_announcements.updated_at IS 'Timestamp when announcement was last updated';

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE club_announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view announcements
CREATE POLICY "Anyone can view club announcements"
  ON club_announcements
  FOR SELECT
  USING (true);

-- Policy: Authenticated users with proper roles can create announcements
-- (Additional authorization will be handled at the API layer)
CREATE POLICY "Teachers and admins can create announcements"
  ON club_announcements
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Creators can update their own announcements
-- (Additional authorization at API layer)
CREATE POLICY "Creators can update their announcements"
  ON club_announcements
  FOR UPDATE
  USING (created_by = auth.uid());

-- Policy: Creators can delete their own announcements
-- (Additional authorization at API layer)
CREATE POLICY "Creators can delete their announcements"
  ON club_announcements
  FOR DELETE
  USING (created_by = auth.uid());

-- ========================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ========================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_club_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_club_announcements_updated_at ON club_announcements;
CREATE TRIGGER trigger_update_club_announcements_updated_at
  BEFORE UPDATE ON club_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_club_announcements_updated_at();

-- ========================================
-- SAMPLE DATA (OPTIONAL - UNCOMMENT TO USE)
-- ========================================

-- Insert sample announcements (replace club_id and created_by with actual IDs)
-- INSERT INTO club_announcements (club_id, title, content, priority, created_by) VALUES
-- ('your-club-id-here', 'Welcome to the Club!', 'We are excited to have you join our community. Stay tuned for upcoming events and activities.', 'high', 'your-user-id-here'),
-- ('your-club-id-here', 'Meeting Reminder', 'Don''t forget about our weekly meeting this Friday at 3 PM in Room 101.', 'normal', 'your-user-id-here'),
-- ('your-club-id-here', 'Project Submission Deadline', 'All project submissions are due by the end of this month. Please submit your work on time.', 'urgent', 'your-user-id-here');

-- ========================================
-- END OF MIGRATION
-- ========================================
