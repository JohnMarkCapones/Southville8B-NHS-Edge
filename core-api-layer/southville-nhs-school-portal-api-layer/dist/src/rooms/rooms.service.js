"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RoomsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const create_room_dto_1 = require("./dto/create-room.dto");
let RoomsService = RoomsService_1 = class RoomsService {
    configService;
    logger = new common_1.Logger(RoomsService_1.name);
    supabase;
    constructor(configService) {
        this.configService = configService;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration is missing');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async getNextRoomNumber(floorId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase.rpc('get_next_room_number', {
            floor_id_param: floorId,
        });
        if (error) {
            this.logger.error('Error getting next room number:', error);
            throw new common_1.InternalServerErrorException('Failed to get next room number');
        }
        return data;
    }
    async create(createRoomDto) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: floor, error: floorError } = await supabase
                .from('floors')
                .select('id, name, number, building:buildings(id, building_name, code)')
                .eq('id', createRoomDto.floorId)
                .single();
            if (floorError || !floor) {
                throw new common_1.BadRequestException('Floor not found');
            }
            const roomNumber = await this.getNextRoomNumber(createRoomDto.floorId);
            const { data: room, error } = await supabase
                .from('rooms')
                .insert({
                floor_id: createRoomDto.floorId,
                name: createRoomDto.name,
                room_number: roomNumber,
                capacity: createRoomDto.capacity,
                status: createRoomDto.status || create_room_dto_1.RoomStatus.AVAILABLE,
            })
                .select(`
          *,
          floor:floors(
            id,
            name,
            number,
            building:buildings(id, building_name, code)
          )
        `)
                .single();
            if (error) {
                this.logger.error('Error creating room:', error);
                throw new common_1.InternalServerErrorException(`Failed to create room: ${error.message}`);
            }
            this.logger.log(`Room created successfully: ${room.room_number}`);
            return room;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating room:', error);
            throw new common_1.InternalServerErrorException('Failed to create room');
        }
    }
    async createBulk(bulkCreateDto) {
        try {
            const supabase = this.getSupabaseClient();
            const rooms = [];
            const { data: floor, error: floorError } = await supabase
                .from('floors')
                .select('id, name, number')
                .eq('id', bulkCreateDto.floorId)
                .single();
            if (floorError || !floor) {
                throw new common_1.BadRequestException('Floor not found');
            }
            for (let i = 0; i < bulkCreateDto.count; i++) {
                const roomNumber = await this.getNextRoomNumber(bulkCreateDto.floorId);
                const { data: room, error } = await supabase
                    .from('rooms')
                    .insert({
                    floor_id: bulkCreateDto.floorId,
                    name: `Room ${roomNumber}`,
                    room_number: roomNumber,
                    capacity: bulkCreateDto.capacity,
                    status: create_room_dto_1.RoomStatus.AVAILABLE,
                })
                    .select(`
            *,
            floor:floors(
              id,
              name,
              number,
              building:buildings(id, building_name, code)
            )
          `)
                    .single();
                if (error) {
                    this.logger.error(`Error creating room ${i + 1}:`, error);
                    throw new common_1.InternalServerErrorException(`Failed to create room ${i + 1}: ${error.message}`);
                }
                rooms.push(room);
            }
            this.logger.log(`Bulk created ${rooms.length} rooms successfully`);
            return rooms;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error bulk creating rooms:', error);
            throw new common_1.InternalServerErrorException('Failed to bulk create rooms');
        }
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, search, status, floorId, buildingId, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        let query = supabase.from('rooms').select(`
      *,
      floor:floors(
        id,
        name,
        number,
        building:buildings(id, building_name, code)
      )
    `);
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
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data: rooms, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching rooms:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch rooms');
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
    async findByFloor(floorId) {
        const supabase = this.getSupabaseClient();
        const { data: rooms, error } = await supabase
            .from('rooms')
            .select(`
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `)
            .eq('floor_id', floorId)
            .order('room_number');
        if (error) {
            this.logger.error('Error fetching rooms by floor:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch rooms by floor');
        }
        return rooms || [];
    }
    async findByBuilding(buildingId) {
        const supabase = this.getSupabaseClient();
        const { data: rooms, error } = await supabase
            .from('rooms')
            .select(`
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `)
            .eq('floor.building_id', buildingId)
            .order('room_number');
        if (error) {
            this.logger.error('Error fetching rooms by building:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch rooms by building');
        }
        return rooms || [];
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data: room, error } = await supabase
            .from('rooms')
            .select(`
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching room:', error);
            throw new common_1.NotFoundException('Room not found');
        }
        return room;
    }
    async update(id, updateRoomDto) {
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
            .select(`
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `)
            .single();
        if (error) {
            this.logger.error('Error updating room:', error);
            throw new common_1.InternalServerErrorException(`Failed to update room: ${error.message}`);
        }
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        this.logger.log(`Room updated successfully: ${room.room_number}`);
        return room;
    }
    async moveRoom(id, moveRoomDto) {
        const supabase = this.getSupabaseClient();
        const { data: targetFloor, error: floorError } = await supabase
            .from('floors')
            .select('id, name, number')
            .eq('id', moveRoomDto.targetFloorId)
            .single();
        if (floorError || !targetFloor) {
            throw new common_1.BadRequestException('Target floor not found');
        }
        const newRoomNumber = await this.getNextRoomNumber(moveRoomDto.targetFloorId);
        const { data: room, error } = await supabase
            .from('rooms')
            .update({
            floor_id: moveRoomDto.targetFloorId,
            room_number: newRoomNumber,
            display_order: moveRoomDto.targetPosition,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select(`
        *,
        floor:floors(
          id,
          name,
          number,
          building:buildings(id, building_name, code)
        )
      `)
            .single();
        if (error) {
            this.logger.error('Error moving room:', error);
            throw new common_1.InternalServerErrorException(`Failed to move room: ${error.message}`);
        }
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        this.logger.log(`Room moved successfully: ${room.room_number}`);
        return room;
    }
    async reorderRooms(floorId, reorderDto) {
        const supabase = this.getSupabaseClient();
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
                this.logger.error(`Error reordering room ${reorderDto.roomIds[i]}:`, error);
                throw new common_1.InternalServerErrorException(`Failed to reorder room: ${error.message}`);
            }
        }
        this.logger.log(`Rooms reordered successfully for floor ${floorId}`);
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase.from('rooms').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting room:', error);
            throw new common_1.InternalServerErrorException(`Failed to delete room: ${error.message}`);
        }
        this.logger.log(`Room deleted successfully: ${id}`);
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = RoomsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map