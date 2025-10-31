import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import {
  AcademicYear,
  AcademicPeriod,
  AcademicYearTemplate,
  AcademicYearSetting,
} from './entities/academic-year.entity';

@Injectable()
export class AcademicYearsService {
  private readonly logger = new Logger(AcademicYearsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private getSupabaseClient() {
    return this.supabaseService.getClient();
  }

  private getSupabaseServiceClient() {
    return this.supabaseService.getServiceClient();
  }

  /**
   * Create a new academic year
   */
  async create(
    dto: CreateAcademicYearDto,
    userId: string,
  ): Promise<AcademicYear> {
    try {
      const supabase = this.getSupabaseServiceClient();

      // Validate dates
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Check for overlapping academic years
      const { data: overlappingYears } = await supabase
        .from('academic_years')
        .select('id, year_name')
        .or(
          `and(start_date.lte.${dto.end_date},end_date.gte.${dto.start_date})`,
        )
        .eq('is_archived', false);

      if (overlappingYears && overlappingYears.length > 0) {
        throw new ConflictException(
          `Academic year overlaps with existing year: ${overlappingYears[0].year_name}`,
        );
      }

      // Check if year name already exists (only for non-archived years)
      const { data: existingYear } = await supabase
        .from('academic_years')
        .select('id, is_archived')
        .eq('year_name', dto.year_name)
        .eq('is_archived', false)
        .single();

      if (existingYear) {
        throw new ConflictException(
          `Academic year ${dto.year_name} already exists and is not archived`,
        );
      }

      // If setting as active, deactivate other years
      if (dto.is_active) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      // Create academic year
      const { data: academicYear, error } = await supabase
        .from('academic_years')
        .insert({
          year_name: dto.year_name,
          start_date: dto.start_date,
          end_date: dto.end_date,
          structure: 'quarters', // Always quarters
          is_active: dto.is_active || false,
          description: dto.description,
          created_by: userId,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating academic year:', error);
        throw new InternalServerErrorException(
          `Failed to create academic year: ${error.message}`,
        );
      }

      // Auto-generate periods if requested
      if (dto.auto_generate_periods) {
        // Use provided template_id or default to quarters template
        const templateId =
          dto.template_id || 'd02de26d-9a33-4693-a5b7-efbb818bca9c'; // Default quarters template
        await this.generatePeriodsFromTemplate(
          academicYear.id,
          templateId,
          userId,
        );
      }

      this.logger.log(
        `Academic year created: ${academicYear.year_name} (ID: ${academicYear.id})`,
      );
      return academicYear;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating academic year:', error);
      throw new InternalServerErrorException('Failed to create academic year');
    }
  }

  /**
   * Get all academic years
   */
  async findAll(): Promise<AcademicYear[]> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: academicYears, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        this.logger.error('Error fetching academic years:', error);
        throw new InternalServerErrorException(
          `Failed to fetch academic years: ${error.message}`,
        );
      }

      return academicYears || [];
    } catch (error) {
      this.logger.error('Unexpected error fetching academic years:', error);
      throw new InternalServerErrorException('Failed to fetch academic years');
    }
  }

  /**
   * Get active academic year
   */
  async findActive(): Promise<AcademicYear | null> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: academicYear, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error('Error fetching active academic year:', error);
        throw new InternalServerErrorException(
          `Failed to fetch active academic year: ${error.message}`,
        );
      }

      return academicYear || null;
    } catch (error) {
      this.logger.error(
        'Unexpected error fetching active academic year:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch active academic year',
      );
    }
  }

  /**
   * Get academic year by ID
   */
  async findOne(
    id: string,
    includeArchived: boolean = false,
  ): Promise<AcademicYear> {
    try {
      const supabase = this.getSupabaseClient();

      let query = supabase.from('academic_years').select('*').eq('id', id);

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data: academicYear, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Academic year with ID ${id} not found`);
        }
        this.logger.error('Error fetching academic year:', error);
        throw new InternalServerErrorException(
          `Failed to fetch academic year: ${error.message}`,
        );
      }

      return academicYear;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching academic year:', error);
      throw new InternalServerErrorException('Failed to fetch academic year');
    }
  }

  /**
   * Update academic year
   */
  async update(
    id: string,
    dto: UpdateAcademicYearDto,
    userId: string,
  ): Promise<AcademicYear> {
    try {
      const supabase = this.getSupabaseServiceClient();

      // Check if academic year exists (include archived ones for updates)
      const existingYear = await this.findOne(id, true);

      // If setting as active, deactivate other years
      if (dto.is_active) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .eq('is_active', true)
          .neq('id', id);
      }

      // Update academic year (only allow specific fields to be updated)
      const updateData: any = {
        updated_by: userId,
      };

      // Only update fields that are provided and allowed
      if (dto.year_name !== undefined) updateData.year_name = dto.year_name;
      if (dto.start_date !== undefined) updateData.start_date = dto.start_date;
      if (dto.end_date !== undefined) updateData.end_date = dto.end_date;
      if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      // Note: structure is always 'quarters' and cannot be changed

      const { data: academicYear, error } = await supabase
        .from('academic_years')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error updating academic year:', error);
        throw new InternalServerErrorException(
          `Failed to update academic year: ${error.message}`,
        );
      }

      this.logger.log(
        `Academic year updated: ${academicYear.year_name} (ID: ${academicYear.id})`,
      );
      return academicYear;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error updating academic year:', error);
      throw new InternalServerErrorException('Failed to update academic year');
    }
  }

  /**
   * Archive academic year (soft delete)
   */
  async archive(id: string, userId: string): Promise<void> {
    try {
      const supabase = this.getSupabaseServiceClient();

      // Check if academic year exists (include archived ones for archiving)
      await this.findOne(id, true);

      const { error } = await supabase
        .from('academic_years')
        .update({
          is_archived: true,
          is_active: false,
          updated_by: userId,
        })
        .eq('id', id);

      if (error) {
        this.logger.error('Error archiving academic year:', error);
        throw new InternalServerErrorException(
          `Failed to archive academic year: ${error.message}`,
        );
      }

      this.logger.log(`Academic year archived: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error archiving academic year:', error);
      throw new InternalServerErrorException('Failed to archive academic year');
    }
  }

  /**
   * Hard delete academic year (permanent deletion)
   */
  async hardDelete(id: string, userId: string): Promise<void> {
    try {
      const supabase = this.getSupabaseServiceClient();

      // Check if academic year exists (include archived ones for deletion)
      const academicYear = await this.findOne(id, true);

      // First delete all associated periods
      const { error: periodsError } = await supabase
        .from('academic_periods')
        .delete()
        .eq('academic_year_id', id);

      if (periodsError) {
        this.logger.error('Error deleting academic periods:', periodsError);
        throw new InternalServerErrorException(
          `Failed to delete academic periods: ${periodsError.message}`,
        );
      }

      // Then delete the academic year
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error hard deleting academic year:', error);
        throw new InternalServerErrorException(
          `Failed to delete academic year: ${error.message}`,
        );
      }

      this.logger.log(
        `Academic year permanently deleted: ${academicYear.year_name} (ID: ${id})`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error hard deleting academic year:', error);
      throw new InternalServerErrorException('Failed to delete academic year');
    }
  }

  /**
   * Get academic periods for a year
   */
  async getPeriods(academicYearId: string): Promise<AcademicPeriod[]> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: periods, error } = await supabase
        .from('academic_periods')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .order('period_order', { ascending: true });

      if (error) {
        this.logger.error('Error fetching academic periods:', error);
        throw new InternalServerErrorException(
          `Failed to fetch academic periods: ${error.message}`,
        );
      }

      return periods || [];
    } catch (error) {
      this.logger.error('Unexpected error fetching academic periods:', error);
      throw new InternalServerErrorException(
        'Failed to fetch academic periods',
      );
    }
  }

  /**
   * Create academic period
   */
  async createPeriod(
    dto: CreateAcademicPeriodDto,
    userId: string,
  ): Promise<AcademicPeriod> {
    try {
      const supabase = this.getSupabaseServiceClient();

      // Validate dates
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Check if academic year exists
      await this.findOne(dto.academicYearId);

      // Check for duplicate period name or order
      const { data: existingPeriod } = await supabase
        .from('academic_periods')
        .select('id')
        .eq('academic_year_id', dto.academicYearId)
        .or(
          `period_name.eq.${dto.periodName},period_order.eq.${dto.periodOrder}`,
        )
        .single();

      if (existingPeriod) {
        throw new ConflictException(
          'Period name or order already exists for this academic year',
        );
      }

      const { data: period, error } = await supabase
        .from('academic_periods')
        .insert({
          academic_year_id: dto.academicYearId,
          period_name: dto.periodName,
          period_order: dto.periodOrder,
          start_date: dto.startDate,
          end_date: dto.endDate,
          is_grading_period: dto.isGradingPeriod || true,
          weight: dto.weight || 1.0,
          description: dto.description,
          created_by: userId,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating academic period:', error);
        throw new InternalServerErrorException(
          `Failed to create academic period: ${error.message}`,
        );
      }

      this.logger.log(
        `Academic period created: ${period.period_name} (ID: ${period.id})`,
      );
      return period;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating academic period:', error);
      throw new InternalServerErrorException(
        'Failed to create academic period',
      );
    }
  }

  /**
   * Get academic year templates
   */
  async getTemplates(): Promise<AcademicYearTemplate[]> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: templates, error } = await supabase
        .from('academic_year_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('template_name', { ascending: true });

      if (error) {
        this.logger.error('Error fetching templates:', error);
        throw new InternalServerErrorException(
          `Failed to fetch templates: ${error.message}`,
        );
      }

      return templates || [];
    } catch (error) {
      this.logger.error('Unexpected error fetching templates:', error);
      throw new InternalServerErrorException('Failed to fetch templates');
    }
  }

  /**
   * Generate periods from template
   */
  async generatePeriodsFromTemplate(
    academicYearId: string,
    templateId: string,
    userId: string,
  ): Promise<void> {
    try {
      const supabase = this.getSupabaseServiceClient();

      // Call the database function
      const { data, error } = await supabase.rpc(
        'generate_academic_periods_from_template',
        {
          p_academic_year_id: academicYearId,
          p_template_id: templateId,
        },
      );

      if (error) {
        this.logger.error('Error generating periods from template:', error);
        throw new InternalServerErrorException(
          `Failed to generate periods: ${error.message}`,
        );
      }

      // Check if the function returned a result indicating periods already exist
      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        !data.success
      ) {
        if (data.message && data.message.includes('already exist')) {
          this.logger.log(
            `Periods already exist for academic year: ${academicYearId}`,
          );
          return; // This is fine, periods already exist
        } else {
          this.logger.error('Template generation failed:', data.message);
          throw new InternalServerErrorException(
            `Failed to generate periods: ${data.message}`,
          );
        }
      }

      this.logger.log(
        `Periods generated from template for academic year: ${academicYearId}`,
      );
    } catch (error) {
      this.logger.error('Unexpected error generating periods:', error);
      throw new InternalServerErrorException(
        'Failed to generate periods from template',
      );
    }
  }

  /**
   * Get current academic period
   */
  async getCurrentPeriod(): Promise<AcademicPeriod | null> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: period, error } = await supabase.rpc(
        'get_current_academic_period',
      );

      if (error) {
        this.logger.error('Error fetching current academic period:', error);
        throw new InternalServerErrorException(
          `Failed to fetch current period: ${error.message}`,
        );
      }

      return period && period.length > 0 ? period[0] : null;
    } catch (error) {
      this.logger.error('Unexpected error fetching current period:', error);
      throw new InternalServerErrorException(
        'Failed to fetch current academic period',
      );
    }
  }

  /**
   * Get academic year settings
   */
  async getSettings(): Promise<AcademicYearSetting[]> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: settings, error } = await supabase
        .from('academic_year_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) {
        this.logger.error('Error fetching settings:', error);
        throw new InternalServerErrorException(
          `Failed to fetch settings: ${error.message}`,
        );
      }

      return settings || [];
    } catch (error) {
      this.logger.error('Unexpected error fetching settings:', error);
      throw new InternalServerErrorException(
        'Failed to fetch academic year settings',
      );
    }
  }

  /**
   * Update academic year setting
   */
  async updateSetting(
    settingKey: string,
    settingValue: any,
    userId: string,
  ): Promise<AcademicYearSetting> {
    try {
      const supabase = this.getSupabaseServiceClient();

      const { data: setting, error } = await supabase
        .from('academic_year_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: settingValue,
          updated_by: userId,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error updating setting:', error);
        throw new InternalServerErrorException(
          `Failed to update setting: ${error.message}`,
        );
      }

      this.logger.log(`Setting updated: ${settingKey}`);
      return setting;
    } catch (error) {
      this.logger.error('Unexpected error updating setting:', error);
      throw new InternalServerErrorException(
        'Failed to update academic year setting',
      );
    }
  }
}
