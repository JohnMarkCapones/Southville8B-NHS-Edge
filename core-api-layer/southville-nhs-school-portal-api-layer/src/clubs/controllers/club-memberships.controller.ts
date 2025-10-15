import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { AuthUser } from '../../auth/auth-user.decorator';
import { ClubMembershipsService } from '../services/club-memberships.service';
import { CreateClubMembershipDto } from '../dto/create-club-membership.dto';
import { UpdateClubMembershipDto } from '../dto/update-club-membership.dto';
import { ClubMembership } from '../entities/club-membership.entity';

@ApiTags('club-memberships')
@Controller('club-memberships')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClubMembershipsController {
  constructor(private readonly service: ClubMembershipsService) {}

  @Post()
  @ApiOperation({ summary: 'Create club membership' })
  @ApiResponse({ status: 201, type: ClubMembership })
  async create(
    @Body() createDto: CreateClubMembershipDto,
    @AuthUser('id') userId: string,
  ): Promise<ClubMembership> {
    return this.service.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all club memberships' })
  @ApiQuery({ name: 'clubId', required: false })
  @ApiResponse({ status: 200, type: [ClubMembership] })
  async findAll(@Query('clubId') clubId?: string): Promise<ClubMembership[]> {
    return this.service.findAll(clubId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get memberships by student' })
  @ApiResponse({ status: 200, type: [ClubMembership] })
  async findByStudent(
    @Param('studentId') studentId: string,
  ): Promise<ClubMembership[]> {
    return this.service.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get membership by ID' })
  @ApiResponse({ status: 200, type: ClubMembership })
  async findOne(@Param('id') id: string): Promise<ClubMembership> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update membership' })
  @ApiResponse({ status: 200, type: ClubMembership })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClubMembershipDto,
    @AuthUser('id') userId: string,
  ): Promise<ClubMembership> {
    return this.service.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete membership' })
  @ApiResponse({ status: 204 })
  async remove(
    @Param('id') id: string,
    @AuthUser('id') userId: string,
  ): Promise<void> {
    return this.service.remove(id, userId);
  }
}
