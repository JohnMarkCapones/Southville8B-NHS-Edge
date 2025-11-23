-- ============================================
-- TEACHER DATA DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================
-- Teacher ID: b4c3204d-1f85-4256-9b9d-cdbc9f768527
-- ============================================

\echo '==========================================='
\echo '🔍 TEACHER DATA DIAGNOSTIC'
\echo '==========================================='
\echo ''

-- ============================================
-- 1. CHECK IF TEACHER USER EXISTS
-- ============================================
\echo '📋 Step 1: Checking teacher user...'
\echo ''

SELECT
    '✅ Teacher Found' as status,
    id,
    full_name,
    email,
    role
FROM users
WHERE id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527';

\echo ''

-- ============================================
-- 2. CHECK ADVISORY SECTIONS
-- ============================================
\echo '📋 Step 2: Checking advisory sections (where teacher is adviser)...'
\echo ''

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '⚠️  NO ADVISORY SECTIONS'
        ELSE '✅ Found ' || COUNT(*) || ' advisory section(s)'
    END as status,
    COUNT(*) as section_count
FROM sections
WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
  AND status = 'active';

\echo ''
\echo 'Advisory sections details:'

SELECT
    id,
    name as section_name,
    grade_level,
    status,
    created_at
FROM sections
WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
ORDER BY created_at DESC;

\echo ''

-- ============================================
-- 3. CHECK STUDENTS IN ADVISORY SECTIONS
-- ============================================
\echo '📋 Step 3: Checking students in advisory sections...'
\echo ''

WITH advisory_sections AS (
    SELECT id, name
    FROM sections
    WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
      AND status = 'active'
)
SELECT
    s.name as section_name,
    COUNT(ss.student_id) as student_count
FROM advisory_sections s
LEFT JOIN section_students ss ON s.id = ss.section_id
GROUP BY s.id, s.name
ORDER BY s.name;

\echo ''
\echo 'Total unique students in advisory sections:'

WITH advisory_sections AS (
    SELECT id
    FROM sections
    WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
      AND status = 'active'
)
SELECT
    CASE
        WHEN COUNT(DISTINCT ss.student_id) = 0 THEN '⚠️  0 students in advisory'
        ELSE '✅ ' || COUNT(DISTINCT ss.student_id) || ' unique students'
    END as status,
    COUNT(DISTINCT ss.student_id) as total_students
FROM advisory_sections s
LEFT JOIN section_students ss ON s.id = ss.section_id;

\echo ''

-- ============================================
-- 4. CHECK TEACHER SCHEDULES (SUBJECT CLASSES)
-- ============================================
\echo '📋 Step 4: Checking teacher schedules (subject classes)...'
\echo ''

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '⚠️  NO SCHEDULES'
        ELSE '✅ Found ' || COUNT(*) || ' schedule(s)'
    END as status,
    COUNT(*) as schedule_count
FROM schedules
WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527';

\echo ''
\echo 'Schedule details:'

SELECT
    sch.id,
    sch.subject_id,
    sch.section_id,
    s.name as section_name,
    s.grade_level,
    sch.day_of_week,
    sch.start_time,
    sch.end_time
FROM schedules sch
LEFT JOIN sections s ON sch.section_id = s.id
WHERE sch.teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
ORDER BY sch.day_of_week, sch.start_time;

\echo ''

-- ============================================
-- 5. CHECK STUDENTS IN SCHEDULED SECTIONS
-- ============================================
\echo '📋 Step 5: Checking students in scheduled sections...'
\echo ''

WITH scheduled_sections AS (
    SELECT DISTINCT section_id, s.name as section_name
    FROM schedules sch
    LEFT JOIN sections s ON sch.section_id = s.id
    WHERE sch.teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
      AND sch.section_id IS NOT NULL
)
SELECT
    ss.section_name,
    COUNT(sst.student_id) as student_count
FROM scheduled_sections ss
LEFT JOIN section_students sst ON ss.section_id = sst.section_id
GROUP BY ss.section_id, ss.section_name
ORDER BY ss.section_name;

\echo ''
\echo 'Total unique students in scheduled sections:'

WITH scheduled_sections AS (
    SELECT DISTINCT section_id
    FROM schedules
    WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
      AND section_id IS NOT NULL
)
SELECT
    CASE
        WHEN COUNT(DISTINCT ss.student_id) = 0 THEN '⚠️  0 students in schedules'
        ELSE '✅ ' || COUNT(DISTINCT ss.student_id) || ' unique students'
    END as status,
    COUNT(DISTINCT ss.student_id) as total_students
FROM scheduled_sections s
LEFT JOIN section_students ss ON s.section_id = ss.section_id;

\echo ''

-- ============================================
-- 6. COMBINED TOTAL (ADVISORY + SCHEDULES)
-- ============================================
\echo '📋 Step 6: Computing combined total unique students...'
\echo ''

WITH all_sections AS (
    -- Advisory sections
    SELECT id as section_id, name as section_name, 'Advisory' as source
    FROM sections
    WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
      AND status = 'active'

    UNION

    -- Scheduled sections
    SELECT DISTINCT s.id as section_id, s.name as section_name, 'Schedule' as source
    FROM schedules sch
    JOIN sections s ON sch.section_id = s.id
    WHERE sch.teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
)
SELECT
    CASE
        WHEN COUNT(DISTINCT ss.student_id) = 0 THEN '🔴 TOTAL: 0 students (NO DATA)'
        ELSE '✅ TOTAL: ' || COUNT(DISTINCT ss.student_id) || ' unique students'
    END as status,
    COUNT(DISTINCT ss.student_id) as total_unique_students
FROM all_sections a
LEFT JOIN section_students ss ON a.section_id = ss.section_id;

\echo ''

-- ============================================
-- 7. CHECK VIEW DATA
-- ============================================
\echo '📋 Step 7: Checking sections_with_details view...'
\echo ''

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '⚠️  NO SECTIONS in view'
        ELSE '✅ Found ' || COUNT(*) || ' section(s) in view'
    END as status,
    COUNT(*) as section_count
FROM sections_with_details
WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527';

\echo ''
\echo 'View details:'

SELECT
    id,
    name,
    grade_level,
    adviser_name,
    adviser_email,
    status
FROM sections_with_details
WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527';

\echo ''

-- ============================================
-- 8. VERIFY VIEW HAS teacher_id COLUMN
-- ============================================
\echo '📋 Step 8: Verifying view structure...'
\echo ''

SELECT
    column_name,
    data_type,
    CASE WHEN column_name = 'teacher_id' THEN '✅' ELSE '' END as is_teacher_id
FROM information_schema.columns
WHERE table_name = 'sections_with_details'
  AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''

-- ============================================
-- 9. FINAL DIAGNOSIS
-- ============================================
\echo '==========================================='
\echo '📊 DIAGNOSTIC SUMMARY'
\echo '==========================================='
\echo ''

WITH diagnosis AS (
    SELECT
        (SELECT COUNT(*) FROM sections WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527' AND status = 'active') as advisory_count,
        (SELECT COUNT(*) FROM schedules WHERE teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527') as schedule_count,
        (SELECT COUNT(DISTINCT ss.student_id)
         FROM sections s
         LEFT JOIN section_students ss ON s.id = ss.section_id
         WHERE s.teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527'
           AND s.status = 'active') as advisory_students,
        (SELECT COUNT(DISTINCT ss.student_id)
         FROM schedules sch
         LEFT JOIN section_students ss ON sch.section_id = ss.section_id
         WHERE sch.teacher_id = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527') as schedule_students
)
SELECT
    CASE
        WHEN advisory_count = 0 AND schedule_count = 0 THEN
            '🔴 RESULT: Zero students is CORRECT - NO ASSIGNMENTS' || E'\n' ||
            '   Reason: Teacher has NO advisory sections AND NO schedules' || E'\n' ||
            E'\n' ||
            '💡 TO FIX: You need to either:' || E'\n' ||
            '   1. Assign sections to this teacher:' || E'\n' ||
            '      UPDATE sections SET teacher_id = ''b4c3204d-1f85-4256-9b9d-cdbc9f768527''' || E'\n' ||
            '      WHERE id = ''<section-id>'';' || E'\n' ||
            E'\n' ||
            '   2. OR create schedules for this teacher:' || E'\n' ||
            '      INSERT INTO schedules (teacher_id, section_id, subject_id, ...)' || E'\n' ||
            '      VALUES (''b4c3204d-1f85-4256-9b9d-cdbc9f768527'', ''<section-id>'', ...);' || E'\n' ||
            E'\n' ||
            '   3. Then ensure sections have students in section_students table'
        WHEN advisory_students = 0 AND schedule_students = 0 THEN
            '🟡 RESULT: Zero students - HAS ASSIGNMENTS BUT NO STUDENTS' || E'\n' ||
            '   - Advisory sections: ' || advisory_count || E'\n' ||
            '   - Schedules: ' || schedule_count || E'\n' ||
            '   - BUT: No students enrolled in any sections' || E'\n' ||
            E'\n' ||
            '💡 TO FIX: Add students to sections in section_students table'
        ELSE
            '🟢 RESULT: Should have students!' || E'\n' ||
            '   - Advisory sections: ' || advisory_count || E'\n' ||
            '   - Schedules: ' || schedule_count || E'\n' ||
            '   - Advisory students: ' || advisory_students || E'\n' ||
            '   - Schedule students: ' || schedule_students || E'\n' ||
            E'\n' ||
            '⚠️  IF FRONTEND SHOWS ZERO, CHECK:' || E'\n' ||
            '   1. API endpoints are being called correctly' || E'\n' ||
            '   2. Frontend calculation logic in page.tsx' || E'\n' ||
            '   3. Browser console for API errors'
    END as diagnosis
FROM diagnosis;

\echo ''
\echo '==========================================='
