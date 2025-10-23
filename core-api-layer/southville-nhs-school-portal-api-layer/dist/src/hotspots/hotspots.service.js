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
var HotspotsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotspotsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let HotspotsService = HotspotsService_1 = class HotspotsService {
    configService;
    logger = new common_1.Logger(HotspotsService_1.name);
    supabase = null;
    constructor(configService) {
        this.configService = configService;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new common_1.InternalServerErrorException('Database configuration is missing. Please contact administrator.');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async create(createHotspotDto) {
        const supabase = this.getSupabaseClient();
        if (createHotspotDto.linkToLocationId) {
            await this.validateNoCircularReference(createHotspotDto.locationId, createHotspotDto.linkToLocationId);
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
            throw new common_1.InternalServerErrorException('Failed to create hotspot');
        }
        this.logger.log(`Created hotspot: ${data.label}`);
        return data;
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, locationId } = filters;
        let query = supabase
            .from('hotspots')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: true });
        if (locationId) {
            query = query.eq('location_id', locationId);
        }
        query = query.range((page - 1) * limit, page * limit - 1);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching hotspots:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch hotspots');
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
    async findByLocation(locationId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('hotspots')
            .select('*')
            .eq('location_id', locationId)
            .order('created_at', { ascending: true });
        if (error) {
            this.logger.error('Error fetching hotspots by location:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch hotspots');
        }
        return data || [];
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('hotspots')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Hotspot not found');
        }
        return data;
    }
    async update(id, updateHotspotDto) {
        const supabase = this.getSupabaseClient();
        const existingHotspot = await this.findOne(id);
        if (updateHotspotDto.linkToLocationId) {
            const locationId = updateHotspotDto.locationId || existingHotspot.location_id;
            await this.validateNoCircularReference(locationId, updateHotspotDto.linkToLocationId);
        }
        const updateData = {};
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
            throw new common_1.InternalServerErrorException('Failed to update hotspot');
        }
        this.logger.log(`Updated hotspot: ${data.label}`);
        return data;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        await this.findOne(id);
        const { error } = await supabase.from('hotspots').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting hotspot:', error);
            throw new common_1.InternalServerErrorException('Failed to delete hotspot');
        }
        this.logger.log(`Deleted hotspot with ID: ${id}`);
    }
    async validateNoCircularReference(startLocationId, targetLocationId, visited = new Set(), depth = 0) {
        if (depth > 10) {
            throw new common_1.BadRequestException('Tour path too deep');
        }
        if (startLocationId === targetLocationId) {
            throw new common_1.BadRequestException('Cannot link location to itself');
        }
        if (visited.has(targetLocationId)) {
            throw new common_1.BadRequestException('Circular reference detected in tour path');
        }
        visited.add(targetLocationId);
        const supabase = this.getSupabaseClient();
        const { data: hotspots, error } = await supabase
            .from('hotspots')
            .select('link_to_location_id')
            .eq('location_id', targetLocationId)
            .not('link_to_location_id', 'is', null);
        if (error) {
            this.logger.error('Error validating circular reference:', error);
            throw new common_1.InternalServerErrorException('Failed to validate tour path');
        }
        for (const hotspot of hotspots || []) {
            if (hotspot.link_to_location_id) {
                await this.validateNoCircularReference(targetLocationId, hotspot.link_to_location_id, visited, depth + 1);
            }
        }
    }
};
exports.HotspotsService = HotspotsService;
exports.HotspotsService = HotspotsService = HotspotsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HotspotsService);
//# sourceMappingURL=hotspots.service.js.map