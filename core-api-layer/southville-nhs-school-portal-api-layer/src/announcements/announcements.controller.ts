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
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Announcement } from './entities/announcement.entity';
import { Tag } from './entities/tag.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { AuditInterceptor } from './audit.interceptor';

@ApiTags('Announcements')
@Controller('announcements')
@UseInterceptors(AuditInterceptor)
export class AnnouncementsController {
  private readonly logger = new Logger(AnnouncementsController.name);

  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new announcement (Admin/Teacher only)' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
    type: Announcement,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @AuthUser() user: any,
  ): Promise<Announcement> {
    this.logger.log(`Creating announcement for user: ${user.id}`);
    return this.announcementsService.create(createAnnouncementDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all announcements with pagination and filtering',
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
    name: 'visibility',
    required: false,
    enum: ['public', 'private'],
    description: 'Filter by visibility',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by announcement type',
  })
  @ApiQuery({
    name: 'roleId',
    required: false,
    type: String,
    description: 'Filter by target role ID',
  })
  @ApiQuery({
    name: 'includeExpired',
    required: false,
    type: Boolean,
    description: 'Include expired announcements (default: false)',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    type: String,
    description: 'Filter by teacher ID (user_id)',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    type: String,
    description: 'Filter by section ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcements retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('visibility') visibility?: string,
    @Query('type') type?: string,
    @Query('roleId') roleId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('includeExpired', new DefaultValuePipe(false), ParseBoolPipe)
    includeExpired?: boolean,
  ): Promise<{ data: Announcement[]; pagination: any }> {
    const filters = {
      page,
      limit,
      visibility,
      type,
      roleId,
      teacherId,
      sectionId,
      includeExpired,
    };
    return this.announcementsService.findAll(filters);
  }

  @Get('my-announcements')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Get announcements targeted to current user's role",
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
    name: 'includeExpired',
    required: false,
    type: Boolean,
    description: 'Include expired announcements (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'User announcements retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyAnnouncements(
    @AuthUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('includeExpired', new DefaultValuePipe(false), ParseBoolPipe)
    includeExpired?: boolean,
  ): Promise<{ data: Announcement[]; pagination: any }> {
    const filters = {
      page,
      limit,
      includeExpired,
    };
    return this.announcementsService.getAnnouncementsForUser(
      user.id,
      user.roleId,
      filters,
    );
  }

  @Get('stats')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get announcement statistics for teacher' })
  @ApiQuery({
    name: 'teacherId',
    required: true,
    type: String,
    description: 'Teacher ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Query('teacherId') teacherId: string): Promise<any> {
    return this.announcementsService.getStats(teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Announcement retrieved successfully',
    type: Announcement,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async findOne(@Param('id') id: string): Promise<Announcement> {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update announcement (Admin or Teacher if owner)' })
  @ApiResponse({
    status: 200,
    description: 'Announcement updated successfully',
    type: Announcement,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own announcements',
  })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
    @AuthUser() user: any,
  ): Promise<Announcement> {
    this.logger.log(`Updating announcement ${id} for user: ${user.id}`);
    return this.announcementsService.update(
      id,
      updateAnnouncementDto,
      user.id,
      user.role,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete announcement (Admin or Teacher if owner)' })
  @ApiResponse({
    status: 200,
    description: 'Announcement deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own announcements',
  })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async remove(
    @Param('id') id: string,
    @AuthUser() user: any,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting announcement ${id} by user ${user.id}`);
    await this.announcementsService.remove(id, user.id, user.role);
    return { message: 'Announcement deleted successfully' };
  }

  // Tag management endpoints
  @Post('tags')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new tag (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: Tag,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or tag name already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createTag(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    this.logger.log(`Creating tag: ${createTagDto.name}`);
    return this.announcementsService.createTag(createTagDto);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
    type: [Tag],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllTags(): Promise<Tag[]> {
    return this.announcementsService.findAllTags();
  }

  @Patch('tags/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update tag (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    type: Tag,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or tag name already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async updateTag(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    this.logger.log(`Updating tag ${id}`);
    return this.announcementsService.updateTag(id, updateTagDto);
  }

  @Delete('tags/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete tag (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async removeTag(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting tag ${id}`);
    await this.announcementsService.removeTag(id);
    return { message: 'Tag deleted successfully' };
  }
}
