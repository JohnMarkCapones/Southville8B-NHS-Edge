-- ============================================
-- NEWS SYSTEM MIGRATION
-- Journalism Team + News Articles with PBAC
-- ============================================

-- ============================================
-- STEP 1: CREATE NEWS CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  slug varchar(120) UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed default categories
INSERT INTO news_categories (name, slug, description) VALUES
('Academic', 'academic', 'Academic news and achievements'),
('Events', 'events', 'School events and activities'),
('Sports', 'sports', 'Sports news and competitions'),
('Announcements', 'announcements', 'Official school announcements'),
('Student Life', 'student-life', 'Student life and culture'),
('Arts & Culture', 'arts-culture', 'Arts and cultural activities'),
('Community', 'community', 'Community engagement and service')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 2: CREATE TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) UNIQUE NOT NULL,
  slug varchar(120) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- ============================================
-- STEP 3: CREATE NEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title varchar(255) NOT NULL,
  slug varchar(300) UNIQUE NOT NULL,

  -- Author (must be journalism member)
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Domain link (journalism domain)
  domain_id uuid REFERENCES domains(id) ON DELETE SET NULL,

  -- Content (dual storage for Tiptap)
  article_json jsonb, -- ProseMirror JSON structure
  article_html text,  -- Rendered HTML for display
  description varchar(500), -- Auto-generated if empty

  -- Featured image (R2 storage)
  featured_image_url varchar(500),
  r2_featured_image_key varchar(500), -- For deletion

  -- Organization
  category_id uuid REFERENCES news_categories(id) ON DELETE SET NULL,

  -- Publishing workflow
  status varchar(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'archived')),
  visibility varchar(50) DEFAULT 'public' CHECK (visibility IN ('public', 'students', 'teachers', 'private')),

  -- Dates
  published_date timestamptz,
  scheduled_date timestamptz,

  -- Analytics
  views integer DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Soft delete
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_domain ON news(domain_id);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_visibility ON news(visibility);

-- Full-text search index on article_html
CREATE INDEX IF NOT EXISTS idx_news_article_html_fts ON news USING gin(to_tsvector('english', article_html));

-- ============================================
-- STEP 4: CREATE NEWS_TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_tags (
  news_id uuid NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),

  PRIMARY KEY (news_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_news_tags_news ON news_tags(news_id);
CREATE INDEX IF NOT EXISTS idx_news_tags_tag ON news_tags(tag_id);

-- ============================================
-- STEP 5: CREATE NEWS_CO_AUTHORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_co_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(100) DEFAULT 'co-author' CHECK (role IN ('co-author', 'editor', 'contributor')),
  added_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE(news_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_news_co_authors_news ON news_co_authors(news_id);
CREATE INDEX IF NOT EXISTS idx_news_co_authors_user ON news_co_authors(user_id);

-- ============================================
-- STEP 6: CREATE NEWS_APPROVAL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news_approval (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL CHECK (status IN ('approved', 'rejected', 'pending', 'changes_requested')),
  remarks text,
  action_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_approval_news ON news_approval(news_id);
CREATE INDEX IF NOT EXISTS idx_news_approval_approver ON news_approval(approver_id);
CREATE INDEX IF NOT EXISTS idx_news_approval_status ON news_approval(status);

-- ============================================
-- STEP 7: CREATE JOURNALISM DOMAIN (IF NOT EXISTS)
-- ============================================

-- Check if journalism domain already exists
DO $$
DECLARE
  v_domain_id uuid;
  v_admin_id uuid;
BEGIN
  -- Try to find existing journalism domain
  SELECT id INTO v_domain_id
  FROM domains
  WHERE type = 'journalism'
  LIMIT 1;

  -- If doesn't exist, create it
  IF v_domain_id IS NULL THEN
    -- Get first admin/superadmin user for created_by
    SELECT id INTO v_admin_id
    FROM users
    WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Admin', 'SuperAdmin'))
    LIMIT 1;

    -- If no admin found, use first user
    IF v_admin_id IS NULL THEN
      SELECT id INTO v_admin_id FROM users LIMIT 1;
    END IF;

    -- Create journalism domain
    INSERT INTO domains (type, name, created_by)
    VALUES ('journalism', 'School Journalism Team', v_admin_id)
    RETURNING id INTO v_domain_id;

    RAISE NOTICE 'Created journalism domain with ID: %', v_domain_id;
  ELSE
    RAISE NOTICE 'Journalism domain already exists with ID: %', v_domain_id;
  END IF;
END $$;

-- ============================================
-- STEP 8: CREATE JOURNALISM POSITIONS (IF NOT EXISTS)
-- ============================================

-- Insert positions (will skip if already exist due to UNIQUE constraint on name)
INSERT INTO club_positions (name, description, level) VALUES
('Adviser', 'Journalism team adviser (teacher)', 200),
('Co-Adviser', 'Journalism team co-adviser (teacher)', 190),
('Editor-in-Chief', 'Head of journalism team, full editorial control', 100),
('Co-Editor-in-Chief', 'Assists Editor-in-Chief, high editorial authority', 90),
('Publisher', 'Can approve and publish articles', 80),
('Writer', 'Can create and submit articles', 70),
('Member', 'General journalism member, no publishing rights', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 9: CREATE DOMAIN ROLES FOR JOURNALISM
-- ============================================

-- Note: domain_roles table should already exist from PBAC setup
-- If it doesn't, create it:
CREATE TABLE IF NOT EXISTS domain_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(domain_id, name)
);

-- Create domain roles for journalism domain
DO $$
DECLARE
  v_journalism_domain_id uuid;
BEGIN
  -- Get journalism domain ID
  SELECT id INTO v_journalism_domain_id
  FROM domains
  WHERE type = 'journalism'
  LIMIT 1;

  IF v_journalism_domain_id IS NOT NULL THEN
    -- Create domain roles matching positions
    INSERT INTO domain_roles (domain_id, name, description) VALUES
    (v_journalism_domain_id, 'Adviser', 'Teacher adviser with full approval rights'),
    (v_journalism_domain_id, 'Co-Adviser', 'Teacher co-adviser with approval rights'),
    (v_journalism_domain_id, 'Editor-in-Chief', 'Student editor-in-chief'),
    (v_journalism_domain_id, 'Co-Editor-in-Chief', 'Student co-editor-in-chief'),
    (v_journalism_domain_id, 'Publisher', 'Student publisher'),
    (v_journalism_domain_id, 'Writer', 'Student writer'),
    (v_journalism_domain_id, 'Member', 'General member')
    ON CONFLICT (domain_id, name) DO NOTHING;

    RAISE NOTICE 'Created domain roles for journalism domain';
  END IF;
END $$;

-- ============================================
-- STEP 10: CREATE NEWS PERMISSIONS
-- ============================================

INSERT INTO permissions (key, description) VALUES
('news.create', 'Create news articles'),
('news.edit_own', 'Edit own articles (draft/pending only)'),
('news.delete_own', 'Delete own draft articles'),
('news.submit', 'Submit article for approval'),
('news.approve', 'Approve articles for publication'),
('news.reject', 'Reject submitted articles'),
('news.publish', 'Publish approved articles'),
('news.edit_any', 'Edit any article (draft/pending only)'),
('news.delete_any', 'Delete any article'),
('news.view_pending', 'View all pending approval articles'),
('news.manage_categories', 'Manage news categories')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- STEP 11: ASSIGN PERMISSIONS TO DOMAIN ROLES
-- ============================================

DO $$
DECLARE
  v_journalism_domain_id uuid;
  v_adviser_role_id uuid;
  v_co_adviser_role_id uuid;
  v_eic_role_id uuid;
  v_co_eic_role_id uuid;
  v_publisher_role_id uuid;
  v_writer_role_id uuid;
  v_member_role_id uuid;
BEGIN
  -- Get journalism domain ID
  SELECT id INTO v_journalism_domain_id FROM domains WHERE type = 'journalism' LIMIT 1;

  IF v_journalism_domain_id IS NULL THEN
    RAISE NOTICE 'Journalism domain not found, skipping permission assignment';
    RETURN;
  END IF;

  -- Get domain role IDs
  SELECT id INTO v_adviser_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Adviser';
  SELECT id INTO v_co_adviser_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Co-Adviser';
  SELECT id INTO v_eic_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Editor-in-Chief';
  SELECT id INTO v_co_eic_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Co-Editor-in-Chief';
  SELECT id INTO v_publisher_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Publisher';
  SELECT id INTO v_writer_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Writer';
  SELECT id INTO v_member_role_id FROM domain_roles WHERE domain_id = v_journalism_domain_id AND name = 'Member';

  -- ADVISER (Teacher) - Full access
  INSERT INTO domain_role_permissions (domain_role_id, permission_id, allowed)
  SELECT v_adviser_role_id, id, true FROM permissions WHERE key IN (
    'news.create', 'news.edit_own', 'news.delete_own', 'news.submit',
    'news.approve', 'news.reject', 'news.publish',
    'news.edit_any', 'news.delete_any', 'news.view_pending', 'news.manage_categories'
  )
  ON CONFLICT DO NOTHING;

  -- CO-ADVISER (Teacher) - Same as Adviser
  INSERT INTO domain_role_permissions (domain_role_id, permission_id, allowed)
  SELECT v_co_adviser_role_id, id, true FROM permissions WHERE key IN (
    'news.create', 'news.edit_own', 'news.delete_own', 'news.submit',
    'news.approve', 'news.reject', 'news.publish',
    'news.edit_any', 'news.delete_any', 'news.view_pending', 'news.manage_categories'
  )
  ON CONFLICT DO NOTHING;

  -- EDITOR-IN-CHIEF (Student) - Can create, edit, delete own, submit
  INSERT INTO domain_role_permissions (domain_role_id, permission_id, allowed)
  SELECT v_eic_role_id, id, true FROM permissions WHERE key IN (
    'news.create', 'news.edit_own', 'news.delete_own', 'news.submit'
  )
  ON CONFLICT DO NOTHING;

  -- CO-EDITOR-IN-CHIEF (Student) - Same as EIC
  INSERT INTO domain_role_permissions (domain_role_id, permission_id, allowed)
  SELECT v_co_eic_role_id, id, true FROM permissions WHERE key IN (
    'news.create', 'news.edit_own', 'news.delete_own', 'news.submit'
  )
  ON CONFLICT DO NOTHING;

  -- PUBLISHER (Student) - Same as EIC
  INSERT INTO domain_role_permissions (domain_role_id, permission_id, allowed)
  SELECT v_publisher_role_id, id, true FROM permissions WHERE key IN (
    'news.create', 'news.edit_own', 'news.delete_own', 'news.submit'
  )
  ON CONFLICT DO NOTHING;

  -- WRITER (Student) - Same as EIC
  INSERT INTO domain_role_permissions (domain_role_id, permission_id, allowed)
  SELECT v_writer_role_id, id, true FROM permissions WHERE key IN (
    'news.create', 'news.edit_own', 'news.delete_own', 'news.submit'
  )
  ON CONFLICT DO NOTHING;

  -- MEMBER (Student) - No publishing permissions
  -- (No permissions assigned)

  RAISE NOTICE 'Assigned permissions to journalism domain roles';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify journalism domain exists
SELECT 'Journalism Domain:' as info, id, type, name
FROM domains
WHERE type = 'journalism';

-- Verify domain roles
SELECT 'Domain Roles:' as info, dr.name, dr.description
FROM domain_roles dr
JOIN domains d ON dr.domain_id = d.id
WHERE d.type = 'journalism'
ORDER BY dr.name;

-- Verify permissions
SELECT 'News Permissions:' as info, key, description
FROM permissions
WHERE key LIKE 'news.%'
ORDER BY key;

-- Verify permission assignments
SELECT 'Permission Assignments:' as info, dr.name as role, p.key as permission
FROM domain_role_permissions drp
JOIN domain_roles dr ON drp.domain_role_id = dr.id
JOIN permissions p ON drp.permission_id = p.id
JOIN domains d ON dr.domain_id = d.id
WHERE d.type = 'journalism' AND drp.allowed = true
ORDER BY dr.name, p.key;

-- ============================================
-- END OF MIGRATION
-- ============================================
