/**
 * Type definitions for the System-Wide Audit Log
 */

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  PUBLISH = 'PUBLISH',
  UNPUBLISH = 'UNPUBLISH',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
}

export enum AuditEntityType {
  // User Management
  USER = 'USER',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',

  // Academic Structure
  SCHEDULE = 'SCHEDULE',
  SECTION = 'SECTION',
  SUBJECT = 'SUBJECT',
  ACADEMIC_YEAR = 'ACADEMIC_YEAR',
  ACADEMIC_PERIOD = 'ACADEMIC_PERIOD',

  // Content Management
  NEWS = 'NEWS',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  BANNER_NOTIFICATION = 'BANNER_NOTIFICATION',

  // Gallery & Media
  GALLERY_ALBUM = 'GALLERY_ALBUM',
  GALLERY_ITEM = 'GALLERY_ITEM',
  MODULE = 'MODULE',

  // Assessments
  QUIZ = 'QUIZ',
  QUIZ_ATTEMPT = 'QUIZ_ATTEMPT',
  QUIZ_STUDENT_ANSWER = 'QUIZ_STUDENT_ANSWER',
  QUIZ_QUESTION = 'QUIZ_QUESTION',
  QUESTION_BANK = 'QUESTION_BANK',

  // Organizations
  CLUB = 'CLUB',
  CLUB_MEMBERSHIP = 'CLUB_MEMBERSHIP',

  // Permissions & Roles
  DOMAIN_ROLE = 'DOMAIN_ROLE',
  USER_DOMAIN_ROLE = 'USER_DOMAIN_ROLE',
  PERMISSION = 'PERMISSION',
  ROLE = 'ROLE',

  // Grading
  GWA = 'GWA',
  STUDENT_RANKING = 'STUDENT_RANKING',

  // Files & Resources
  TEACHER_FILE = 'TEACHER_FILE',
  TEACHER_FOLDER = 'TEACHER_FOLDER',
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_description?: string;
  actor_user_id?: string;
  actor_name?: string;
  actor_role?: string;
  changed_fields?: string[];
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  note?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  is_deleted: boolean;
  deleted_at?: Date;
}

export interface CreateAuditLogDto {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityDescription?: string;
  actorUserId?: string;
  actorName?: string;
  actorRole?: string;
  changedFields?: string[];
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface AuditMetadata {
  entityType: AuditEntityType;
  idField?: string; // Default: 'id'
  descriptionField?: string; // Field to use for human-readable description
  descriptionTemplate?: (entity: any) => string; // Custom description generator
}
