import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Only Admin and Teacher can create students
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @AuthUser() user: SupabaseUser,
  ) {
    // Only Admin and Teacher can create students
    console.log(`Creating student for user: ${user.email} (${user.id})`);
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Only Admin and Teacher can view all students
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  findAll(@AuthUser() user: SupabaseUser) {
    // Only Admin and Teacher can view all students
    console.log(`Fetching students for user: ${user.email} (${user.id})`);
    return this.studentsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT) // All roles can view specific student
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    // All authenticated users can view specific student
    console.log(`Fetching student ${id} for user: ${user.email} (${user.id})`);
    return this.studentsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Only Admin and Teacher can update students
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @AuthUser() user: SupabaseUser,
  ) {
    // Only Admin and Teacher can update students
    console.log(`Updating student ${id} for user: ${user.email} (${user.id})`);
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Only Admin can delete students
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    // Only Admin can delete students
    console.log(`Deleting student ${id} for user: ${user.email} (${user.id})`);
    return this.studentsService.remove(+id);
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
}
