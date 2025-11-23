-- ============================================
-- CREATE JOURNALISM DOMAIN ROLES
-- Run this AFTER creating the journalism domain
-- ============================================

DO $$
DECLARE
  v_journalism_domain_id uuid;
  v_role_count integer;
BEGIN
  -- Get journalism domain ID
  SELECT id INTO v_journalism_domain_id
  FROM domains
  WHERE type = 'journalism'
  LIMIT 1;

  IF v_journalism_domain_id IS NULL THEN
    RAISE EXCEPTION 'Journalism domain not found. Please run create_journalism_domain_manual.sql first.';
  END IF;

  RAISE NOTICE 'Found journalism domain with ID: %', v_journalism_domain_id;

  -- Create domain roles for journalism
  -- Insert each role individually to avoid conflicts
  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Adviser'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Adviser'
  );

  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Co-Adviser'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Co-Adviser'
  );

  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Editor-in-Chief'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Editor-in-Chief'
  );

  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Co-Editor-in-Chief'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Co-Editor-in-Chief'
  );

  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Publisher'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Publisher'
  );

  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Writer'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Writer'
  );

  INSERT INTO domain_roles (domain_id, name)
  SELECT v_journalism_domain_id, 'Member'
  WHERE NOT EXISTS (
    SELECT 1 FROM domain_roles
    WHERE domain_id = v_journalism_domain_id AND name = 'Member'
  );

  -- Count how many roles were created
  SELECT COUNT(*)
  INTO v_role_count
  FROM domain_roles
  WHERE domain_id = v_journalism_domain_id;

  RAISE NOTICE 'Journalism domain now has % roles', v_role_count;
END $$;

-- Verify domain roles were created
SELECT
  'Domain Roles Created:' as status,
  dr.id,
  dr.name,
  d.name as domain_name
FROM domain_roles dr
JOIN domains d ON dr.domain_id = d.id
WHERE d.type = 'journalism'
ORDER BY
  CASE dr.name
    WHEN 'Adviser' THEN 1
    WHEN 'Co-Adviser' THEN 2
    WHEN 'Editor-in-Chief' THEN 3
    WHEN 'Co-Editor-in-Chief' THEN 4
    WHEN 'Publisher' THEN 5
    WHEN 'Writer' THEN 6
    WHEN 'Member' THEN 7
    ELSE 8
  END;
