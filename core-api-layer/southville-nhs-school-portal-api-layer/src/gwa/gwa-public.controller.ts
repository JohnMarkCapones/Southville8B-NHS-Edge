import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GwaService } from './gwa.service';
import { Gwa } from './entities/gwa.entity';

@ApiTags('GWA (Public)')
@Controller('public/gwa')
export class GwaPublicController {
  constructor(private readonly gwaService: GwaService) {}

  @Get('top')
  @ApiOperation({
    summary: 'Get top students by GWA (Public)',
    description:
      'Get top performing students by GWA for leaderboard display without authentication.',
  })
  @ApiQuery({
    name: 'gradeLevel',
    required: false,
    description: 'Filter by grade level',
  })
  @ApiQuery({
    name: 'quarter',
    required: false,
    description: 'Filter by quarter (Q1, Q2, Q3, Q4)',
  })
  @ApiQuery({
    name: 'schoolYear',
    required: false,
    description: 'Filter by school year (YYYY-YYYY)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top students to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top students by GWA retrieved successfully',
    type: [Gwa],
  })
  getTopStudents(
    @Query('gradeLevel') gradeLevel?: string,
    @Query('quarter') quarter?: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('limit') limit?: number,
  ): Promise<Gwa[]> {
    return this.gwaService.getTopStudents({
      gradeLevel,
      quarter,
      schoolYear,
      limit: limit || 10,
    });
  }
}
