import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Service for managing PBAC (Policy-Based Access Control) data
 * Provides methods to create, update, and manage domains, roles, and permissions
 */
@Injectable()
export class PbacManagementService {
  private readonly logger = new Logger(PbacManagementService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Creates a new domain
   * @param type - The domain type (e.g., 'club', 'event', 'project')
   * @param name - The domain name
   * @param createdBy - The user ID who created the domain
   * @returns Promise<number> - The created domain ID
   */
  async createDomain(
    type: string,
    name: string,
    createdBy: string,
  ): Promise<number> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domains')
        .insert({
          type,
          name,
          created_by: createdBy,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(`Error creating domain: ${type}:${name}`, error);
        throw new Error(`Failed to create domain: ${error.message}`);
      }

      this.logger.log(`Created domain ${data.id} for ${type}:${name}`);
      return data.id;
    } catch (error) {
      this.logger.error(
        `Unexpected error creating domain: ${type}:${name}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new domain role
   * @param domainId - The domain ID
   * @param name - The role name (e.g., 'Treasurer', 'Secretary')
   * @param createdBy - The user ID who created the role
   * @returns Promise<number> - The created domain role ID
   */
  async createDomainRole(
    domainId: number,
    name: string,
    createdBy: string,
  ): Promise<number> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domain_roles')
        .insert({
          domain_id: domainId,
          name,
          created_by: createdBy,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(
          `Error creating domain role: ${name} for domain ${domainId}`,
          error,
        );
        throw new Error(`Failed to create domain role: ${error.message}`);
      }

      this.logger.log(
        `Created domain role ${data.id}: ${name} for domain ${domainId}`,
      );
      return data.id;
    } catch (error) {
      this.logger.error(
        `Unexpected error creating domain role: ${name}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new permission
   * @param key - The permission key (e.g., 'club.manage_finances')
   * @param description - The permission description
   * @returns Promise<number> - The created permission ID
   */
  async createPermission(key: string, description?: string): Promise<number> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('permissions')
        .insert({
          key,
          description,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(`Error creating permission: ${key}`, error);
        throw new Error(`Failed to create permission: ${error.message}`);
      }

      this.logger.log(`Created permission ${data.id}: ${key}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Unexpected error creating permission: ${key}`, error);
      throw error;
    }
  }

  /**
   * Assigns a permission to a domain role
   * @param domainRoleId - The domain role ID
   * @param permissionId - The permission ID
   * @param allowed - Whether the permission is allowed (default: true)
   * @returns Promise<number> - The created domain role permission ID
   */
  async assignPermissionToRole(
    domainRoleId: number,
    permissionId: number,
    allowed: boolean = true,
  ): Promise<number> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domain_role_permissions')
        .insert({
          domain_role_id: domainRoleId,
          permission_id: permissionId,
          allowed,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(
          `Error assigning permission ${permissionId} to role ${domainRoleId}`,
          error,
        );
        throw new Error(`Failed to assign permission: ${error.message}`);
      }

      this.logger.log(
        `Assigned permission ${permissionId} to domain role ${domainRoleId} (allowed: ${allowed})`,
      );
      return data.id;
    } catch (error) {
      this.logger.error(`Unexpected error assigning permission to role`, error);
      throw error;
    }
  }

  /**
   * Assigns a domain role to a user
   * @param userId - The user ID
   * @param domainRoleId - The domain role ID
   * @returns Promise<number> - The created user domain role ID
   */
  async assignRoleToUser(
    userId: string,
    domainRoleId: number,
  ): Promise<number> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('user_domain_roles')
        .insert({
          user_id: userId,
          domain_role_id: domainRoleId,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(
          `Error assigning role ${domainRoleId} to user ${userId}`,
          error,
        );
        throw new Error(`Failed to assign role to user: ${error.message}`);
      }

      this.logger.log(`Assigned domain role ${domainRoleId} to user ${userId}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Unexpected error assigning role to user`, error);
      throw error;
    }
  }

  /**
   * Gets all domains
   * @returns Promise<Array<{id: number, type: string, name: string}>>
   */
  async getAllDomains(): Promise<
    Array<{ id: number; type: string; name: string }>
  > {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domains')
        .select('id, type, name')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error getting all domains', error);
        throw new Error(`Failed to get domains: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Unexpected error getting domains', error);
      throw error;
    }
  }

  /**
   * Gets all permissions
   * @returns Promise<Array<{id: string, key: string, description: string | null}>>
   */
  async getAllPermissions(): Promise<
    Array<{ id: string; key: string; description: string | null }>
  > {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('permissions')
        .select('id, key, description')
        .order('key');

      if (error) {
        this.logger.error('Error getting all permissions', error);
        throw new Error(`Failed to get permissions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Unexpected error getting permissions', error);
      throw error;
    }
  }

  /**
   * Removes a domain role from a user
   * @param userId - The user ID
   * @param domainRoleId - The domain role ID
   * @returns Promise<boolean> - Whether the removal was successful
   */
  async removeRoleFromUser(
    userId: string,
    domainRoleId: number,
  ): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { error } = await supabase
        .from('user_domain_roles')
        .delete()
        .eq('user_id', userId)
        .eq('domain_role_id', domainRoleId);

      if (error) {
        this.logger.error(
          `Error removing role ${domainRoleId} from user ${userId}`,
          error,
        );
        throw new Error(`Failed to remove role from user: ${error.message}`);
      }

      this.logger.log(
        `Removed domain role ${domainRoleId} from user ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Unexpected error removing role from user`, error);
      throw error;
    }
  }
}
