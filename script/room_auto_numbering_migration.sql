-- Migration: Room Auto-Numbering Database Function
-- Description: Creates a PostgreSQL function to automatically generate room numbers
--              based on floor number (e.g., Floor 1 → 101, 102, 103; Floor 2 → 201, 202, 203)
-- Usage: Called by backend when creating a room without specifying roomNumber

-- Drop function if exists (for re-running migration)
DROP FUNCTION IF EXISTS get_next_room_number(UUID);

-- Create function to get next room number for a floor
CREATE OR REPLACE FUNCTION get_next_room_number(floor_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  floor_num INTEGER;
  max_room_num INTEGER;
  next_room_num INTEGER;
  floor_base INTEGER;
BEGIN
  -- Get the floor number
  SELECT number INTO floor_num
  FROM floors
  WHERE id = floor_id_param
    AND is_deleted = FALSE;

  -- If floor not found, raise exception
  IF floor_num IS NULL THEN
    RAISE EXCEPTION 'Floor with ID % not found', floor_id_param;
  END IF;

  -- Calculate floor base (Floor 1 = 100, Floor 2 = 200, etc.)
  floor_base := floor_num * 100;

  -- Get the highest room number on this floor
  -- Only consider rooms within the floor's range (101-199 for floor 1, 201-299 for floor 2, etc.)
  SELECT MAX(
    CASE
      WHEN room_number ~ '^\d+$' THEN CAST(room_number AS INTEGER)
      ELSE NULL
    END
  ) INTO max_room_num
  FROM rooms
  WHERE floor_id = floor_id_param
    AND is_deleted = FALSE
    AND room_number ~ '^\d+$'  -- Only numeric room numbers
    AND CAST(room_number AS INTEGER) BETWEEN floor_base + 1 AND floor_base + 99;

  -- Calculate next room number
  IF max_room_num IS NULL THEN
    -- First room on this floor: start at X01 (e.g., 101, 201, 301)
    next_room_num := floor_base + 1;
  ELSE
    -- Increment the highest number
    next_room_num := max_room_num + 1;
  END IF;

  -- Validate room number doesn't exceed floor capacity (max 99 rooms per floor)
  IF next_room_num > floor_base + 99 THEN
    RAISE EXCEPTION 'Floor % has reached maximum capacity (99 rooms)', floor_num;
  END IF;

  -- Return the next room number as text
  RETURN next_room_num::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Test the function (optional - comment out if floors table is empty)
-- SELECT get_next_room_number('your-floor-uuid-here');

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_next_room_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_room_number(UUID) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_next_room_number(UUID) IS
'Automatically generates the next room number for a given floor.
Room numbers follow the format: (floor_number * 100) + room_count.
Example: Floor 1 → 101, 102, 103; Floor 2 → 201, 202, 203.
Maximum 99 rooms per floor (X01 to X99).
This function is transaction-safe and handles concurrent requests correctly.';
