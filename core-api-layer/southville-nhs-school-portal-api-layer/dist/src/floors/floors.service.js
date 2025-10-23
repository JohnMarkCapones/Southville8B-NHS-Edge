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
var FloorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloorsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let FloorsService = FloorsService_1 = class FloorsService {
    configService;
    logger = new common_1.Logger(FloorsService_1.name);
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
    async create(createFloorDto) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: building, error: buildingError } = await supabase
                .from('buildings')
                .select('id, building_name')
                .eq('id', createFloorDto.buildingId)
                .single();
            if (buildingError || !building) {
                throw new common_1.BadRequestException('Building not found');
            }
            const { data: existingFloor } = await supabase
                .from('floors')
                .select('id')
                .eq('building_id', createFloorDto.buildingId)
                .eq('number', createFloorDto.number)
                .single();
            if (existingFloor) {
                throw new common_1.ConflictException(`Floor number ${createFloorDto.number} already exists in this building`);
            }
            const { data: floor, error } = await supabase
                .from('floors')
                .insert({
                building_id: createFloorDto.buildingId,
                name: createFloorDto.name,
                number: createFloorDto.number,
            })
                .select(`
          *,
          building:buildings(id, building_name, code)
        `)
                .single();
            if (error) {
                this.logger.error('Error creating floor:', error);
                throw new common_1.InternalServerErrorException(`Failed to create floor: ${error.message}`);
            }
            this.logger.log(`Floor created successfully: ${floor.name}`);
            return floor;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating floor:', error);
            throw new common_1.InternalServerErrorException('Failed to create floor');
        }
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, search, buildingId, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        let query = supabase.from('floors').select(`
      *,
      building:buildings(id, building_name, code),
      rooms(id, room_number, name, capacity, status)
    `, { count: 'exact' });
        if (search) {
            query = query.or(`name.ilike.%${search}%`);
        }
        if (buildingId) {
            query = query.eq('building_id', buildingId);
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data: floors, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching floors:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch floors');
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
    async findByBuilding(buildingId) {
        const supabase = this.getSupabaseClient();
        const { data: floors, error } = await supabase
            .from('floors')
            .select(`
        *,
        building:buildings(id, building_name, code),
        rooms(id, room_number, name, capacity, status)
      `)
            .eq('building_id', buildingId)
            .order('number');
        if (error) {
            this.logger.error('Error fetching floors by building:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch floors by building');
        }
        return floors || [];
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data: floor, error } = await supabase
            .from('floors')
            .select(`
        *,
        building:buildings(id, building_name, code),
        rooms(id, room_number, name, capacity, status)
      `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching floor:', error);
            throw new common_1.NotFoundException('Floor not found');
        }
        return floor;
    }
    async update(id, updateFloorDto) {
        const supabase = this.getSupabaseClient();
        const existingFloor = await this.findOne(id);
        const effectiveBuildingId = updateFloorDto.buildingId ?? existingFloor.buildingId;
        if (updateFloorDto.number) {
            const { data: duplicateFloor } = await supabase
                .from('floors')
                .select('id')
                .eq('building_id', effectiveBuildingId)
                .eq('number', updateFloorDto.number)
                .neq('id', id)
                .single();
            if (duplicateFloor) {
                throw new common_1.ConflictException(`Floor number ${updateFloorDto.number} already exists in this building`);
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
            .select(`
        *,
        building:buildings(id, building_name, code)
      `)
            .single();
        if (error) {
            this.logger.error('Error updating floor:', error);
            throw new common_1.InternalServerErrorException(`Failed to update floor: ${error.message}`);
        }
        if (!floor) {
            throw new common_1.NotFoundException('Floor not found');
        }
        this.logger.log(`Floor updated successfully: ${floor.name}`);
        return floor;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('id')
            .eq('floor_id', id)
            .limit(1);
        if (roomsError) {
            this.logger.error('Error checking rooms:', roomsError);
            throw new common_1.InternalServerErrorException('Failed to check floor rooms');
        }
        if (rooms && rooms.length > 0) {
            throw new common_1.BadRequestException('Cannot delete floor with existing rooms. Please delete or move rooms first.');
        }
        const { error } = await supabase.from('floors').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting floor:', error);
            throw new common_1.InternalServerErrorException(`Failed to delete floor: ${error.message}`);
        }
        this.logger.log(`Floor deleted successfully: ${id}`);
    }
};
exports.FloorsService = FloorsService;
exports.FloorsService = FloorsService = FloorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FloorsService);
//# sourceMappingURL=floors.service.js.map