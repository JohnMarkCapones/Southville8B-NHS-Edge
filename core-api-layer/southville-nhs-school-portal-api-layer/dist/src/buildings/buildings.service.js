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
var BuildingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let BuildingsService = BuildingsService_1 = class BuildingsService {
    configService;
    logger = new common_1.Logger(BuildingsService_1.name);
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
    async create(createBuildingDto) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: existingBuilding } = await supabase
                .from('buildings')
                .select('id')
                .eq('code', createBuildingDto.code)
                .single();
            if (existingBuilding) {
                throw new common_1.ConflictException('Building code already exists');
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
                throw new common_1.InternalServerErrorException(`Failed to create building: ${error.message}`);
            }
            this.logger.log(`Building created successfully: ${building.building_name}`);
            return building;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating building:', error);
            throw new common_1.InternalServerErrorException('Failed to create building');
        }
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        let query = supabase.from('buildings').select(`
      *,
      floors(id, name, number),
      floors_count:floors(count)
    `, { count: 'exact' });
        if (search) {
            query = query.or(`building_name.ilike.%${search}%,code.ilike.%${search}%`);
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data: buildings, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching buildings:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch buildings');
        }
        const totalPages = Math.ceil((count || 0) / limit);
        return {
            data: buildings,
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
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data: building, error } = await supabase
            .from('buildings')
            .select(`
        *,
        floors(
          id,
          name,
          number,
          rooms(id, room_number, capacity, status)
        )
      `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching building:', error);
            throw new common_1.NotFoundException('Building not found');
        }
        return building;
    }
    async update(id, updateBuildingDto) {
        const supabase = this.getSupabaseClient();
        this.logger.debug(`Updating building ${id} with data:`, updateBuildingDto);
        if (updateBuildingDto.code) {
            const { data: existingBuilding } = await supabase
                .from('buildings')
                .select('id')
                .eq('code', updateBuildingDto.code)
                .neq('id', id)
                .single();
            if (existingBuilding) {
                throw new common_1.ConflictException('Building code already exists');
            }
        }
        const updateData = {
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
            throw new common_1.InternalServerErrorException(`Failed to update building: ${error.message}`);
        }
        if (!building) {
            throw new common_1.NotFoundException('Building not found');
        }
        this.logger.log(`Building updated successfully: ${building.building_name}`);
        return building;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase.from('buildings').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting building:', error);
            throw new common_1.InternalServerErrorException(`Failed to delete building: ${error.message}`);
        }
        this.logger.log(`Building deleted successfully: ${id}`);
    }
    async getBuildingStats(id) {
        const supabase = this.getSupabaseClient();
        const { data: building, error: buildingError } = await supabase
            .from('buildings')
            .select('id, building_name, capacity')
            .eq('id', id)
            .single();
        if (buildingError || !building) {
            throw new common_1.NotFoundException('Building not found');
        }
        const { count: floorsCount } = await supabase
            .from('floors')
            .select('*', { count: 'exact', head: true })
            .eq('building_id', id);
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
        const totalRoomsCapacity = roomsData?.reduce((sum, room) => sum + (room.capacity || 0), 0) || 0;
        const utilizationRate = building.capacity && building.capacity > 0
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
};
exports.BuildingsService = BuildingsService;
exports.BuildingsService = BuildingsService = BuildingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BuildingsService);
//# sourceMappingURL=buildings.service.js.map