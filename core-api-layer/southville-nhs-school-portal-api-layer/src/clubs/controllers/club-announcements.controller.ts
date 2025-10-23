import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { Policies } from '../../auth/decorators/policies.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
import { ClubAnnouncementsService } from '../services/club-announcements.service';
import { CreateClubAnnouncementDto } from '../dto/create-club-announcement.dto';
import { UpdateClubAnnouncementDto } from '../dto/update-club-announcement.dto';

@ApiTags('club-announcements')
@Controller('club-announcements')
export class ClubAnnouncementsController {
  constructor(
    private readonly clubAnnouncementsService: ClubAnnouncementsService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new club announcement (Teachers/Admins)' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async create(
    @Body() createDto: CreateClubAnnouncementDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.clubAnnouncementsService.create(createDto, user.id);
  }

  @Get('club/:clubId')
  @ApiOperation({ summary: 'Get all announcements for a club (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Announcements retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findByClub(@Param('clubId') clubId: string) {
    return this.clubAnnouncementsService.findByClub(clubId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single announcement by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Announcement retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async findOne(@Param('id') id: string) {
    return this.clubAnnouncementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update an announcement (Creator/Teachers/Admins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcement updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the creator' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClubAnnouncementDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.clubAnnouncementsService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an announcement (Creator/Teachers/Admins)',
  })
  @ApiResponse({
    status: 204,
    description: 'Announcement deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the creator' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    await this.clubAnnouncementsService.remove(id, user.id);
  }
}
