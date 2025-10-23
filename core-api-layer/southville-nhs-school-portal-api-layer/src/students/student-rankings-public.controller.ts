import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { StudentRanking } from './entities/student-ranking.entity';

@ApiTags('Student Rankings (Public)')
@Controller('public/students')
export class StudentRankingsPublicController {
  private readonly logger = new Logger(StudentRankingsPublicController.name);

  constructor(private readonly studentsService: StudentsService) {}

  @Get('rankings')
  @ApiOperation({
    summary: 'Get all student rankings with pagination and filtering (Public)',
    description:
      'Public endpoint to retrieve student rankings without authentication',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'gradeLevel',
    required: false,
    type: String,
    description: 'Filter by grade level',
  })
  @ApiQuery({
    name: 'quarter',
    required: false,
    type: String,
    description: 'Filter by quarter',
  })
  @ApiQuery({
    name: 'schoolYear',
    required: false,
    type: String,
    description: 'Filter by school year',
  })
  @ApiQuery({
    name: 'topN',
    required: false,
    type: Number,
    description: 'Get top N students (default: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Student rankings retrieved successfully',
  })
  async findAllRankings(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('quarter') quarter?: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('topN', new ParseIntPipe({ optional: true })) topN: number = 100,
  ) {
    this.logger.log('Fetching student rankings (public)');
    return this.studentsService.findAllRankings({
      page,
      limit,
      gradeLevel,
      quarter,
      schoolYear,
      topN,
    });
  }

  @Get('rankings/:id')
  @ApiOperation({
    summary: 'Get a student ranking by ID (Public)',
    description:
      'Public endpoint to retrieve a specific student ranking without authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Student ranking retrieved successfully',
    type: StudentRanking,
  })
  @ApiResponse({ status: 404, description: 'Student ranking not found' })
  async findRankingById(@Param('id') id: string) {
    this.logger.log(`Fetching student ranking ${id} (public)`);
    return this.studentsService.findRankingById(id);
  }

  @Get(':studentId/rankings')
  @ApiOperation({
    summary: 'Get all rankings for a specific student (Public)',
    description:
      'Public endpoint to retrieve all rankings for a specific student without authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Student rankings retrieved successfully',
    type: [StudentRanking],
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findRankingsByStudent(@Param('studentId') studentId: string) {
    this.logger.log(`Fetching rankings for student ${studentId} (public)`);
    return this.studentsService.findRankingsByStudent(studentId);
  }
}
