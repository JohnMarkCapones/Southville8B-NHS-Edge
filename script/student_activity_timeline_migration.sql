-- =====================================================
-- STUDENT ACTIVITY TIMELINE - DATABASE MIGRATION
-- =====================================================
-- This migration creates a comprehensive activity tracking system
-- for students to see their academic and extracurricular activities

-- =====================================================
-- 1. ACTIVITY TYPES ENUM
-- =====================================================
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        -- Quiz Activities
        'quiz_started',
        'quiz_submitted',
        'quiz_graded',
        'quiz_terminated',

        -- Module/Assignment Activities
        'module_downloaded',
        'module_uploaded',
        'assignment_submitted',

        -- Club Activities
        'club_joined',
        'club_left',
        'club_position_changed',

        -- Achievement Activities
        'badge_earned',
        'milestone_reached',
        'award_received',

        -- Event Activities
        'event_registered',
        'event_attended',
        'event_participated',

        -- Academic Activities
        'grade_published',
        'rank_updated',
        'gwa_updated',

        -- General Activities
        'profile_updated',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. STUDENT ACTIVITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS student_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Student reference
    student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Activity details
    activity_type activity_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Activity metadata (flexible JSONB for activity-specific data)
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Examples of metadata:
    -- For quiz: { "quiz_id": "uuid", "quiz_title": "Math Quiz", "score": 95, "max_score": 100 }
    -- For club: { "club_id": "uuid", "club_name": "Science Club", "position": "Member" }
    -- For module: { "module_id": "uuid", "module_title": "Lesson 1", "file_name": "lesson1.pdf" }
    -- For achievement: { "badge_id": "uuid", "badge_name": "Perfect Attendance", "icon": "trophy" }

    -- Related entity references (nullable, depending on activity type)
    related_entity_id UUID, -- Generic reference to quiz_id, club_id, module_id, etc.
    related_entity_type VARCHAR(50), -- 'quiz', 'club', 'module', 'event', etc.

    -- Visual customization
    icon VARCHAR(50), -- Icon name from Lucide React (e.g., 'CheckCircle2', 'Trophy', 'BookOpen')
    color VARCHAR(50), -- Color class (e.g., 'text-green-500', 'text-blue-500')

    -- Priority/visibility
    is_highlighted BOOLEAN DEFAULT false, -- For important activities
    is_visible BOOLEAN DEFAULT true, -- Can be hidden by student

    -- Timestamps
    activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When activity occurred
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_student_activities_student_user_id
    ON student_activities(student_user_id);

CREATE INDEX IF NOT EXISTS idx_student_activities_activity_type
    ON student_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_student_activities_timestamp
    ON student_activities(activity_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_student_activities_student_timestamp
    ON student_activities(student_user_id, activity_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_student_activities_visible
    ON student_activities(is_visible) WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_student_activities_related_entity
    ON student_activities(related_entity_id, related_entity_type);

-- GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_student_activities_metadata
    ON student_activities USING GIN (metadata);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;

-- Students can only view their own activities
CREATE POLICY "Students can view own activities"
    ON student_activities
    FOR SELECT
    USING (auth.uid() = student_user_id);

-- Teachers and admins can view all activities
CREATE POLICY "Teachers and admins can view all activities"
    ON student_activities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role IN ('Teacher', 'Admin')
        )
    );

-- Only backend service can insert activities (using service role)
-- Students cannot directly insert activities
CREATE POLICY "Service role can insert activities"
    ON student_activities
    FOR INSERT
    WITH CHECK (true); -- Service role bypasses RLS

-- Students can update visibility of their own activities
CREATE POLICY "Students can update visibility of own activities"
    ON student_activities
    FOR UPDATE
    USING (auth.uid() = student_user_id)
    WITH CHECK (auth.uid() = student_user_id);

-- Only service role can delete activities
CREATE POLICY "Service role can delete activities"
    ON student_activities
    FOR DELETE
    USING (true); -- Service role bypasses RLS

-- =====================================================
-- 5. TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_student_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_activities_updated_at
    BEFORE UPDATE ON student_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_student_activities_updated_at();

-- =====================================================
-- 6. ACTIVITY STATISTICS VIEW
-- =====================================================
-- Useful view for analytics and dashboard
CREATE OR REPLACE VIEW student_activity_stats AS
SELECT
    student_user_id,
    activity_type,
    COUNT(*) as activity_count,
    MAX(activity_timestamp) as last_activity,
    MIN(activity_timestamp) as first_activity
FROM student_activities
WHERE is_visible = true
GROUP BY student_user_id, activity_type;

-- =====================================================
-- 7. HELPER FUNCTION: CREATE QUIZ ACTIVITY
-- =====================================================
-- This function can be called from backend or database triggers
CREATE OR REPLACE FUNCTION create_quiz_activity(
    p_student_user_id UUID,
    p_activity_type activity_type,
    p_quiz_id UUID,
    p_quiz_title VARCHAR,
    p_score INTEGER DEFAULT NULL,
    p_max_score INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
    v_title VARCHAR(255);
    v_description TEXT;
    v_metadata JSONB;
    v_icon VARCHAR(50);
    v_color VARCHAR(50);
BEGIN
    -- Build title and description based on activity type
    IF p_activity_type = 'quiz_started' THEN
        v_title := 'Started Quiz: ' || p_quiz_title;
        v_description := 'You started taking the quiz';
        v_icon := 'BookOpen';
        v_color := 'text-blue-500';
    ELSIF p_activity_type = 'quiz_submitted' THEN
        v_title := 'Submitted Quiz: ' || p_quiz_title;
        v_description := 'You submitted the quiz for grading';
        v_icon := 'CheckCircle2';
        v_color := 'text-green-500';
    ELSIF p_activity_type = 'quiz_graded' THEN
        v_title := 'Quiz Graded: ' || p_quiz_title;
        v_description := 'Your quiz has been graded - Score: ' || p_score || '/' || p_max_score;
        v_icon := 'Award';
        v_color := CASE
            WHEN (p_score::FLOAT / p_max_score) >= 0.9 THEN 'text-green-500'
            WHEN (p_score::FLOAT / p_max_score) >= 0.75 THEN 'text-blue-500'
            ELSE 'text-orange-500'
        END;
    ELSE
        v_title := 'Quiz Activity: ' || p_quiz_title;
        v_description := 'Quiz activity recorded';
        v_icon := 'BookOpen';
        v_color := 'text-gray-500';
    END IF;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'quiz_id', p_quiz_id,
        'quiz_title', p_quiz_title,
        'score', p_score,
        'max_score', p_max_score
    );

    -- Insert activity
    INSERT INTO student_activities (
        student_user_id,
        activity_type,
        title,
        description,
        metadata,
        related_entity_id,
        related_entity_type,
        icon,
        color,
        is_highlighted
    ) VALUES (
        p_student_user_id,
        p_activity_type,
        v_title,
        v_description,
        v_metadata,
        p_quiz_id,
        'quiz',
        v_icon,
        v_color,
        p_activity_type = 'quiz_graded' -- Highlight graded quizzes
    )
    RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. HELPER FUNCTION: CREATE CLUB ACTIVITY
-- =====================================================
CREATE OR REPLACE FUNCTION create_club_activity(
    p_student_user_id UUID,
    p_activity_type activity_type,
    p_club_id UUID,
    p_club_name VARCHAR,
    p_position VARCHAR DEFAULT 'Member'
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
    v_title VARCHAR(255);
    v_description TEXT;
    v_metadata JSONB;
BEGIN
    -- Build title based on activity type
    IF p_activity_type = 'club_joined' THEN
        v_title := 'Joined ' || p_club_name;
        v_description := 'You became a member of ' || p_club_name;
    ELSIF p_activity_type = 'club_left' THEN
        v_title := 'Left ' || p_club_name;
        v_description := 'You left ' || p_club_name;
    ELSIF p_activity_type = 'club_position_changed' THEN
        v_title := 'Promoted in ' || p_club_name;
        v_description := 'Your position changed to ' || p_position;
    END IF;

    v_metadata := jsonb_build_object(
        'club_id', p_club_id,
        'club_name', p_club_name,
        'position', p_position
    );

    INSERT INTO student_activities (
        student_user_id,
        activity_type,
        title,
        description,
        metadata,
        related_entity_id,
        related_entity_type,
        icon,
        color,
        is_highlighted
    ) VALUES (
        p_student_user_id,
        p_activity_type,
        v_title,
        v_description,
        v_metadata,
        p_club_id,
        'club',
        'Users',
        'text-blue-500',
        false
    )
    RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample activities for testing
-- Note: Replace the UUIDs with actual student user IDs from your database

/*
-- Example: Insert sample quiz activity
SELECT create_quiz_activity(
    'STUDENT_USER_ID_HERE'::UUID,
    'quiz_graded',
    'QUIZ_ID_HERE'::UUID,
    'Mathematics Final Exam',
    95,
    100
);

-- Example: Insert sample club activity
SELECT create_club_activity(
    'STUDENT_USER_ID_HERE'::UUID,
    'club_joined',
    'CLUB_ID_HERE'::UUID,
    'Science Club',
    'Member'
);
*/

-- =====================================================
-- 10. GRANTS (Ensure proper permissions)
-- =====================================================
-- Grant necessary permissions to authenticated users
GRANT SELECT ON student_activities TO authenticated;
GRANT SELECT ON student_activity_stats TO authenticated;
GRANT UPDATE (is_visible) ON student_activities TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The student_activities table is now ready to use!
--
-- Next steps:
-- 1. Update backend services to create activities when events occur
-- 2. Create NestJS endpoints to fetch activities
-- 3. Update frontend to consume the new API endpoints
