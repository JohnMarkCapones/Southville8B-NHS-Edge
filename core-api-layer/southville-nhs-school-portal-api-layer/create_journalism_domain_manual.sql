-- ============================================
-- MANUALLY CREATE JOURNALISM DOMAIN
-- Run this in Supabase SQL Editor
-- ============================================

-- This script will create the journalism domain if it doesn't exist
-- It handles different user table structures (role vs role_id)

DO $$
DECLARE
  v_domain_id uuid;
  v_admin_id uuid;
  v_domains_columns text[];
BEGIN
  -- Check if journalism domain already exists
  SELECT id INTO v_domain_id
  FROM domains
  WHERE type = 'journalism'
  LIMIT 1;

  IF v_domain_id IS NOT NULL THEN
    RAISE NOTICE 'Journalism domain already exists with ID: %', v_domain_id;
    RETURN;
  END IF;

  -- Get admin user ID (try different methods)
  -- Method 1: Check if users table has 'role' column (text)
  BEGIN
    SELECT id INTO v_admin_id
    FROM users
    WHERE role IN ('Admin', 'Super Admin', 'SuperAdmin')
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      v_admin_id := NULL;
  END;

  -- Method 2: If Method 1 failed, try role_id
  IF v_admin_id IS NULL THEN
    BEGIN
      SELECT id INTO v_admin_id
      FROM users
      WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Admin', 'Super Admin', 'SuperAdmin'))
      LIMIT 1;
    EXCEPTION
      WHEN OTHERS THEN
        v_admin_id := NULL;
    END;
  END IF;

  -- Method 3: If no admin found, use the current user (from JWT)
  IF v_admin_id IS NULL THEN
    BEGIN
      v_admin_id := auth.uid();
    EXCEPTION
      WHEN OTHERS THEN
        v_admin_id := NULL;
    END;
  END IF;

  -- Method 4: Last resort - use first user in the table
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM users LIMIT 1;
  END IF;

  -- Check what columns the domains table has
  SELECT ARRAY_AGG(column_name::text)
  INTO v_domains_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'domains';

  -- Create journalism domain based on available columns
  -- Check for different column combinations
  IF 'created_by' = ANY(v_domains_columns) AND 'description' = ANY(v_domains_columns) THEN
    -- Has both created_by and description
    INSERT INTO domains (type, name, description, created_by)
    VALUES (
      'journalism',
      'School Journalism Team',
      'School-wide journalism and news publication domain',
      v_admin_id
    )
    RETURNING id INTO v_domain_id;
  ELSIF 'created_by' = ANY(v_domains_columns) THEN
    -- Has created_by but no description
    INSERT INTO domains (type, name, created_by)
    VALUES (
      'journalism',
      'School Journalism Team',
      v_admin_id
    )
    RETURNING id INTO v_domain_id;
  ELSIF 'description' = ANY(v_domains_columns) THEN
    -- Has description but no created_by
    INSERT INTO domains (type, name, description)
    VALUES (
      'journalism',
      'School Journalism Team',
      'School-wide journalism and news publication domain'
    )
    RETURNING id INTO v_domain_id;
  ELSE
    -- Only has type and name (minimal schema)
    INSERT INTO domains (type, name)
    VALUES (
      'journalism',
      'School Journalism Team'
    )
    RETURNING id INTO v_domain_id;
  END IF;

  RAISE NOTICE 'Successfully created journalism domain with ID: %', v_domain_id;
  RAISE NOTICE 'Created by user ID: %', v_admin_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create journalism domain: %', SQLERRM;
END $$;

-- Verify creation
SELECT
  'Journalism Domain Created:' as status,
  id,
  type,
  name,
  created_at
FROM domains
WHERE type = 'journalism';
