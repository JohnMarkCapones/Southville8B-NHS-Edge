-- =====================================================================
-- Quiz Question Types Migration
-- =====================================================================
-- Purpose: Add missing question type enum values to support all 11 types
-- Run this in Supabase SQL Editor BEFORE implementing question type fixes
-- =====================================================================

-- Step 1: Check current enum values
DO $$
DECLARE
    enum_values text[];
BEGIN
    -- Get all current enum values for question_type
    SELECT array_agg(enumlabel::text ORDER BY enumlabel)
    INTO enum_values
    FROM pg_enum
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum');

    RAISE NOTICE 'Current question_type_enum values: %', enum_values;
END $$;

-- Step 2: Add missing enum values safely
-- This will only add values that don't already exist

DO $$
BEGIN
    RAISE NOTICE 'Adding missing question type enum values...';

    -- Add checkbox (if missing)
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'checkbox'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum')
        ) THEN
            ALTER TYPE question_type_enum ADD VALUE 'checkbox';
            RAISE NOTICE '✅ Added: checkbox';
        ELSE
            RAISE NOTICE '⏭️  Already exists: checkbox';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error adding checkbox: %', SQLERRM;
    END;

    -- Add dropdown (if missing)
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'dropdown'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum')
        ) THEN
            ALTER TYPE question_type_enum ADD VALUE 'dropdown';
            RAISE NOTICE '✅ Added: dropdown';
        ELSE
            RAISE NOTICE '⏭️  Already exists: dropdown';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error adding dropdown: %', SQLERRM;
    END;

    -- Add linear_scale (if missing)
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'linear_scale'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum')
        ) THEN
            ALTER TYPE question_type_enum ADD VALUE 'linear_scale';
            RAISE NOTICE '✅ Added: linear_scale';
        ELSE
            RAISE NOTICE '⏭️  Already exists: linear_scale';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error adding linear_scale: %', SQLERRM;
    END;

    -- Add drag_drop (if missing)
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'drag_drop'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum')
        ) THEN
            ALTER TYPE question_type_enum ADD VALUE 'drag_drop';
            RAISE NOTICE '✅ Added: drag_drop';
        ELSE
            RAISE NOTICE '⏭️  Already exists: drag_drop';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error adding drag_drop: %', SQLERRM;
    END;

    RAISE NOTICE 'Enum values update complete!';
END $$;

-- Step 3: Verify all expected values exist
DO $$
DECLARE
    missing_count integer;
    expected_values text[] := ARRAY[
        'multiple_choice',
        'checkbox',
        'true_false',
        'short_answer',
        'essay',
        'fill_in_blank',
        'matching',
        'drag_drop',
        'ordering',
        'dropdown',
        'linear_scale'
    ];
    enum_value text;
BEGIN
    RAISE NOTICE 'Verifying all expected question types exist...';
    RAISE NOTICE '================================================';

    missing_count := 0;

    FOREACH enum_value IN ARRAY expected_values
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = enum_value
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum')
        ) THEN
            RAISE NOTICE '✅ %', enum_value;
        ELSE
            RAISE NOTICE '❌ MISSING: %', enum_value;
            missing_count := missing_count + 1;
        END IF;
    END LOOP;

    RAISE NOTICE '================================================';

    IF missing_count = 0 THEN
        RAISE NOTICE '✅ All question types verified successfully!';
    ELSE
        RAISE WARNING '⚠️  % question type(s) are still missing!', missing_count;
    END IF;
END $$;

-- Step 4: Ensure metadata column exists (should already exist)
-- This is just a safety check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'quiz_questions'
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE quiz_questions ADD COLUMN metadata JSONB;
        RAISE NOTICE '✅ Added metadata column to quiz_questions';
    ELSE
        RAISE NOTICE '✅ metadata column already exists in quiz_questions';
    END IF;
END $$;

-- Step 5: Add performance index on question_type (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(question_type);
RAISE NOTICE '✅ Created index on question_type (if not exists)';

-- Step 6: Add index on metadata for faster queries (optional)
CREATE INDEX IF NOT EXISTS idx_quiz_questions_metadata ON quiz_questions USING gin(metadata);
RAISE NOTICE '✅ Created GIN index on metadata (if not exists)';

-- Final verification query
SELECT
    'question_type_enum' as enum_name,
    array_agg(enumlabel::text ORDER BY enumsortorder) as available_values,
    array_length(array_agg(enumlabel::text), 1) as total_count
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type_enum')
GROUP BY enum_name;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Next steps:
-- 1. Verify all 11 question types show in the output above
-- 2. Check that metadata column exists in quiz_questions table
-- 3. Proceed with frontend implementation
-- =====================================================================
