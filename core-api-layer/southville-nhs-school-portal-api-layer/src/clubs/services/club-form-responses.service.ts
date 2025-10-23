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

      // Check if user already submitted a response
      const { data: existingResponse } = await supabase
        .from('club_form_responses')
        .select('id')
        .eq('form_id', formId)
        .eq('user_id', userId)
        .single();

      if (existingResponse) {
        throw new ConflictException(
          'You have already submitted a response to this form',
        );
      }

      // Validate answers against form questions
      await this.validateAnswers(formId, submitResponseDto.answers);

      // Create response
      const { data: response, error: responseError } = await supabase
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

      if (responseError) {
        this.logger.error('Error creating form response:', responseError);
        // 23505 = unique_violation (Postgres) — Supabase exposes in error.code
        if ((responseError as any).code === '23505') {
          throw new ConflictException(
            'You have already submitted a response to this form',
          );
        }
        throw new BadRequestException(
          `Failed to submit response: ${responseError.message}`,
        );
      }

      // Create answers
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
        // Rollback response creation
        await supabase
          .from('club_form_responses')
          .delete()
          .eq('id', response.id);
        throw new BadRequestException(
          `Failed to submit response: ${answersError.message}`,
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
}
