import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
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

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
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
      throw new InternalServerErrorException('Failed to create location');
    }

    this.logger.log(`Created location: ${data.name}`);
    return data;
  }

  async findAll(
    filters: {
      page?: number;
      limit?: number;
      imageType?: string;
    } = {},
  ): Promise<{
    data: Location[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const supabase = this.getSupabaseClient();
    const { page = 1, limit = 10, imageType } = filters;

    let query = supabase
      .from('locations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply image type filter if provided
    if (imageType) {
      query = query.eq('image_type', imageType);
    }

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching locations:', error);
      throw new InternalServerErrorException('Failed to fetch locations');
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

  async findOne(id: string): Promise<Location> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Location not found');
    }

    return data;
  }

  async findWithHotspots(id: string): Promise<Location> {
    const supabase = this.getSupabaseClient();

    // Get location with hotspots
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (locationError || !location) {
      throw new NotFoundException('Location not found');
    }

    // Get hotspots for this location
    const { data: hotspots, error: hotspotsError } = await supabase
      .from('hotspots')
      .select('*')
      .eq('location_id', id)
      .order('created_at', { ascending: true });

    if (hotspotsError) {
      this.logger.error('Error fetching hotspots:', hotspotsError);
      throw new InternalServerErrorException('Failed to fetch hotspots');
    }

    // Get linked locations for hotspots
    const linkedLocationIds =
      hotspots
        ?.filter((hotspot) => hotspot.link_to_location_id)
        .map((hotspot) => hotspot.link_to_location_id) || [];

    let linkedLocations: any[] = [];
    if (linkedLocationIds.length > 0) {
      const { data: linkedData, error: linkedError } = await supabase
        .from('locations')
        .select('id, name, image_type, preview_image_url')
        .in('id', linkedLocationIds);

      if (linkedError) {
        this.logger.error('Error fetching linked locations:', linkedError);
        throw new InternalServerErrorException(
          'Failed to fetch linked locations',
        );
      }

      linkedLocations = linkedData || [];
    }

    // Enhance hotspots with linked location data
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

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const supabase = this.getSupabaseClient();

    // Check if location exists
    const existingLocation = await this.findOne(id);

    const updateData: any = {};
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
      throw new InternalServerErrorException('Failed to update location');
    }

    this.logger.log(`Updated location: ${data.name}`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if location exists
    await this.findOne(id);

    const { error } = await supabase.from('locations').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting location:', error);
      throw new InternalServerErrorException('Failed to delete location');
    }

    this.logger.log(`Deleted location with ID: ${id}`);
  }

  async uploadImage(
    file: Express.Multer.File,
    locationId: string,
    imageType: 'main' | 'preview',
  ): Promise<{ url: string; path: string }> {
    const supabase = this.getSupabaseClient();

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 10MB.',
      );
    }

    // Check if location exists
    await this.findOne(locationId);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${locationId}/${imageType}_${timestamp}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('locations-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      this.logger.error('Error uploading image:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('locations-images')
      .getPublicUrl(fileName);

    this.logger.log(
      `Uploaded ${imageType} image for location ${locationId}: ${fileName}`,
    );

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  }

  async deleteImage(imagePath: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase.storage
      .from('locations-images')
      .remove([imagePath]);

    if (error) {
      this.logger.error('Error deleting image:', error);
      throw new InternalServerErrorException('Failed to delete image');
    }

    this.logger.log(`Deleted image: ${imagePath}`);
  }

  async updateLocationWithImage(
    id: string,
    updateLocationDto: UpdateLocationDto,
    mainImage?: Express.Multer.File,
    previewImage?: Express.Multer.File,
  ): Promise<Location> {
    const supabase = this.getSupabaseClient();

    // Check if location exists
    const existingLocation = await this.findOne(id);

    const updateData: any = {};
    if (updateLocationDto.name !== undefined)
      updateData.name = updateLocationDto.name;
    if (updateLocationDto.description !== undefined)
      updateData.description = updateLocationDto.description;
    if (updateLocationDto.imageType !== undefined)
      updateData.image_type = updateLocationDto.imageType;

    // Handle main image upload
    if (mainImage) {
      const uploadResult = await this.uploadImage(mainImage, id, 'main');
      updateData.image_url = uploadResult.url;
    } else if (updateLocationDto.imageUrl !== undefined) {
      updateData.image_url = updateLocationDto.imageUrl;
    }

    // Handle preview image upload
    if (previewImage) {
      const uploadResult = await this.uploadImage(previewImage, id, 'preview');
      updateData.preview_image_url = uploadResult.url;
    } else if (updateLocationDto.previewImageUrl !== undefined) {
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
      throw new InternalServerErrorException('Failed to update location');
    }

    this.logger.log(`Updated location: ${data.name}`);
    return data;
  }
}
