import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import {
  AcademicYear,
  AcademicPeriod,
  AcademicYearTemplate,
  AcademicYearSetting,
} from './entities/academic-year.entity';

@ApiTags('Academic Years')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new academic year' })
  @ApiResponse({
    status: 201,
    description: 'Academic year created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Academic year already exists or overlaps',
  })
  async create(
    @Body() createAcademicYearDto: CreateAcademicYearDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.academicYearsService.create(createAcademicYearDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all academic years' })
  @ApiResponse({
    status: 200,
    description: 'Academic years retrieved successfully',
  })
  async findAll(): Promise<AcademicYear[]> {
    return this.academicYearsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the active academic year' })
  @ApiResponse({
    status: 200,
    description: 'Active academic year retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No active academic year found' })
  async findActive(): Promise<AcademicYear | null> {
    return this.academicYearsService.findActive();
  }

  @Get('current-period')
  @ApiOperation({ summary: 'Get the current academic period' })
  @ApiResponse({
    status: 200,
    description: 'Current academic period retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No current academic period found' })
  async getCurrentPeriod(): Promise<AcademicPeriod | null> {
    return this.academicYearsService.getCurrentPeriod();
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get academic year templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(): Promise<AcademicYearTemplate[]> {
    return this.academicYearsService.getTemplates();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get academic year settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings(): Promise<AcademicYearSetting[]> {
    return this.academicYearsService.getSettings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get academic year by ID' })
  @ApiParam({ name: 'id', description: 'Academic year ID' })
  @ApiResponse({
    status: 200,
    description: 'Academic year retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async findOne(@Param('id') id: string): Promise<AcademicYear> {
    return this.academicYearsService.findOne(id);
  }

  @Get(':id/periods')
  @ApiOperation({ summary: 'Get academic periods for a year' })
  @ApiParam({ name: 'id', description: 'Academic year ID' })
  @ApiResponse({
    status: 200,
    description: 'Academic periods retrieved successfully',
  })
  async getPeriods(@Param('id') id: string): Promise<AcademicPeriod[]> {
    return this.academicYearsService.getPeriods(id);
  }

  @Post('periods')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new academic period' })
  @ApiResponse({
    status: 201,
    description: 'Academic period created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Period name or order already exists',
  })
  async createPeriod(
    @Body() createPeriodDto: CreateAcademicPeriodDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.academicYearsService.createPeriod(createPeriodDto, userId);
  }

  @Post(':id/generate-periods')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate periods from template for an academic year',
  })
  @ApiParam({ name: 'id', description: 'Academic year ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        template_id: { type: 'string', description: 'Template ID to use' },
      },
      required: ['template_id'],
    },
  })
  @ApiResponse({ status: 200, description: 'Periods generated successfully' })
  @ApiResponse({
    status: 404,
    description: 'Academic year or template not found',
  })
  async generatePeriods(
    @Param('id') id: string,
    @Body('template_id') templateId: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    await this.academicYearsService.generatePeriodsFromTemplate(
      id,
      templateId,
      userId,
    );
    return { message: 'Periods generated successfully' };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update academic year' })
  @ApiParam({ name: 'id', description: 'Academic year ID' })
  @ApiResponse({
    status: 200,
    description: 'Academic year updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
    @Req() req: any,
  ): Promise<AcademicYear> {
    const userId = req.user.sub;
    return this.academicYearsService.update(id, updateAcademicYearDto, userId);
  }

  @Patch('settings/:key')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update academic year setting' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { description: 'Setting value' },
      },
      required: ['value'],
    },
  })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  async updateSetting(
    @Param('key') key: string,
    @Body('value') value: any,
    @Req() req: any,
  ): Promise<AcademicYearSetting> {
    const userId = req.user.sub;
    return this.academicYearsService.updateSetting(key, value, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive academic year (soft delete)' })
  @ApiParam({ name: 'id', description: 'Academic year ID' })
  @ApiResponse({
    status: 204,
    description: 'Academic year archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async archive(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    await this.academicYearsService.archive(id, userId);
  }

  @Delete(':id/hard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete academic year (hard delete)' })
  @ApiParam({ name: 'id', description: 'Academic year ID' })
  @ApiResponse({
    status: 204,
    description: 'Academic year permanently deleted',
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only SuperAdmin and Admin can hard delete',
  })
  async hardDelete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    await this.academicYearsService.hardDelete(id, userId);
  }

  // Additional utility endpoints

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get academic year dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview retrieved successfully',
  })
  async getDashboardOverview() {
    const [activeYear, currentPeriod, allYears] = await Promise.all([
      this.academicYearsService.findActive(),
      this.academicYearsService.getCurrentPeriod(),
      this.academicYearsService.findAll(),
    ]);

    return {
      active_year: activeYear,
      current_period: currentPeriod,
      total_years: allYears.length,
      upcoming_years: allYears.filter(
        (year) => new Date(year.start_date) > new Date(),
      ).length,
      archived_years: allYears.filter((year) => year.is_archived).length,
    };
  }

  @Get('validation/check-overlap')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check for overlapping academic years' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
        exclude_id: {
          type: 'string',
          description: 'Academic year ID to exclude from check',
        },
      },
      required: ['start_date', 'end_date'],
    },
  })
  @ApiResponse({ status: 200, description: 'Overlap check completed' })
  async checkOverlap(
    @Body('start_date') startDate: string,
    @Body('end_date') endDate: string,
    @Body('exclude_id') excludeId?: string,
  ) {
    // This would be implemented in the service
    // For now, return a simple response
    return {
      has_overlap: false,
      overlapping_years: [],
    };
  }
}
