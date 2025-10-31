import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { SubmitFormResponseDto } from '../dto/submit-form-response.dto';
import { ReviewFormResponseDto } from '../dto/review-form-response.dto';

@Injectable()
export class ClubFormResponsesService {
  private readonly logger = new Logger(ClubFormResponsesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Submits a form response
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param submitResponseDto - Response data
   * @param userId - User submitting the response
   * @returns Promise<ClubFormResponse> - Created response
   */
  async submitResponse(
    clubId: string,
    formId: string,
    submitResponseDto: SubmitFormResponseDto,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify form exists and is active
      const form = await this.verifyFormAccess(clubId, formId);

      // Check if user already has a response
      const { data: existingResponse } = await supabase
        .from('club_form_responses')
        .select('id, status')
        .eq('form_id', formId)
        .eq('user_id', userId)
        .single();

      // Validate answers against form questions
      await this.validateAnswers(formId, submitResponseDto.answers);

      let response;
      let responseError;

      if (existingResponse) {
        // If there's a pending application, prevent resubmission
        if (existingResponse.status === 'pending') {
          throw new ConflictException(
            'You already have a pending application for this club. Please wait for it to be reviewed.',
          );
        }

        // If withdrawn/rejected/approved, update the existing record
        const { data: updatedResponse, error: updateError } = await supabase
          .from('club_form_responses')
          .update({
            status: form.auto_approve ? 'approved' : 'pending',
            review_notes: null, // Clear any previous review notes
            reviewed_by: null, // Clear previous reviewer
            reviewed_at: null, // Clear previous review date
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingResponse.id)
          .select(
            `
            *,
            user:user_id(id, full_name, email),
            form:form_id(id, name, auto_approve)
          `,
          )
          .single();

        response = updatedResponse;
        responseError = updateError;
      } else {
        // No existing response, create new one
        const { data: newResponse, error: insertError } = await supabase
          .from('club_form_responses')
          .insert({
            form_id: formId,
            user_id: userId,
            status: form.auto_approve ? 'approved' : 'pending',
          })
          .select(
            `
            *,
            user:user_id(id, full_name, email),
            form:form_id(id, name, auto_approve)
          `,
          )
          .single();

        response = newResponse;
        responseError = insertError;
      }

      if (responseError) {
        this.logger.error('Error processing form response:', responseError);
        throw new BadRequestException(
          `Failed to submit response: ${responseError.message}`,
        );
      }

      // Handle answers - delete existing and insert new ones
      if (existingResponse) {
        // Delete existing answers for this response
        const { error: deleteError } = await supabase
          .from('club_form_answers')
          .delete()
          .eq('response_id', response.id);

        if (deleteError) {
          this.logger.error('Error deleting existing answers:', deleteError);
          throw new BadRequestException(
            `Failed to clear previous answers: ${deleteError.message}`,
          );
        }
      }

      // Create new answers
      const answersData = submitResponseDto.answers.map((answer) => ({
        response_id: response.id,
        question_id: answer.question_id,
        answer_text: answer.answer_text,
        answer_value: answer.answer_value,
      }));

      const { error: answersError } = await supabase
        .from('club_form_answers')
        .insert(answersData);

      if (answersError) {
        this.logger.error('Error creating form answers:', answersError);
        // Only rollback if this was a new response (not an update)
        if (!existingResponse) {
          await supabase
            .from('club_form_responses')
            .delete()
            .eq('id', response.id);
        }
        throw new BadRequestException(
          `Failed to save answers: ${answersError.message}`,
        );
      }

      // Fetch complete response with answers
      const { data: completeResponse } = await supabase
        .from('club_form_responses')
        .select(
          `
          *,
          user:user_id(id, full_name, email),
          form:form_id(id, name, auto_approve),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `,
        )
        .eq('id', response.id)
        .single();

      this.logger.log(
        `Submitted response to form ${formId} by user ${userId} (Status: ${response.status})`,
      );
      return completeResponse;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error submitting response:', error);
      throw new BadRequestException('Failed to submit response');
    }
  }

  /**
   * Gets all responses for a form
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param userId - User requesting responses
   * @returns Promise<ClubFormResponse[]> - Array of responses
   */
  async findAllResponses(
    clubId: string,
    formId: string,
    userId: string,
  ): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.verifyFormAccess(clubId, formId);

      const { data, error } = await supabase
        .from('club_form_responses')
        .select(
          `
          *,
          user:user_id(id, full_name, email),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `,
        )
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching form responses:', error);
        throw new BadRequestException(
          `Failed to fetch responses: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error fetching responses:', error);
      throw new BadRequestException('Failed to fetch responses');
    }
  }

  /**
   * Gets a specific response by ID
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param responseId - Response ID
   * @param userId - User requesting the response
   * @returns Promise<ClubFormResponse> - Response data
   */
  async findOneResponse(
    clubId: string,
    formId: string,
    responseId: string,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.verifyFormAccess(clubId, formId);

      const { data, error } = await supabase
        .from('club_form_responses')
        .select(
          `
          *,
          user:user_id(id, full_name, email),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type,
              options:club_form_question_options(
                id,
                option_text,
                option_value
              )
            )
          )
        `,
        )
        .eq('id', responseId)
        .eq('form_id', formId)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Response with ID ${responseId} not found`);
      }

      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error fetching response ${responseId}:`, error);
      throw new BadRequestException('Failed to fetch response');
    }
  }

  /**
   * Reviews a form response (approve/reject)
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param responseId - Response ID
   * @param reviewDto - Review data
   * @param userId - User reviewing the response
   * @returns Promise<ClubFormResponse> - Updated response
   */
  async reviewResponse(
    clubId: string,
    formId: string,
    responseId: string,
    reviewDto: ReviewFormResponseDto,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.verifyFormAccess(clubId, formId);

      // Check if response exists
      const { data: existingResponse } = await supabase
        .from('club_form_responses')
        .select('id, status')
        .eq('id', responseId)
        .eq('form_id', formId)
        .single();

      if (!existingResponse) {
        throw new NotFoundException(`Response with ID ${responseId} not found`);
      }

      // Update response
      const { data, error } = await supabase
        .from('club_form_responses')
        .update({
          status: reviewDto.status,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewDto.review_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .eq('form_id', formId)
        .select(
          `
          *,
          user:user_id(id, full_name, email),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error(`Error reviewing response ${responseId}:`, error);
        throw new BadRequestException(
          `Failed to review response: ${error.message}`,
        );
      }

      // If approved, add student as club member
      if (reviewDto.status === 'approved' && data) {
        await this.addStudentToClub(clubId, data.user_id, supabase);
      }

      this.logger.log(
        `Reviewed response ${responseId}: ${reviewDto.status} by user ${userId}`,
      );
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected error reviewing response ${responseId}:`,
        error,
      );
      throw new BadRequestException('Failed to review response');
    }
  }

  /**
   * Verifies form exists and is accessible
   * @param clubId - Club ID
   * @param formId - Form ID
   * @returns Promise<any> - Form data
   */
  private async verifyFormAccess(clubId: string, formId: string): Promise<any> {
    const supabase = this.supabaseService.getServiceClient();

    const { data: form, error } = await supabase
      .from('club_forms')
      .select('id, name, is_active, auto_approve')
      .eq('id', formId)
      .eq('club_id', clubId)
      .single();

    if (error || !form) {
      throw new NotFoundException(
        `Form with ID ${formId} not found in club ${clubId}`,
      );
    }

    if (!form.is_active) {
      throw new BadRequestException('This form is not currently active');
    }

    return form;
  }

  /**
   * Get all form responses for the current user (their applications)
   * @param userId - User ID
   * @returns Promise<any[]> - User's form responses
   */
  async findUserResponses(userId: string): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_form_responses')
        .select(
          `
          *,
          form:form_id(
            id,
            name,
            club:club_id(
              id,
              name,
              advisor:advisor_id(id, full_name, email)
            )
          ),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching user form responses:', error);
        throw new BadRequestException(
          `Failed to fetch user responses: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error in findUserResponses:', error);
      throw new BadRequestException(
        'An error occurred while fetching user responses',
      );
    }
  }

  /**
   * Withdraw a form response (soft delete by updating status)
   * @param responseId - Response ID
   * @param userId - User ID (must be the owner of the response)
   * @returns Promise<any> - Updated response
   */
  async withdrawResponse(responseId: string, userId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // First, verify the response exists and belongs to the user
      const { data: existingResponse, error: fetchError } = await supabase
        .from('club_form_responses')
        .select('id, user_id, status')
        .eq('id', responseId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingResponse) {
        throw new NotFoundException(
          'Application not found or you do not have permission to withdraw it',
        );
      }

      // Check if application can be withdrawn (only pending applications)
      if (existingResponse.status !== 'pending') {
        throw new BadRequestException(
          'Only pending applications can be withdrawn',
        );
      }

      // Update the response status to rejected (withdrawn)
      // Using 'rejected' status since 'withdrawn' is not in the database constraint
      // We'll use review_notes to indicate it was withdrawn by the user
      const { data, error } = await supabase
        .from('club_form_responses')
        .update({
          status: 'rejected',
          review_notes: 'Application withdrawn by student',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .eq('user_id', userId)
        .select(
          `
          *,
          form:form_id(
            id,
            name,
            club:club_id(
              id,
              name,
              advisor:advisor_id(id, full_name, email)
            )
          ),
          reviewed_by_user:reviewed_by(id, full_name, email),
          answers:club_form_answers(
            id,
            question_id,
            answer_text,
            answer_value,
            question:question_id(
              id,
              question_text,
              question_type
            )
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error withdrawing application:', error);
        throw new BadRequestException(
          `Failed to withdraw application: ${error.message}`,
        );
      }

      this.logger.log(`Application ${responseId} withdrawn by user ${userId}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error in withdrawResponse:', error);
      throw new BadRequestException(
        'An error occurred while withdrawing the application',
      );
    }
  }

  /**
   * Verifies user has access to club (officer or advisor)
   * @param clubId - Club ID
   * @param userId - User ID
   * @returns Promise<void>
   */
  private async verifyClubAccess(
    clubId: string,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    const { data: club, error } = await supabase
      .from('clubs')
      .select('id, president_id, vp_id, secretary_id, advisor_id')
      .eq('id', clubId)
      .single();

    if (error || !club) {
      throw new NotFoundException(`Club with ID ${clubId} not found`);
    }

    // Check if user is an officer or advisor
    const isOfficerOrAdvisor =
      club.president_id === userId ||
      club.vp_id === userId ||
      club.secretary_id === userId ||
      club.advisor_id === userId;

    if (!isOfficerOrAdvisor) {
      throw new ForbiddenException(
        'Only club officers and advisors can view responses',
      );
    }
  }

  /**
   * Validates answers against form questions
   * @param formId - Form ID
   * @param answers - Answers to validate
   * @returns Promise<void>
   */
  private async validateAnswers(formId: string, answers: any[]): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check for duplicate question_id values (fail fast)
    const questionIds = answers.map((a) => a.question_id);
    const uniqueQuestionIds = new Set(questionIds);
    if (questionIds.length !== uniqueQuestionIds.size) {
      throw new BadRequestException(
        'Duplicate question_id found in answers. Each question can only be answered once.',
      );
    }

    // Get form questions
    const { data: questions, error } = await supabase
      .from('club_form_questions')
      .select(
        `
        id,
        question_text,
        question_type,
        required,
        options:club_form_question_options(
          id,
          option_text,
          option_value
        )
      `,
      )
      .eq('form_id', formId)
      .order('order_index');

    if (error) {
      throw new BadRequestException('Failed to validate form questions');
    }

    // Check required questions
    const requiredQuestions = questions.filter((q) => q.required);
    const answeredQuestionIds = answers.map((a) => a.question_id);

    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.includes(question.id)) {
        throw new BadRequestException(
          `Required question "${question.question_text}" is missing`,
        );
      }
    }

    // Validate each answer based on question type
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.question_id);
      if (!question) {
        throw new BadRequestException(
          `Invalid question ID: ${answer.question_id}`,
        );
      }

      // Validate based on question type
      switch (question.question_type) {
        case 'dropdown':
        case 'radio':
          // Single-select: require answer_value, validate against options
          if (!answer.answer_value) {
            throw new BadRequestException(
              `Answer value is required for ${question.question_type} question "${question.question_text}"`,
            );
          }
          const validValues = question.options.map((opt) => opt.option_value);
          if (!validValues.includes(answer.answer_value)) {
            throw new BadRequestException(
              `Invalid answer value "${answer.answer_value}" for question "${question.question_text}". Valid options: ${validValues.join(', ')}`,
            );
          }
          break;

        case 'checkbox':
          // Multi-select: parse answer_value as array, validate all values
          if (!answer.answer_value) {
            throw new BadRequestException(
              `Answer value is required for checkbox question "${question.question_text}"`,
            );
          }
          let selectedValues: string[];
          try {
            // Try to parse as JSON array first, then as comma-separated string
            selectedValues = JSON.parse(answer.answer_value);
            if (!Array.isArray(selectedValues)) {
              selectedValues = answer.answer_value
                .split(',')
                .map((v) => v.trim());
            }
          } catch {
            selectedValues = answer.answer_value
              .split(',')
              .map((v) => v.trim());
          }

          const validCheckboxValues = question.options.map(
            (opt) => opt.option_value,
          );
          for (const value of selectedValues) {
            if (!validCheckboxValues.includes(value)) {
              throw new BadRequestException(
                `Invalid checkbox value "${value}" for question "${question.question_text}". Valid options: ${validCheckboxValues.join(', ')}`,
              );
            }
          }
          break;

        case 'text':
        case 'textarea':
        case 'number':
        case 'email':
        case 'date':
          // Text-based: require non-empty answer_text or answer_value
          const hasTextAnswer =
            answer.answer_text && answer.answer_text.trim().length > 0;
          const hasValueAnswer =
            answer.answer_value && answer.answer_value.trim().length > 0;

          if (!hasTextAnswer && !hasValueAnswer) {
            throw new BadRequestException(
              `Answer is required for ${question.question_type} question "${question.question_text}"`,
            );
          }
          break;

        default:
          throw new BadRequestException(
            `Unknown question type: ${question.question_type}`,
          );
      }
    }
  }

  /**
   * Adds a student to a club as a member when their application is approved
   * @param clubId - Club ID
   * @param userId - User ID to add as member
   * @param supabase - Supabase client
   */
  private async addStudentToClub(
    clubId: string,
    userId: string,
    supabase: any,
  ): Promise<void> {
    try {
      // First, get the student record from the user_id
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (studentError || !student) {
        this.logger.error(
          `Student record not found for user ${userId}:`,
          studentError,
        );
        return;
      }

      const studentId = student.id;

      // Get the default "Member" position
      const { data: memberPosition } = await supabase
        .from('club_positions')
        .select('id')
        .eq('name', 'Member')
        .single();

      if (!memberPosition) {
        this.logger.error('Default "Member" position not found');
        return;
      }

      // Check if student is already a member
      const { data: existingMembership } = await supabase
        .from('student_club_memberships')
        .select('id, is_active')
        .eq('student_id', studentId)
        .eq('club_id', clubId)
        .maybeSingle();

      if (existingMembership) {
        // If membership exists but is inactive, reactivate it
        if (!existingMembership.is_active) {
          const { error: updateError } = await supabase
            .from('student_club_memberships')
            .update({
              is_active: true,
              joined_at: new Date().toISOString(),
            })
            .eq('id', existingMembership.id);

          if (updateError) {
            this.logger.error('Error reactivating membership:', updateError);
          } else {
            this.logger.log(
              `Reactivated membership for student ${studentId} (user ${userId}) in club ${clubId}`,
            );
          }
        } else {
          this.logger.log(
            `Student ${studentId} (user ${userId}) is already an active member of club ${clubId}`,
          );
        }
        return;
      }

      // Create new membership
      const { error: insertError } = await supabase
        .from('student_club_memberships')
        .insert({
          student_id: studentId,
          club_id: clubId,
          position_id: memberPosition.id,
          joined_at: new Date().toISOString(),
          is_active: true,
        });

      if (insertError) {
        this.logger.error('Error adding student to club:', insertError);
        throw new BadRequestException(
          `Failed to add student to club: ${insertError.message}`,
        );
      }

      this.logger.log(
        `Successfully added student ${studentId} (user ${userId}) as member of club ${clubId}`,
      );
    } catch (error) {
      this.logger.error('Error in addStudentToClub:', error);
      // Don't throw error - we don't want to fail the approval if membership creation fails
      // The approval itself should succeed even if membership creation fails
    }
  }
}
