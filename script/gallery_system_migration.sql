-- ================================================================
-- SCHOOL GALLERY SYSTEM - DATABASE MIGRATION
-- ================================================================
-- Purpose: Create comprehensive gallery system with albums, items, tags
-- Storage: Cloudflare R2 for files, PostgreSQL for metadata
-- Features: Albums, photos/videos, tags, analytics, soft delete
-- Date: 2025-10-22
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE 1: gallery_albums (Main collections/containers)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_albums (
  -- Core fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Categorization
  category VARCHAR(50) NOT NULL DEFAULT 'other',

  -- Visual
  cover_image_id UUID,
  color_theme VARCHAR(20),

  -- Access control
  visibility VARCHAR(20) DEFAULT 'public',
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,

  -- Metadata
  event_date DATE,
  location VARCHAR(255),

  -- Stats (denormalized for performance)
  items_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Audit fields
  created_by UUID NOT NULL,
  updated_by UUID,
  deleted_by UUID,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT gallery_albums_title_length CHECK (char_length(title) >= 3),
  CONSTRAINT gallery_albums_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT gallery_albums_category_check CHECK (category IN (
    'events', 'departments', 'achievements', 'campus_life',
    'sports', 'academics', 'other'
  )),
  CONSTRAINT gallery_albums_visibility_check CHECK (visibility IN (
    'public', 'authenticated', 'staff_only', 'private'
  ))
);

-- Indexes for gallery_albums
CREATE INDEX idx_gallery_albums_category ON gallery_albums(category) WHERE is_deleted = false;
CREATE INDEX idx_gallery_albums_visibility ON gallery_albums(visibility) WHERE is_deleted = false;
CREATE INDEX idx_gallery_albums_featured ON gallery_albums(is_featured, featured_order) WHERE is_deleted = false AND is_featured = true;
CREATE INDEX idx_gallery_albums_event_date ON gallery_albums(event_date DESC) WHERE is_deleted = false;
CREATE INDEX idx_gallery_albums_created_at ON gallery_albums(created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_gallery_albums_slug ON gallery_albums(slug) WHERE is_deleted = false;
CREATE INDEX idx_gallery_albums_created_by ON gallery_albums(created_by);

-- Comments
COMMENT ON TABLE gallery_albums IS 'Photo/video albums for organizing school gallery content';
COMMENT ON COLUMN gallery_albums.slug IS 'URL-friendly unique identifier (e.g., science-fair-2024)';
COMMENT ON COLUMN gallery_albums.category IS 'Album category: events, departments, achievements, campus_life, sports, academics, other';
COMMENT ON COLUMN gallery_albums.visibility IS 'Access level: public, authenticated, staff_only, private';
COMMENT ON COLUMN gallery_albums.is_featured IS 'Display on homepage/featured section';
COMMENT ON COLUMN gallery_albums.items_count IS 'Denormalized count of photos/videos in album';

-- ================================================================
-- TABLE 2: gallery_items (Individual photos/videos)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  -- Core fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL,

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

  -- Image/video specific metadata
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,

  -- Display metadata
  title VARCHAR(255),
  caption TEXT,
  alt_text VARCHAR(500),

  -- Organization
  display_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
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
  ),

  -- Foreign key
  CONSTRAINT fk_gallery_items_album
    FOREIGN KEY (album_id)
    REFERENCES gallery_albums(id)
    ON DELETE CASCADE
);

-- Indexes for gallery_items
CREATE INDEX idx_gallery_items_album ON gallery_items(album_id, display_order) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_media_type ON gallery_items(media_type) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_taken_at ON gallery_items(taken_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_gallery_items_featured ON gallery_items(is_featured) WHERE is_deleted = false AND is_featured = true;
CREATE INDEX idx_gallery_items_r2_key ON gallery_items(r2_file_key);
CREATE INDEX idx_gallery_items_uploaded_by ON gallery_items(uploaded_by);
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC) WHERE is_deleted = false;

-- Comments
COMMENT ON TABLE gallery_items IS 'Individual photos and videos within gallery albums';
COMMENT ON COLUMN gallery_items.r2_file_key IS 'Internal R2 storage path (e.g., gallery/albums/slug/uuid-filename.jpg)';
COMMENT ON COLUMN gallery_items.media_type IS 'Type: image or video';
COMMENT ON COLUMN gallery_items.display_order IS 'Order of item within album (for sorting)';
COMMENT ON COLUMN gallery_items.is_cover IS 'Whether this item is the album cover';
COMMENT ON COLUMN gallery_items.alt_text IS 'Accessibility description for screen readers';

-- ================================================================
-- TABLE 3: gallery_tags (Tags for categorization)
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
  CONSTRAINT gallery_tags_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for gallery_tags
CREATE INDEX idx_gallery_tags_usage ON gallery_tags(usage_count DESC);
CREATE INDEX idx_gallery_tags_slug ON gallery_tags(slug);
CREATE INDEX idx_gallery_tags_name ON gallery_tags(name);

-- Comments
COMMENT ON TABLE gallery_tags IS 'Reusable tags for categorizing gallery items';
COMMENT ON COLUMN gallery_tags.usage_count IS 'Denormalized count of items with this tag';
COMMENT ON COLUMN gallery_tags.color IS 'UI color for tag display (hex or preset name)';

-- ================================================================
-- TABLE 4: gallery_item_tags (Many-to-many relationship)
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
-- TABLE 5: gallery_downloads (Download tracking for analytics)
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
-- TABLE 6: gallery_views (View tracking - optional for analytics)
-- ================================================================
CREATE TABLE IF NOT EXISTS gallery_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewable_type VARCHAR(20) NOT NULL,
  viewable_id UUID NOT NULL,

  user_id UUID,
  ip_address INET,

  viewed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT gallery_views_type_check CHECK (viewable_type IN ('album', 'item'))
);

-- Indexes for gallery_views
CREATE INDEX idx_gallery_views_viewable ON gallery_views(viewable_type, viewable_id, viewed_at DESC);
CREATE INDEX idx_gallery_views_user ON gallery_views(user_id, viewed_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_gallery_views_date ON gallery_views(viewed_at DESC);

-- Comments
COMMENT ON TABLE gallery_views IS 'Track album/item views for analytics';
COMMENT ON COLUMN gallery_views.viewable_type IS 'Type: album or item';
COMMENT ON COLUMN gallery_views.viewable_id IS 'References gallery_albums.id or gallery_items.id';

-- ================================================================
-- FOREIGN KEY: Link album cover back to items
-- ================================================================
-- Note: This creates a circular dependency, so we add it after both tables exist
ALTER TABLE gallery_albums
  DROP CONSTRAINT IF EXISTS fk_gallery_albums_cover_image;

ALTER TABLE gallery_albums
  ADD CONSTRAINT fk_gallery_albums_cover_image
    FOREIGN KEY (cover_image_id)
    REFERENCES gallery_items(id)
    ON DELETE SET NULL;

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

-- Trigger for gallery_albums
DROP TRIGGER IF EXISTS trigger_gallery_albums_updated_at ON gallery_albums;
CREATE TRIGGER trigger_gallery_albums_updated_at
  BEFORE UPDATE ON gallery_albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gallery_items
DROP TRIGGER IF EXISTS trigger_gallery_items_updated_at ON gallery_items;
CREATE TRIGGER trigger_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- TRIGGERS: Auto-update denormalized counts
-- ================================================================

-- Function to update album items_count
CREATE OR REPLACE FUNCTION update_album_items_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When item is created or restored
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_deleted = true AND NEW.is_deleted = false)) THEN
    UPDATE gallery_albums
    SET items_count = items_count + 1
    WHERE id = NEW.album_id;
  END IF;

  -- When item is soft deleted
  IF (TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true) THEN
    UPDATE gallery_albums
    SET items_count = GREATEST(items_count - 1, 0)
    WHERE id = NEW.album_id;
  END IF;

  -- When item is hard deleted
  IF (TG_OP = 'DELETE') THEN
    UPDATE gallery_albums
    SET items_count = GREATEST(items_count - 1, 0)
    WHERE id = OLD.album_id;
  END IF;

  -- When item is moved to different album
  IF (TG_OP = 'UPDATE' AND OLD.album_id != NEW.album_id AND NEW.is_deleted = false) THEN
    UPDATE gallery_albums
    SET items_count = GREATEST(items_count - 1, 0)
    WHERE id = OLD.album_id;

    UPDATE gallery_albums
    SET items_count = items_count + 1
    WHERE id = NEW.album_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for items_count
DROP TRIGGER IF EXISTS trigger_update_album_items_count ON gallery_items;
CREATE TRIGGER trigger_update_album_items_count
  AFTER INSERT OR UPDATE OR DELETE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_album_items_count();

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

-- Insert common tags (optional - you can customize or remove this)
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
-- SAMPLE DATA: Example album (optional - remove if not needed)
-- ================================================================

-- Note: Replace 'YOUR_ADMIN_USER_ID' with actual admin user UUID
-- Or remove this section entirely if you want to start fresh

/*
INSERT INTO gallery_albums (
  title,
  slug,
  description,
  category,
  visibility,
  is_featured,
  created_by
) VALUES (
  'Welcome to Our School Gallery',
  'welcome-gallery',
  'A collection of photos showcasing our vibrant school community',
  'campus_life',
  'public',
  true,
  'YOUR_ADMIN_USER_ID'  -- Replace with actual UUID
);
*/

-- ================================================================
-- PERMISSIONS & ROW LEVEL SECURITY (Optional - if using RLS)
-- ================================================================

-- Enable RLS on tables (uncomment if you want to use Supabase RLS)
/*
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view public albums
CREATE POLICY "Public albums are viewable by everyone"
  ON gallery_albums FOR SELECT
  USING (visibility = 'public' AND is_deleted = false);

-- Policy: Authenticated users can view authenticated albums
CREATE POLICY "Authenticated albums viewable by logged in users"
  ON gallery_albums FOR SELECT
  USING (
    (visibility = 'authenticated' AND auth.role() = 'authenticated' AND is_deleted = false)
    OR
    (visibility = 'public' AND is_deleted = false)
  );

-- Policy: Staff can view staff-only albums
CREATE POLICY "Staff albums viewable by staff"
  ON gallery_albums FOR SELECT
  USING (
    (visibility IN ('staff_only', 'private') AND auth.jwt()->>'role' IN ('admin', 'teacher') AND is_deleted = false)
    OR
    (visibility IN ('authenticated', 'public') AND is_deleted = false)
  );

-- Add more RLS policies as needed for INSERT, UPDATE, DELETE
*/

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
-- Next steps:
-- 1. Review the created tables and indexes
-- 2. Adjust RLS policies if using Supabase RLS
-- 3. Proceed with NestJS API implementation
-- ================================================================
