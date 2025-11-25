-- ================================================================
-- SIMPLIFIED SCHOOL GALLERY SYSTEM - DATABASE MIGRATION
-- ================================================================
-- Purpose: Simple photo/video gallery without album complexity
-- Storage: Cloudflare R2 for files, PostgreSQL for metadata
-- Features: Photos/videos, tags, analytics, soft delete
-- Date: 2025-10-22
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE 1: gallery_items (Photos/Videos)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  -- Core fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File storage (R2)
  file_url TEXT NOT NULL,
  r2_file_key TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  r2_thumbnail_key TEXT,

  -- File metadata
  original_filename VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  media_type VARCHAR(20) NOT NULL,

  -- Display metadata
  title VARCHAR(255),
  caption TEXT,
  alt_text VARCHAR(500),

  -- Organization
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,

  -- Attribution
  photographer_name VARCHAR(255),
  photographer_credit TEXT,
  taken_at TIMESTAMPTZ,
  location VARCHAR(255),

  -- Stats
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,

  -- Audit fields
  uploaded_by UUID NOT NULL,
  updated_by UUID,
  deleted_by UUID,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT gallery_items_media_type_check CHECK (media_type IN ('image', 'video')),
  CONSTRAINT gallery_items_file_size_check CHECK (file_size_bytes > 0),
  CONSTRAINT gallery_items_dimensions_check CHECK (
    (width IS NULL AND height IS NULL) OR (width > 0 AND height > 0)
  ),
  CONSTRAINT gallery_items_duration_check CHECK (
    (media_type = 'image' AND duration_seconds IS NULL) OR
    (media_type = 'video' AND (duration_seconds IS NULL OR duration_seconds > 0))
  )
);

-- Indexes for gallery_items
CREATE INDEX idx_gallery_items_media_type ON gallery_items(media_type) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_category ON gallery_items(category) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_taken_at ON gallery_items(taken_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_featured ON gallery_items(is_featured) WHERE is_deleted = false AND is_featured = true;
CREATE INDEX idx_gallery_items_r2_key ON gallery_items(r2_file_key);
CREATE INDEX idx_gallery_items_uploaded_by ON gallery_items(uploaded_by);
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_event_date ON gallery_items(event_date DESC) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_display_order ON gallery_items(display_order) WHERE is_deleted = false;

-- Comments
COMMENT ON TABLE gallery_items IS 'Photos and videos in the school gallery';
COMMENT ON COLUMN gallery_items.r2_file_key IS 'Internal R2 storage path (e.g., gallery/uuid-filename.jpg)';
COMMENT ON COLUMN gallery_items.media_type IS 'Type: image or video';
COMMENT ON COLUMN gallery_items.display_order IS 'Order for displaying items (for sorting)';
COMMENT ON COLUMN gallery_items.is_featured IS 'Whether this item is featured on homepage';
COMMENT ON COLUMN gallery_items.category IS 'Item category: events, departments, achievements, campus_life, sports, academics, other';
COMMENT ON COLUMN gallery_items.alt_text IS 'Accessibility description for screen readers';

-- ================================================================
-- TABLE 2: gallery_tags (Tags for categorization)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20),
  usage_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT gallery_tags_name_length CHECK (char_length(name) >= 2),
  CONSTRAINT gallery_tags_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- Indexes for gallery_tags
CREATE INDEX idx_gallery_tags_usage ON gallery_tags(usage_count DESC);
CREATE INDEX idx_gallery_tags_slug ON gallery_tags(slug);
CREATE INDEX idx_gallery_tags_name ON gallery_tags(name);

-- Comments
COMMENT ON TABLE gallery_tags IS 'Reusable tags for categorizing gallery items';
COMMENT ON COLUMN gallery_tags.usage_count IS 'Denormalized count of items with this tag';

-- ================================================================
-- TABLE 3: gallery_item_tags (Many-to-many relationship)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  tag_id UUID NOT NULL,

  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate tags on same item
  UNIQUE(item_id, tag_id),

  -- Foreign keys
  CONSTRAINT fk_gallery_item_tags_item
    FOREIGN KEY (item_id)
    REFERENCES gallery_items(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_gallery_item_tags_tag
    FOREIGN KEY (tag_id)
    REFERENCES gallery_tags(id)
    ON DELETE CASCADE
);

-- Indexes for gallery_item_tags
CREATE INDEX idx_gallery_item_tags_item ON gallery_item_tags(item_id);
CREATE INDEX idx_gallery_item_tags_tag ON gallery_item_tags(tag_id);

-- Comments
COMMENT ON TABLE gallery_item_tags IS 'Junction table linking gallery items to tags (many-to-many)';

-- ================================================================
-- TABLE 4: gallery_downloads (Download tracking for analytics)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  user_id UUID,

  ip_address INET,
  user_agent TEXT,

  success BOOLEAN DEFAULT true,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT gallery_downloads_user_or_ip CHECK (
    user_id IS NOT NULL OR ip_address IS NOT NULL
  ),

  -- Foreign key
  CONSTRAINT fk_gallery_downloads_item
    FOREIGN KEY (item_id)
    REFERENCES gallery_items(id)
    ON DELETE CASCADE
);

-- Indexes for gallery_downloads
CREATE INDEX idx_gallery_downloads_item ON gallery_downloads(item_id, downloaded_at DESC);
CREATE INDEX idx_gallery_downloads_user ON gallery_downloads(user_id, downloaded_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_gallery_downloads_date ON gallery_downloads(downloaded_at DESC);

-- Comments
COMMENT ON TABLE gallery_downloads IS 'Track downloads for analytics (supports guest downloads via IP)';
COMMENT ON COLUMN gallery_downloads.user_id IS 'NULL for guest downloads';

-- ================================================================
-- TABLE 5: gallery_views (View tracking - optional for analytics)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,

  user_id UUID,
  ip_address INET,

  viewed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key
  CONSTRAINT fk_gallery_views_item
    FOREIGN KEY (item_id)
    REFERENCES gallery_items(id)
    ON DELETE CASCADE
);

-- Indexes for gallery_views
CREATE INDEX idx_gallery_views_item ON gallery_views(item_id, viewed_at DESC);
CREATE INDEX idx_gallery_views_user ON gallery_views(user_id, viewed_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_gallery_views_date ON gallery_views(viewed_at DESC);

-- Comments
COMMENT ON TABLE gallery_views IS 'Track item views for analytics';

-- ================================================================
-- TRIGGERS: Auto-update timestamps
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for gallery_items
DROP TRIGGER IF EXISTS trigger_gallery_items_updated_at ON gallery_items;
CREATE TRIGGER trigger_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- TRIGGERS: Auto-update denormalized counts
-- ================================================================

-- Function to update tag usage_count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE gallery_tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    UPDATE gallery_tags
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.tag_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag usage_count
DROP TRIGGER IF EXISTS trigger_update_tag_usage_count ON gallery_item_tags;
CREATE TRIGGER trigger_update_tag_usage_count
  AFTER INSERT OR DELETE ON gallery_item_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- ================================================================
-- SEED DATA: Sample tags
-- ================================================================

INSERT INTO gallery_tags (name, slug, description, color) VALUES
  ('Events', 'events', 'School events and activities', '#3B82F6'),
  ('Sports', 'sports', 'Athletic activities and competitions', '#10B981'),
  ('Academics', 'academics', 'Academic achievements and classroom activities', '#F59E0B'),
  ('Campus Life', 'campus-life', 'Daily life on campus', '#8B5CF6'),
  ('Graduation', 'graduation', 'Graduation ceremonies', '#EF4444'),
  ('Competitions', 'competitions', 'Academic and non-academic competitions', '#EC4899'),
  ('Science Fair', 'science-fair', 'Science fair projects and exhibitions', '#06B6D4'),
  ('Cultural Festival', 'cultural-festival', 'Cultural celebrations and festivals', '#F97316'),
  ('Student Council', 'student-council', 'Student government activities', '#6366F1'),
  ('Field Trip', 'field-trip', 'Educational field trips', '#14B8A6')
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'gallery_%'
ORDER BY table_name;

-- Verify indexes created
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename LIKE 'gallery_%'
ORDER BY tablename, indexname;

-- Verify constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name LIKE 'gallery_%'
ORDER BY tc.table_name, tc.constraint_type;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Simplified gallery system: No albums, just photos/videos with tags
-- ================================================================
