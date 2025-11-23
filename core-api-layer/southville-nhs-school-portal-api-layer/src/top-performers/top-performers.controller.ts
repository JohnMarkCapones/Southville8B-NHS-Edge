import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TopPerformersService } from './top-performers.service';
import {
  TopPerformersQueryDto,
  StatsQueryDto,
} from './dto/top-performers-query.dto';
import {
  TopPerformersListResponse,
  TopPerformersStats,
  StudentPerformanceDetails,
} from './entities/top-performer.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@ApiTags('Top Performers')
@ApiBearerAuth('JWT-auth')
@Controller('top-performers')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class TopPerformersController {
  private readonly logger = new Logger(TopPerformersController.name);

  constructor(private readonly topPerformersService: TopPerformersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get top performers with filtering and pagination',
    description:
      'Retrieves a list of top performing students based on GWA with filtering options',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by student name or ID',
  })
  @ApiQuery({
    name: 'timePeriod',
    required: false,
    enum: ['current-quarter', 'semester', 'school-year', 'all-time'],
    description: 'Time period for filtering results',
  })
  @ApiQuery({
    name: 'gradeLevel',
    required: false,
    enum: ['all', '7', '8', '9', '10'],
    description: 'Filter by grade level',
  })
  @ApiQuery({
    name: 'topN',
    required: false,
    type: Number,
    description: 'Number of top performers to return (1-100)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Top performers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        performers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              rank: { type: 'number' },
              studentId: { type: 'string' },
              name: { type: 'string' },
              gradeLevel: { type: 'number' },
              section: { type: 'string' },
              gwa: { type: 'number' },
              recognitionDate: { type: 'string' },
              status: { type: 'string', enum: ['Active', 'Archived'] },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        stats: {
          type: 'object',
          properties: {
            totalHonorStudents: { type: 'number' },
            honorRollStudents: { type: 'number' },
            perfectGwaStudents: { type: 'number' },
            gradeDistribution: {
              type: 'object',
              properties: {
                grade7: { type: 'number' },
                grade8: { type: 'number' },
                grade9: { type: 'number' },
                grade10: { type: 'number' },
              },
            },
            averageGwa: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  async getTopPerformers(
    @Query() query: TopPerformersQueryDto,
  ): Promise<TopPerformersListResponse> {
    this.logger.log(
      `Fetching top performers with query: ${JSON.stringify(query)}`,
    );
    return this.topPerformersService.getTopPerformers(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get top performers statistics',
    description: 'Retrieves statistical data about top performing students',
  })
  @ApiQuery({
    name: 'timePeriod',
    required: false,
    enum: ['current-quarter', 'semester', 'school-year', 'all-time'],
    description: 'Time period for filtering statistics',
  })
  @ApiQuery({
    name: 'gradeLevel',
    required: false,
    enum: ['all', '7', '8', '9', '10'],
    description: 'Filter statistics by grade level',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalHonorStudents: { type: 'number' },
        honorRollStudents: { type: 'number' },
        perfectGwaStudents: { type: 'number' },
        gradeDistribution: {
          type: 'object',
          properties: {
            grade7: { type: 'number' },
            grade8: { type: 'number' },
            grade9: { type: 'number' },
            grade10: { type: 'number' },
          },
        },
        averageGwa: { type: 'number' },
        topStudent: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            gwa: { type: 'number' },
            gradeLevel: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  async getTopPerformersStats(
    @Query() query: StatsQueryDto,
  ): Promise<TopPerformersStats> {
    this.logger.log(
      `Fetching top performers stats with query: ${JSON.stringify(query)}`,
    );
    return this.topPerformersService.getTopPerformersStats(query);
  }

  @Get(':id/details')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get detailed student performance information',
    description:
      'Retrieves comprehensive performance details for a specific student',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student performance details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        name: { type: 'string' },
        gradeLevel: { type: 'number' },
        section: { type: 'string' },
        gwa: { type: 'number' },
        rank: { type: 'number' },
        gwaHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              gradingPeriod: { type: 'string' },
              gwa: { type: 'number' },
              academicYear: { type: 'string' },
            },
          },
        },
        achievements: { type: 'array' },
        subjects: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentPerformanceDetails(
    @Param('id') studentId: string,
  ): Promise<StudentPerformanceDetails> {
    this.logger.log(`Fetching performance details for student: ${studentId}`);
    return this.topPerformersService.getStudentPerformanceDetails(studentId);
  }
}
