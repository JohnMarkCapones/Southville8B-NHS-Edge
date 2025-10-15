import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCampusFacilityDto } from './dto/create-campus-facility.dto';
import { UpdateCampusFacilityDto } from './dto/update-campus-facility.dto';
import { CampusFacility } from './entities/campus-facility.entity';

@Injectable()
export class CampusFacilitiesService {
  private readonly logger = new Logger(CampusFacilitiesService.name);
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

  async create(
    createCampusFacilityDto: CreateCampusFacilityDto,
    imageFile?: any,
  ): Promise<CampusFacility> {
    try {
      const supabase = this.getSupabaseClient();
      let imageUrl: string | undefined;

      // Handle image upload if provided
      if (imageFile) {
        imageUrl = await this.uploadImage(imageFile);
      }

      const { data: facility, error } = await supabase
        .from('campus_facilities')
        .insert({
          name: createCampusFacilityDto.name,
          description: createCampusFacilityDto.description,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating campus facility:', error);
        throw new InternalServerErrorException(
          `Failed to create campus facility: ${error.message}`,
        );
      }

      this.logger.log(`Campus facility created successfully: ${facility.name}`);
      return facility;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating campus facility:', error);
      throw new InternalServerErrorException(
        'Failed to create campus facility',
      );
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

    let query = supabase.from('campus_facilities').select('*', {
      count: 'exact',
    });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: facilities, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching campus facilities:', error);
      throw new InternalServerErrorException(
        'Failed to fetch campus facilities',
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: facilities,
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

  async findOne(id: string): Promise<CampusFacility> {
    const supabase = this.getSupabaseClient();

    const { data: facility, error } = await supabase
      .from('campus_facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching campus facility:', error);
      throw new NotFoundException('Campus facility not found');
    }

    return facility;
  }

  async update(
    id: string,
    updateCampusFacilityDto: UpdateCampusFacilityDto,
    imageFile?: any,
  ): Promise<CampusFacility> {
    const supabase = this.getSupabaseClient();

    // Get existing facility to check for old image
    const { data: existingFacility } = await supabase
      .from('campus_facilities')
      .select('image_url')
      .eq('id', id)
      .single();

    let imageUrl = existingFacility?.image_url;

    // Handle new image upload if provided
    if (imageFile) {
      // Delete old image if exists
      if (existingFacility?.image_url) {
        await this.deleteImage(existingFacility.image_url);
      }
      imageUrl = await this.uploadImage(imageFile);
    }

    const updateData: any = {
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
      throw new InternalServerErrorException(
        `Failed to update campus facility: ${error.message}`,
      );
    }

    if (!facility) {
      throw new NotFoundException('Campus facility not found');
    }

    this.logger.log(`Campus facility updated successfully: ${facility.name}`);
    return facility;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Get facility to check for image
    const { data: facility } = await supabase
      .from('campus_facilities')
      .select('image_url')
      .eq('id', id)
      .single();

    // Delete associated image if exists
    if (facility?.image_url) {
      await this.deleteImage(facility.image_url);
    }

    const { error } = await supabase
      .from('campus_facilities')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting campus facility:', error);
      throw new InternalServerErrorException(
        `Failed to delete campus facility: ${error.message}`,
      );
    }

    this.logger.log(`Campus facility deleted successfully: ${id}`);
  }

  private async uploadImage(file: any): Promise<string> {
    const supabase = this.getSupabaseClient();

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 5MB.',
      );
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('campus-facilities')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      this.logger.error('Error uploading image:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('campus-facilities')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  private async deleteImage(imageUrl: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from('campus-facilities')
        .remove([fileName]);

      if (error) {
        this.logger.warn(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      this.logger.warn(`Error deleting image: ${error.message}`);
    }
  }
}
