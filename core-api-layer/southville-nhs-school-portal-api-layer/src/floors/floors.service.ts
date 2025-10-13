import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { Floor } from './entities/floor.entity';

@Injectable()
export class FloorsService {
  private readonly logger = new Logger(FloorsService.name);
  private supabase: SupabaseClient;

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

  async create(createFloorDto: CreateFloorDto): Promise<Floor> {
    try {
      const supabase = this.getSupabaseClient();

      // Validate building exists
      const { data: building, error: buildingError } = await supabase
        .from('buildings')
        .select('id, building_name')
        .eq('id', createFloorDto.buildingId)
        .single();

      if (buildingError || !building) {
        throw new BadRequestException('Building not found');
      }

      // Check if floor number already exists in this building
      const { data: existingFloor } = await supabase
        .from('floors')
        .select('id')
        .eq('building_id', createFloorDto.buildingId)
        .eq('number', createFloorDto.number)
        .single();

      if (existingFloor) {
        throw new ConflictException(
          `Floor number ${createFloorDto.number} already exists in this building`,
        );
      }

      const { data: floor, error } = await supabase
        .from('floors')
        .insert({
          building_id: createFloorDto.buildingId,
          name: createFloorDto.name,
          number: createFloorDto.number,
        })
        .select(
          `
          *,
          building:buildings(id, building_name, code)
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating floor:', error);
        throw new InternalServerErrorException(
          `Failed to create floor: ${error.message}`,
        );
      }

      this.logger.log(`Floor created successfully: ${floor.name}`);
      return floor;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error creating floor:', error);
      throw new InternalServerErrorException('Failed to create floor');
    }
  }

  async findAll(filters: any = {}): Promise<any> {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      search,
      buildingId,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('floors').select(`
      *,
      building:buildings(id, building_name, code),
      rooms(id, room_number, name, capacity, status)
    `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }
    if (buildingId) {
      query = query.eq('building_id', buildingId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: floors, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching floors:', error);
      throw new InternalServerErrorException('Failed to fetch floors');
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: floors,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findByBuilding(buildingId: string): Promise<Floor[]> {
    const supabase = this.getSupabaseClient();

    const { data: floors, error } = await supabase
      .from('floors')
      .select(
        `
        *,
        building:buildings(id, building_name, code),
        rooms(id, room_number, name, capacity, status)
      `,
      )
      .eq('building_id', buildingId)
      .order('number');

    if (error) {
      this.logger.error('Error fetching floors by building:', error);
      throw new InternalServerErrorException(
        'Failed to fetch floors by building',
      );
    }

    return floors || [];
  }

  async findOne(id: string): Promise<Floor> {
    const supabase = this.getSupabaseClient();

    const { data: floor, error } = await supabase
      .from('floors')
      .select(
        `
        *,
        building:buildings(id, building_name, code),
        rooms(id, room_number, name, capacity, status)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching floor:', error);
      throw new NotFoundException('Floor not found');
    }

    return floor;
  }

  async update(id: string, updateFloorDto: UpdateFloorDto): Promise<Floor> {
    const supabase = this.getSupabaseClient();

    // Check if floor number already exists in this building (if updating number)
    if (updateFloorDto.number) {
      const { data: existingFloor } = await supabase
        .from('floors')
        .select('id')
        .eq('building_id', updateFloorDto.buildingId || '')
        .eq('number', updateFloorDto.number)
        .neq('id', id)
        .single();

      if (existingFloor) {
        throw new ConflictException(
          `Floor number ${updateFloorDto.number} already exists in this building`,
        );
      }
    }

    const { data: floor, error } = await supabase
      .from('floors')
      .update({
        building_id: updateFloorDto.buildingId,
        name: updateFloorDto.name,
        number: updateFloorDto.number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        building:buildings(id, building_name, code)
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error updating floor:', error);
      throw new InternalServerErrorException(
        `Failed to update floor: ${error.message}`,
      );
    }

    if (!floor) {
      throw new NotFoundException('Floor not found');
    }

    this.logger.log(`Floor updated successfully: ${floor.name}`);
    return floor;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if floor has rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('floor_id', id)
      .limit(1);

    if (roomsError) {
      this.logger.error('Error checking rooms:', roomsError);
      throw new InternalServerErrorException('Failed to check floor rooms');
    }

    if (rooms && rooms.length > 0) {
      throw new BadRequestException(
        'Cannot delete floor with existing rooms. Please delete or move rooms first.',
      );
    }

    const { error } = await supabase.from('floors').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting floor:', error);
      throw new InternalServerErrorException(
        `Failed to delete floor: ${error.message}`,
      );
    }

    this.logger.log(`Floor deleted successfully: ${id}`);
  }
}
