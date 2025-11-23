import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentAssistantService } from './student-assistant.service';
import { StudentAssistantQueryDto } from './dto/student-assistant-query.dto';
import { StudentAssistantResponseDto } from './dto/student-assistant-response.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Student Assistant')
@ApiBearerAuth('JWT-auth')
@Controller('student-assistant')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class StudentAssistantController {
  constructor(
    private readonly studentAssistantService: StudentAssistantService,
  ) {}

  @Post('query')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Query consolidated student information for AI assistant workflows',
  })
  @ApiResponse({
    status: 200,
    description: 'Student assistant data fetched successfully',
    type: StudentAssistantResponseDto,
  })
  async query(
    @Body() dto: StudentAssistantQueryDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    return this.studentAssistantService.handleQuery(dto, user);
  }
}
