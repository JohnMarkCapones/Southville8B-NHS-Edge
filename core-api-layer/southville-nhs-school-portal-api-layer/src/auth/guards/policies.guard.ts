import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyConfig, POLICIES_KEY } from '../decorators/policies.decorator';
import { PolicyEngineService } from '../services/policy-engine.service';
import { DomainMappingService } from '../services/domain-mapping.service';
import { SupabaseUser } from '../interfaces/supabase-user.interface';

/**
 * Guard that evaluates domain-specific permissions (PBAC)
 * Works in conjunction with RBAC to provide fine-grained access control
 *
 * Flow:
 * 1. Extract policy configuration from route metadata
 * 2. Get domain ID from route parameters using DomainMappingService
 * 3. Evaluate permission using PolicyEngineService
 * 4. Grant/deny access based on result
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PoliciesGuard.name);

  constructor(
    private reflector: Reflector,
    private policyEngineService: PolicyEngineService,
    private domainMappingService: DomainMappingService,
  ) {}

  /**
   * Sanitize input to prevent XSS attacks
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  private sanitizeInput(
    input: string | null | undefined,
  ): string | null | undefined {
    if (!input) return input;
    return input.replace(/<[^>]*>/g, '').trim();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get policy configuration from route metadata
    const policyConfig = this.reflector.getAllAndOverride<PolicyConfig>(
      POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no policies are required, allow access
    if (!policyConfig) {
      this.logger.debug('No policies required for this route');
      return true;
    }

    // Get the request object and user
    const request = context.switchToHttp().getRequest();
    const user: SupabaseUser = request.user;

    if (!user) {
      this.logger.warn('No authenticated user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const { domainParam, permissionKey } = policyConfig;

      // Sanitize inputs
      const sanitizedUserId = this.sanitizeInput(user.id);
      const sanitizedDomainParam = this.sanitizeInput(domainParam);
      const sanitizedPermissionKey = this.sanitizeInput(permissionKey);

      if (
        !sanitizedUserId ||
        !sanitizedDomainParam ||
        !sanitizedPermissionKey
      ) {
        throw new ForbiddenException('Invalid input parameters');
      }

      // Extract domain entity ID from route parameters
      const entityId = request.params[sanitizedDomainParam];
      if (!entityId) {
        this.logger.warn(
          `Domain parameter '${sanitizedDomainParam}' not found in route parameters`,
        );
        throw new ForbiddenException(
          `Required parameter '${sanitizedDomainParam}' not found`,
        );
      }

      // Sanitize entity ID
      const sanitizedEntityId = this.sanitizeInput(entityId);
      if (!sanitizedEntityId) {
        throw new ForbiddenException('Invalid entity ID');
      }

      // Resolve domain ID from entity ID
      const domainId = await this.domainMappingService.resolveDomainId(
        sanitizedDomainParam,
        sanitizedEntityId,
      );
      if (!domainId) {
        this.logger.warn(
          `Could not resolve domain ID for ${sanitizedDomainParam}:${sanitizedEntityId}`,
        );
        throw new ForbiddenException(
          `Invalid ${sanitizedDomainParam} or domain not found`,
        );
      }

      this.logger.debug(
        `Evaluating permission for user ${sanitizedUserId}, domain ${domainId}, permission ${sanitizedPermissionKey}`,
      );

      // Evaluate the permission
      const hasPermission = await this.policyEngineService.evaluatePermission(
        sanitizedUserId,
        domainId,
        sanitizedPermissionKey,
      );

      if (!hasPermission) {
        // Enhanced security logging
        this.logger.warn(
          `🚫 PERMISSION_DENIED: User ${sanitizedUserId} attempted ${sanitizedPermissionKey} on domain ${domainId} at ${new Date().toISOString()}`,
        );
        this.logger.warn(
          `🔍 Security Context: IP=${request.ip}, UserAgent=${request.headers['user-agent']}, Path=${request.path}`,
        );
        throw new ForbiddenException(
          `Access denied. Required permission: ${sanitizedPermissionKey} in domain ${domainId}`,
        );
      }

      this.logger.debug(
        `✅ Access granted for user ${sanitizedUserId} - has permission ${sanitizedPermissionKey} in domain ${domainId}`,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error in PoliciesGuard for user ${user.id}`,
        error,
      );
      throw new ForbiddenException('Failed to evaluate domain permissions');
    }
  }
}
