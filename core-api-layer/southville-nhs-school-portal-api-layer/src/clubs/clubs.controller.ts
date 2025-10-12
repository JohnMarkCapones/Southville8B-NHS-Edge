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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { Policies } from '../auth/decorators/policies.decorator';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@ApiTags('clubs')
@Controller('clubs')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a new club' })
  @ApiResponse({ status: 201, description: 'Club created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(createClubDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all clubs' })
  @ApiResponse({ status: 200, description: 'Clubs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.clubsService.findAll();
  }

  @Get(':clubId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get club by ID' })
  @ApiResponse({ status: 200, description: 'Club retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('clubId') clubId: string) {
    return this.clubsService.findOne(clubId);
  }

  @Patch(':clubId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('clubId', 'club.edit')
  @ApiOperation({ summary: 'Update club' })
  @ApiResponse({ status: 200, description: 'Club updated successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('clubId') clubId: string,
    @Body() updateClubDto: UpdateClubDto,
  ) {
    return this.clubsService.update(clubId, updateClubDto);
  }

  @Delete(':clubId')
  @Roles(UserRole.ADMIN)
  @Policies('clubId', 'club.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete club' })
  @ApiResponse({ status: 204, description: 'Club deleted successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('clubId') clubId: string) {
    await this.clubsService.remove(clubId);
  }

  // Club Management endpoints with PBAC

  @Get(':clubId/members')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.view_members')
  @ApiOperation({ summary: 'Get club members' })
  @ApiResponse({
    status: 200,
    description: 'Club members retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMembers(@Param('clubId') clubId: string) {
    return this.clubsService.getMembers(clubId);
  }

  @Post(':clubId/members')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('clubId', 'club.manage_members')
  @ApiOperation({ summary: 'Add member to club' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addMember(@Param('clubId') clubId: string, @Body() memberData: any) {
    return this.clubsService.addMember(clubId, memberData);
  }

  @Patch(':clubId/finances')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('clubId', 'club.manage_finances')
  @ApiOperation({ summary: 'Update club finances' })
  @ApiResponse({ status: 200, description: 'Finances updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateFinances(
    @Param('clubId') clubId: string,
    @Body() financesData: any,
  ) {
    return this.clubsService.updateFinances(clubId, financesData);
  }
}
