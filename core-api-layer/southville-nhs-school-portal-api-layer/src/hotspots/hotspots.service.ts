import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateHotspotDto } from './dto/create-hotspot.dto';
import { UpdateHotspotDto } from './dto/update-hotspot.dto';
import { Hotspot } from './entities/hotspot.entity';

@Injectable()
export class HotspotsService {
  private readonly logger = new Logger(HotspotsService.name);
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

  async create(createHotspotDto: CreateHotspotDto): Promise<Hotspot> {
    const supabase = this.getSupabaseClient();

    // Validate circular reference if linkToLocationId is provided
    if (createHotspotDto.linkToLocationId) {
      await this.validateNoCircularReference(
        createHotspotDto.locationId,
        createHotspotDto.linkToLocationId,
      );
    }

    const { data, error } = await supabase
      .from('hotspots')
      .insert({
        location_id: createHotspotDto.locationId,
        label: createHotspotDto.label,
        x_position: createHotspotDto.xPosition,
        y_position: createHotspotDto.yPosition,
        link_to_location_id: createHotspotDto.linkToLocationId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating hotspot:', error);
      throw new InternalServerErrorException('Failed to create hotspot');
    }

    this.logger.log(`Created hotspot: ${data.label}`);
    return data;
  }

  async findAll(
    filters: {
      page?: number;
      limit?: number;
      locationId?: string;
    } = {},
  ): Promise<{
    data: Hotspot[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const supabase = this.getSupabaseClient();
    const { page = 1, limit = 10, locationId } = filters;

    let query = supabase
      .from('hotspots')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true });

    // Apply location filter if provided
    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching hotspots:', error);
      throw new InternalServerErrorException('Failed to fetch hotspots');
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

  async findByLocation(locationId: string): Promise<Hotspot[]> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('Error fetching hotspots by location:', error);
      throw new InternalServerErrorException('Failed to fetch hotspots');
    }

    return data || [];
  }

  async findOne(id: string): Promise<Hotspot> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Hotspot not found');
    }

    return data;
  }

  async update(
    id: string,
    updateHotspotDto: UpdateHotspotDto,
  ): Promise<Hotspot> {
    const supabase = this.getSupabaseClient();

    // Check if hotspot exists
    const existingHotspot = await this.findOne(id);

    // Validate circular reference if linkToLocationId is being updated
    if (updateHotspotDto.linkToLocationId) {
      const locationId =
        updateHotspotDto.locationId || existingHotspot.location_id;
      await this.validateNoCircularReference(
        locationId,
        updateHotspotDto.linkToLocationId,
      );
    }

    const updateData: any = {};
    if (updateHotspotDto.locationId !== undefined)
      updateData.location_id = updateHotspotDto.locationId;
    if (updateHotspotDto.label !== undefined)
      updateData.label = updateHotspotDto.label;
    if (updateHotspotDto.xPosition !== undefined)
      updateData.x_position = updateHotspotDto.xPosition;
    if (updateHotspotDto.yPosition !== undefined)
      updateData.y_position = updateHotspotDto.yPosition;
    if (updateHotspotDto.linkToLocationId !== undefined)
      updateData.link_to_location_id = updateHotspotDto.linkToLocationId;

    const { data, error } = await supabase
      .from('hotspots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating hotspot:', error);
      throw new InternalServerErrorException('Failed to update hotspot');
    }

    this.logger.log(`Updated hotspot: ${data.label}`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if hotspot exists
    await this.findOne(id);

    const { error } = await supabase.from('hotspots').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting hotspot:', error);
      throw new InternalServerErrorException('Failed to delete hotspot');
    }

    this.logger.log(`Deleted hotspot with ID: ${id}`);
  }

  private async validateNoCircularReference(
    startLocationId: string,
    targetLocationId: string,
    visited: Set<string> = new Set(),
    depth: number = 0,
  ): Promise<void> {
    if (depth > 10) {
      throw new BadRequestException('Tour path too deep');
    }

    if (startLocationId === targetLocationId) {
      throw new BadRequestException('Cannot link location to itself');
    }

    if (visited.has(targetLocationId)) {
      throw new BadRequestException('Circular reference detected in tour path');
    }

    visited.add(targetLocationId);

    // Query hotspots from targetLocationId and recursively check
    const supabase = this.getSupabaseClient();
    const { data: hotspots, error } = await supabase
      .from('hotspots')
      .select('link_to_location_id')
      .eq('location_id', targetLocationId)
      .not('link_to_location_id', 'is', null);

    if (error) {
      this.logger.error('Error validating circular reference:', error);
      throw new InternalServerErrorException('Failed to validate tour path');
    }

    for (const hotspot of hotspots || []) {
      if (hotspot.link_to_location_id) {
        await this.validateNoCircularReference(
          targetLocationId,
          hotspot.link_to_location_id,
          visited,
          depth + 1,
        );
      }
    }
  }
}
