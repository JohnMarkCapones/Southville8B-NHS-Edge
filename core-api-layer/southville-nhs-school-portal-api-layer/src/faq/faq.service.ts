import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new InternalServerErrorException(
          'Database configuration is missing. Please contact administrator.',
        );
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('faq')
      .insert({
        question: createFaqDto.question,
        answer: createFaqDto.answer,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating FAQ:', error);
      throw new InternalServerErrorException('Failed to create FAQ');
    }

    this.logger.log(`Created FAQ: ${data.question}`);
    return data;
  }

  async findAll(
    filters: {
      page?: number;
      limit?: number;
      search?: string;
    } = {},
  ): Promise<{
    data: Faq[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const supabase = this.getSupabaseClient();
    const { page = 1, limit = 10, search } = filters;

    let query = supabase
      .from('faq')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching FAQs:', error);
      throw new InternalServerErrorException('Failed to fetch FAQs');
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Faq> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('FAQ not found');
    }

    return data;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const supabase = this.getSupabaseClient();

    // Check if FAQ exists
    const existingFaq = await this.findOne(id);

    const { data, error } = await supabase
      .from('faq')
      .update({
        ...(updateFaqDto.question && { question: updateFaqDto.question }),
        ...(updateFaqDto.answer && { answer: updateFaqDto.answer }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating FAQ:', error);
      throw new InternalServerErrorException('Failed to update FAQ');
    }

    this.logger.log(`Updated FAQ: ${data.question}`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if FAQ exists
    await this.findOne(id);

    const { error } = await supabase.from('faq').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting FAQ:', error);
      throw new InternalServerErrorException('Failed to delete FAQ');
    }

    this.logger.log(`Deleted FAQ with ID: ${id}`);
  }

  async search(query: string): Promise<{
    data: Faq[];
    total: number;
  }> {
    const supabase = this.getSupabaseClient();

    const { data, error, count } = await supabase
      .from('faq')
      .select('*', { count: 'exact' })
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error searching FAQs:', error);
      throw new InternalServerErrorException('Failed to search FAQs');
    }

    return {
      data: data || [],
      total: count || 0,
    };
  }
}
