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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { Floor } from './entities/floor.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Policies } from '../auth/decorators/policies.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Floors')
@Controller('floors')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new floor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Floor created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Building not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Floor number already exists',
  })
  async create(
    @Body() createFloorDto: CreateFloorDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Creating floor for user: ${user.email} (${user.id})`);
    return this.floorsService.create(createFloorDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all floors with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'buildingId', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'name', 'number'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Floors retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @AuthUser() user: SupabaseUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('buildingId') buildingId?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.floorsService.findAll({
      page,
      limit,
      search,
      buildingId,
      sortBy,
      sortOrder,
    });
  }

  @Get('building/:buildingId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get floors by building ID' })
  @ApiResponse({ status: 200, description: 'Floors retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByBuilding(
    @Param('buildingId') buildingId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.floorsService.findByBuilding(buildingId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get floor by ID with rooms' })
  @ApiResponse({ status: 200, description: 'Floor retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Floor not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Fetching floor ${id} for user: ${user.email} (${user.id})`);
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update floor by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Floor updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Floor not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Floor number already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFloorDto: UpdateFloorDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Updating floor ${id} for user: ${user.email} (${user.id})`);
    return this.floorsService.update(id, updateFloorDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete floor by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Floor deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Floor not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot delete floor with rooms',
  })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Deleting floor ${id} for user: ${user.email} (${user.id})`);
    await this.floorsService.remove(id);
    return { message: 'Floor deleted successfully' };
  }
}
