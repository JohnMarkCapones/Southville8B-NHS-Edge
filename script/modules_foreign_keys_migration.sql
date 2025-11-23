-- Migration: Add Foreign Key Constraints to Modules Table
-- Purpose: Enable Supabase foreign key syntax for joins (users!uploaded_by, subjects!subject_id)
-- Date: 2025-01-26

-- ========================================
-- 1. Add Foreign Key for uploaded_by → users.id
-- ========================================

-- Check if foreign key already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'modules_uploaded_by_fkey'
        AND table_name = 'modules'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.modules
        ADD CONSTRAINT modules_uploaded_by_fkey
        FOREIGN KEY (uploaded_by)
        REFERENCES public.users(id)
        ON DELETE SET NULL;

        RAISE NOTICE 'Foreign key modules_uploaded_by_fkey created';
    ELSE
        RAISE NOTICE 'Foreign key modules_uploaded_by_fkey already exists';
    END IF;
END $$;

-- ========================================
-- 2. Add Foreign Key for subject_id → subjects.id
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'modules_subject_id_fkey'
        AND table_name = 'modules'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.modules
        ADD CONSTRAINT modules_subject_id_fkey
        FOREIGN KEY (subject_id)
        REFERENCES public.subjects(id)
        ON DELETE SET NULL;

        RAISE NOTICE 'Foreign key modules_subject_id_fkey created';
    ELSE
        RAISE NOTICE 'Foreign key modules_subject_id_fkey already exists';
    END IF;
END $$;

-- ========================================
-- 3. Add Foreign Key for section_modules → modules
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'section_modules_module_id_fkey'
        AND table_name = 'section_modules'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.section_modules
        ADD CONSTRAINT section_modules_module_id_fkey
        FOREIGN KEY (module_id)
        REFERENCES public.modules(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Foreign key section_modules_module_id_fkey created';
    ELSE
        RAISE NOTICE 'Foreign key section_modules_module_id_fkey already exists';
    END IF;
END $$;

-- ========================================
-- 4. Add Foreign Key for section_modules → sections
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'section_modules_section_id_fkey'
        AND table_name = 'section_modules'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.section_modules
        ADD CONSTRAINT section_modules_section_id_fkey
        FOREIGN KEY (section_id)
        REFERENCES public.sections(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Foreign key section_modules_section_id_fkey created';
    ELSE
        RAISE NOTICE 'Foreign key section_modules_section_id_fkey already exists';
    END IF;
END $$;

-- ========================================
-- 5. Add Foreign Key for section_modules → assigned_by (users)
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'section_modules_assigned_by_fkey'
        AND table_name = 'section_modules'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.section_modules
        ADD CONSTRAINT section_modules_assigned_by_fkey
        FOREIGN KEY (assigned_by)
        REFERENCES public.users(id)
        ON DELETE SET NULL;

        RAISE NOTICE 'Foreign key section_modules_assigned_by_fkey created';
    ELSE
        RAISE NOTICE 'Foreign key section_modules_assigned_by_fkey already exists';
    END IF;
END $$;

-- ========================================
-- 6. Create Indexes for Better Performance
-- ========================================

-- Index on uploaded_by for faster joins
CREATE INDEX IF NOT EXISTS idx_modules_uploaded_by
ON public.modules(uploaded_by);

-- Index on subject_id for faster joins
CREATE INDEX IF NOT EXISTS idx_modules_subject_id
ON public.modules(subject_id);

-- Index on module_id for faster joins
CREATE INDEX IF NOT EXISTS idx_section_modules_module_id
ON public.section_modules(module_id);

-- Index on section_id for faster joins
CREATE INDEX IF NOT EXISTS idx_section_modules_section_id
ON public.section_modules(section_id);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_modules_global_subject
ON public.modules(is_global, subject_id)
WHERE is_deleted = false;

-- ========================================
-- Verification Queries (Optional)
-- ========================================

-- Uncomment to verify foreign keys were created:
/*
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('modules', 'section_modules')
ORDER BY tc.table_name, tc.constraint_name;
*/

-- ========================================
-- Success Message
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Modules foreign key migration completed successfully!';
    RAISE NOTICE 'The following foreign keys are now in place:';
    RAISE NOTICE '  - modules.uploaded_by → users.id';
    RAISE NOTICE '  - modules.subject_id → subjects.id';
    RAISE NOTICE '  - section_modules.module_id → modules.id';
    RAISE NOTICE '  - section_modules.section_id → sections.id';
    RAISE NOTICE '  - section_modules.assigned_by → users.id';
    RAISE NOTICE '';
    RAISE NOTICE 'This enables Supabase foreign key syntax:';
    RAISE NOTICE '  - uploader:users!uploaded_by(...)';
    RAISE NOTICE '  - subject:subjects!subject_id(...)';
END $$;
