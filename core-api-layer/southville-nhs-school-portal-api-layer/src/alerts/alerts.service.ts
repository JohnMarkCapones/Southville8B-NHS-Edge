import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Create a new alert
   */
  async create(createAlertDto: CreateAlertDto, userId: string): Promise<Alert> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: alert, error } = await supabase
        .from('alerts')
        .insert({
          ...createAlertDto,
          created_by: userId,
        })
        .select(
          `
          *,
          created_by_user:created_by(
            id,
            email,
            user_metadata
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating alert:', error);
        throw new BadRequestException(
          `Failed to create alert: ${error.message}`,
        );
      }

      this.logger.log(`Alert created: ${alert.title} (ID: ${alert.id})`);
      return alert;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating alert:', error);
      throw new InternalServerErrorException('Failed to create alert');
    }
  }

  /**
   * Get all alerts with filtering and pagination
   */
  async findAll(queryDto: QueryAlertDto): Promise<{
    data: Alert[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const supabase = this.getSupabaseClient();
      const {
        type,
        includeExpired = false,
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = queryDto;

      let query = supabase.from('alerts').select(
        `
          *,
          created_by_user:created_by(
            id,
            email,
            user_metadata
          )
        `,
        { count: 'exact' },
      );

      // Filter by type if provided
      if (type) {
        query = query.eq('type', type);
      }

      // Filter out expired alerts unless includeExpired is true
      if (!includeExpired) {
        query = query.gt('expires_at', new Date().toISOString());
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'ASC' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: alerts, error, count } = await query;

      if (error) {
        this.logger.error('Error fetching alerts:', error);
        throw new InternalServerErrorException('Failed to fetch alerts');
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: alerts || [],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching alerts:', error);
      throw new InternalServerErrorException('Failed to fetch alerts');
    }
  }

  /**
   * Get a single alert by ID
   */
  async findOne(id: string): Promise<Alert> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: alert, error } = await supabase
        .from('alerts')
        .select(
          `
          *,
          created_by_user:created_by(
            id,
            email,
            user_metadata
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Error fetching alert ${id}:`, error);
        throw new NotFoundException(`Alert with ID ${id} not found`);
      }

      return alert;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching alert:', error);
      throw new InternalServerErrorException('Failed to fetch alert');
    }
  }

  /**
   * Update an alert
   */
  async update(
    id: string,
    updateAlertDto: UpdateAlertDto,
    userId: string,
  ): Promise<Alert> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if alert exists
      await this.findOne(id);

      const { data: alert, error } = await supabase
        .from('alerts')
        .update({
          ...updateAlertDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          created_by_user:created_by(
            id,
            email,
            user_metadata
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error(`Error updating alert ${id}:`, error);
        throw new BadRequestException(
          `Failed to update alert: ${error.message}`,
        );
      }

      this.logger.log(`Alert updated: ${alert.title} (ID: ${alert.id})`);
      return alert;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating alert:', error);
      throw new InternalServerErrorException('Failed to update alert');
    }
  }

  /**
   * Delete an alert
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if alert exists
      await this.findOne(id);

      const { error } = await supabase.from('alerts').delete().eq('id', id);

      if (error) {
        this.logger.error(`Error deleting alert ${id}:`, error);
        throw new InternalServerErrorException('Failed to delete alert');
      }

      this.logger.log(`Alert deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting alert:', error);
      throw new InternalServerErrorException('Failed to delete alert');
    }
  }
}
