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
  ParseIntPipe,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CampusFacilitiesService } from './campus-facilities.service';
import { CreateCampusFacilityDto } from './dto/create-campus-facility.dto';
import { UpdateCampusFacilityDto } from './dto/update-campus-facility.dto';
import { CampusFacility } from './entities/campus-facility.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Campus Facilities')
@Controller('campus-facilities')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CampusFacilitiesController {
  private readonly logger = new Logger(CampusFacilitiesController.name);
  constructor(
    private readonly campusFacilitiesService: CampusFacilitiesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new campus facility (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Campus facility data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Campus facility name',
          example: 'Library',
        },
        description: {
          type: 'string',
          description: 'Campus facility description',
          example: 'A modern library with extensive collection of books',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Campus facility image (JPEG, PNG, WebP, max 5MB)',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Campus facility created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file type or size',
  })
  async create(
    @Body() createCampusFacilityDto: CreateCampusFacilityDto,
    @UploadedFile() imageFile?: any,
    @AuthUser() user?: SupabaseUser,
  ) {
    this.logger.log('Creating campus facility for admin user');
    return this.campusFacilitiesService.create(
      createCampusFacilityDto,
      imageFile,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all campus facilities with pagination and filtering',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'name', 'updated_at'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Campus facilities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.campusFacilitiesService.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get campus facility by ID' })
  @ApiResponse({
    status: 200,
    description: 'Campus facility retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Campus facility not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(
      `Fetching campus facility ${id} for user: ${user.email} (${user.id})`,
    );
    return this.campusFacilitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update campus facility by ID (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Campus facility data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Campus facility name',
          example: 'Library',
        },
        description: {
          type: 'string',
          description: 'Campus facility description',
          example: 'A modern library with extensive collection of books',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Campus facility image (JPEG, PNG, WebP, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Campus facility updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Campus facility not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file type or size',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCampusFacilityDto: UpdateCampusFacilityDto,
    @UploadedFile() imageFile?: any,
    @AuthUser() user?: SupabaseUser,
  ) {
    console.log(
      `Updating campus facility ${id} for user: ${user?.email} (${user?.id})`,
    );
    return this.campusFacilitiesService.update(
      id,
      updateCampusFacilityDto,
      imageFile,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete campus facility by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Campus facility deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Campus facility not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(
      `Deleting campus facility ${id} for user: ${user.email} (${user.id})`,
    );
    await this.campusFacilitiesService.remove(id);
    return { message: 'Campus facility deleted successfully' };
  }
}
