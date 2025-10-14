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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
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

@ApiTags('Events')
@ApiBearerAuth('JWT-auth')
@Controller('events')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
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
    return this.eventsService.findAll(filters);
  }

  @Get('upcoming')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete event (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  // Additional Info endpoints
  @Post(':id/additional-info')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
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
