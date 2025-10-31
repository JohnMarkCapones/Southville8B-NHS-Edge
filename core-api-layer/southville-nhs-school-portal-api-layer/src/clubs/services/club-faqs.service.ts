import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateClubFaqDto } from '../dto/create-club-faq.dto';
import { UpdateClubFaqDto } from '../dto/update-club-faq.dto';
import { ClubFaq } from '../entities/club-faq.entity';

@Injectable()
export class ClubFaqsService {
  private readonly logger = new Logger(ClubFaqsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all FAQs for a club
   * @param clubId - Club ID
   * @returns Promise<ClubFaq[]>
   */
  async findAll(clubId: string): Promise<ClubFaq[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_faqs')
        .select('*')
        .eq('club_id', clubId)
        .order('order_index', { ascending: true });

      if (error) {
        this.logger.error(`Error fetching FAQs for club ${clubId}:`, error);
        throw new InternalServerErrorException(
          `Failed to fetch FAQs: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching FAQs:', error);
      throw new BadRequestException('Failed to fetch FAQs');
    }
  }

  /**
   * Get a single FAQ by ID
   * @param clubId - Club ID
   * @param faqId - FAQ ID
   * @returns Promise<ClubFaq>
   */
  async findOne(clubId: string, faqId: string): Promise<ClubFaq> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_faqs')
        .select('*')
        .eq('id', faqId)
        .eq('club_id', clubId)
        .single();

      if (error || !data) {
        throw new NotFoundException(
          `FAQ with ID ${faqId} not found in club ${clubId}`,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching FAQ:', error);
      throw new BadRequestException('Failed to fetch FAQ');
    }
  }

  /**
   * Create a new FAQ for a club
   * @param clubId - Club ID
   * @param createFaqDto - FAQ data
   * @returns Promise<ClubFaq>
   */
  async create(
    clubId: string,
    createFaqDto: CreateClubFaqDto,
  ): Promise<ClubFaq> {
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
        .from('club_faqs')
        .insert({
          club_id: clubId,
          ...createFaqDto,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating FAQ:', error);
        throw new InternalServerErrorException(
          `Failed to create FAQ: ${error.message}`,
        );
      }

      this.logger.log(`Created FAQ for club ${clubId}: ${data.id}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating FAQ:', error);
      throw new BadRequestException('Failed to create FAQ');
    }
  }

  /**
   * Update a FAQ
   * @param clubId - Club ID
   * @param faqId - FAQ ID
   * @param updateFaqDto - Update data
   * @returns Promise<ClubFaq>
   */
  async update(
    clubId: string,
    faqId: string,
    updateFaqDto: UpdateClubFaqDto,
  ): Promise<ClubFaq> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify FAQ exists and belongs to club
      await this.findOne(clubId, faqId);

      const { data, error } = await supabase
        .from('club_faqs')
        .update({
          ...updateFaqDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', faqId)
        .eq('club_id', clubId)
        .select()
        .single();

      if (error || !data) {
        this.logger.error('Error updating FAQ:', error);
        throw new InternalServerErrorException(
          `Failed to update FAQ: ${error?.message}`,
        );
      }

      this.logger.log(`Updated FAQ ${faqId} for club ${clubId}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating FAQ:', error);
      throw new BadRequestException('Failed to update FAQ');
    }
  }

  /**
   * Delete a FAQ
   * @param clubId - Club ID
   * @param faqId - FAQ ID
   * @returns Promise<void>
   */
  async remove(clubId: string, faqId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify FAQ exists and belongs to club
      await this.findOne(clubId, faqId);

      const { error } = await supabase
        .from('club_faqs')
        .delete()
        .eq('id', faqId)
        .eq('club_id', clubId);

      if (error) {
        this.logger.error('Error deleting FAQ:', error);
        throw new InternalServerErrorException(
          `Failed to delete FAQ: ${error.message}`,
        );
      }

      this.logger.log(`Deleted FAQ ${faqId} from club ${clubId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error deleting FAQ:', error);
      throw new BadRequestException('Failed to delete FAQ');
    }
  }
}
