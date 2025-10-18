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
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { JournalismMembershipService } from '../services/journalism-membership.service';
import { AddMemberDto, UpdateMemberPositionDto } from '../dto';

/**
 * Controller for managing journalism team membership
 * Handles adding, removing, and updating member positions
 */
@ApiTags('journalism-membership')
@Controller('journalism/members')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class JournalismMembershipController {
  constructor(
    private readonly membershipService: JournalismMembershipService,
  ) {}

  /**
   * Get all journalism members
   * Admins, Advisers, and all journalism members can view
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all journalism team members' })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          membershipId: { type: 'string' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          userEmail: { type: 'string' },
          userRole: { type: 'string' },
          position: { type: 'string' },
          positionDescription: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllMembers() {
    return this.membershipService.getAllMembers();
  }

  /**
   * Get specific member details
   */
  @Get(':userId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get specific journalism member details' })
  @ApiResponse({ status: 200, description: 'Member details retrieved' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMember(@Param('userId') userId: string) {
    return this.membershipService.getMember(userId);
  }

  /**
   * Add a new member to journalism
   * Admins can add anyone (including Advisers)
   * Advisers can add students (Writer, Publisher, EIC, etc.)
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Add a new member to journalism team' })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        userName: { type: 'string' },
        userEmail: { type: 'string' },
        position: { type: 'string' },
        addedBy: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to assign this position',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'User already a member OR position already taken',
  })
  async addMember(
    @Body() addMemberDto: AddMemberDto,
    @AuthUser('id') requesterId: string,
  ) {
    return this.membershipService.addMember(addMemberDto, requesterId);
  }

  /**
   * Update a member's position
   * Admins can update anyone
   * Advisers can update student positions (not other Advisers)
   */
  @Patch(':userId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update a member\'s position' })
  @ApiResponse({
    status: 200,
    description: 'Position updated successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        previousPosition: { type: 'string' },
        newPosition: { type: 'string' },
        updatedBy: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Position already taken' })
  async updatePosition(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateMemberPositionDto,
    @AuthUser('id') requesterId: string,
  ) {
    return this.membershipService.updateMemberPosition(
      userId,
      updateDto,
      requesterId,
    );
  }

  /**
   * Remove a member from journalism
   * Admins can remove anyone
   * Advisers can remove students (not other Advisers)
   */
  @Delete(':userId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from journalism team' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async removeMember(
    @Param('userId') userId: string,
    @AuthUser('id') requesterId: string,
  ) {
    await this.membershipService.removeMember(userId, requesterId);
  }
}
