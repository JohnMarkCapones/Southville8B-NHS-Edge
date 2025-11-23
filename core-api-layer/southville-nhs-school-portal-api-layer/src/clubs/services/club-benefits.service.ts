import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateClubBenefitDto } from '../dto/create-club-benefit.dto';
import { UpdateClubBenefitDto } from '../dto/update-club-benefit.dto';
import { ClubBenefit } from '../entities/club-benefit.entity';

@Injectable()
export class ClubBenefitsService {
  private readonly logger = new Logger(ClubBenefitsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all benefits for a club
   * @param clubId - Club ID
   * @returns Promise<ClubBenefit[]>
   */
  async findAll(clubId: string): Promise<ClubBenefit[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_benefits')
        .select('*')
        .eq('club_id', clubId)
        .order('order_index', { ascending: true });

      if (error) {
        this.logger.error(`Error fetching benefits for club ${clubId}:`, error);
        throw new InternalServerErrorException(
          `Failed to fetch benefits: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching benefits:', error);
      throw new BadRequestException('Failed to fetch benefits');
    }
  }

  /**
   * Get a single benefit by ID
   * @param clubId - Club ID
   * @param benefitId - Benefit ID
   * @returns Promise<ClubBenefit>
   */
  async findOne(clubId: string, benefitId: string): Promise<ClubBenefit> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_benefits')
        .select('*')
        .eq('id', benefitId)
        .eq('club_id', clubId)
        .single();

      if (error || !data) {
        throw new NotFoundException(
          `Benefit with ID ${benefitId} not found in club ${clubId}`,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching benefit:', error);
      throw new BadRequestException('Failed to fetch benefit');
    }
  }

  /**
   * Create a new benefit for a club
   * @param clubId - Club ID
   * @param createBenefitDto - Benefit data
   * @returns Promise<ClubBenefit>
   */
  async create(
    clubId: string,
    createBenefitDto: CreateClubBenefitDto,
  ): Promise<ClubBenefit> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('id', clubId)
        .single();

      if (clubError || !club) {
        throw new NotFoundException(`Club with ID ${clubId} not found`);
      }

      const { data, error } = await supabase
        .from('club_benefits')
        .insert({
          club_id: clubId,
          ...createBenefitDto,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating benefit:', error);
        throw new InternalServerErrorException(
          `Failed to create benefit: ${error.message}`,
        );
      }

      this.logger.log(`Created benefit for club ${clubId}: ${data.id}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating benefit:', error);
      throw new BadRequestException('Failed to create benefit');
    }
  }

  /**
   * Update a benefit
   * @param clubId - Club ID
   * @param benefitId - Benefit ID
   * @param updateBenefitDto - Update data
   * @returns Promise<ClubBenefit>
   */
  async update(
    clubId: string,
    benefitId: string,
    updateBenefitDto: UpdateClubBenefitDto,
  ): Promise<ClubBenefit> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify benefit exists and belongs to club
      await this.findOne(clubId, benefitId);

      const { data, error } = await supabase
        .from('club_benefits')
        .update({
          ...updateBenefitDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', benefitId)
        .eq('club_id', clubId)
        .select()
        .single();

      if (error || !data) {
        this.logger.error('Error updating benefit:', error);
        throw new InternalServerErrorException(
          `Failed to update benefit: ${error?.message}`,
        );
      }

      this.logger.log(`Updated benefit ${benefitId} for club ${clubId}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating benefit:', error);
      throw new BadRequestException('Failed to update benefit');
    }
  }

  /**
   * Delete a benefit
   * @param clubId - Club ID
   * @param benefitId - Benefit ID
   * @returns Promise<void>
   */
  async remove(clubId: string, benefitId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify benefit exists and belongs to club
      await this.findOne(clubId, benefitId);

      const { error } = await supabase
        .from('club_benefits')
        .delete()
        .eq('id', benefitId)
        .eq('club_id', clubId);

      if (error) {
        this.logger.error('Error deleting benefit:', error);
        throw new InternalServerErrorException(
          `Failed to delete benefit: ${error.message}`,
        );
      }

      this.logger.log(`Deleted benefit ${benefitId} from club ${clubId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error deleting benefit:', error);
      throw new BadRequestException('Failed to delete benefit');
    }
  }
}
