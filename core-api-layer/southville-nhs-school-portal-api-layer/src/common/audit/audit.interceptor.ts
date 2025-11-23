import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { AuditService } from './audit.service';
import {
  AUDIT_METADATA_KEY,
  AuditDecoratorOptions,
} from './audit.decorator';
import { AuditAction } from './audit.types';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get audit metadata from decorator
    const auditOptions = this.reflector.get<AuditDecoratorOptions>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    // If no audit metadata, skip auditing
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const method = request.method;

    // Determine action - use custom action from decorator if provided
    let action: AuditAction | null = null;

    if (auditOptions.action) {
      // Use custom action specified in decorator (e.g., RESTORE, PUBLISH)
      action = auditOptions.action;
    } else if (method === 'POST' && !auditOptions.excludeActions?.includes('create')) {
      action = AuditAction.CREATE;
    } else if (
      (method === 'PUT' || method === 'PATCH') &&
      !auditOptions.excludeActions?.includes('update')
    ) {
      action = AuditAction.UPDATE;
    } else if (
      method === 'DELETE' &&
      !auditOptions.excludeActions?.includes('delete')
    ) {
      action = AuditAction.DELETE;
    }

    // If no action to audit, skip
    if (!action) {
      return next.handle();
    }

    // Extract actor information from request
    const user = (request as any).user;
    const actorUserId = user?.id || user?.sub;
    const actorName = user?.full_name || user?.email || 'Unknown';
    const actorRole =
      user?.role || user?.user_metadata?.role || 'Authenticated';

    // Extract request metadata
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];
    const requestId = request.id || request.headers['x-request-id'] as string;

    // Store request body for UPDATE operations (to detect before state)
    const requestBody = (request as any).body;

    // For DELETE operations, extract entity ID from URL params before execution
    const urlParams = (request as any).params || {};
    const entityIdFromUrl = urlParams.id || urlParams.uuid;

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Handle different response structures
          let entityData = this.extractEntityData(response);

          // For DELETE operations with no response (204 No Content),
          // create minimal entity data from URL params
          if (!entityData && action === AuditAction.DELETE && entityIdFromUrl) {
            entityData = { id: entityIdFromUrl };
            this.logger.debug(
              `Using entity ID from URL for DELETE: ${entityIdFromUrl}`,
            );
          }

          // Only skip if we have no entity data at all
          if (!entityData) {
            this.logger.debug(
              `No entity data found in response for ${auditOptions.entityType}`,
            );
            return;
          }

          const commonOptions = {
            actorUserId,
            actorName,
            actorRole,
            idField: auditOptions.idField,
            descriptionField: auditOptions.descriptionField,
            ipAddress,
            userAgent,
            requestId,
          };

          // Log based on action
          if (action === AuditAction.CREATE) {
            await this.auditService.logCreate(
              auditOptions.entityType,
              entityData,
              commonOptions,
            );
          } else if (action === AuditAction.UPDATE) {
            // For updates, we need the before state
            // If the response includes both before and after, use it
            // Otherwise, we'll just log the after state
            const beforeState = (response as any).before || null;
            const afterState = (response as any).after || entityData;

            await this.auditService.logUpdate(
              auditOptions.entityType,
              beforeState,
              afterState,
              commonOptions,
            );
          } else if (action === AuditAction.DELETE) {
            await this.auditService.logDelete(
              auditOptions.entityType,
              entityData,
              commonOptions,
            );
          } else {
            // Handle custom actions (RESTORE, PUBLISH, APPROVE, etc.)
            await this.auditService.logCustomAction(
              action,
              auditOptions.entityType,
              entityData,
              commonOptions,
            );
          }
        } catch (error) {
          this.logger.error(`Failed to log audit for ${action}:`, error);
        }
      }),
      catchError((error) => {
        // Log error but don't block the request
        this.logger.error(`Request failed, skipping audit log:`, error.message);
        throw error;
      }),
    );
  }

  /**
   * Extract entity data from response
   * Handles various response structures:
   * - Direct entity: { id, name, ... }
   * - Wrapped: { data: { id, name, ... } }
   * - With metadata: { result: { id, name, ... }, meta: {...} }
   */
  private extractEntityData(response: any): any {
    if (!response) {
      return null;
    }

    // If response is array, take first item
    if (Array.isArray(response)) {
      return response[0] || null;
    }

    // Check common wrapper properties
    if (response.data) {
      return Array.isArray(response.data) ? response.data[0] : response.data;
    }

    if (response.result) {
      return Array.isArray(response.result)
        ? response.result[0]
        : response.result;
    }

    if (response.entity) {
      return response.entity;
    }

    // Handle before/after structure for updates
    if (response.after) {
      return response.after;
    }

    if (response.before) {
      return response.before;
    }

    // If response looks like an entity (has id field), return it
    if (response.id || response.uuid) {
      return response;
    }

    return null;
  }

  /**
   * Extract IP address from request
   * Checks various headers for proxied requests
   */
  private extractIpAddress(request: FastifyRequest): string | undefined {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip;
  }
}
