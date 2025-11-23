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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HotspotsService } from './hotspots.service';
import { CreateHotspotDto } from './dto/create-hotspot.dto';
import { UpdateHotspotDto } from './dto/update-hotspot.dto';
import { Hotspot } from './entities/hotspot.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Hotspots')
@Controller('hotspots')
export class HotspotsController {
  constructor(private readonly hotspotsService: HotspotsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new hotspot (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Hotspot created successfully',
    type: Hotspot,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(@Body() createHotspotDto: CreateHotspotDto): Promise<Hotspot> {
    return this.hotspotsService.create(createHotspotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotspots (Public)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: String,
    description: 'Filter hotspots by location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Hotspots retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Hotspot' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('locationId') locationId?: string,
  ) {
    return this.hotspotsService.findAll({ page, limit, locationId });
  }

  @Get('location/:locationId')
  @ApiOperation({
    summary: 'Get all hotspots for a specific location (Public)',
  })
  @ApiResponse({
    status: 200,
    description: 'Hotspots retrieved successfully',
    type: [Hotspot],
  })
  async findByLocation(
    @Param('locationId') locationId: string,
  ): Promise<Hotspot[]> {
    return this.hotspotsService.findByLocation(locationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotspot by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Hotspot retrieved successfully',
    type: Hotspot,
  })
  @ApiResponse({ status: 404, description: 'Hotspot not found' })
  async findOne(@Param('id') id: string): Promise<Hotspot> {
    return this.hotspotsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a hotspot (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Hotspot updated successfully',
    type: Hotspot,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Hotspot not found' })
  async update(
    @Param('id') id: string,
    @Body() updateHotspotDto: UpdateHotspotDto,
  ): Promise<Hotspot> {
    return this.hotspotsService.update(id, updateHotspotDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a hotspot (Admin only)' })
  @ApiResponse({ status: 200, description: 'Hotspot deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Hotspot not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotspotsService.remove(id);
  }
}
