-- Create sample news data for testing
-- This script creates sample news articles to test the News API integration

-- First, check if we have any users to use as authors
SELECT COUNT(*) as user_count FROM users;

-- Get a sample user ID to use as author (or create one if none exist)
DO $$
DECLARE
    user_count INTEGER;
    sample_user_id UUID;
    journalism_domain_id UUID;
BEGIN
    -- Check if users table has any records
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count > 0 THEN
        -- Get the first user ID
        SELECT id INTO sample_user_id FROM users LIMIT 1;
        RAISE NOTICE 'Found % users, using user_id: %', user_count, sample_user_id;
    ELSE
        -- Create a dummy user for news
        INSERT INTO users (id, email, full_name, role, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'news@southville8b.edu',
            'News Administrator',
            'admin',
            now(),
            now()
        ) RETURNING id INTO sample_user_id;
        RAISE NOTICE 'Created dummy user with ID: %', sample_user_id;
    END IF;
    
    -- Check if journalism domain exists, create if not
    SELECT id INTO journalism_domain_id FROM domains WHERE type = 'journalism' LIMIT 1;
    
    IF journalism_domain_id IS NULL THEN
        INSERT INTO domains (id, type, name, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'journalism',
            'Journalism',
            now(),
            now()
        ) RETURNING id INTO journalism_domain_id;
        RAISE NOTICE 'Created journalism domain with ID: %', journalism_domain_id;
    ELSE
        RAISE NOTICE 'Found existing journalism domain with ID: %', journalism_domain_id;
    END IF;
    
    -- Insert sample news articles
    INSERT INTO news (
        id, title, slug, author_id, domain_id, 
        article_html, description, featured_image_url,
        status, visibility, published_date, views,
        created_at, updated_at
    ) VALUES
    (
        gen_random_uuid(),
        'Science Fair Champions Advance to Nationals',
        'science-fair-champions-advance-to-nationals',
        sample_user_id,
        journalism_domain_id,
        '<h2>Outstanding Achievement</h2><p>Our students have once again demonstrated their exceptional talent in scientific research and innovation. The Southville 8B NHS Science Fair team has secured their place in the national competition after winning the regional championship.</p><h3>Project Highlights</h3><p>The winning projects included groundbreaking research in environmental science, robotics, and biotechnology. Students spent months developing their innovative solutions to real-world problems.</p>',
        'Our students'' innovative projects earn recognition at state level competition, advancing to nationals.',
        '/placeholder.svg?height=400&width=600&text=Science+Fair+Champions',
        'published',
        'public',
        now() - interval '2 days',
        2847,
        now() - interval '3 days',
        now() - interval '2 days'
    ),
    (
        gen_random_uuid(),
        'New STEM Laboratory Opens with Cutting-Edge Equipment',
        'new-stem-laboratory-opens-with-cutting-edge-equipment',
        sample_user_id,
        journalism_domain_id,
        '<h2>State-of-the-Art Facilities</h2><p>Southville 8B NHS is proud to announce the opening of our new STEM laboratory, equipped with the latest technology and equipment for advanced research and learning.</p><h3>Equipment Features</h3><p>The laboratory includes advanced chemistry, physics, and biology research equipment, providing students with hands-on experience in cutting-edge scientific methods.</p>',
        'State-of-the-art laboratory facilities now available for advanced chemistry, physics, and biology research.',
        '/placeholder.svg?height=400&width=600&text=STEM+Laboratory',
        'published',
        'public',
        now() - interval '5 days',
        1923,
        now() - interval '6 days',
        now() - interval '5 days'
    ),
    (
        gen_random_uuid(),
        'Eagles Basketball Team Advances to State Finals',
        'eagles-basketball-team-advances-to-state-finals',
        sample_user_id,
        journalism_domain_id,
        '<h2>Undefeated Season Continues</h2><p>The Eagles basketball team has secured their spot in the state championship game with a thrilling victory over Central High School.</p><h3>Championship Game</h3><p>The team''s undefeated season continues as they prepare for the biggest game of the year. Coach Johnson and the players are confident and ready to bring home the championship.</p>',
        'Undefeated season continues as our basketball team secures their spot in the state championship game.',
        '/placeholder.svg?height=400&width=600&text=Basketball+Championship',
        'published',
        'public',
        now() - interval '7 days',
        3156,
        now() - interval '8 days',
        now() - interval '7 days'
    ),
    (
        gen_random_uuid(),
        'Robotics Club Wins Regional Competition',
        'robotics-club-wins-regional-competition',
        sample_user_id,
        journalism_domain_id,
        '<h2>Innovation and Excellence</h2><p>Our Robotics Club has achieved another milestone by winning the regional robotics competition with their innovative autonomous robot design.</p><h3>Technical Excellence</h3><p>The winning robot demonstrated advanced programming, mechanical engineering, and problem-solving skills that impressed the judges and competitors alike.</p>',
        'Our Robotics Club demonstrates technical excellence and innovation in regional competition victory.',
        '/placeholder.svg?height=400&width=600&text=Robotics+Competition',
        'published',
        'public',
        now() - interval '10 days',
        1456,
        now() - interval '11 days',
        now() - interval '10 days'
    ),
    (
        gen_random_uuid(),
        'Environmental Club Launches Green Campus Initiative',
        'environmental-club-launches-green-campus-initiative',
        sample_user_id,
        journalism_domain_id,
        '<h2>Sustainability in Action</h2><p>The Environmental Club has launched an ambitious Green Campus Initiative aimed at making Southville 8B NHS more environmentally friendly and sustainable.</p><h3>Green Initiatives</h3><p>The initiative includes recycling programs, energy conservation measures, and educational campaigns to promote environmental awareness among students and staff.</p>',
        'Environmental Club leads sustainability efforts with comprehensive Green Campus Initiative.',
        '/placeholder.svg?height=400&width=600&text=Green+Campus',
        'published',
        'public',
        now() - interval '12 days',
        987,
        now() - interval '13 days',
        now() - interval '12 days'
    );
    
    RAISE NOTICE 'Successfully inserted 5 sample news articles with author_id: %', sample_user_id;
END $$;

-- Verify the inserted data
SELECT 
    id, 
    title, 
    slug, 
    status, 
    visibility, 
    published_date,
    views,
    created_at
FROM news 
WHERE deleted_at IS NULL 
ORDER BY published_date DESC;
