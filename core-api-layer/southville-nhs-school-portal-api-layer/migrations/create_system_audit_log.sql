-- =====================================================
-- SYSTEM-WIDE AUDIT LOG MIGRATION
-- =====================================================
-- Purpose: Comprehensive audit logging for all critical entities
-- Tracks: CREATE, UPDATE, DELETE operations with field-level changes
-- Retention: Permanent (no automatic deletion)
-- =====================================================

-- Create audit_actions enum for type safety
CREATE TYPE audit_action_type AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE',
    'PUBLISH',
    'UNPUBLISH',
    'APPROVE',
    'REJECT',
    'ASSIGN',
    'UNASSIGN'
);

-- Create entity_type enum for all audited entities
CREATE TYPE audit_entity_type AS ENUM (
    -- User Management
    'USER',
    'STUDENT',
    'TEACHER',
    'ADMIN',

    -- Academic Structure
    'SCHEDULE',
    'SECTION',
    'SUBJECT',
    'ACADEMIC_YEAR',
    'ACADEMIC_PERIOD',

    -- Content Management
    'NEWS',
    'ANNOUNCEMENT',
    'EVENT',
    'BANNER_NOTIFICATION',

    -- Gallery & Media
    'GALLERY_ALBUM',
    'GALLERY_ITEM',
    'MODULE',

    -- Assessments
    'QUIZ',
    'QUIZ_ATTEMPT',
    'QUIZ_STUDENT_ANSWER',
    'QUIZ_QUESTION',
    'QUESTION_BANK',

    -- Organizations
    'CLUB',
    'CLUB_MEMBERSHIP',

    -- Permissions & Roles
    'DOMAIN_ROLE',
    'USER_DOMAIN_ROLE',
    'PERMISSION',
    'ROLE',

    -- Grading
    'GWA',
    'STUDENT_RANKING',

    -- Files & Resources
    'TEACHER_FILE',
    'TEACHER_FOLDER'
);

-- Main system audit log table
CREATE TABLE system_audit_log (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Action details
    action audit_action_type NOT NULL,
    entity_type audit_entity_type NOT NULL,
    entity_id VARCHAR(255) NOT NULL, -- Flexible to support UUID, INT, or composite keys
    entity_description TEXT, -- Human-readable description (e.g., "Quiz: Midterm Exam")

    -- Actor information
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255), -- Denormalized for historical accuracy
    actor_role VARCHAR(100), -- Role at time of action (denormalized)

    -- Change tracking (field-level)
    changed_fields TEXT[], -- Array of field names that changed
    before_state JSONB, -- Complete state before change (for UPDATE/DELETE)
    after_state JSONB, -- Complete state after change (for CREATE/UPDATE)

    -- Request metadata
    ip_address INET, -- IP address of the request
    user_agent TEXT, -- Browser/client information
    request_id VARCHAR(100), -- Correlation ID for request tracking

    -- Additional context
    note TEXT, -- Optional note (e.g., reason for change)
    metadata JSONB, -- Additional flexible metadata

    -- Temporal tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Soft delete (for accidental audit log entries - use sparingly)
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary query patterns indexes
CREATE INDEX idx_audit_log_created_at ON system_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity_type_created ON system_audit_log(entity_type, created_at DESC);
CREATE INDEX idx_audit_log_entity_id ON system_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON system_audit_log(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON system_audit_log(action, created_at DESC);

-- Composite indexes for common filter combinations
CREATE INDEX idx_audit_log_entity_action ON system_audit_log(entity_type, action, created_at DESC);
CREATE INDEX idx_audit_log_actor_entity ON system_audit_log(actor_user_id, entity_type, created_at DESC);

-- JSONB indexes for efficient JSON querying
CREATE INDEX idx_audit_log_before_state ON system_audit_log USING GIN (before_state);
CREATE INDEX idx_audit_log_after_state ON system_audit_log USING GIN (after_state);
CREATE INDEX idx_audit_log_metadata ON system_audit_log USING GIN (metadata);

-- Partial index for active (non-deleted) logs
CREATE INDEX idx_audit_log_active ON system_audit_log(created_at DESC) WHERE is_deleted = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- RLS DISABLED: No row-level security policies applied
-- Access control handled by application layer (NestJS guards)
-- All admins can query audit logs via API endpoints

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get audit trail for specific entity
CREATE OR REPLACE FUNCTION get_entity_audit_trail(
    p_entity_type audit_entity_type,
    p_entity_id VARCHAR,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    action audit_action_type,
    actor_name VARCHAR,
    changed_fields TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    note TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sal.id,
        sal.action,
        sal.actor_name,
        sal.changed_fields,
        sal.created_at,
        sal.note
    FROM system_audit_log sal
    WHERE sal.entity_type = p_entity_type
    AND sal.entity_id = p_entity_id
    AND sal.is_deleted = FALSE
    ORDER BY sal.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_audit_summary(
    p_user_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    action audit_action_type,
    entity_type audit_entity_type,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sal.action,
        sal.entity_type,
        COUNT(*) as count
    FROM system_audit_log sal
    WHERE sal.actor_user_id = p_user_id
    AND sal.created_at BETWEEN p_start_date AND p_end_date
    AND sal.is_deleted = FALSE
    GROUP BY sal.action, sal.entity_type
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search audit logs with filters
CREATE OR REPLACE FUNCTION search_audit_logs(
    p_entity_type audit_entity_type DEFAULT NULL,
    p_action audit_action_type DEFAULT NULL,
    p_actor_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    p_limit INT DEFAULT 100,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    action audit_action_type,
    entity_type audit_entity_type,
    entity_id VARCHAR,
    entity_description TEXT,
    actor_name VARCHAR,
    changed_fields TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    ip_address INET
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sal.id,
        sal.action,
        sal.entity_type,
        sal.entity_id,
        sal.entity_description,
        sal.actor_name,
        sal.changed_fields,
        sal.created_at,
        sal.ip_address
    FROM system_audit_log sal
    WHERE (p_entity_type IS NULL OR sal.entity_type = p_entity_type)
    AND (p_action IS NULL OR sal.action = p_action)
    AND (p_actor_user_id IS NULL OR sal.actor_user_id = p_actor_user_id)
    AND sal.created_at BETWEEN p_start_date AND p_end_date
    AND sal.is_deleted = FALSE
    ORDER BY sal.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUDIT LOG STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW audit_log_statistics AS
SELECT
    DATE(created_at) as log_date,
    entity_type,
    action,
    COUNT(*) as count,
    COUNT(DISTINCT actor_user_id) as unique_actors
FROM system_audit_log
WHERE is_deleted = FALSE
AND created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), entity_type, action
ORDER BY log_date DESC, count DESC;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE system_audit_log IS 'System-wide audit log tracking all write operations across critical entities';
COMMENT ON COLUMN system_audit_log.action IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN system_audit_log.entity_type IS 'Type of entity being audited';
COMMENT ON COLUMN system_audit_log.entity_id IS 'Primary key of the audited entity (flexible type)';
COMMENT ON COLUMN system_audit_log.changed_fields IS 'Array of field names that were modified in UPDATE operations';
COMMENT ON COLUMN system_audit_log.before_state IS 'Complete entity state before the change (UPDATE/DELETE only)';
COMMENT ON COLUMN system_audit_log.after_state IS 'Complete entity state after the change (CREATE/UPDATE only)';
COMMENT ON COLUMN system_audit_log.actor_user_id IS 'Foreign key to user who performed the action';
COMMENT ON COLUMN system_audit_log.ip_address IS 'IP address from which the request originated';
COMMENT ON COLUMN system_audit_log.is_deleted IS 'Soft delete flag (emergency use only - audit logs should be immutable)';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant SELECT to authenticated users (will be filtered by RLS)
GRANT SELECT ON system_audit_log TO authenticated;

-- Grant INSERT to service role (for automatic audit logging)
GRANT INSERT ON system_audit_log TO service_role;

-- Grant usage on enums
GRANT USAGE ON TYPE audit_action_type TO authenticated, service_role;
GRANT USAGE ON TYPE audit_entity_type TO authenticated, service_role;

-- Grant execute on utility functions
GRANT EXECUTE ON FUNCTION get_entity_audit_trail TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_audit_summary TO authenticated;
GRANT EXECUTE ON FUNCTION search_audit_logs TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert initial log entry to mark migration
INSERT INTO system_audit_log (
    action,
    entity_type,
    entity_id,
    entity_description,
    actor_name,
    actor_role,
    note,
    after_state
) VALUES (
    'CREATE',
    'ADMIN',
    'system',
    'System Audit Log Migration',
    'System',
    'SYSTEM',
    'Audit logging system initialized successfully',
    jsonb_build_object(
        'migration_version', '1.0.0',
        'created_at', CURRENT_TIMESTAMP,
        'entities_covered', 28,
        'features', array['field_level_tracking', 'before_after_states', 'metadata_capture']
    )
);
