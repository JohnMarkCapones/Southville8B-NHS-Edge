-- =====================================================
-- SYSTEM-WIDE AUDIT LOG MIGRATION (CLEAN VERSION)
-- =====================================================
-- Handles already existing types and tables safely
-- =====================================================

-- Drop existing table and types if they exist
DROP TABLE IF EXISTS system_audit_log CASCADE;
DROP TYPE IF EXISTS audit_action_type CASCADE;
DROP TYPE IF EXISTS audit_entity_type CASCADE;

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
    entity_id VARCHAR(255) NOT NULL,
    entity_description TEXT,

    -- Actor information
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255),
    actor_role VARCHAR(100),

    -- Change tracking (field-level)
    changed_fields TEXT[],
    before_state JSONB,
    after_state JSONB,

    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),

    -- Additional context
    note TEXT,
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Soft delete support
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary query pattern: Recent logs
CREATE INDEX idx_audit_log_created_at ON system_audit_log(created_at DESC);

-- Entity-specific queries
CREATE INDEX idx_audit_log_entity ON system_audit_log(entity_type, entity_id);

-- Actor-specific queries
CREATE INDEX idx_audit_log_actor ON system_audit_log(actor_user_id);

-- Action filtering
CREATE INDEX idx_audit_log_action ON system_audit_log(action);

-- Combined entity + action queries
CREATE INDEX idx_audit_log_entity_action ON system_audit_log(entity_type, action);

-- Time-range queries
CREATE INDEX idx_audit_log_date_range ON system_audit_log(created_at) WHERE is_deleted = FALSE;

-- Actor + time queries
CREATE INDEX idx_audit_log_actor_time ON system_audit_log(actor_user_id, created_at DESC);

-- Full-text search on descriptions
CREATE INDEX idx_audit_log_description ON system_audit_log USING gin(to_tsvector('english', entity_description));

-- IP address tracking
CREATE INDEX idx_audit_log_ip ON system_audit_log(ip_address);

-- Request correlation
CREATE INDEX idx_audit_log_request_id ON system_audit_log(request_id) WHERE request_id IS NOT NULL;

-- Partial index for active (non-deleted) logs
CREATE INDEX idx_audit_log_active ON system_audit_log(created_at DESC) WHERE is_deleted = FALSE;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE system_audit_log IS 'System-wide audit log tracking all critical entity changes';
COMMENT ON COLUMN system_audit_log.action IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN system_audit_log.entity_type IS 'Type of entity being audited';
COMMENT ON COLUMN system_audit_log.entity_id IS 'ID of the entity (flexible type for UUID/INT/composite)';
COMMENT ON COLUMN system_audit_log.entity_description IS 'Human-readable description of the entity';
COMMENT ON COLUMN system_audit_log.actor_user_id IS 'User who performed the action (may be NULL for system actions)';
COMMENT ON COLUMN system_audit_log.changed_fields IS 'Array of field names that changed (for UPDATE actions)';
COMMENT ON COLUMN system_audit_log.before_state IS 'Complete entity state before the change';
COMMENT ON COLUMN system_audit_log.after_state IS 'Complete entity state after the change';

-- =====================================================
-- TEST DATA
-- =====================================================

INSERT INTO system_audit_log (
    action,
    entity_type,
    entity_id,
    entity_description,
    actor_name,
    actor_role,
    note
) VALUES (
    'CREATE',
    'NEWS',
    'test-123',
    'Test Audit Log Entry',
    'System',
    'Admin',
    'Initial audit log setup verification'
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify the table was created successfully:
-- SELECT * FROM system_audit_log ORDER BY created_at DESC LIMIT 10;
