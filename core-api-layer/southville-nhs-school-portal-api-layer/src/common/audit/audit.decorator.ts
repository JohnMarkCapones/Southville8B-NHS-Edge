import { SetMetadata } from '@nestjs/common';
import { AuditEntityType, AuditAction } from './audit.types';

export const AUDIT_METADATA_KEY = 'audit_metadata';

export interface AuditDecoratorOptions {
  /** Entity type being audited */
  entityType: AuditEntityType;

  /** Primary key field name (default: 'id') */
  idField?: string;

  /** Field to use for human-readable description */
  descriptionField?: string;

  /** Disable auditing for specific actions */
  excludeActions?: ('create' | 'update' | 'delete')[];

  /** Enable detailed logging (includes full request/response) */
  detailed?: boolean;

  /** Override the action type (for custom actions like RESTORE, PUBLISH, etc.) */
  action?: AuditAction;
}

/**
 * Decorator to enable automatic audit logging for a controller method
 *
 * @example
 * ```typescript
 * @Audit({
 *   entityType: AuditEntityType.NEWS,
 *   descriptionField: 'title'
 * })
 * @Post()
 * async create(@Body() dto: CreateNewsDto) {
 *   return this.newsService.create(dto);
 * }
 * ```
 */
export const Audit = (options: AuditDecoratorOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, options);
