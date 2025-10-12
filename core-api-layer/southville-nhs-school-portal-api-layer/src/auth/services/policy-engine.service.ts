import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

interface CachedPermission {
  result: boolean;
  timestamp: number;
}

/**
 * Service responsible for evaluating domain-specific permissions
 * Queries the permission chain: user_domain_roles → domain_roles → domain_role_permissions → permissions
 */
@Injectable()
export class PolicyEngineService {
  private readonly logger = new Logger(PolicyEngineService.name);
  private permissionCache = new Map<string, CachedPermission>();
  private readonly PERMISSION_TTL = 30 * 1000; // 30 seconds in milliseconds

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Evaluates if a user has permission for a specific domain and permission key
   * @param userId - The user ID
   * @param domainId - The domain ID
   * @param permissionKey - The permission key to check (e.g., 'club.manage_finances')
   * @returns Promise<boolean> - Whether the user has the permission
   */
  async evaluatePermission(
    userId: string,
    domainId: number,
    permissionKey: string,
  ): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `${userId}:${domainId}:${permissionKey}`;
      const cached = this.permissionCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.PERMISSION_TTL) {
        this.logger.debug(
          `⚡ Permission cache hit for ${cacheKey}: ${cached.result}`,
        );
        return cached.result;
      }

      this.logger.debug(
        `🔍 Permission cache miss for user ${userId}, domain ${domainId}, permission ${permissionKey}`,
      );

      const supabase = this.supabaseService.getServiceClient();

      // Query the permission chain in one go using joins
      const { data, error } = await supabase
        .from('user_domain_roles')
        .select(
          `
          domain_role_id,
          domain_roles!inner(
            id,
            domain_id,
            domain_role_permissions!inner(
              allowed,
              permissions!inner(
                key
              )
            )
          )
        `,
        )
        .eq('user_id', userId)
        .eq('domain_roles.domain_id', domainId)
        .eq(
          'domain_roles.domain_role_permissions.permissions.key',
          permissionKey,
        );

      if (error) {
        this.logger.error(
          `Error evaluating permission for user ${userId}`,
          error,
        );
        throw new ForbiddenException('Failed to evaluate permissions');
      }

      if (!data || data.length === 0) {
        this.logger.debug(
          `No permissions found for user ${userId} in domain ${domainId} with key ${permissionKey}`,
        );
        return false;
      }

      // Check if any of the found permissions are allowed
      const hasPermission = data.some((userRole: any) =>
        userRole.domain_roles.domain_role_permissions.some(
          (rolePermission: any) => rolePermission.allowed === true,
        ),
      );

      // Cache the result
      this.permissionCache.set(cacheKey, {
        result: hasPermission,
        timestamp: Date.now(),
      });

      this.logger.debug(
        `✅ Permission evaluation result for user ${userId}: ${hasPermission} (cached)`,
      );
      return hasPermission;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error evaluating permission for user ${userId}`,
        error,
      );
      throw new ForbiddenException('Failed to evaluate permissions');
    }
  }

  /**
   * Gets all permissions for a user in a specific domain
   * @param userId - The user ID
   * @param domainId - The domain ID
   * @returns Promise<Array<{permissionKey: string, allowed: boolean}>> - Array of permissions
   */
  async getUserDomainPermissions(
    userId: string,
    domainId: number,
  ): Promise<Array<{ permissionKey: string; allowed: boolean }>> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('user_domain_roles')
        .select(
          `
          domain_role_id,
          domain_roles!inner(
            id,
            domain_id,
            domain_role_permissions!inner(
              allowed,
              permissions!inner(
                key
              )
            )
          )
        `,
        )
        .eq('user_id', userId)
        .eq('domain_roles.domain_id', domainId);

      if (error) {
        this.logger.error(
          `Error getting user domain permissions for user ${userId}`,
          error,
        );
        throw new ForbiddenException('Failed to get user permissions');
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Flatten and deduplicate permissions
      const permissionsMap = new Map<string, boolean>();

      data.forEach((userRole: any) => {
        userRole.domain_roles.domain_role_permissions.forEach(
          (rolePermission: any) => {
            const key = rolePermission.permissions.key;
            // If permission already exists, use OR logic (true if any role allows it)
            permissionsMap.set(
              key,
              permissionsMap.get(key) || rolePermission.allowed,
            );
          },
        );
      });

      return Array.from(permissionsMap.entries()).map(
        ([permissionKey, allowed]) => ({
          permissionKey,
          allowed,
        }),
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error getting user domain permissions for user ${userId}`,
        error,
      );
      throw new ForbiddenException('Failed to get user permissions');
    }
  }

  /**
   * Checks if a user has any role in a specific domain
   * @param userId - The user ID
   * @param domainId - The domain ID
   * @returns Promise<boolean> - Whether the user has any role in the domain
   */
  async hasAnyDomainRole(userId: string, domainId: number): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('user_domain_roles')
        .select(
          `
          domain_role_id,
          domain_roles!inner(
            id,
            domain_id
          )
        `,
        )
        .eq('user_id', userId)
        .eq('domain_roles.domain_id', domainId)
        .limit(1);

      if (error) {
        this.logger.error(
          `Error checking domain role for user ${userId}`,
          error,
        );
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      this.logger.error(
        `Unexpected error checking domain role for user ${userId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Clear permission cache for a specific user
   * @param userId - The user ID
   */
  clearUserPermissionCache(userId: string): void {
    const keysToDelete = Array.from(this.permissionCache.keys()).filter((key) =>
      key.startsWith(`${userId}:`),
    );
    keysToDelete.forEach((key) => this.permissionCache.delete(key));
    this.logger.debug(
      `🗑️ Cleared permission cache for user ${userId} (${keysToDelete.length} entries)`,
    );
  }

  /**
   * Clear all permission cache
   */
  clearAllPermissionCache(): void {
    this.permissionCache.clear();
    this.logger.debug('🗑️ Cleared all permission cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number; result: boolean }>;
  } {
    const entries = Array.from(this.permissionCache.entries()).map(
      ([key, cached]) => ({
        key,
        age: Date.now() - cached.timestamp,
        result: cached.result,
      }),
    );

    return {
      size: this.permissionCache.size,
      entries,
    };
  }
}
