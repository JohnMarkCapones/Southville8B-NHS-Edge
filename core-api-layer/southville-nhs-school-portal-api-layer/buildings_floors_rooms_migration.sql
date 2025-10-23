-- ============================================
-- BUILDINGS, FLOORS, AND ROOMS MIGRATION
-- Database Migration Script
-- ============================================
-- This script creates the missing tables for:
-- 1. buildings table
-- 2. floors table  
-- 3. rooms table
-- 4. Proper relationships and constraints
-- 5. RLS policies for security
-- ============================================

-- ============================================
-- PART 1: CREATE BUILDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  building_name character varying NOT NULL,
  code character varying NOT NULL UNIQUE,
  capacity integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT buildings_pkey PRIMARY KEY (id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_buildings_code ON public.buildings(code);
CREATE INDEX IF NOT EXISTS idx_buildings_created_at ON public.buildings(created_at);

-- Add comments
COMMENT ON TABLE public.buildings IS 'School buildings and facilities';
COMMENT ON COLUMN public.buildings.building_name IS 'Name of the building';
COMMENT ON COLUMN public.buildings.code IS 'Unique building code/identifier';
COMMENT ON COLUMN public.buildings.capacity IS 'Total capacity of the building';

-- ============================================
-- PART 2: CREATE FLOORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.floors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  name character varying NOT NULL,
  number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT floors_pkey PRIMARY KEY (id),
  CONSTRAINT floors_building_number_unique UNIQUE (building_id, number)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_floors_building_id ON public.floors(building_id);
CREATE INDEX IF NOT EXISTS idx_floors_number ON public.floors(number);
CREATE INDEX IF NOT EXISTS idx_floors_building_number ON public.floors(building_id, number);

-- Add comments
COMMENT ON TABLE public.floors IS 'Floors within buildings';
COMMENT ON COLUMN public.floors.building_id IS 'Reference to the building this floor belongs to';
COMMENT ON COLUMN public.floors.name IS 'Name of the floor (e.g., "Ground Floor", "First Floor")';
COMMENT ON COLUMN public.floors.number IS 'Floor number (must be unique within building)';

-- ============================================
-- PART 3: CREATE ROOMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  floor_id uuid NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  room_number character varying NOT NULL,
  name character varying,
  capacity integer,
  status character varying DEFAULT 'Available'::character varying,
  display_order integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_floor_room_number_unique UNIQUE (floor_id, room_number)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON public.rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON public.rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_room_number ON public.rooms(floor_id, room_number);

-- Add comments
COMMENT ON TABLE public.rooms IS 'Rooms within floors';
COMMENT ON COLUMN public.rooms.floor_id IS 'Reference to the floor this room belongs to';
COMMENT ON COLUMN public.rooms.room_number IS 'Room number/identifier (unique within floor)';
COMMENT ON COLUMN public.rooms.name IS 'Optional room name';
COMMENT ON COLUMN public.rooms.capacity IS 'Room capacity';
COMMENT ON COLUMN public.rooms.status IS 'Room status (Available, Occupied, Maintenance)';
COMMENT ON COLUMN public.rooms.display_order IS 'Order for displaying rooms';

-- ============================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: CREATE RLS POLICIES
-- ============================================

-- Admin can manage all buildings, floors, and rooms
CREATE POLICY "Admin can manage all buildings" ON public.buildings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Admin'
  )
);

CREATE POLICY "Admin can manage all floors" ON public.floors
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Admin'
  )
);

CREATE POLICY "Admin can manage all rooms" ON public.rooms
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Admin'
  )
);

-- Teachers can read buildings, floors, and rooms
CREATE POLICY "Teachers can read buildings" ON public.buildings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Teacher'
  )
);

CREATE POLICY "Teachers can read floors" ON public.floors
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Teacher'
  )
);

CREATE POLICY "Teachers can read rooms" ON public.rooms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Teacher'
  )
);

-- Students can read buildings, floors, and rooms
CREATE POLICY "Students can read buildings" ON public.buildings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Student'
  )
);

CREATE POLICY "Students can read floors" ON public.floors
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Student'
  )
);

CREATE POLICY "Students can read rooms" ON public.rooms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Student'
  )
);

-- ============================================
-- PART 6: SEED SAMPLE DATA
-- ============================================

-- Insert sample building
INSERT INTO public.buildings (building_name, code, capacity) VALUES
('Main Campus Building', 'MCB', 1000),
('Science Building', 'SB', 500),
('Library Building', 'LB', 200)
ON CONFLICT (code) DO NOTHING;

-- Insert sample floors for Main Campus Building
INSERT INTO public.floors (building_id, name, number) 
SELECT b.id, 'Ground Floor', 0
FROM public.buildings b WHERE b.code = 'MCB'
ON CONFLICT (building_id, number) DO NOTHING;

INSERT INTO public.floors (building_id, name, number) 
SELECT b.id, 'First Floor', 1
FROM public.buildings b WHERE b.code = 'MCB'
ON CONFLICT (building_id, number) DO NOTHING;

INSERT INTO public.floors (building_id, name, number) 
SELECT b.id, 'Second Floor', 2
FROM public.buildings b WHERE b.code = 'MCB'
ON CONFLICT (building_id, number) DO NOTHING;

-- Insert sample rooms
INSERT INTO public.rooms (floor_id, room_number, name, capacity, status) 
SELECT f.id, '101', 'Room 101', 30, 'Available'
FROM public.floors f 
JOIN public.buildings b ON f.building_id = b.id 
WHERE b.code = 'MCB' AND f.number = 1
ON CONFLICT (floor_id, room_number) DO NOTHING;

INSERT INTO public.rooms (floor_id, room_number, name, capacity, status) 
SELECT f.id, '102', 'Room 102', 25, 'Available'
FROM public.floors f 
JOIN public.buildings b ON f.building_id = b.id 
WHERE b.code = 'MCB' AND f.number = 1
ON CONFLICT (floor_id, room_number) DO NOTHING;

INSERT INTO public.rooms (floor_id, room_number, name, capacity, status) 
SELECT f.id, '201', 'Room 201', 35, 'Available'
FROM public.floors f 
JOIN public.buildings b ON f.building_id = b.id 
WHERE b.code = 'MCB' AND f.number = 2
ON CONFLICT (floor_id, room_number) DO NOTHING;

-- ============================================
-- PART 7: VERIFICATION QUERIES
-- ============================================

-- Check that tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('buildings', 'floors', 'rooms')
ORDER BY table_name;

-- Check that RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('buildings', 'floors', 'rooms');

-- Check sample data
SELECT 
  b.building_name,
  f.name as floor_name,
  f.number as floor_number,
  r.room_number,
  r.name as room_name,
  r.capacity,
  r.status
FROM public.buildings b
LEFT JOIN public.floors f ON b.id = f.building_id
LEFT JOIN public.rooms r ON f.id = r.floor_id
ORDER BY b.building_name, f.number, r.room_number;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this migration script in Supabase
-- 2. Verify tables and data exist
-- 3. Test API endpoints
-- ============================================








