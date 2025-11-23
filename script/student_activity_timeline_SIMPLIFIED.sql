-- =====================================================
-- STUDENT ACTIVITY TIMELINE - SIMPLIFIED VERSION
-- =====================================================
-- Tracks ONLY club activities and module uploads/receives
-- No quiz, no assignments, no achievements

-- =====================================================
-- 1. ACTIVITY TYPES ENUM (SIMPLIFIED)
-- =====================================================
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        -- Club Activities
        'club_joined',
        'club_left',
        'club_position_changed',
        'club_event_created',
        'club_announcement_posted',
        'club_member_added',

        -- Module Activities
        'module_received',
        'module_uploaded_by_teacher',

        -- General
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
    -- Examples:
    -- For club: { "club_id": "uuid", "club_name": "Science Club", "position": "Member" }
    -- For module: { "module_id": "uuid", "module_title": "Lesson 1", "teacher_name": "Mr. Smith" }

    -- Related entity references
    related_entity_id UUID, -- club_id, module_id, etc.
    related_entity_type VARCHAR(50), -- 'club', 'module', etc.

    -- Visual customization
    icon VARCHAR(50), -- Icon name from Lucide React
    color VARCHAR(50), -- Color class (e.g., 'text-blue-500')

    -- Priority/visibility
    is_highlighted BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,

    -- Timestamps
    activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

CREATE INDEX IF NOT EXISTS idx_student_activities_metadata
    ON student_activities USING GIN (metadata);

-- =====================================================
-- 4. TRIGGER FOR UPDATED_AT
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
-- 5. HELPER FUNCTION: CREATE CLUB ACTIVITY
-- =====================================================
CREATE OR REPLACE FUNCTION create_club_activity(
    p_student_user_id UUID,
    p_activity_type activity_type,
    p_club_id UUID,
    p_club_name VARCHAR,
    p_position VARCHAR DEFAULT 'Member',
    p_additional_info TEXT DEFAULT NULL
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
    -- Build title based on activity type
    IF p_activity_type = 'club_joined' THEN
        v_title := 'Joined ' || p_club_name;
        v_description := 'You became a member of ' || p_club_name;
        v_icon := 'Users';
        v_color := 'text-blue-500';
    ELSIF p_activity_type = 'club_left' THEN
        v_title := 'Left ' || p_club_name;
        v_description := 'You left ' || p_club_name;
        v_icon := 'Users';
        v_color := 'text-gray-500';
    ELSIF p_activity_type = 'club_position_changed' THEN
        v_title := 'Promoted in ' || p_club_name;
        v_description := 'Your position changed to ' || p_position;
        v_icon := 'Trophy';
        v_color := 'text-yellow-500';
    ELSIF p_activity_type = 'club_event_created' THEN
        v_title := p_club_name || ' created new event';
        v_description := COALESCE(p_additional_info, 'A new event has been created');
        v_icon := 'CalendarIcon';
        v_color := 'text-purple-500';
    ELSIF p_activity_type = 'club_announcement_posted' THEN
        v_title := 'New announcement from ' || p_club_name;
        v_description := COALESCE(p_additional_info, 'Check the latest announcement');
        v_icon := 'Bell';
        v_color := 'text-orange-500';
    ELSIF p_activity_type = 'club_member_added' THEN
        v_title := 'New member joined ' || p_club_name;
        v_description := COALESCE(p_additional_info, 'A new member has joined the club');
        v_icon := 'Users';
        v_color := 'text-green-500';
    ELSE
        v_title := 'Club Activity: ' || p_club_name;
        v_description := p_additional_info;
        v_icon := 'Users';
        v_color := 'text-gray-500';
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
        v_icon,
        v_color,
        p_activity_type = 'club_position_changed' -- Highlight promotions
    )
    RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. HELPER FUNCTION: CREATE MODULE ACTIVITY
-- =====================================================
CREATE OR REPLACE FUNCTION create_module_activity(
    p_student_user_id UUID,
    p_activity_type activity_type,
    p_module_id UUID,
    p_module_title VARCHAR,
    p_teacher_name VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
    v_title VARCHAR(255);
    v_description TEXT;
    v_metadata JSONB;
BEGIN
    IF p_activity_type = 'module_received' THEN
        v_title := 'Received: ' || p_module_title;
        v_description := 'New learning material available';
    ELSIF p_activity_type = 'module_uploaded_by_teacher' THEN
        v_title := COALESCE(p_teacher_name, 'Teacher') || ' uploaded ' || p_module_title;
        v_description := 'New module has been uploaded to your class';
    ELSE
        v_title := 'Module: ' || p_module_title;
        v_description := 'Module activity';
    END IF;

    v_metadata := jsonb_build_object(
        'module_id', p_module_id,
        'module_title', p_module_title,
        'teacher_name', p_teacher_name
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
        p_module_id,
        'module',
        'BookOpen',
        'text-purple-500',
        false
    )
    RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE!
-- =====================================================
-- This simplified version only tracks:
-- 1. Club activities (joined, promoted, events, announcements, new members)
-- 2. Module uploads (when teacher uploads, when student receives)
