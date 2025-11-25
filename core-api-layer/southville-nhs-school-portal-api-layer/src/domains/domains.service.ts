import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDomainDto, CreateClubDomainDto } from './dto/create-domain.dto';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Creates a new domain
   * @param createDomainDto - Domain creation data
   * @param createdBy - User ID who created the domain
   * @returns Promise<any> - Created domain
   */
  async create(
    createDomainDto: CreateDomainDto,
    createdBy: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domains')
        .insert({
          ...createDomainDto,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating domain:', error);
        throw new BadRequestException(
          `Failed to create domain: ${error.message}`,
        );
      }

      this.logger.log(`Created domain: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error creating domain:', error);
      throw new BadRequestException('Failed to create domain');
    }
  }

  /**
   * Creates a club domain with associated club record
   * @param createClubDomainDto - Club domain creation data
   * @param createdBy - User ID who created the domain
   * @returns Promise<any> - Created domain and club
   */
  async createClubDomain(
    createClubDomainDto: CreateClubDomainDto,
    createdBy: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Start transaction-like operation
      // 1. Create domain
      const { data: domain, error: domainError } = await supabase
        .from('domains')
        .insert({
          type: 'club',
          name: createClubDomainDto.name,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (domainError) {
        this.logger.error('Error creating domain:', domainError);
        throw new BadRequestException(
          `Failed to create domain: ${domainError.message}`,
        );
      }

      // 2. Create club linked to domain
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: createClubDomainDto.name,
          description: createClubDomainDto.description,
          president_id: createClubDomainDto.president_id,
          vp_id: createClubDomainDto.vp_id,
          secretary_id: createClubDomainDto.secretary_id,
          advisor_id: createClubDomainDto.advisor_id,
          domain_id: domain.id,
        })
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .single();

      if (clubError) {
        this.logger.error('Error creating club:', clubError);
        // Clean up domain if club creation fails
        await supabase.from('domains').delete().eq('id', domain.id);
        throw new BadRequestException(
          `Failed to create club: ${clubError.message}`,
        );
      }

      // 3. Create default domain roles
      await this.createDefaultDomainRoles(domain.id, createdBy);

      this.logger.log(
        `Created club domain: ${domain.name} with club ID: ${club.id}`,
      );

      return {
        domain,
        club,
        message: 'Club domain created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error creating club domain:', error);
      throw new BadRequestException('Failed to create club domain');
    }
  }

  /**
   * Creates default domain roles for a club
   * @param domainId - Domain ID
   * @param createdBy - User ID who created the roles
   */
  private async createDefaultDomainRoles(
    domainId: string,
    createdBy: string,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const defaultRoles = [
        {
          name: 'President',
          permissions: [
            'club.edit',
            'club.delete',
            'club.manage_finances',
            'club.manage_members',
            'club.view_members',
          ],
        },
        {
          name: 'Vice President',
          permissions: [
            'club.edit',
            'club.manage_finances',
            'club.manage_members',
            'club.view_members',
          ],
        },
        {
          name: 'Treasurer',
          permissions: ['club.manage_finances', 'club.view_members'],
        },
        {
          name: 'Secretary',
          permissions: [
            'club.edit',
            'club.manage_members',
            'club.view_members',
          ],
        },
        { name: 'Member', permissions: ['club.view_members'] },
      ];

      for (const roleData of defaultRoles) {
        // Create domain role
        const { data: domainRole, error: roleError } = await supabase
          .from('domain_roles')
          .insert({
            domain_id: domainId,
            name: roleData.name,
          })
          .select('*')
          .single();

        if (roleError) {
          this.logger.warn(
            `Failed to create domain role ${roleData.name}:`,
            roleError,
          );
          continue;
        }

        // Assign permissions to role
        for (const permissionKey of roleData.permissions) {
          // Get permission ID
          const { data: permission, error: permError } = await supabase
            .from('permissions')
            .select('id')
            .eq('key', permissionKey)
            .single();

          if (permError || !permission) {
            this.logger.warn(`Permission ${permissionKey} not found, skipping`);
            continue;
          }

          // Create domain role permission
          await supabase.from('domain_role_permissions').insert({
            domain_role_id: domainRole.id,
            permission_id: permission.id,
            allowed: true,
          });
        }
      }

      this.logger.log(`Created default domain roles for domain ${domainId}`);
    } catch (error) {
      this.logger.error('Error creating default domain roles:', error);
      // Don't throw error as this is not critical for domain creation
    }
  }

  /**
   * Gets all domains
   * @returns Promise<any[]> - Array of domains
   */
  async findAll(): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domains')
        .select(
          `
          *,
          created_by_user:created_by(id, full_name, email)
        `,
        )
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching domains:', error);
        throw new BadRequestException(
          `Failed to fetch domains: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching domains:', error);
      throw new BadRequestException('Failed to fetch domains');
    }
  }

  /**
   * Gets a domain by ID
   * @param id - Domain ID
   * @returns Promise<any> - Domain data
   */
  async findOne(id: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('domains')
        .select(
          `
          *,
          created_by_user:created_by(id, full_name, email),
          domain_roles(id, name),
          clubs(id, name, description)
        `,
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Domain with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching domain ${id}:`, error);
      throw new BadRequestException('Failed to fetch domain');
    }
  }

  /**
   * Gets all domain roles for a specific domain
   * @param domainId - Domain ID
   * @returns Promise<any[]> - Array of domain roles
   */
  async getDomainRoles(domainId: string): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // First check if domain exists
      const { data: domain, error: domainError } = await supabase
        .from('domains')
        .select('id')
        .eq('id', domainId)
        .single();

      if (domainError || !domain) {
        throw new NotFoundException(`Domain with ID ${domainId} not found`);
      }

      // Get domain roles
      const { data, error } = await supabase
        .from('domain_roles')
        .select(
          `
          *,
          domain:domain_id(id, type, name)
        `,
        )
        .eq('domain_id', domainId)
        .order('name', { ascending: true });

      if (error) {
        this.logger.error(
          `Error fetching domain roles for domain ${domainId}:`,
          error,
        );
        throw new BadRequestException(
          `Failed to fetch domain roles: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected error fetching domain roles for domain ${domainId}:`,
        error,
      );
      throw new BadRequestException('Failed to fetch domain roles');
    }
  }
}
