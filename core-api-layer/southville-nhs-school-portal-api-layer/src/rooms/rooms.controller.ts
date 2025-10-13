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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MoveRoomDto } from './dto/move-room.dto';
import { BulkCreateRoomsDto } from './dto/bulk-create-rooms.dto';
import { ReorderRoomsDto } from './dto/reorder-rooms.dto';
import { Room } from './entities/room.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Policies } from '../auth/decorators/policies.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new room (Admin only)' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Floor not found' })
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Creating room for user: ${user.email} (${user.id})`);
    return this.roomsService.create(createRoomDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create multiple rooms at once (Admin only)' })
  @ApiResponse({ status: 201, description: 'Rooms created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Floor not found' })
  async createBulk(
    @Body() bulkCreateDto: BulkCreateRoomsDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Bulk creating rooms for user: ${user.email} (${user.id})`);
    return this.roomsService.createBulk(bulkCreateDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all rooms with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['Available', 'Occupied', 'Maintenance'],
  })
  @ApiQuery({ name: 'floorId', required: false, type: String })
  @ApiQuery({ name: 'buildingId', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'room_number', 'name'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
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
    @Query('status') status?: string,
    @Query('floorId') floorId?: string,
    @Query('buildingId') buildingId?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.roomsService.findAll({
      page,
      limit,
      search,
      status,
      floorId,
      buildingId,
      sortBy,
      sortOrder,
    });
  }

  @Get('floor/:floorId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get rooms by floor ID' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByFloor(
    @Param('floorId') floorId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.roomsService.findByFloor(floorId);
  }

  @Get('building/:buildingId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get rooms by building ID' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByBuilding(
    @Param('buildingId') buildingId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.roomsService.findByBuilding(buildingId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Fetching room ${id} for user: ${user.email} (${user.id})`);
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update room by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Updating room ${id} for user: ${user.email} (${user.id})`);
    return this.roomsService.update(id, updateRoomDto);
  }

  @Patch(':id/move')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Move room to different floor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Room moved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Target floor not found',
  })
  async moveRoom(
    @Param('id') id: string,
    @Body() moveRoomDto: MoveRoomDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Moving room ${id} for user: ${user.email} (${user.id})`);
    return this.roomsService.moveRoom(id, moveRoomDto);
  }

  @Post('floor/:floorId/reorder')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reorder rooms in floor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Rooms reordered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async reorderRooms(
    @Param('floorId') floorId: string,
    @Body() reorderDto: ReorderRoomsDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(
      `Reordering rooms in floor ${floorId} for user: ${user.email} (${user.id})`,
    );
    await this.roomsService.reorderRooms(floorId, reorderDto);
    return { message: 'Rooms reordered successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete room by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Deleting room ${id} for user: ${user.email} (${user.id})`);
    await this.roomsService.remove(id);
    return { message: 'Room deleted successfully' };
  }
}
