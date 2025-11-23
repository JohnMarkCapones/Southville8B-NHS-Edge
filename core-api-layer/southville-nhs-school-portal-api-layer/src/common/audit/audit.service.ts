import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AuditAction,
  AuditEntityType,
  CreateAuditLogDto,
  AuditLogEntry,
} from './audit.types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Log a CREATE action to the audit log
   */
  async logCreate(
    entityType: AuditEntityType,
    entity: any,
    options?: {
      actorUserId?: string;
      actorName?: string;
      actorRole?: string;
      idField?: string;
      descriptionField?: string;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      note?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const idField = options?.idField || 'id';
      const entityId = entity[idField]?.toString();

      if (!entityId) {
        this.logger.warn(
          `Cannot log CREATE audit: entity ID not found (field: ${idField})`,
        );
        return;
      }

      const dto: CreateAuditLogDto = {
        action: AuditAction.CREATE,
        entityType,
        entityId,
        entityDescription: this.generateEntityDescription(
          entity,
          options?.descriptionField,
        ),
        actorUserId: options?.actorUserId,
        actorName: options?.actorName,
        actorRole: options?.actorRole,
        afterState: this.sanitizeState(entity),
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        requestId: options?.requestId,
        note: options?.note,
        metadata: options?.metadata,
      };

      await this.createAuditLog(dto);
    } catch (error) {
      this.logger.error(
        `Failed to log CREATE audit for ${entityType}:`,
        error,
      );
    }
  }

  /**
   * Log an UPDATE action to the audit log with automatic field diffing
   */
  async logUpdate(
    entityType: AuditEntityType,
    beforeState: any,
    afterState: any,
    options?: {
      actorUserId?: string;
      actorName?: string;
      actorRole?: string;
      idField?: string;
      descriptionField?: string;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      note?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const idField = options?.idField || 'id';
      const entityId = afterState[idField]?.toString();

      if (!entityId) {
        this.logger.warn(
          `Cannot log UPDATE audit: entity ID not found (field: ${idField})`,
        );
        return;
      }

      const changedFields = this.detectChangedFields(beforeState, afterState);

      // Only log if there are actual changes
      if (changedFields.length === 0) {
        this.logger.debug(
          `Skipping UPDATE audit for ${entityType} ${entityId}: no changes detected`,
        );
        return;
      }

      const dto: CreateAuditLogDto = {
        action: AuditAction.UPDATE,
        entityType,
        entityId,
        entityDescription: this.generateEntityDescription(
          afterState,
          options?.descriptionField,
        ),
        actorUserId: options?.actorUserId,
        actorName: options?.actorName,
        actorRole: options?.actorRole,
        changedFields,
        beforeState: this.sanitizeState(beforeState),
        afterState: this.sanitizeState(afterState),
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        requestId: options?.requestId,
        note: options?.note,
        metadata: options?.metadata,
      };

      await this.createAuditLog(dto);
    } catch (error) {
      this.logger.error(
        `Failed to log UPDATE audit for ${entityType}:`,
        error,
      );
    }
  }

  /**
   * Log a DELETE action to the audit log
   */
  async logDelete(
    entityType: AuditEntityType,
    entity: any,
    options?: {
      actorUserId?: string;
      actorName?: string;
      actorRole?: string;
      idField?: string;
      descriptionField?: string;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      note?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const idField = options?.idField || 'id';
      const entityId = entity[idField]?.toString();

      if (!entityId) {
        this.logger.warn(
          `Cannot log DELETE audit: entity ID not found (field: ${idField})`,
        );
        return;
      }

      const dto: CreateAuditLogDto = {
        action: AuditAction.DELETE,
        entityType,
        entityId,
        entityDescription: this.generateEntityDescription(
          entity,
          options?.descriptionField,
        ),
        actorUserId: options?.actorUserId,
        actorName: options?.actorName,
        actorRole: options?.actorRole,
        beforeState: this.sanitizeState(entity),
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        requestId: options?.requestId,
        note: options?.note,
        metadata: options?.metadata,
      };

      await this.createAuditLog(dto);
    } catch (error) {
      this.logger.error(
        `Failed to log DELETE audit for ${entityType}:`,
        error,
      );
    }
  }

  /**
   * Log a custom action (PUBLISH, APPROVE, ASSIGN, etc.)
   */
  async logCustomAction(
    action: AuditAction,
    entityType: AuditEntityType,
    entity: any,
    options?: {
      actorUserId?: string;
      actorName?: string;
      actorRole?: string;
      idField?: string;
      descriptionField?: string;
      beforeState?: any;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      note?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const idField = options?.idField || 'id';
      const entityId = entity[idField]?.toString();

      if (!entityId) {
        this.logger.warn(
          `Cannot log ${action} audit: entity ID not found (field: ${idField})`,
        );
        return;
      }

      const dto: CreateAuditLogDto = {
        action,
        entityType,
        entityId,
        entityDescription: this.generateEntityDescription(
          entity,
          options?.descriptionField,
        ),
        actorUserId: options?.actorUserId,
        actorName: options?.actorName,
        actorRole: options?.actorRole,
        beforeState: options?.beforeState
          ? this.sanitizeState(options.beforeState)
          : undefined,
        afterState: this.sanitizeState(entity),
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        requestId: options?.requestId,
        note: options?.note,
        metadata: options?.metadata,
      };

      await this.createAuditLog(dto);
    } catch (error) {
      this.logger.error(
        `Failed to log ${action} audit for ${entityType}:`,
        error,
      );
    }
  }

  /**
   * Retrieve audit trail for a specific entity
   */
  async getEntityAuditTrail(
    entityType: AuditEntityType,
    entityId: string,
    limit = 50,
  ): Promise<AuditLogEntry[]> {
    try {
      const supabase = this.getSupabaseClient();

      const { data, error } = await supabase
        .from('system_audit_log')
        .select(
          `
          id,
          action,
          entity_type,
          entity_id,
          entity_description,
          actor_user_id,
          actor_name,
          actor_role,
          changed_fields,
          before_state,
          after_state,
          ip_address,
          user_agent,
          request_id,
          note,
          metadata,
          created_at,
          is_deleted
        `,
        )
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Failed to retrieve audit trail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Failed to retrieve audit trail:', error);
      return [];
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(filters: {
    entityType?: AuditEntityType;
    action?: AuditAction;
    actorUserId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ data: AuditLogEntry[]; total: number }> {
    try {
      const supabase = this.getSupabaseClient();

      let query = supabase
        .from('system_audit_log')
        .select(
          `
          id,
          action,
          entity_type,
          entity_id,
          entity_description,
          actor_user_id,
          actor_name,
          actor_role,
          changed_fields,
          ip_address,
          created_at,
          is_deleted
        `,
          { count: 'exact' },
        )
        .eq('is_deleted', false);

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.actorUserId) {
        query = query.eq('actor_user_id', filters.actorUserId);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      query = query
        .order('created_at', { ascending: false })
        .range(
          filters.offset || 0,
          (filters.offset || 0) + (filters.limit || 100) - 1,
        );

      const { data, error, count } = await query;

      if (error) {
        this.logger.error('Failed to search audit logs:', error);
        return { data: [], total: 0 };
      }

      return { data: data || [], total: count || 0 };
    } catch (error) {
      this.logger.error('Failed to search audit logs:', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(days = 30): Promise<any> {
    try {
      const supabase = this.getSupabaseClient();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('system_audit_log')
        .select('action, entity_type, actor_user_id')
        .gte('created_at', startDate.toISOString())
        .eq('is_deleted', false);

      if (error) {
        this.logger.error('Failed to retrieve audit statistics:', error);
        return null;
      }

      // Calculate statistics
      const stats = {
        total: data.length,
        byAction: {} as Record<string, number>,
        byEntity: {} as Record<string, number>,
        uniqueActors: new Set(
          data.map((log) => log.actor_user_id).filter(Boolean),
        ).size,
      };

      data.forEach((log) => {
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
        stats.byEntity[log.entity_type] =
          (stats.byEntity[log.entity_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      this.logger.error('Failed to retrieve audit statistics:', error);
      return null;
    }
  }

  /**
   * Create audit log entry in database
   */
  private async createAuditLog(dto: CreateAuditLogDto): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      const { error } = await supabase.from('system_audit_log').insert({
        action: dto.action,
        entity_type: dto.entityType,
        entity_id: dto.entityId,
        entity_description: dto.entityDescription,
        actor_user_id: dto.actorUserId || null,
        actor_name: dto.actorName || null,
        actor_role: dto.actorRole || null,
        changed_fields: dto.changedFields || null,
        before_state: dto.beforeState || null,
        after_state: dto.afterState || null,
        ip_address: dto.ipAddress || null,
        user_agent: dto.userAgent || null,
        request_id: dto.requestId || null,
        note: dto.note || null,
        metadata: dto.metadata || null,
      });

      if (error) {
        this.logger.error('Failed to insert audit log:', error);
      }
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * Detect changed fields between two states
   */
  private detectChangedFields(before: any, after: any): string[] {
    const changedFields: string[] = [];

    if (!before || !after) {
      return changedFields;
    }

    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      // Skip metadata fields
      if (
        [
          'created_at',
          'updated_at',
          'deleted_at',
          'created_by',
          'updated_by',
        ].includes(key)
      ) {
        continue;
      }

      const beforeValue = before[key];
      const afterValue = after[key];

      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  /**
   * Generate human-readable entity description
   */
  private generateEntityDescription(
    entity: any,
    descriptionField?: string,
  ): string {
    if (!entity) {
      return '';
    }

    if (descriptionField && entity[descriptionField]) {
      return entity[descriptionField].toString();
    }

    // Try common description fields
    const commonFields = ['title', 'name', 'full_name', 'email', 'subject'];
    for (const field of commonFields) {
      if (entity[field]) {
        return entity[field].toString();
      }
    }

    return '';
  }

  /**
   * Sanitize entity state before storing (remove sensitive fields)
   */
  private sanitizeState(
    state: any,
  ): Record<string, any> | undefined {
    if (!state) {
      return undefined;
    }

    const sanitized = { ...state };

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'password_hash',
      'salt',
      'secret',
      'api_key',
      'token',
      'access_token',
      'refresh_token',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
