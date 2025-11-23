-- Check if events table exists and create it if it doesn't
-- This is a simple version to get the API working

-- First, check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'events'
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  date date NOT NULL,
  time varchar(50),
  location varchar(255),
  organizer_id uuid REFERENCES users(id),
  event_image varchar(500),
  status varchar(20) DEFAULT 'published',
  visibility varchar(20) DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Check if we have any data
SELECT COUNT(*) as event_count FROM events;

-- Create a dummy user for events if no users exist, or use existing user
DO $$
DECLARE
    user_count INTEGER;
    sample_user_id UUID;
BEGIN
    -- Check if users table has any records
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count > 0 THEN
        -- Get the first user ID
        SELECT id INTO sample_user_id FROM users LIMIT 1;
        RAISE NOTICE 'Found % users, using user_id: %', user_count, sample_user_id;
    ELSE
        -- Create a dummy user for events
        INSERT INTO users (id, email, full_name, role, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'events@southville8b.edu',
            'Events Administrator',
            'admin',
            now(),
            now()
        ) RETURNING id INTO sample_user_id;
        RAISE NOTICE 'Created dummy user with ID: %', sample_user_id;
    END IF;
    
    -- Now insert events with the valid user ID
    INSERT INTO events (title, description, date, time, location, organizer_id, event_image, status, visibility) VALUES
    ('Spring Musical: Hamilton', 'Drama department with professional-level production', '2024-04-20'::date, '7:00 PM', 'Main Auditorium', sample_user_id, '/placeholder.svg?height=400&width=800&text=Hamilton+Musical', 'published', 'public'),
    ('State Basketball Championship', 'Eagles compete for state championship', '2024-03-15'::date, '8:00 PM', 'State Arena, Downtown', sample_user_id, '/placeholder.svg?height=400&width=800&text=Basketball+Championship', 'published', 'public'),
    ('Science Fair 2024', 'Annual showcase of student STEM projects with university judges', '2024-05-10'::date, '9:00 AM', 'Gymnasium', sample_user_id, '/placeholder.svg?height=400&width=800&text=Science+Fair', 'published', 'public'),
    ('Graduation Ceremony 2024', 'Celebrating the graduating class of 2024', '2024-06-15'::date, '10:00 AM', 'Football Stadium', sample_user_id, '/placeholder.svg?height=400&width=800&text=Graduation+2024', 'published', 'public'),
    ('Senior Prom 2024', 'Elegant senior prom with Enchanted Garden theme', '2024-05-18'::date, '7:00 PM', 'Grand Ballroom Hotel', sample_user_id, '/placeholder.svg?height=400&width=800&text=Senior+Prom', 'published', 'public'),
    ('Robotics Competition', 'Regional robotics competition featuring innovative student robots', '2024-04-12'::date, '8:00 AM', 'Engineering Lab', sample_user_id, '/placeholder.svg?height=400&width=800&text=Robotics+Competition', 'published', 'public');
    
    RAISE NOTICE 'Successfully inserted 6 events with organizer_id: %', sample_user_id;
END $$;

-- Verify the data
SELECT id, title, date, status, visibility FROM events ORDER BY date;
