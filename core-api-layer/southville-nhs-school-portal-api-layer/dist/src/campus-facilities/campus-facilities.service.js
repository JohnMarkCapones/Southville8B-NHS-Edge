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
var CampusFacilitiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampusFacilitiesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let CampusFacilitiesService = CampusFacilitiesService_1 = class CampusFacilitiesService {
    configService;
    logger = new common_1.Logger(CampusFacilitiesService_1.name);
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
    async create(createCampusFacilityDto, imageFile) {
        try {
            const supabase = this.getSupabaseClient();
            let imageUrl;
            const { data: existingFacility } = await supabase
                .from('campus_facilities')
                .select('id')
                .eq('name', createCampusFacilityDto.name)
                .eq('domain_id', createCampusFacilityDto.domainId)
                .single();
            if (existingFacility) {
                throw new common_1.ConflictException('A facility with this name already exists in this domain');
            }
            if (imageFile) {
                imageUrl = await this.uploadImage(imageFile);
            }
            const { data: facility, error } = await supabase
                .from('campus_facilities')
                .insert({
                name: createCampusFacilityDto.name,
                description: createCampusFacilityDto.description,
                image_url: imageUrl,
                building_id: createCampusFacilityDto.buildingId,
                floor_id: createCampusFacilityDto.floorId,
                capacity: createCampusFacilityDto.capacity,
                type: createCampusFacilityDto.type,
                status: createCampusFacilityDto.status || 'Available',
                domain_id: createCampusFacilityDto.domainId,
                created_by: createCampusFacilityDto.createdBy,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating campus facility:', error);
                throw new common_1.InternalServerErrorException(`Failed to create campus facility: ${error.message}`);
            }
            this.logger.log(`Campus facility created successfully: ${facility.name}`);
            return this.mapDbToDto(facility);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating campus facility:', error);
            throw new common_1.InternalServerErrorException('Failed to create campus facility');
        }
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc', buildingId, floorId, type, status, domainId, } = filters;
        let query = supabase.from('campus_facilities').select('*', {
            count: 'exact',
        });
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (buildingId) {
            query = query.eq('building_id', buildingId.trim());
        }
        if (floorId) {
            query = query.eq('floor_id', floorId.trim());
        }
        if (type) {
            const types = Array.isArray(type) ? type : [type];
            query = query.in('type', types);
        }
        if (status) {
            const statuses = Array.isArray(status) ? status : [status];
            query = query.in('status', statuses);
        }
        if (domainId) {
            query = query.eq('domain_id', domainId.trim());
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data: facilities, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching campus facilities:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch campus facilities');
        }
        const totalPages = Math.ceil((count || 0) / limit);
        return {
            data: facilities.map((f) => this.mapDbToDto(f)),
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
        const { data: facility, error } = await supabase
            .from('campus_facilities')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !facility) {
            this.logger.error(`Facility not found or error fetching: ${id}`, error);
            throw new common_1.NotFoundException('Campus facility not found');
        }
        return this.mapDbToDto(facility);
    }
    async update(id, updateCampusFacilityDto, imageFile) {
        const supabase = this.getSupabaseClient();
        const { data: existingFacility, error: fetchError } = await supabase
            .from('campus_facilities')
            .select('image_url')
            .eq('id', id)
            .single();
        if (fetchError || !existingFacility) {
            this.logger.error(`Facility not found or error fetching: ${id}`, fetchError);
            throw new common_1.NotFoundException('Campus facility not found');
        }
        let imageUrl = existingFacility.image_url;
        if (imageFile) {
            if (existingFacility.image_url) {
                await this.deleteImage(existingFacility.image_url);
            }
            imageUrl = await this.uploadImage(imageFile);
        }
        const updateData = {
            name: updateCampusFacilityDto.name,
            description: updateCampusFacilityDto.description,
            updated_at: new Date().toISOString(),
        };
        if (imageUrl !== undefined) {
            updateData.image_url = imageUrl;
        }
        const { data: facility, error } = await supabase
            .from('campus_facilities')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating campus facility:', error);
            throw new common_1.InternalServerErrorException(`Failed to update campus facility: ${error.message}`);
        }
        if (!facility) {
            throw new common_1.NotFoundException('Campus facility not found');
        }
        this.logger.log(`Campus facility updated successfully: ${facility.name}`);
        return this.mapDbToDto(facility);
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const { data: facility, error: fetchError } = await supabase
            .from('campus_facilities')
            .select('image_url')
            .eq('id', id)
            .single();
        if (fetchError || !facility) {
            this.logger.error(`Facility not found or error fetching: ${id}`, fetchError);
            throw new common_1.NotFoundException('Campus facility not found');
        }
        if (facility.image_url) {
            await this.deleteImage(facility.image_url);
        }
        const { error } = await supabase
            .from('campus_facilities')
            .delete()
            .eq('id', id);
        if (error) {
            this.logger.error('Error deleting campus facility:', error);
            throw new common_1.InternalServerErrorException(`Failed to delete campus facility: ${error.message}`);
        }
        this.logger.log(`Campus facility deleted successfully: ${id}`);
    }
    async uploadImage(file) {
        const supabase = this.getSupabaseClient();
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size too large. Maximum size is 5MB.');
        }
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const { data, error } = await supabase.storage
            .from('campus-facilities')
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        });
        if (error) {
            this.logger.error('Error uploading image:', error);
            throw new common_1.InternalServerErrorException('Failed to upload image');
        }
        const { data: urlData } = supabase.storage
            .from('campus-facilities')
            .getPublicUrl(data.path);
        return urlData.publicUrl;
    }
    mapDbToDto(dbRecord) {
        return {
            id: dbRecord.id,
            name: dbRecord.name,
            imageUrl: dbRecord.image_url,
            description: dbRecord.description,
            buildingId: dbRecord.building_id,
            floorId: dbRecord.floor_id,
            capacity: dbRecord.capacity,
            type: dbRecord.type,
            status: dbRecord.status,
            domainId: dbRecord.domain_id,
            createdBy: dbRecord.created_by,
            createdAt: dbRecord.created_at,
            updatedAt: dbRecord.updated_at,
        };
    }
    async deleteImage(imageUrl) {
        try {
            const supabase = this.getSupabaseClient();
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const { error } = await supabase.storage
                .from('campus-facilities')
                .remove([fileName]);
            if (error) {
                this.logger.warn(`Failed to delete image: ${error.message}`);
            }
        }
        catch (error) {
            this.logger.warn(`Error deleting image: ${error.message}`);
        }
    }
};
exports.CampusFacilitiesService = CampusFacilitiesService;
exports.CampusFacilitiesService = CampusFacilitiesService = CampusFacilitiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CampusFacilitiesService);
//# sourceMappingURL=campus-facilities.service.js.map