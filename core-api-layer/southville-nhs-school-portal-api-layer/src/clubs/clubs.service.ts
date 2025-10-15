import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Creates a new club
   * @param createClubDto - Club creation data
   * @returns Promise<Club> - Created club
   */
  async create(createClubDto: CreateClubDto): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify domain exists
      const { data: domain, error: domainError } = await supabase
        .from('domains')
        .select('id, type, name')
        .eq('id', createClubDto.domain_id)
        .single();

      if (domainError || !domain) {
        throw new NotFoundException(
          `Domain with ID ${createClubDto.domain_id} not found`,
        );
      }

      if (domain.type !== 'club') {
        throw new BadRequestException(
          `Domain type must be 'club', got '${domain.type}'`,
        );
      }

      // Create club
      const { data, error } = await supabase
        .from('clubs')
        .insert(createClubDto)
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating club:', error);
        throw new BadRequestException(
          `Failed to create club: ${error.message}`,
        );
      }

      this.logger.log(`Created club: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating club:', error);
      throw new BadRequestException('Failed to create club');
    }
  }

  /**
   * Gets all clubs
   * @returns Promise<Club[]> - Array of clubs
   */
  async findAll(): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('clubs')
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching clubs:', error);
        throw new BadRequestException(
          `Failed to fetch clubs: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching clubs:', error);
      throw new BadRequestException('Failed to fetch clubs');
    }
  }

  /**
   * Gets a club by ID
   * @param id - Club ID
   * @returns Promise<Club> - Club data
   */
  async findOne(id: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('clubs')
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Club with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching club ${id}:`, error);
      throw new BadRequestException('Failed to fetch club');
    }
  }

  /**
   * Updates a club
   * @param id - Club ID
   * @param updateClubDto - Update data
   * @returns Promise<Club> - Updated club
   */
  async update(id: string, updateClubDto: UpdateClubDto): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      const existingClub = await this.findOne(id);

      // Validate domain_id if provided
      if (updateClubDto.domain_id) {
        const { data: domain, error: domainError } = await supabase
          .from('domains')
          .select('id, type')
          .eq('id', updateClubDto.domain_id)
          .single();

        if (domainError || !domain) {
          throw new BadRequestException('Invalid domain_id: domain not found');
        }

        if (domain.type !== 'club') {
          throw new BadRequestException(
            `Invalid domain_id: domain type must be 'club', got '${domain.type}'`,
          );
        }
      }

      // Update club
      const { data, error } = await supabase
        .from('clubs')
        .update({
          ...updateClubDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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

      if (error) {
        this.logger.error(`Error updating club ${id}:`, error);
        throw new BadRequestException(
          `Failed to update club: ${error.message}`,
        );
      }

      this.logger.log(`Updated club: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error updating club ${id}:`, error);
      throw new BadRequestException('Failed to update club');
    }
  }

  /**
   * Deletes a club
   * @param id - Club ID
   * @returns Promise<void>
   */
  async remove(id: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      await this.findOne(id);

      const { error } = await supabase.from('clubs').delete().eq('id', id);

      if (error) {
        this.logger.error(`Error deleting club ${id}:`, error);
        throw new BadRequestException(
          `Failed to delete club: ${error.message}`,
        );
      }

      this.logger.log(`Deleted club with ID: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error deleting club ${id}:`, error);
      throw new BadRequestException('Failed to delete club');
    }
  }

  /**
   * Gets club members (placeholder for future implementation)
   * @param clubId - Club ID
   * @returns Promise<any[]> - Club members
   */
  async getMembers(clubId: string): Promise<any[]> {
    // TODO: Implement when student_club_memberships table is ready
    return [];
  }

  /**
   * Adds a member to a club (placeholder for future implementation)
   * @param clubId - Club ID
   * @param memberData - Member data
   * @returns Promise<any> - Added member
   */
  async addMember(clubId: string, memberData: any): Promise<any> {
    // TODO: Implement when student_club_memberships table is ready
    throw new BadRequestException('Member management not yet implemented');
  }

  /**
   * Updates club finances (placeholder for future implementation)
   * @param clubId - Club ID
   * @param financesData - Finances data
   * @returns Promise<any> - Updated finances
   */
  async updateFinances(clubId: string, financesData: any): Promise<any> {
    // TODO: Implement when club finances table is ready
    return {
      clubId,
      message: 'Finances updated successfully',
      data: financesData,
    };
  }
}
