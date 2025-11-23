import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { RoleCacheService } from '../services/role-cache.service';
import { UserRole, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private roleCacheService: RoleCacheService,
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
    // Get required roles from the route handler
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Sanitize user ID
      const sanitizedUserId = this.sanitizeInput(user.id);
      if (!sanitizedUserId) {
        throw new ForbiddenException('Invalid user ID');
      }

      // ✅ NEW: Get user role from database with caching
      let userRole = this.roleCacheService.getCachedRole(sanitizedUserId);

      if (!userRole) {
        // Only log in development mode or when debugging
        if (
          process.env.NODE_ENV === 'development' &&
          process.env.DEBUG_ROLE_CACHE === 'true'
        ) {
          console.log(
            `🔍 Cache miss for user ${sanitizedUserId}, querying database...`,
          );
        }
        userRole =
          await this.authService.getUserRoleFromDatabase(sanitizedUserId);

        if (userRole) {
          // Sanitize role name
          const sanitizedRole = this.sanitizeInput(userRole);
          if (sanitizedRole) {
            // Cache the role for future requests
            this.roleCacheService.setCachedRole(sanitizedUserId, sanitizedRole);
            if (
              process.env.NODE_ENV === 'development' &&
              process.env.DEBUG_ROLE_CACHE === 'true'
            ) {
              console.log(
                `✅ Cached role "${sanitizedRole}" for user ${sanitizedUserId}`,
              );
            }
            userRole = sanitizedRole;
          }
        }
      } else {
        // Cache hit - no need to log every single request
        // Only log in development mode or when debugging
        if (
          process.env.NODE_ENV === 'development' &&
          process.env.DEBUG_ROLE_CACHE === 'true'
        ) {
          console.log(
            `⚡ Cache hit for user ${sanitizedUserId}, role: "${userRole}"`,
          );
        }
      }

      if (!userRole) {
        throw new ForbiddenException('User role not found in database');
      }

      // Sanitize required roles
      const sanitizedRequiredRoles = requiredRoles
        .map((role) => this.sanitizeInput(role))
        .filter((role): role is string => role !== null && role !== undefined);

      // Check if user's role is in the required roles (with hierarchy support)
      const hasRole = sanitizedRequiredRoles.some(
        (role) =>
          role === userRole ||
          (userRole && this.authService.hasRoleHierarchy(userRole, role)),
      );

      if (!hasRole) {
        // Enhanced security logging
        console.warn(
          `🚫 ROLE_DENIED: User ${sanitizedUserId} attempted access requiring roles [${sanitizedRequiredRoles.join(', ')}] but has role "${userRole}" at ${new Date().toISOString()}`,
        );
        throw new ForbiddenException(
          `Access denied. Required roles: ${sanitizedRequiredRoles.join(', ')}. Your role: ${userRole}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error in RolesGuard:', error);
      throw new ForbiddenException('Failed to verify user role');
    }
  }
}
