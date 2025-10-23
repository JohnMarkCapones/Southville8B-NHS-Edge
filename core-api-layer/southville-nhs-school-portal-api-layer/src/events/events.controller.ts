import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Logger,
  ParseIntPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventAdditionalInfoDto } from './dto/create-event.dto';
import { UpdateEventAdditionalInfoDto } from './dto/update-event-additional-info.dto';
import { CreateEventHighlightDto } from './dto/create-event.dto';
import { UpdateEventHighlightDto } from './dto/update-event-highlight.dto';
import { CreateEventScheduleDto } from './dto/create-event.dto';
import { UpdateEventScheduleDto } from './dto/update-event-schedule.dto';
import { CreateEventFaqDto } from './dto/create-event.dto';
import { UpdateEventFaqDto } from './dto/update-event-faq.dto';
import { ReorderEventItemsDto } from './dto/reorder-event-items.dto';
import { EventStatisticsDto } from './dto/event-statistics.dto';
import { TagDto } from './dto/tag.dto';
import { Event } from './entities/event.entity';
import { EventAdditionalInfo } from './entities/event-additional-info.entity';
import { EventHighlight } from './entities/event-highlight.entity';
import { EventSchedule } from './entities/event-schedule.entity';
import { EventFaq } from './entities/event-faq.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuditInterceptor } from './audit.interceptor';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { R2StorageService } from '../storage/r2-storage/r2-storage.service';

@ApiTags('Events')
@Controller('events')
@UseInterceptors(AuditInterceptor)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  /**
   * Enrich event with presigned URL for image access
   */
  private async enrichEventWithPresignedUrl(event: any): Promise<any> {
    if (!event.eventImage) return event;

    try {
      let fileKey: string | null = null;

      // Check if it's already a key (new format)
      if (event.eventImage.startsWith('events/images/')) {
        fileKey = event.eventImage;
      }
      // Check if it's a public URL (old format) - extract the key
      else if (event.eventImage.includes('/events/images/')) {
        // Extract key from URL like: https://pub-xxx.r2.dev/events/images/filename.jpg
        const urlParts = event.eventImage.split('/events/images/');
        if (urlParts.length === 2) {
          fileKey = `events/images/${urlParts[1]}`;
        }
      }

      if (fileKey) {
        this.logger.debug(
          `Converting image URL to presigned URL. Original: ${event.eventImage}, Key: ${fileKey}`,
        );
        event.eventImage = await this.r2StorageService.getPresignedUrl(
          fileKey,
          86400,
        );
        this.logger.debug(`Generated presigned URL: ${event.eventImage}`);
      } else {
        this.logger.warn(
          `Could not extract file key from image URL: ${event.eventImage}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to generate presigned URL for ${event.eventImage}: ${error.message}`,
      );
      // Keep the original URL if presigned URL generation fails
    }

    return event;
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new event (Admin/Teacher only)' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(
    @Body() createEventDto: CreateEventDto,
    @AuthUser() user: any,
  ): Promise<Event> {
    this.logger.log(`Creating event for user: ${user.id}`);
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all events with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    description: 'Filter by event status',
  })
  @ApiQuery({
    name: 'visibility',
    required: false,
    enum: ['public', 'private'],
    description: 'Filter by visibility',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter events from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter events until this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'organizerId',
    required: false,
    type: String,
    description: 'Filter by organizer ID',
  })
  @ApiQuery({
    name: 'tagId',
    required: false,
    type: String,
    description: 'Filter by tag ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title and description',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: string,
    @Query('visibility') visibility?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('organizerId') organizerId?: string,
    @Query('tagId') tagId?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      page,
      limit,
      status,
      visibility,
      startDate,
      endDate,
      organizerId,
      tagId,
      search,
    };
    const result = await this.eventsService.findAll(filters);

    // Enrich events with presigned URLs
    if (result && result.data) {
      for (const event of result.data) {
        await this.enrichEventWithPresignedUrl(event);
      }
    }

    return result;
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get event statistics and KPIs' })
  @ApiResponse({
    status: 200,
    description: 'Event statistics retrieved successfully',
    type: EventStatisticsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics(): Promise<EventStatisticsDto> {
    return this.eventsService.getStatistics();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all event tags' })
  @ApiResponse({
    status: 200,
    description: 'Event tags retrieved successfully',
    type: [TagDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTags(): Promise<TagDto[]> {
    return this.eventsService.getTags();
  }

  @Post('upload-image')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload event image to R2 storage' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://pub-xxx.r2.dev/events/images/uuid-image.jpg',
        },
        fileName: { type: 'string' },
        fileSize: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid image file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async uploadImage(@Req() request: any, @AuthUser('id') userId: string) {
    try {
      const parts = request.parts();
      let imageBuffer: Buffer | null = null;
      let imageFilename: string = '';
      let imageMimeType: string = '';

      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'image') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          imageBuffer = Buffer.concat(chunks);
          imageFilename = part.filename;
          imageMimeType = part.mimetype;
        }
      }

      if (!imageBuffer || !imageFilename) {
        throw new BadRequestException('No image file provided');
      }

      // Validate image type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(imageMimeType)) {
        throw new BadRequestException(
          'Invalid image type. Allowed: JPEG, PNG, GIF, WEBP',
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (imageBuffer.length > maxSize) {
        throw new BadRequestException(
          `Image too large: ${(imageBuffer.length / (1024 * 1024)).toFixed(2)}MB. Maximum: 10MB`,
        );
      }

      // Sanitize filename
      const ext = path.extname(imageFilename);
      const sanitizedName = imageFilename
        .replace(ext, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

      // Generate unique file key for R2
      const uniqueId = uuidv4();
      const finalFilename = `${uniqueId}-${sanitizedName}${ext}`;
      const fileKey = `events/images/${finalFilename}`;

      this.logger.debug(`Uploading image to R2: ${fileKey}`);

      // Upload to R2
      const uploadResult = await this.r2StorageService.uploadFile(
        fileKey,
        imageBuffer,
        imageMimeType,
      );

      if (!uploadResult.success) {
        this.logger.error(`R2 upload failed for ${fileKey}`);
        throw new BadRequestException('Failed to upload image to storage');
      }

      this.logger.log(`Image uploaded successfully: ${fileKey}`);

      this.logger.debug(`Upload result: ${JSON.stringify(uploadResult)}`);

      // Return file key instead of presigned URL to avoid database length limits
      // Presigned URLs will be generated on-demand in findOne/findAll endpoints
      return {
        url: fileKey, // Store just the key, not the presigned URL
        fileName: imageFilename,
        fileSize: imageBuffer.length,
      };
    } catch (error) {
      this.logger.error('Error uploading image:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to upload image: ${error.message || 'Unknown error'}`,
      );
    }
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @Get('organizer/:organizerId')
  @ApiOperation({ summary: 'Get events by organizer' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizer events retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByOrganizer(
    @Param('organizerId') organizerId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const filters = { page, limit };
    return this.eventsService.findByOrganizer(organizerId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string): Promise<Event> {
    const event = await this.eventsService.findOne(id);
    return this.enrichEventWithPresignedUrl(event);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event (Admin or organizer)' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own events',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @AuthUser() user: any,
  ): Promise<Event> {
    this.logger.log(`Updating event ${id} for user: ${user.id}`);
    return this.eventsService.update(id, updateEventDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Permanently delete event (Admin only - use for archived events)',
  })
  @ApiResponse({
    status: 200,
    description: 'Event permanently deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  @Post(':id/archive')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Archive event (soft delete - Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event archived successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async archive(@Param('id') id: string, @AuthUser() user: any): Promise<void> {
    return this.eventsService.softDelete(id, user.id);
  }

  @Get('archived')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get archived (soft-deleted) events' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title, description, location',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category (tag ID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Archived events retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findArchived(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const filters = { page, limit, search, category };
    return this.eventsService.findArchived(filters);
  }

  @Patch(':id/restore')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore archived event (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event restored successfully',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async restore(@Param('id') id: string): Promise<Event> {
    return this.eventsService.restore(id);
  }

  // Additional Info endpoints
  @Post(':id/additional-info')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add additional info to event' })
  @ApiResponse({
    status: 201,
    description: 'Additional info added successfully',
    type: EventAdditionalInfo,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async addAdditionalInfo(
    @Param('id') eventId: string,
    @Body() dto: CreateEventAdditionalInfoDto,
  ): Promise<EventAdditionalInfo> {
    return this.eventsService.addAdditionalInfo(eventId, dto);
  }

  @Patch(':id/additional-info/:infoId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update additional info' })
  @ApiResponse({
    status: 200,
    description: 'Additional info updated successfully',
    type: EventAdditionalInfo,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or info not found' })
  async updateAdditionalInfo(
    @Param('id') eventId: string,
    @Param('infoId') infoId: string,
    @Body() dto: UpdateEventAdditionalInfoDto,
  ): Promise<EventAdditionalInfo> {
    return this.eventsService.updateAdditionalInfo(eventId, infoId, dto);
  }

  @Delete(':id/additional-info/:infoId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove additional info' })
  @ApiResponse({
    status: 200,
    description: 'Additional info removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or info not found' })
  async removeAdditionalInfo(
    @Param('id') eventId: string,
    @Param('infoId') infoId: string,
  ): Promise<void> {
    return this.eventsService.removeAdditionalInfo(eventId, infoId);
  }

  // Highlights endpoints
  @Post(':id/highlights')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add highlight to event' })
  @ApiResponse({
    status: 201,
    description: 'Highlight added successfully',
    type: EventHighlight,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async addHighlight(
    @Param('id') eventId: string,
    @Body() dto: CreateEventHighlightDto,
  ): Promise<EventHighlight> {
    return this.eventsService.addHighlight(eventId, dto);
  }

  @Patch(':id/highlights/:highlightId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update highlight' })
  @ApiResponse({
    status: 200,
    description: 'Highlight updated successfully',
    type: EventHighlight,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or highlight not found' })
  async updateHighlight(
    @Param('id') eventId: string,
    @Param('highlightId') highlightId: string,
    @Body() dto: UpdateEventHighlightDto,
  ): Promise<EventHighlight> {
    return this.eventsService.updateHighlight(eventId, highlightId, dto);
  }

  @Delete(':id/highlights/:highlightId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove highlight' })
  @ApiResponse({
    status: 200,
    description: 'Highlight removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or highlight not found' })
  async removeHighlight(
    @Param('id') eventId: string,
    @Param('highlightId') highlightId: string,
  ): Promise<void> {
    return this.eventsService.removeHighlight(eventId, highlightId);
  }

  // Schedule endpoints
  @Post(':id/schedule')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add schedule item to event' })
  @ApiResponse({
    status: 201,
    description: 'Schedule item added successfully',
    type: EventSchedule,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async addScheduleItem(
    @Param('id') eventId: string,
    @Body() dto: CreateEventScheduleDto,
  ): Promise<EventSchedule> {
    return this.eventsService.addScheduleItem(eventId, dto);
  }

  @Patch(':id/schedule/:scheduleId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update schedule item' })
  @ApiResponse({
    status: 200,
    description: 'Schedule item updated successfully',
    type: EventSchedule,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or schedule item not found' })
  async updateScheduleItem(
    @Param('id') eventId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateEventScheduleDto,
  ): Promise<EventSchedule> {
    return this.eventsService.updateScheduleItem(eventId, scheduleId, dto);
  }

  @Delete(':id/schedule/:scheduleId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove schedule item' })
  @ApiResponse({
    status: 200,
    description: 'Schedule item removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or schedule item not found' })
  async removeScheduleItem(
    @Param('id') eventId: string,
    @Param('scheduleId') scheduleId: string,
  ): Promise<void> {
    return this.eventsService.removeScheduleItem(eventId, scheduleId);
  }

  // FAQ endpoints
  @Post(':id/faq')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add FAQ to event' })
  @ApiResponse({
    status: 201,
    description: 'FAQ added successfully',
    type: EventFaq,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async addFaq(
    @Param('id') eventId: string,
    @Body() dto: CreateEventFaqDto,
  ): Promise<EventFaq> {
    return this.eventsService.addFaq(eventId, dto);
  }

  @Patch(':id/faq/:faqId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update FAQ' })
  @ApiResponse({
    status: 200,
    description: 'FAQ updated successfully',
    type: EventFaq,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or FAQ not found' })
  async updateFaq(
    @Param('id') eventId: string,
    @Param('faqId') faqId: string,
    @Body() dto: UpdateEventFaqDto,
  ): Promise<EventFaq> {
    return this.eventsService.updateFaq(eventId, faqId, dto);
  }

  @Delete(':id/faq/:faqId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove FAQ' })
  @ApiResponse({
    status: 200,
    description: 'FAQ removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or FAQ not found' })
  async removeFaq(
    @Param('id') eventId: string,
    @Param('faqId') faqId: string,
  ): Promise<void> {
    return this.eventsService.removeFaq(eventId, faqId);
  }

  // Reorder endpoints
  @Patch(':id/reorder/:entityType')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reorder event items' })
  @ApiResponse({
    status: 200,
    description: 'Items reordered successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async reorderItems(
    @Param('id') eventId: string,
    @Param('entityType') entityType: string,
    @Body() dto: ReorderEventItemsDto,
  ): Promise<void> {
    return this.eventsService.reorderItems(eventId, entityType, dto);
  }
}
