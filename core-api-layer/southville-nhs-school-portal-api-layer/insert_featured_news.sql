-- Insert the 3 featured news articles from the homepage image into Supabase
-- These match exactly what was shown in the static design

-- First, check if we have any users to use as authors
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
        -- Create a dummy user for news articles
        INSERT INTO users (id, email, full_name, role, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'news@southville8b.edu',
            'School Administration',
            'admin',
            now(),
            now()
        ) RETURNING id INTO sample_user_id;
        RAISE NOTICE 'Created dummy user with ID: %', sample_user_id;
    END IF;
    
    -- Insert the 3 featured news articles
    INSERT INTO news (
        id,
        title,
        description,
        article_html,
        featured_image,
        author_id,
        status,
        visibility,
        published_date,
        created_at,
        updated_at
    ) VALUES
    (
        gen_random_uuid(),
        'Science Fair Champions Advance to Nationals',
        'Our students'' innovative projects earn recognition at state level competition.',
        '<p>Our students'' innovative projects earn recognition at state level competition. The science fair showcased incredible talent and creativity from our young scientists.</p><p>Students demonstrated advanced understanding of scientific principles and presented their findings with confidence and clarity.</p>',
        '/placeholder.svg?height=200&width=300&text=Science+Fair',
        sample_user_id,
        'published',
        'public',
        '2024-10-17'::date,
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        'New STEM Laboratory Opens with Cutting-Edge Equipment',
        'State-of-the-art laboratory facilities now available for advanced chemistry, physics, and biology research.',
        '<p>State-of-the-art laboratory facilities now available for advanced chemistry, physics, and biology research. The new STEM lab features the latest technology and equipment.</p><p>Students will have access to professional-grade instruments and tools to conduct advanced experiments and research projects.</p>',
        '/placeholder.svg?height=200&width=300&text=STEM+Lab',
        sample_user_id,
        'published',
        'public',
        '2024-10-14'::date,
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        'Eagles Basketball Team Advances to State Finals',
        'Undefeated season continues as our basketball team secures their spot in the championship game.',
        '<p>Undefeated season continues as our basketball team secures their spot in the championship game. The Eagles have shown exceptional teamwork and determination throughout the season.</p><p>With their impressive record and strong performance, the team is ready to compete for the state championship title.</p>',
        '/placeholder.svg?height=200&width=300&text=Basketball',
        sample_user_id,
        'published',
        'public',
        '2024-10-12'::date,
        now(),
        now()
    );
    
    RAISE NOTICE 'Successfully inserted 3 featured news articles with author_id: %', sample_user_id;
END $$;

-- Verify the inserted data
SELECT 
    id,
    title,
    description,
    featured_image,
    status,
    visibility,
    published_date,
    created_at
FROM news 
WHERE status = 'published' 
ORDER BY published_date DESC;
