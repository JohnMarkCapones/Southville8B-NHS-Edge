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
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';

@Injectable()
export class BuildingsService {
  private readonly logger = new Logger(BuildingsService.name);
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

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if building code already exists
      const { data: existingBuilding } = await supabase
        .from('buildings')
        .select('id')
        .eq('code', createBuildingDto.code)
        .single();

      if (existingBuilding) {
        throw new ConflictException('Building code already exists');
      }

      const { data: building, error } = await supabase
        .from('buildings')
        .insert({
          building_name: createBuildingDto.buildingName,
          code: createBuildingDto.code,
          capacity: createBuildingDto.capacity,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating building:', error);
        throw new InternalServerErrorException(
          `Failed to create building: ${error.message}`,
        );
      }

      this.logger.log(
        `Building created successfully: ${building.building_name}`,
      );
      return building;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error creating building:', error);
      throw new InternalServerErrorException('Failed to create building');
    }
  }

  async findAll(filters: any = {}): Promise<any> {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('buildings').select(
      `
      *,
      floors(id, name, number, rooms(id, name, room_number, capacity, status)),
      floors_count:floors(count)
    `,
      { count: 'exact' },
    );

    // Apply filters
    if (search) {
      query = query.or(
        `building_name.ilike.%${search}%,code.ilike.%${search}%`,
      );
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: buildings, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching buildings:', error);
      throw new InternalServerErrorException('Failed to fetch buildings');
    }

    // Transform database fields to API response format
    const transformedBuildings =
      buildings?.map((building) => ({
        id: building.id,
        buildingName: building.building_name,
        code: building.code,
        capacity: building.capacity,
        createdAt: building.created_at,
        updatedAt: building.updated_at,
        floors: building.floors?.map((floor) => ({
          id: floor.id,
          name: floor.name,
          number: floor.number,
          buildingId: floor.building_id,
          createdAt: floor.created_at,
          updatedAt: floor.updated_at,
          rooms: floor.rooms?.map((room) => ({
            id: room.id,
            name: room.name,
            roomNumber: room.room_number,
            capacity: room.capacity,
            status: room.status,
            floorId: room.floor_id,
            createdAt: room.created_at,
            updatedAt: room.updated_at,
          })),
        })),
      })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: transformedBuildings,
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

  async findOne(id: string): Promise<Building> {
    const supabase = this.getSupabaseClient();

    const { data: building, error } = await supabase
      .from('buildings')
      .select(
        `
        *,
        floors(
          id,
          name,
          number,
          rooms(id, room_number, capacity, status)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching building:', error);
      throw new NotFoundException('Building not found');
    }

    // Transform database fields to API response format
    return {
      id: building.id,
      buildingName: building.building_name,
      code: building.code,
      capacity: building.capacity,
      createdAt: building.created_at,
      updatedAt: building.updated_at,
      floors: building.floors?.map((floor) => ({
        id: floor.id,
        name: floor.name,
        number: floor.number,
        buildingId: floor.building_id,
        createdAt: floor.created_at,
        updatedAt: floor.updated_at,
        rooms: floor.rooms?.map((room) => ({
          id: room.id,
          name: room.name,
          roomNumber: room.room_number,
          capacity: room.capacity,
          status: room.status,
          floorId: room.floor_id,
          createdAt: room.created_at,
          updatedAt: room.updated_at,
        })),
      })),
    };
  }

  async update(
    id: string,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const supabase = this.getSupabaseClient();

    // Log the incoming DTO for debugging
    this.logger.debug(`Updating building ${id} with data:`, updateBuildingDto);

    // Check if building code already exists (if updating code)
    if (updateBuildingDto.code) {
      const { data: existingBuilding } = await supabase
        .from('buildings')
        .select('id')
        .eq('code', updateBuildingDto.code)
        .neq('id', id)
        .single();

      if (existingBuilding) {
        throw new ConflictException('Building code already exists');
      }
    }

    // Build update object, only including defined values
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateBuildingDto.buildingName !== undefined) {
      updateData.building_name = updateBuildingDto.buildingName;
    }
    if (updateBuildingDto.code !== undefined) {
      updateData.code = updateBuildingDto.code;
    }
    if (updateBuildingDto.capacity !== undefined) {
      updateData.capacity = updateBuildingDto.capacity;
    }

    this.logger.debug(`Supabase update payload:`, updateData);

    const { data: building, error } = await supabase
      .from('buildings')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      this.logger.error('Error updating building:', error);
      throw new InternalServerErrorException(
        `Failed to update building: ${error.message}`,
      );
    }

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    this.logger.log(`Building updated successfully: ${building.building_name}`);
    return building;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase.from('buildings').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting building:', error);
      throw new InternalServerErrorException(
        `Failed to delete building: ${error.message}`,
      );
    }

    this.logger.log(`Building deleted successfully: ${id}`);
  }

  async getBuildingStats(id: string): Promise<any> {
    const supabase = this.getSupabaseClient();

    // Get building info
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id, building_name, capacity')
      .eq('id', id)
      .single();

    if (buildingError || !building) {
      throw new NotFoundException('Building not found');
    }

    // Get floors count
    const { count: floorsCount } = await supabase
      .from('floors')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', id);

    // Get rooms count and total capacity
    const { data: floors } = await supabase
      .from('floors')
      .select('id')
      .eq('building_id', id);

    const floorIds = floors?.map((f) => f.id) || [];

    const { data: roomsData } = await supabase
      .from('rooms')
      .select('capacity')
      .in('floor_id', floorIds);

    const roomsCount = roomsData?.length || 0;
    const totalRoomsCapacity =
      roomsData?.reduce((sum, room) => sum + (room.capacity || 0), 0) || 0;

    // Calculate utilization rate
    const utilizationRate =
      building.capacity && building.capacity > 0
        ? Math.round((totalRoomsCapacity / building.capacity) * 100)
        : 0;

    return {
      building: {
        id: building.id,
        name: building.building_name,
        capacity: building.capacity,
      },
      stats: {
        totalFloors: floorsCount || 0,
        totalRooms: roomsCount,
        totalCapacity: totalRoomsCapacity,
        utilizationRate,
      },
    };
  }
}
