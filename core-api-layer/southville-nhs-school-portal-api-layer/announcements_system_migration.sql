-- ============================================
-- ANNOUNCEMENTS SYSTEM MIGRATION
-- School-wide Announcements + Banner Notifications
-- ============================================

-- ============================================
-- STEP 1: CREATE ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Creator (Admin or Teacher)
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title varchar(255) NOT NULL,
  content text NOT NULL,

  -- Scheduling & Expiration
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Optional expiration

  -- Classification
  type varchar(50), -- e.g., 'event', 'academic', 'emergency', 'general'

  -- Visibility control
  visibility varchar(50) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),

  -- Constraints
  CONSTRAINT valid_title_length CHECK (char_length(title) >= 3),
  CONSTRAINT valid_content_length CHECK (char_length(content) >= 10)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcements_user ON announcements(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON announcements(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_visibility ON announcements(visibility);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type) WHERE type IS NOT NULL;

-- Full-text search on content
CREATE INDEX IF NOT EXISTS idx_announcements_content_fts ON announcements USING gin(to_tsvector('english', content));

-- Foreign key name for reference in service
ALTER TABLE announcements
  DROP CONSTRAINT IF EXISTS fk_user,
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 2: CREATE ANNOUNCEMENT_TARGETS TABLE
-- (Many-to-Many: Announcements -> Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS announcement_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),

  -- Prevent duplicate targets
  UNIQUE(announcement_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_targets_announcement ON announcement_targets(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_targets_role ON announcement_targets(role_id);

-- ============================================
-- STEP 3: CREATE ANNOUNCEMENT_TAGS TABLE
-- (Many-to-Many: Announcements -> Tags)
-- Note: Reuses 'tags' table from news system
-- ============================================
CREATE TABLE IF NOT EXISTS announcement_tags (
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),

  PRIMARY KEY (announcement_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_tags_announcement ON announcement_tags(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_tags_tag ON announcement_tags(tag_id);

-- ============================================
-- STEP 4: CREATE BANNER_NOTIFICATIONS TABLE
-- (For top-of-page banner alerts)
-- ============================================
CREATE TABLE IF NOT EXISTS banner_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  message text NOT NULL,
  short_message varchar(255) NOT NULL,

  -- Visual styling
  type varchar(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'destructive')),

  -- Behavior
  is_active boolean DEFAULT false,
  is_dismissible boolean DEFAULT true,
  has_action boolean DEFAULT false,
  action_label varchar(100),
  action_url varchar(500),

  -- Scheduling
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,

  -- Metadata
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template varchar(100), -- e.g., 'Weather Alert', 'Achievement', 'Event Reminder'

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_message_length CHECK (char_length(message) >= 10),
  CONSTRAINT valid_short_message_length CHECK (char_length(short_message) >= 5),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT valid_action_url CHECK (
    (has_action = true AND action_label IS NOT NULL AND action_url IS NOT NULL)
    OR
    (has_action = false)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_banner_notifications_active ON banner_notifications(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banner_notifications_dates ON banner_notifications(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banner_notifications_created_by ON banner_notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_banner_notifications_type ON banner_notifications(type);

-- ============================================
-- STEP 5: CREATE AUDIT LOG FOR ANNOUNCEMENTS
-- (Optional: Track who viewed announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS announcement_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),

  -- Prevent duplicate view counts per user
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_views_announcement ON announcement_views(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_user ON announcement_views(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_date ON announcement_views(viewed_at DESC);

-- ============================================
-- STEP 6: ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public announcements
CREATE POLICY announcements_public_read ON announcements
  FOR SELECT
  USING (visibility = 'public' AND (expires_at IS NULL OR expires_at > now()));

-- Policy: Authenticated users can read their role-targeted announcements
CREATE POLICY announcements_role_targeted_read ON announcements
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM users u
      INNER JOIN announcement_targets at ON at.role_id = u.role_id
      WHERE at.announcement_id = announcements.id
    )
  );

-- Policy: Admins and Teachers can create announcements
CREATE POLICY announcements_create ON announcements
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role_id IN (
        SELECT id FROM roles WHERE name IN ('Admin', 'Teacher')
      )
    )
  );

-- Policy: Admins can update/delete any announcement, Teachers only their own
CREATE POLICY announcements_update ON announcements
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM users WHERE role_id IN (
        SELECT id FROM roles WHERE name = 'Admin'
      )
    )
  );

CREATE POLICY announcements_delete ON announcements
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role_id IN (
        SELECT id FROM roles WHERE name = 'Admin'
      )
    )
  );

-- Enable RLS on banner_notifications
ALTER TABLE banner_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active banners within date range
CREATE POLICY banner_notifications_public_read ON banner_notifications
  FOR SELECT
  USING (is_active = true AND now() >= start_date AND now() <= end_date);

-- Policy: Only Admins can manage banners
CREATE POLICY banner_notifications_admin_all ON banner_notifications
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role_id IN (
        SELECT id FROM roles WHERE name = 'Admin'
      )
    )
  );

-- Enable RLS on announcement_targets
ALTER TABLE announcement_targets ENABLE ROW LEVEL SECURITY;

-- Policy: Public read for announcement targets
CREATE POLICY announcement_targets_read ON announcement_targets
  FOR SELECT
  USING (true);

-- Policy: Only creators and admins can manage targets
CREATE POLICY announcement_targets_manage ON announcement_targets
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM announcements WHERE id = announcement_id
    ) OR
    auth.uid() IN (
      SELECT id FROM users WHERE role_id IN (
        SELECT id FROM roles WHERE name = 'Admin'
      )
    )
  );

-- Enable RLS on announcement_tags
ALTER TABLE announcement_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Public read
CREATE POLICY announcement_tags_read ON announcement_tags
  FOR SELECT
  USING (true);

-- Policy: Only creators and admins can manage tags
CREATE POLICY announcement_tags_manage ON announcement_tags
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM announcements WHERE id = announcement_id
    ) OR
    auth.uid() IN (
      SELECT id FROM users WHERE role_id IN (
        SELECT id FROM roles WHERE name = 'Admin'
      )
    )
  );

-- Enable RLS on announcement_views
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own views
CREATE POLICY announcement_views_own_read ON announcement_views
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own views
CREATE POLICY announcement_views_insert ON announcement_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get active banners
CREATE OR REPLACE FUNCTION get_active_banners()
RETURNS TABLE (
  id uuid,
  message text,
  short_message varchar,
  type varchar,
  is_dismissible boolean,
  has_action boolean,
  action_label varchar,
  action_url varchar
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bn.id,
    bn.message,
    bn.short_message,
    bn.type,
    bn.is_dismissible,
    bn.has_action,
    bn.action_label,
    bn.action_url
  FROM banner_notifications bn
  WHERE bn.is_active = true
    AND now() >= bn.start_date
    AND now() <= bn.end_date
  ORDER BY bn.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if announcement is expired
CREATE OR REPLACE FUNCTION is_announcement_expired(announcement_id uuid)
RETURNS boolean AS $$
DECLARE
  exp_date timestamptz;
BEGIN
  SELECT expires_at INTO exp_date
  FROM announcements
  WHERE id = announcement_id;

  IF exp_date IS NULL THEN
    RETURN false;
  END IF;

  RETURN now() > exp_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 8: SEED SAMPLE DATA (OPTIONAL)
-- ============================================

-- Sample announcement types
COMMENT ON COLUMN announcements.type IS 'Announcement type: event, academic, emergency, general, maintenance, etc.';

-- Sample banner templates
COMMENT ON COLUMN banner_notifications.template IS 'Banner template: Weather Alert, Achievement, Event Reminder, System Notice, etc.';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
--   1. announcements
--   2. announcement_targets
--   3. announcement_tags
--   4. banner_notifications
--   5. announcement_views
--
-- RLS policies enabled for security
-- Helper functions created for common queries
-- ============================================
