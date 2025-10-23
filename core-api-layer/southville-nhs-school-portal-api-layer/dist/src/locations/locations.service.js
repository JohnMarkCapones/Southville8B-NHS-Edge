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
var LocationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let LocationsService = LocationsService_1 = class LocationsService {
    configService;
    logger = new common_1.Logger(LocationsService_1.name);
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
    async create(createLocationDto) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('locations')
            .insert({
            name: createLocationDto.name,
            description: createLocationDto.description,
            image_type: createLocationDto.imageType,
            image_url: createLocationDto.imageUrl,
            preview_image_url: createLocationDto.previewImageUrl,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating location:', error);
            throw new common_1.InternalServerErrorException('Failed to create location');
        }
        this.logger.log(`Created location: ${data.name}`);
        return data;
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, imageType } = filters;
        let query = supabase
            .from('locations')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });
        if (imageType) {
            query = query.eq('image_type', imageType);
        }
        query = query.range((page - 1) * limit, page * limit - 1);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching locations:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch locations');
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
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Location not found');
        }
        return data;
    }
    async findWithHotspots(id) {
        const supabase = this.getSupabaseClient();
        const { data: location, error: locationError } = await supabase
            .from('locations')
            .select('*')
            .eq('id', id)
            .single();
        if (locationError || !location) {
            throw new common_1.NotFoundException('Location not found');
        }
        const { data: hotspots, error: hotspotsError } = await supabase
            .from('hotspots')
            .select('*')
            .eq('location_id', id)
            .order('created_at', { ascending: true });
        if (hotspotsError) {
            this.logger.error('Error fetching hotspots:', hotspotsError);
            throw new common_1.InternalServerErrorException('Failed to fetch hotspots');
        }
        const linkedLocationIds = hotspots
            ?.filter((hotspot) => hotspot.link_to_location_id)
            .map((hotspot) => hotspot.link_to_location_id) || [];
        let linkedLocations = [];
        if (linkedLocationIds.length > 0) {
            const { data: linkedData, error: linkedError } = await supabase
                .from('locations')
                .select('id, name, image_type, preview_image_url')
                .in('id', linkedLocationIds);
            if (linkedError) {
                this.logger.error('Error fetching linked locations:', linkedError);
                throw new common_1.InternalServerErrorException('Failed to fetch linked locations');
            }
            linkedLocations = linkedData || [];
        }
        const enhancedHotspots = hotspots?.map((hotspot) => ({
            ...hotspot,
            linked_location: hotspot.link_to_location_id
                ? linkedLocations.find((loc) => loc.id === hotspot.link_to_location_id)
                : null,
        }));
        return {
            ...location,
            hotspots: enhancedHotspots || [],
        };
    }
    async update(id, updateLocationDto) {
        const supabase = this.getSupabaseClient();
        const existingLocation = await this.findOne(id);
        const updateData = {};
        if (updateLocationDto.name !== undefined)
            updateData.name = updateLocationDto.name;
        if (updateLocationDto.description !== undefined)
            updateData.description = updateLocationDto.description;
        if (updateLocationDto.imageType !== undefined)
            updateData.image_type = updateLocationDto.imageType;
        if (updateLocationDto.imageUrl !== undefined)
            updateData.image_url = updateLocationDto.imageUrl;
        if (updateLocationDto.previewImageUrl !== undefined)
            updateData.preview_image_url = updateLocationDto.previewImageUrl;
        const { data, error } = await supabase
            .from('locations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating location:', error);
            throw new common_1.InternalServerErrorException('Failed to update location');
        }
        this.logger.log(`Updated location: ${data.name}`);
        return data;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        await this.findOne(id);
        const { error } = await supabase.from('locations').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting location:', error);
            throw new common_1.InternalServerErrorException('Failed to delete location');
        }
        this.logger.log(`Deleted location with ID: ${id}`);
    }
    async uploadImage(file, locationId, imageType) {
        const supabase = this.getSupabaseClient();
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size too large. Maximum size is 10MB.');
        }
        await this.findOne(locationId);
        const timestamp = Date.now();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${locationId}/${imageType}_${timestamp}.${fileExtension}`;
        const { data, error } = await supabase.storage
            .from('locations-images')
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false,
        });
        if (error) {
            this.logger.error('Error uploading image:', error);
            throw new common_1.InternalServerErrorException('Failed to upload image');
        }
        const { data: urlData } = supabase.storage
            .from('locations-images')
            .getPublicUrl(fileName);
        this.logger.log(`Uploaded ${imageType} image for location ${locationId}: ${fileName}`);
        return {
            url: urlData.publicUrl,
            path: fileName,
        };
    }
    async deleteImage(imagePath, locationId) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase.storage
            .from('locations-images')
            .remove([imagePath]);
        if (error) {
            this.logger.error('Error deleting image:', error);
            throw new common_1.InternalServerErrorException('Failed to delete image');
        }
        const { data: location } = await supabase
            .from('locations')
            .select('image_url, preview_image_url')
            .eq('id', locationId)
            .single();
        if (location) {
            const updateData = {};
            if (location.image_url && location.image_url.includes(imagePath)) {
                updateData.image_url = null;
            }
            if (location.preview_image_url &&
                location.preview_image_url.includes(imagePath)) {
                updateData.preview_image_url = null;
            }
            if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await supabase
                    .from('locations')
                    .update(updateData)
                    .eq('id', locationId);
                if (updateError) {
                    this.logger.error('Error updating location after image deletion:', updateError);
                    throw new common_1.InternalServerErrorException('Failed to update location record');
                }
            }
        }
        this.logger.log(`Deleted image: ${imagePath}`);
    }
    async updateLocationWithImage(id, updateLocationDto, mainImage, previewImage) {
        const supabase = this.getSupabaseClient();
        const existingLocation = await this.findOne(id);
        const updateData = {};
        if (updateLocationDto.name !== undefined)
            updateData.name = updateLocationDto.name;
        if (updateLocationDto.description !== undefined)
            updateData.description = updateLocationDto.description;
        if (updateLocationDto.imageType !== undefined)
            updateData.image_type = updateLocationDto.imageType;
        if (mainImage) {
            const uploadResult = await this.uploadImage(mainImage, id, 'main');
            updateData.image_url = uploadResult.url;
        }
        else if (updateLocationDto.imageUrl !== undefined) {
            updateData.image_url = updateLocationDto.imageUrl;
        }
        if (previewImage) {
            const uploadResult = await this.uploadImage(previewImage, id, 'preview');
            updateData.preview_image_url = uploadResult.url;
        }
        else if (updateLocationDto.previewImageUrl !== undefined) {
            updateData.preview_image_url = updateLocationDto.previewImageUrl;
        }
        const { data, error } = await supabase
            .from('locations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating location:', error);
            throw new common_1.InternalServerErrorException('Failed to update location');
        }
        this.logger.log(`Updated location: ${data.name}`);
        return data;
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = LocationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map