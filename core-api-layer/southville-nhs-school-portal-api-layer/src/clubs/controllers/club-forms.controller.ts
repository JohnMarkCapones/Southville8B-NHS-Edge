import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { Policies } from '../../auth/decorators/policies.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { ClubFormsService } from '../services/club-forms.service';
import { ClubFormResponsesService } from '../services/club-form-responses.service';
import { CreateClubFormDto } from '../dto/create-club-form.dto';
import { UpdateClubFormDto } from '../dto/update-club-form.dto';
import { CreateFormQuestionDto } from '../dto/create-form-question.dto';
import { UpdateFormQuestionDto } from '../dto/update-form-question.dto';
import { SubmitFormResponseDto } from '../dto/submit-form-response.dto';
import { ReviewFormResponseDto } from '../dto/review-form-response.dto';

@ApiTags('club-forms')
@Controller('clubs/:clubId/forms')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClubFormsController {
  constructor(
    private readonly clubFormsService: ClubFormsService,
    private readonly clubFormResponsesService: ClubFormResponsesService,
  ) {}

  // Form Management Endpoints

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.manage_forms')
  @ApiOperation({ summary: 'Create a new club form' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 201, description: 'Form created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createForm(
    @Param('clubId') clubId: string,
    @Body() createClubFormDto: CreateClubFormDto,
    @AuthUser() user: any,
  ) {
    return this.clubFormsService.createForm(clubId, createClubFormDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all forms for a club' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 200, description: 'Forms retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllForms(@Param('clubId') clubId: string) {
    return this.clubFormsService.findAllForms(clubId);
  }

  @Get(':formId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get form by ID with questions' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOneForm(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
  ) {
    return this.clubFormsService.findOneForm(clubId, formId);
  }

  @Patch(':formId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.manage_forms')
  @ApiOperation({ summary: 'Update club form' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form updated successfully' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateForm(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Body() updateClubFormDto: UpdateClubFormDto,
    @AuthUser() user: any,
  ) {
    return this.clubFormsService.updateForm(
      clubId,
      formId,
      updateClubFormDto,
      user.id,
    );
  }

  @Delete(':formId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.manage_forms')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete club form' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 204, description: 'Form deleted successfully' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeForm(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @AuthUser() user: any,
  ) {
    await this.clubFormsService.removeForm(clubId, formId, user.id);
  }

  // Question Management Endpoints

  @Post(':formId/questions')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.manage_forms')
  @ApiOperation({ summary: 'Add question to form' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addQuestion(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Body() createQuestionDto: CreateFormQuestionDto,
    @AuthUser() user: any,
  ) {
    return this.clubFormsService.addQuestion(
      clubId,
      formId,
      createQuestionDto,
      user.id,
    );
  }

  @Patch(':formId/questions/:questionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.manage_forms')
  @ApiOperation({ summary: 'Update form question' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateQuestion(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateFormQuestionDto,
    @AuthUser() user: any,
  ) {
    return this.clubFormsService.updateQuestion(
      clubId,
      formId,
      questionId,
      updateQuestionDto,
      user.id,
    );
  }

  @Delete(':formId/questions/:questionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.manage_forms')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete form question' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 204, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeQuestion(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Param('questionId') questionId: string,
    @AuthUser() user: any,
  ) {
    await this.clubFormsService.removeQuestion(
      clubId,
      formId,
      questionId,
      user.id,
    );
  }

  // Response Management Endpoints

  @Post(':formId/responses')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit form response' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 201, description: 'Response submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Response already exists' })
  async submitResponse(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Body() submitResponseDto: SubmitFormResponseDto,
    @AuthUser() user: any,
  ) {
    return this.clubFormResponsesService.submitResponse(
      clubId,
      formId,
      submitResponseDto,
      user.id,
    );
  }

  @Get(':formId/responses')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.view_responses')
  @ApiOperation({ summary: 'Get all responses for a form' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Responses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllResponses(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @AuthUser() user: any,
  ) {
    return this.clubFormResponsesService.findAllResponses(
      clubId,
      formId,
      user.id,
    );
  }

  @Get(':formId/responses/:responseId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.view_responses')
  @ApiOperation({ summary: 'Get response by ID' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'responseId', description: 'Response ID' })
  @ApiResponse({ status: 200, description: 'Response retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Response not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOneResponse(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Param('responseId') responseId: string,
    @AuthUser() user: any,
  ) {
    return this.clubFormResponsesService.findOneResponse(
      clubId,
      formId,
      responseId,
      user.id,
    );
  }

  @Patch(':formId/responses/:responseId/review')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Policies('clubId', 'club.review_responses')
  @ApiOperation({ summary: 'Review form response (approve/reject)' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'responseId', description: 'Response ID' })
  @ApiResponse({ status: 200, description: 'Response reviewed successfully' })
  @ApiResponse({ status: 404, description: 'Response not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async reviewResponse(
    @Param('clubId') clubId: string,
    @Param('formId') formId: string,
    @Param('responseId') responseId: string,
    @Body() reviewDto: ReviewFormResponseDto,
    @AuthUser() user: any,
  ) {
    return this.clubFormResponsesService.reviewResponse(
      clubId,
      formId,
      responseId,
      reviewDto,
      user.id,
    );
  }
}
