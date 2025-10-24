import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GwaService, StudentGwaListResponse } from './gwa.service';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('GWA Management')
@ApiBearerAuth('JWT-auth')
@Controller('gwa')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class GwaController {
  private readonly logger = new Logger(GwaController.name);

  constructor(private readonly gwaService: GwaService) {}

  @Get('my-gwa')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get authenticated student GWA records',
    description:
      'Returns GWA records for the authenticated student with optional filtering by grading period and school year',
  })
  @ApiQuery({
    name: 'grading_period',
    description: 'Grading period (Q1, Q2, Q3, Q4)',
    example: 'Q1',
    required: false,
  })
  @ApiQuery({
    name: 'school_year',
    description: 'School year (e.g., "2024-2025")',
    example: '2024-2025',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Student GWA records retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'GWA record ID' },
          student_id: { type: 'string', description: 'Student ID' },
          gwa: { type: 'number', description: 'GWA value (50-100)' },
          grading_period: { type: 'string', description: 'Grading period' },
          school_year: { type: 'string', description: 'School year' },
          remarks: { type: 'string', description: 'Optional remarks' },
          honor_status: { type: 'string', description: 'Honor status' },
          recorded_by: { type: 'string', description: 'Teacher who recorded' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @ApiResponse({ status: 404, description: 'Student record not found' })
  async getMyGwa(
    @AuthUser() user: any,
    @Query('grading_period') gradingPeriod?: string,
    @Query('school_year') schoolYear?: string,
  ): Promise<any[]> {
    this.logger.log(
      `Getting GWA records for student: ${user.id}, period: ${gradingPeriod}, year: ${schoolYear}`,
    );
    return this.gwaService.getStudentGwa(user.id, gradingPeriod, schoolYear);
  }

  @Get('teacher/advisory-students')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: "Get students in teacher's advisory section with GWA records",
    description:
      "Returns all students in the authenticated teacher's advisory section along with their GWA records for the specified grading period and school year",
  })
  @ApiQuery({
    name: 'grading_period',
    description: 'Grading period (Q1, Q2, Q3, Q4)',
    example: 'Q1',
  })
  @ApiQuery({
    name: 'school_year',
    description: 'School year (e.g., "2024-2025")',
    example: '2024-2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Students with GWA records retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        students: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              student_id: { type: 'string', description: 'Student UUID' },
              student_name: {
                type: 'string',
                description: 'Student full name',
              },
              student_number: { type: 'string', description: 'Student number' },
              gwa: { type: 'number', description: 'GWA value (50-100)' },
              remarks: { type: 'string', description: 'Optional remarks' },
              honor_status: { type: 'string', description: 'Honor status' },
              gwa_id: {
                type: 'string',
                description: 'GWA record ID (null if no entry)',
              },
            },
          },
        },
        section_name: { type: 'string', description: 'Advisory section name' },
        grade_level: { type: 'string', description: 'Grade level' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher access required',
  })
  @ApiResponse({ status: 404, description: 'Teacher or section not found' })
  async getAdvisoryStudentsWithGwa(
    @AuthUser() user: any,
    @Query('grading_period') gradingPeriod: string,
    @Query('school_year') schoolYear: string,
  ): Promise<StudentGwaListResponse> {
    this.logger.log(
      `Getting advisory students for teacher: ${user.id}, period: ${gradingPeriod}, year: ${schoolYear}`,
    );
    return this.gwaService.getAdvisoryStudentsWithGwa(
      user.id,
      gradingPeriod,
      schoolYear,
    );
  }

  @Post()
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Create new GWA entry',
    description:
      "Creates a new GWA entry for a student in the teacher's advisory section",
  })
  @ApiResponse({
    status: 201,
    description: 'GWA entry created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'GWA entry ID' },
        student_id: { type: 'string', description: 'Student ID' },
        gwa: { type: 'number', description: 'GWA value' },
        grading_period: { type: 'string', description: 'Grading period' },
        school_year: { type: 'string', description: 'School year' },
        remarks: { type: 'string', description: 'Remarks' },
        honor_status: { type: 'string', description: 'Honor status' },
        recorded_by: { type: 'string', description: 'Teacher who recorded' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Teacher access required or not advisor of student',
  })
  async createGwaEntry(
    @AuthUser() user: any,
    @Body() createGwaDto: CreateGwaDto,
  ): Promise<any> {
    this.logger.log(
      `Creating GWA entry for student: ${createGwaDto.student_id}`,
    );
    return this.gwaService.createGwaEntry(createGwaDto, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Update existing GWA entry',
    description:
      'Updates an existing GWA entry. Only the teacher who created the entry can update it.',
  })
  @ApiResponse({
    status: 200,
    description: 'GWA entry updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'GWA entry ID' },
        student_id: { type: 'string', description: 'Student ID' },
        gwa: { type: 'number', description: 'GWA value' },
        grading_period: { type: 'string', description: 'Grading period' },
        school_year: { type: 'string', description: 'School year' },
        remarks: { type: 'string', description: 'Remarks' },
        honor_status: { type: 'string', description: 'Honor status' },
        recorded_by: { type: 'string', description: 'Teacher who recorded' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher access required or not owner of entry',
  })
  @ApiResponse({ status: 404, description: 'GWA entry not found' })
  async updateGwaEntry(
    @AuthUser() user: any,
    @Param('id') id: string,
    @Body() updateGwaDto: UpdateGwaDto,
  ): Promise<any> {
    this.logger.log(`Updating GWA entry: ${id}`);
    return this.gwaService.updateGwaEntry(id, updateGwaDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Delete GWA entry',
    description:
      'Deletes a GWA entry. Only the teacher who created the entry can delete it.',
  })
  @ApiResponse({
    status: 200,
    description: 'GWA entry deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher access required or not owner of entry',
  })
  @ApiResponse({ status: 404, description: 'GWA entry not found' })
  async deleteGwaEntry(
    @AuthUser() user: any,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting GWA entry: ${id}`);
    await this.gwaService.deleteGwaEntry(id, user.id);
    return { message: 'GWA entry deleted successfully' };
  }
}
