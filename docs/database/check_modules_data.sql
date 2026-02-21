-- ========================================
-- Quick Diagnostic Script for Modules
-- ========================================
-- Run this in Supabase SQL Editor to check why subject/uploader show as N/A

-- ========================================
-- 1. CHECK: Do foreign key constraints exist?
-- ========================================
\echo '========================================';
\echo '1. FOREIGN KEY CONSTRAINTS';
\echo '========================================';

SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('modules', 'section_modules')
ORDER BY tc.table_name, tc.constraint_name;

-- ========================================
-- 2. CHECK: Do modules have subject_id and uploaded_by?
-- ========================================
\echo '';
\echo '========================================';
\echo '2. MODULES DATA CHECK';
\echo '========================================';

SELECT
    COUNT(*) as total_modules,
    COUNT(subject_id) as modules_with_subject,
    COUNT(uploaded_by) as modules_with_uploader,
    COUNT(*) - COUNT(subject_id) as missing_subject,
    COUNT(*) - COUNT(uploaded_by) as missing_uploader
FROM modules
WHERE is_deleted = false;

-- ========================================
-- 3. CHECK: Sample of actual module data
-- ========================================
\echo '';
\echo '========================================';
\echo '3. SAMPLE MODULE DATA';
\echo '========================================';

SELECT
    id,
    LEFT(title, 30) as title,
    subject_id,
    uploaded_by,
    is_global,
    is_deleted
FROM modules
WHERE is_deleted = false
LIMIT 5;

-- ========================================
-- 4. CHECK: Do the foreign keys resolve to real records?
-- ========================================
\echo '';
\echo '========================================';
\echo '4. FOREIGN KEY VALIDATION (WITH JOINS)';
\echo '========================================';

SELECT
    m.id,
    LEFT(m.title, 30) as title,
    m.subject_id,
    s.subject_name,
    m.uploaded_by,
    u.full_name,
    CASE
        WHEN m.subject_id IS NULL THEN 'NO SUBJECT ASSIGNED'
        WHEN s.id IS NULL THEN 'INVALID SUBJECT ID'
        ELSE 'OK'
    END as subject_status,
    CASE
        WHEN m.uploaded_by IS NULL THEN 'NO UPLOADER ASSIGNED'
        WHEN u.id IS NULL THEN 'INVALID UPLOADER ID'
        ELSE 'OK'
    END as uploader_status
FROM modules m
LEFT JOIN subjects s ON m.subject_id = s.id
LEFT JOIN users u ON m.uploaded_by = u.id
WHERE m.is_deleted = false
LIMIT 10;

-- ========================================
-- 5. CHECK: Available subjects
-- ========================================
\echo '';
\echo '========================================';
\echo '5. AVAILABLE SUBJECTS';
\echo '========================================';

SELECT
    id,
    code,
    subject_name,
    status
FROM subjects
WHERE status = 'active'
LIMIT 10;

-- ========================================
-- 6. CHECK: Available users (teachers)
-- ========================================
\echo '';
\echo '========================================';
\echo '6. AVAILABLE TEACHERS';
\echo '========================================';

SELECT
    id,
    full_name,
    email,
    role
FROM users
WHERE role = 'Teacher'
LIMIT 10;

-- ========================================
-- DIAGNOSTIC SUMMARY
-- ========================================
\echo '';
\echo '========================================';
\echo 'DIAGNOSTIC SUMMARY';
\echo '========================================';

DO $$
DECLARE
    v_total_modules INT;
    v_modules_with_subject INT;
    v_modules_with_uploader INT;
    v_total_subjects INT;
    v_total_teachers INT;
    v_fk_count INT;
BEGIN
    -- Count modules
    SELECT COUNT(*) INTO v_total_modules FROM modules WHERE is_deleted = false;
    SELECT COUNT(subject_id) INTO v_modules_with_subject FROM modules WHERE is_deleted = false;
    SELECT COUNT(uploaded_by) INTO v_modules_with_uploader FROM modules WHERE is_deleted = false;

    -- Count related tables
    SELECT COUNT(*) INTO v_total_subjects FROM subjects WHERE status = 'active';
    SELECT COUNT(*) INTO v_total_teachers FROM users WHERE role = 'Teacher';

    -- Count foreign keys
    SELECT COUNT(*) INTO v_fk_count
    FROM information_schema.table_constraints
    WHERE table_name = 'modules' AND constraint_type = 'FOREIGN KEY';

    RAISE NOTICE '';
    RAISE NOTICE '📊 DATABASE STATUS:';
    RAISE NOTICE '  Total Modules: %', v_total_modules;
    RAISE NOTICE '  Modules with Subject: % (%% of total)', v_modules_with_subject,
        CASE WHEN v_total_modules > 0 THEN ROUND(v_modules_with_subject * 100.0 / v_total_modules) ELSE 0 END;
    RAISE NOTICE '  Modules with Uploader: % (%% of total)', v_modules_with_uploader,
        CASE WHEN v_total_modules > 0 THEN ROUND(v_modules_with_uploader * 100.0 / v_total_modules) ELSE 0 END;
    RAISE NOTICE '  Available Subjects: %', v_total_subjects;
    RAISE NOTICE '  Available Teachers: %', v_total_teachers;
    RAISE NOTICE '  Foreign Keys on modules: %', v_fk_count;
    RAISE NOTICE '';

    -- Diagnose issues
    IF v_fk_count < 2 THEN
        RAISE WARNING '⚠️  ISSUE: Missing foreign key constraints! Run modules_foreign_keys_migration.sql';
    ELSE
        RAISE NOTICE '✅ Foreign key constraints exist';
    END IF;

    IF v_total_modules = 0 THEN
        RAISE WARNING '⚠️  ISSUE: No modules in database! Create test modules first';
    ELSIF v_modules_with_subject < v_total_modules THEN
        RAISE WARNING '⚠️  ISSUE: % modules are missing subject_id!', (v_total_modules - v_modules_with_subject);
        RAISE NOTICE '   Fix: UPDATE modules SET subject_id = (SELECT id FROM subjects LIMIT 1) WHERE subject_id IS NULL;';
    ELSE
        RAISE NOTICE '✅ All modules have subjects assigned';
    END IF;

    IF v_modules_with_uploader < v_total_modules THEN
        RAISE WARNING '⚠️  ISSUE: % modules are missing uploaded_by!', (v_total_modules - v_modules_with_uploader);
        RAISE NOTICE '   Fix: UPDATE modules SET uploaded_by = (SELECT id FROM users WHERE role = ''Teacher'' LIMIT 1) WHERE uploaded_by IS NULL;';
    ELSE
        RAISE NOTICE '✅ All modules have uploaders assigned';
    END IF;

    IF v_total_subjects = 0 THEN
        RAISE WARNING '⚠️  ISSUE: No active subjects in database!';
    END IF;

    IF v_total_teachers = 0 THEN
        RAISE WARNING '⚠️  ISSUE: No teachers in database!';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🔧 NEXT STEPS:';
    IF v_fk_count < 2 THEN
        RAISE NOTICE '  1. Run modules_foreign_keys_migration.sql';
    END IF;
    IF v_modules_with_subject < v_total_modules OR v_modules_with_uploader < v_total_modules THEN
        RAISE NOTICE '  2. Fix missing data using the UPDATE statements above';
    END IF;
    RAISE NOTICE '  3. Restart backend: npm run start:dev';
    RAISE NOTICE '  4. Clear browser cache and refresh';
    RAISE NOTICE '';
END $$;
