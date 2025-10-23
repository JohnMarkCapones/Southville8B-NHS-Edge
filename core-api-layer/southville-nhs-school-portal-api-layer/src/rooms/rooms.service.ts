import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateRoomDto, RoomStatus } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MoveRoomDto } from './dto/move-room.dto';
import { BulkCreateRoomsDto } from './dto/bulk-create-rooms.dto';
import { ReorderRoomsDto } from './dto/reorder-rooms.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
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

  async getNextRoomNumber(floorId: string): Promise<string> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase.rpc('get_next_room_number', {
      floor_id_param: floorId,
    });

    if (error) {
      this.logger.error('Error getting next room number:', error);
      throw new InternalServerErrorException('Failed to get next room number');
    }

    return data;
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      const supabase = this.getSupabaseClient();

      // Validate floor exists
      const { data: floor, error: floorError } = await supabase
        .from('floors')
        .select('id, name, number, building:buildings(id, building_name, code)')
        .eq('id', createRoomDto.floorId)
        .single();

      if (floorError || !floor) {
        throw new BadRequestException('Floor not found');
      }

      // Room number conflict detection removed - allow automatic increment

      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          floor_id: createRoomDto.floorId,
          name: createRoomDto.name,
          room_number: createRoomDto.roomNumber,
          capacity: createRoomDto.capacity,
          status: createRoomDto.status || RoomStatus.AVAILABLE,
        })
        .select(
          `
          *,
          floor:floors(
            id,
            name,
            number,
            building:buildings(id, building_name, code)
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating room:', error);
        throw new InternalServerErrorException(
          `Failed to create room: ${error.message}`,
        );
      }

      this.logger.log(`Room created successfully: ${room.room_number}`);
      return room;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating room:', error);
      throw new InternalServerErrorException('Failed to create room');
    }
  }

  async createBulk(bulkCreateDto: BulkCreateRoomsDto): Promise<Room[]> {
    try {
      const supabase = this.getSupabaseClient();
      const rooms: Room[] = [];

      // Validate floor exists
      const { data: floor, error: floorError } = await supabase
        .from('floors')
        .select('id, name, number')
        .eq('id', bulkCreateDto.floorId)
        .single();

      if (floorError || !floor) {
        throw new BadRequestException('Floor not found');
      }

      // Create rooms one by one to get sequential room numbers
      for (let i = 0; i < bulkCreateDto.count; i++) {
        const roomNumber = await this.getNextRoomNumber(bulkCreateDto.floorId);

        const { data: room, error } = await supabase
          .from('rooms')
          .insert({
            floor_id: bulkCreateDto.floorId,
            name: `Room ${roomNumber}`,
            room_number: roomNumber,
            capacity: bulkCreateDto.capacity,
            status: RoomStatus.AVAILABLE,
          })
          .select(
            `
            *,
            floor:floors(
              id,
              name,
              number,
              building:buildings(id, building_name, code)
            )
          `,
          )
          .single();

        if (error) {
          this.logger.error(`Error creating room ${i + 1}:`, error);
          throw new InternalServerErrorException(
            `Failed to create room ${i + 1}: ${error.message}`,
          );
        }

        rooms.push(room);
      }

      this.logger.log(`Bulk created ${rooms.length} rooms successfully`);
      return rooms;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error bulk creating rooms:', error);
      throw new InternalServerErrorException('Failed to bulk create rooms');
    }
  }

  async findAll(filters: any = {}): Promise<any> {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      search,
      status,
      floorId,
      buildingId,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('rooms').select(`
      *,
      floor:floors(
        id,
        name,
        number,
        building:buildings(id, building_name, code)
      )
    `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,room_number.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (floorId) {
      query = query.eq('floor_id', floorId);
    }
    if (buildingId) {
      query = query.eq('floor.building_id', buildingId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: rooms, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching rooms:', error);
      throw new InternalServerErrorException('Failed to fetch rooms');
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: rooms,
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

  async findByFloor(floorId: string): Promise<Room[]> {
    const supabase = this.getSupabaseClient();

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(
        `
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `,
      )
      .eq('floor_id', floorId)
      .order('room_number');

    if (error) {
      this.logger.error('Error fetching rooms by floor:', error);
      throw new InternalServerErrorException('Failed to fetch rooms by floor');
    }

    return rooms || [];
  }

  async findByBuilding(buildingId: string): Promise<Room[]> {
    const supabase = this.getSupabaseClient();

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(
        `
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `,
      )
      .eq('floor.building_id', buildingId)
      .order('room_number');

    if (error) {
      this.logger.error('Error fetching rooms by building:', error);
      throw new InternalServerErrorException(
        'Failed to fetch rooms by building',
      );
    }

    return rooms || [];
  }

  async findOne(id: string): Promise<Room> {
    const supabase = this.getSupabaseClient();

    const { data: room, error } = await supabase
      .from('rooms')
      .select(
        `
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching room:', error);
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const supabase = this.getSupabaseClient();

    const { data: room, error } = await supabase
      .from('rooms')
      .update({
        name: updateRoomDto.name,
        capacity: updateRoomDto.capacity,
        status: updateRoomDto.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error updating room:', error);
      throw new InternalServerErrorException(
        `Failed to update room: ${error.message}`,
      );
    }

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    this.logger.log(`Room updated successfully: ${room.room_number}`);
    return room;
  }

  async moveRoom(id: string, moveRoomDto: MoveRoomDto): Promise<Room> {
    const supabase = this.getSupabaseClient();

    // Validate target floor exists
    const { data: targetFloor, error: floorError } = await supabase
      .from('floors')
      .select('id, name, number')
      .eq('id', moveRoomDto.targetFloorId)
      .single();

    if (floorError || !targetFloor) {
      throw new BadRequestException('Target floor not found');
    }

    // Get new room number for target floor
    const newRoomNumber = await this.getNextRoomNumber(
      moveRoomDto.targetFloorId,
    );

    const { data: room, error } = await supabase
      .from('rooms')
      .update({
        floor_id: moveRoomDto.targetFloorId,
        room_number: newRoomNumber,
        display_order: moveRoomDto.targetPosition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error moving room:', error);
      throw new InternalServerErrorException(
        `Failed to move room: ${error.message}`,
      );
    }

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    this.logger.log(`Room moved successfully: ${room.room_number}`);
    return room;
  }

  async reorderRooms(
    floorId: string,
    reorderDto: ReorderRoomsDto,
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Update display order for each room
    for (let i = 0; i < reorderDto.roomIds.length; i++) {
      const { error } = await supabase
        .from('rooms')
        .update({
          display_order: i + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reorderDto.roomIds[i])
        .eq('floor_id', floorId);

      if (error) {
        this.logger.error(
          `Error reordering room ${reorderDto.roomIds[i]}:`,
          error,
        );
        throw new InternalServerErrorException(
          `Failed to reorder room: ${error.message}`,
        );
      }
    }

    this.logger.log(`Rooms reordered successfully for floor ${floorId}`);
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase.from('rooms').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting room:', error);
      throw new InternalServerErrorException(
        `Failed to delete room: ${error.message}`,
      );
    }

    this.logger.log(`Room deleted successfully: ${id}`);
  }
}
