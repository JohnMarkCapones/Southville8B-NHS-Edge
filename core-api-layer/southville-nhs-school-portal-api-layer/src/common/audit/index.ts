/**
 * Audit Module Exports
 *
 * Centralized exports for the audit logging system.
 *
 * Note: audit.module is not exported here to avoid circular dependencies.
 * Import AuditModule directly from './audit.module' if needed.
 */

// Export decorator and types first (no dependencies)
export {
  Audit,
  AUDIT_METADATA_KEY,
  AuditDecoratorOptions,
} from './audit.decorator';
export * from './audit.types';

// Export service and interceptor (these can be imported separately if needed)
export * from './audit.service';
export * from './audit.interceptor';
