-- ========================================
-- SAMPLE ANNOUNCEMENTS SEED DATA
-- Southville 8B NHS School Portal
-- ========================================
-- 
-- This script inserts 5 sample announcements into the database
-- for testing the Phase 3 Announcements Integration.
--
-- Run this in Supabase SQL Editor to see "Live Data" on homepage!
-- ========================================

-- ========================================
-- STEP 1: CREATE SAMPLE TAGS (if needed)
-- ========================================
INSERT INTO tags (name, color, created_at)
VALUES 
  ('Urgent', '#EF4444', NOW()),
  ('Academic', '#3B82F6', NOW()),
  ('Event', '#8B5CF6', NOW()),
  ('Important', '#F59E0B', NOW()),
  ('Sports', '#10B981', NOW())
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- STEP 2: INSERT SAMPLE ANNOUNCEMENTS
-- ========================================

-- Get user_id and role IDs for reference
-- User: Richard Ramos Jr (superadmin@gmail.com)
-- User ID: aa0c0e87-b329-47d8-a925-76bf3f76760a
-- Admin Role ID: 168be9c7-17ad-4790-a209-38d1bbc4a12a
-- Student Role ID: 129922d5-b2c3-4ac9-89d7-0f1bb9946551
-- Teacher Role ID: f8e53b78-9508-48b1-8d7f-4afa2e6f83c6

-- Announcement 1: Welcome to School Year 2025
INSERT INTO announcements (
  id,
  user_id,
  title,
  content,
  type,
  visibility,
  expires_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'aa0c0e87-b329-47d8-a925-76bf3f76760a', -- Richard Ramos Jr
  'Welcome to School Year 2025-2026!',
  '<p>Dear Southville 8B NHS Community,</p><p>We are excited to welcome all students, faculty, and staff to the new academic year! This year promises to be filled with learning, growth, and exciting opportunities.</p><p>Key highlights for this year:</p><ul><li>Enhanced digital learning platform</li><li>New sports facilities</li><li>Expanded club activities</li><li>Advanced STEM programs</li></ul><p>Let''s make this year memorable together!</p>',
  'general',
  'public',
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Announcement 2: Exam Schedule - Q1
INSERT INTO announcements (
  id,
  user_id,
  title,
  content,
  type,
  visibility,
  expires_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'aa0c0e87-b329-47d8-a925-76bf3f76760a',
  'First Quarter Examination Schedule Announced',
  '<p><strong>Important Notice to All Students</strong></p><p>The First Quarter examinations will be conducted from <strong>October 28-31, 2025</strong>.</p><h3>Examination Guidelines:</h3><ol><li>Students must arrive 15 minutes before the scheduled exam</li><li>Bring valid school ID and required materials</li><li>No electronic devices allowed in the examination hall</li><li>Strictly follow the exam schedule posted on bulletin boards</li></ol><p>Please check with your section advisers for specific time slots. Good luck to all students!</p>',
  'urgent',
  'public',
  NOW() + INTERVAL '15 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Announcement 3: Sports Fest 2025
INSERT INTO announcements (
  id,
  user_id,
  title,
  content,
  type,
  visibility,
  expires_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'aa0c0e87-b329-47d8-a925-76bf3f76760a',
  'Southville 8B NHS Sports Fest 2025',
  '<p>Get ready for the most exciting event of the year!</p><p><strong>Date:</strong> November 15-17, 2025<br><strong>Venue:</strong> Main Campus Grounds & Gymnasium</p><h3>Featured Sports:</h3><ul><li>Basketball (Boys & Girls)</li><li>Volleyball (Boys & Girls)</li><li>Badminton (Singles & Doubles)</li><li>Table Tennis</li><li>Track and Field Events</li><li>Chess Competition</li></ul><p>Registration is now open! Contact your PE teachers or visit the Athletics Office. Represent your section and show your school spirit!</p>',
  'event',
  'public',
  NOW() + INTERVAL '45 days',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
);

-- Announcement 4: Academic Excellence Awards
INSERT INTO announcements (
  id,
  user_id,
  title,
  content,
  type,
  visibility,
  expires_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'aa0c0e87-b329-47d8-a925-76bf3f76760a',
  'Congratulations to Our Academic Excellence Awardees!',
  '<p>We are proud to announce our <strong>Academic Excellence Awardees</strong> for the Previous School Year!</p><h3>Outstanding Achievers:</h3><ul><li><strong>With High Honors:</strong> 45 students</li><li><strong>With Honors:</strong> 82 students</li><li><strong>Perfect Attendance:</strong> 23 students</li><li><strong>Most Improved:</strong> 15 students</li></ul><p>The awards ceremony will be held on <strong>October 25, 2025</strong> at 2:00 PM in the School Auditorium.</p><p>Parents and guardians are warmly invited to attend. Let''s celebrate our students'' achievements together!</p>',
  'academic',
  'public',
  NOW() + INTERVAL '10 days',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
);

-- Announcement 5: Library Hours Update
INSERT INTO announcements (
  id,
  user_id,
  title,
  content,
  type,
  visibility,
  expires_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'aa0c0e87-b329-47d8-a925-76bf3f76760a',
  'Updated Library Operating Hours',
  '<p>The school library has updated its operating hours to better serve our students and faculty.</p><h3>New Schedule (Effective October 20, 2025):</h3><p><strong>Monday - Friday:</strong><br>6:30 AM - 7:00 PM</p><p><strong>Saturday:</strong><br>8:00 AM - 4:00 PM</p><p><strong>Sunday:</strong><br>Closed</p><h3>New Services:</h3><ul><li>Extended study rooms until 7:00 PM</li><li>Online book reservation system</li><li>Printingscanning services</li><li>Group study areas with multimedia support</li></ul><p>For inquiries, contact the Library Office at extension 123 or email library@southville8bnhs.edu.ph</p>',
  'general',
  'public',
  NOW() + INTERVAL '60 days',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
);

-- ========================================
-- STEP 3: LINK ANNOUNCEMENTS TO TAGS
-- ========================================

-- Link "Exam Schedule" to tags
INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT 
  a.id,
  t.id
FROM announcements a
CROSS JOIN tags t
WHERE a.title LIKE '%Examination Schedule%'
  AND t.name IN ('Urgent', 'Academic')
ON CONFLICT DO NOTHING;

-- Link "Sports Fest" to tags
INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT 
  a.id,
  t.id
FROM announcements a
CROSS JOIN tags t
WHERE a.title LIKE '%Sports Fest%'
  AND t.name IN ('Event', 'Sports')
ON CONFLICT DO NOTHING;

-- Link "Academic Excellence" to tags
INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT 
  a.id,
  t.id
FROM announcements a
CROSS JOIN tags t
WHERE a.title LIKE '%Academic Excellence%'
  AND t.name IN ('Academic', 'Important')
ON CONFLICT DO NOTHING;

-- Link "Library Hours" to tags
INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT 
  a.id,
  t.id
FROM announcements a
CROSS JOIN tags t
WHERE a.title LIKE '%Library Operating Hours%'
  AND t.name IN ('Important')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 4: ASSIGN TARGET ROLES (PUBLIC = ALL ROLES)
-- ========================================

-- Assign all roles to all public announcements
INSERT INTO announcement_targets (announcement_id, role_id)
SELECT 
  a.id,
  r.id
FROM announcements a
CROSS JOIN roles r
WHERE a.visibility = 'public'
  AND a.title IN (
    'Welcome to School Year 2025-2026!',
    'First Quarter Examination Schedule Announced',
    'Southville 8B NHS Sports Fest 2025',
    'Congratulations to Our Academic Excellence Awardees!',
    'Updated Library Operating Hours'
  )
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to verify the data was inserted correctly:
--
-- SELECT 
--   a.id,
--   a.title,
--   a.type,
--   a.visibility,
--   u.full_name as created_by,
--   a.created_at,
--   array_agg(DISTINCT t.name) as tags,
--   array_agg(DISTINCT r.name) as target_roles
-- FROM announcements a
-- LEFT JOIN users u ON a.user_id = u.id
-- LEFT JOIN announcement_tags at ON a.id = at.announcement_id
-- LEFT JOIN tags t ON at.tag_id = t.id
-- LEFT JOIN announcement_targets atr ON a.id = atr.announcement_id
-- LEFT JOIN roles r ON atr.role_id = r.id
-- WHERE a.created_at >= NOW() - INTERVAL '1 week'
-- GROUP BY a.id, a.title, a.type, a.visibility, u.full_name, a.created_at
-- ORDER BY a.created_at DESC;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SAMPLE DATA INSERTED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 5 sample tags';
  RAISE NOTICE '  - 5 sample announcements';
  RAISE NOTICE '  - Tag associations';
  RAISE NOTICE '  - Role targeting (public access)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Visit http://localhost:3000';
  RAISE NOTICE '  2. Look for the "Live Data" badge (green)';
  RAISE NOTICE '  3. Announcements should now show real data!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

