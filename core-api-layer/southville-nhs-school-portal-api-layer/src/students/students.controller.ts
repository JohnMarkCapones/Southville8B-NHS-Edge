import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { CreateStudentRankingDto } from './dto/create-student-ranking.dto';
import { UpdateStudentRankingDto } from './dto/update-student-ranking.dto';
import { StudentRanking } from './entities/student-ranking.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { Policies } from '../auth/decorators/policies.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class StudentsController {
  private readonly logger = new Logger(StudentsController.name);
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Student already exists',
  })
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Creating student for user: ${user.email} (${user.id})`);
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('id', 'student:read')
  @ApiOperation({ summary: 'Get all students with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'gradeLevel', required: false, type: String })
  @ApiQuery({ name: 'sectionId', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'first_name', 'last_name', 'student_id'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
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
    @Query('gradeLevel') gradeLevel?: string,
    @Query('sectionId') sectionId?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    this.logger.log('Fetching students');
    return this.studentsService.findAll({
      page,
      limit,
      search,
      gradeLevel,
      sectionId,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('id', 'student:read')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    // Students can only view their own data
    if (user.role === 'Student') {
      const student = await this.studentsService.findOne(id);
      if (student.user_id !== user.id) {
        throw new ForbiddenException('Students can only view their own data');
      }
    }

    this.logger.log(`Fetching student ${id}`);
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('id', 'student:update')
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Updating student ${id} for user: ${user.email} (${user.id})`);
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Policies('id', 'student:delete')
  @ApiOperation({ summary: 'Delete a student (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Deleting student ${id} for user: ${user.email} (${user.id})`);
    return this.studentsService.remove(id);
  }

  // Example of a public endpoint (no auth required)
  @Get('public/info')
  @ApiOperation({ summary: 'Get public student information' })
  @ApiResponse({
    status: 200,
    description: 'Public information retrieved successfully',
  })
  getPublicInfo() {
    return {
      message: 'This is a public endpoint - no authentication required',
      timestamp: new Date().toISOString(),
    };
  }

  // Get emergency contacts for a student
  @Get(':studentUserId/emergency-contacts')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get emergency contacts for a student' })
  @ApiResponse({
    status: 200,
    description: 'Emergency contacts retrieved',
    type: [EmergencyContact],
  })
  async getEmergencyContacts(
    @Param('studentUserId') studentUserId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    // Students can only view their own
    if (user.role === 'Student' && user.id !== studentUserId) {
      throw new ForbiddenException(
        'You can only view your own emergency contacts',
      );
    }
    return this.studentsService.getEmergencyContacts(studentUserId);
  }

  // Add emergency contact
  @Post(':studentUserId/emergency-contacts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add emergency contact (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Emergency contact created',
    type: EmergencyContact,
  })
  async addEmergencyContact(
    @Param('studentUserId') studentUserId: string,
    @Body() createDto: CreateEmergencyContactDto,
  ) {
    return this.studentsService.addEmergencyContact(studentUserId, createDto);
  }

  // Update emergency contact
  @Patch('emergency-contacts/:contactId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update emergency contact (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Emergency contact updated',
    type: EmergencyContact,
  })
  async updateEmergencyContact(
    @Param('contactId') contactId: string,
    @Body() updateDto: UpdateEmergencyContactDto,
  ) {
    return this.studentsService.updateEmergencyContact(contactId, updateDto);
  }

  // Delete emergency contact
  @Delete('emergency-contacts/:contactId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete emergency contact (Admin only)' })
  @ApiResponse({ status: 200, description: 'Emergency contact deleted' })
  async deleteEmergencyContact(@Param('contactId') contactId: string) {
    await this.studentsService.deleteEmergencyContact(contactId);
    return { message: 'Emergency contact deleted successfully' };
  }

  // ==================== STUDENT RANKINGS ENDPOINTS ====================

  @Post('rankings')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('id', 'student:create')
  @ApiOperation({ summary: 'Create a new student ranking' })
  @ApiResponse({
    status: 201,
    description: 'Student ranking created successfully',
    type: StudentRanking,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Student already has ranking for this period',
  })
  async createRanking(
    @Body() createDto: CreateStudentRankingDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Creating student ranking for user: ${user.email} (${user.id})`,
    );
    return this.studentsService.createRanking(createDto);
  }

  @Get('rankings')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('id', 'student:read')
  @ApiOperation({
    summary: 'Get all student rankings with pagination and filtering',
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAllRankings(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('quarter') quarter?: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('topN', new ParseIntPipe({ optional: true })) topN: number = 100,
  ) {
    this.logger.log('Fetching student rankings');
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
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('id', 'student:read')
  @ApiOperation({ summary: 'Get a student ranking by ID' })
  @ApiResponse({
    status: 200,
    description: 'Student ranking retrieved successfully',
    type: StudentRanking,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student ranking not found' })
  async findRankingById(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ) {
    // Students can only view their own rankings
    if (user.role === 'Student') {
      const ranking = await this.studentsService.findRankingById(id);
      if (ranking.student_id !== user.id) {
        throw new ForbiddenException(
          'Students can only view their own rankings',
        );
      }
    }

    this.logger.log(`Fetching student ranking ${id}`);
    return this.studentsService.findRankingById(id);
  }

  @Get(':studentId/rankings')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('id', 'student:read')
  @ApiOperation({ summary: 'Get all rankings for a specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student rankings retrieved successfully',
    type: [StudentRanking],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findRankingsByStudent(
    @Param('studentId') studentId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    // Students can only view their own rankings
    if (user.role === 'Student' && user.id !== studentId) {
      throw new ForbiddenException('Students can only view their own rankings');
    }

    this.logger.log(`Fetching rankings for student ${studentId}`);
    return this.studentsService.findRankingsByStudent(studentId);
  }

  @Patch('rankings/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('id', 'student:update')
  @ApiOperation({ summary: 'Update a student ranking' })
  @ApiResponse({
    status: 200,
    description: 'Student ranking updated successfully',
    type: StudentRanking,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student ranking not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Duplicate ranking for this period',
  })
  async updateRanking(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentRankingDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Updating student ranking ${id} for user: ${user.email} (${user.id})`,
    );
    return this.studentsService.updateRanking(id, updateDto);
  }

  @Delete('rankings/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Policies('id', 'student:delete')
  @ApiOperation({ summary: 'Delete a student ranking' })
  @ApiResponse({
    status: 200,
    description: 'Student ranking deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Student ranking not found' })
  async deleteRanking(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    this.logger.log(
      `Deleting student ranking ${id} for user: ${user.email} (${user.id})`,
    );
    await this.studentsService.deleteRanking(id);
    return { message: 'Student ranking deleted successfully' };
  }
}
