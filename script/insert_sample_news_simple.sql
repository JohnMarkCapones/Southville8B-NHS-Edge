-- Simple script to insert sample news data
-- This assumes the database schema is already set up

-- Get a user ID to use as author
DO $$
DECLARE
    sample_user_id UUID;
    journalism_domain_id UUID;
    academic_category_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Get journalism domain ID
    SELECT id INTO journalism_domain_id FROM domains WHERE type = 'journalism' LIMIT 1;
    
    -- Get academic category ID
    SELECT id INTO academic_category_id FROM news_categories WHERE slug = 'academic-excellence' LIMIT 1;
    
    -- Insert sample news articles
    INSERT INTO news (
        id, title, slug, author_id, domain_id, category_id,
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
        academic_category_id,
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
        academic_category_id,
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
        academic_category_id,
        '<h2>Undefeated Season Continues</h2><p>The Eagles basketball team has secured their spot in the state championship game with a thrilling victory over Central High School.</p><h3>Championship Game</h3><p>The team''s undefeated season continues as they prepare for the biggest game of the year. Coach Johnson and the players are confident and ready to bring home the championship.</p>',
        'Undefeated season continues as our basketball team secures their spot in the state championship game.',
        '/placeholder.svg?height=400&width=600&text=Basketball+Championship',
        'published',
        'public',
        now() - interval '7 days',
        3156,
        now() - interval '8 days',
        now() - interval '7 days'
    );
    
    RAISE NOTICE 'Successfully inserted 3 sample news articles';
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
