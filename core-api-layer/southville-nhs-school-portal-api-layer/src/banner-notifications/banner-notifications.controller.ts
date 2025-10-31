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
  DefaultValuePipe,
  ParseIntPipe,
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
import { BannerNotificationsService } from './banner-notifications.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerNotification } from './entities/banner.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuthUser } from '../auth/auth-user.decorator';

@ApiTags('Banner Notifications')
@Controller('banner-notifications')
export class BannerNotificationsController {
  private readonly logger = new Logger(BannerNotificationsController.name);

  constructor(
    private readonly bannerNotificationsService: BannerNotificationsService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new banner notification (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Banner created successfully',
    type: BannerNotification,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @AuthUser() user: any,
  ): Promise<BannerNotification> {
    this.logger.log(`Creating banner for user: ${user.id}`);
    return this.bannerNotificationsService.create(createBannerDto, user.id);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all banners with pagination and filtering (Admin only)',
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
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by banner type',
  })
  @ApiResponse({
    status: 200,
    description: 'Banners retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: boolean,
    @Query('type') type?: string,
  ): Promise<{ data: BannerNotification[]; pagination: any }> {
    const filters = {
      page,
      limit,
      isActive,
      type,
    };
    return this.bannerNotificationsService.findAll(filters);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get currently active banners (Public endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active banners retrieved successfully',
    type: [BannerNotification],
  })
  async findActive(): Promise<BannerNotification[]> {
    return this.bannerNotificationsService.findActive();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get banner by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Banner retrieved successfully',
    type: BannerNotification,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async findOne(@Param('id') id: string): Promise<BannerNotification> {
    return this.bannerNotificationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update banner (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Banner updated successfully',
    type: BannerNotification,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<BannerNotification> {
    this.logger.log(`Updating banner ${id}`);
    return this.bannerNotificationsService.update(id, updateBannerDto);
  }

  @Patch(':id/toggle')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle banner active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Banner status toggled successfully',
    type: BannerNotification,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async toggle(@Param('id') id: string): Promise<BannerNotification> {
    this.logger.log(`Toggling banner ${id} active status`);
    return this.bannerNotificationsService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete banner (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Banner deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting banner ${id}`);
    await this.bannerNotificationsService.remove(id);
    return { message: 'Banner deleted successfully' };
  }
}
