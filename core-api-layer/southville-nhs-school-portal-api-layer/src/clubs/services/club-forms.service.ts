import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateClubFormDto } from '../dto/create-club-form.dto';
import { UpdateClubFormDto } from '../dto/update-club-form.dto';
import { CreateFormQuestionDto } from '../dto/create-form-question.dto';
import { UpdateFormQuestionDto } from '../dto/update-form-question.dto';

@Injectable()
export class ClubFormsService {
  private readonly logger = new Logger(ClubFormsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Creates a new club form
   * @param clubId - Club ID
   * @param createClubFormDto - Form creation data
   * @param userId - User creating the form
   * @returns Promise<ClubForm> - Created form
   */
  async createForm(
    clubId: string,
    createClubFormDto: CreateClubFormDto,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists and user has permission
      await this.verifyClubAccess(clubId, userId);

      // Create form
      const { data, error } = await supabase
        .from('club_forms')
        .insert({
          ...createClubFormDto,
          club_id: clubId,
          created_by: userId,
        })
        .select(
          `
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email)
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating club form:', error);
        throw new BadRequestException(
          `Failed to create form: ${error.message}`,
        );
      }

      this.logger.log(`Created club form: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating club form:', error);
      throw new BadRequestException('Failed to create club form');
    }
  }

  /**
   * Gets all forms for a club
   * @param clubId - Club ID
   * @returns Promise<ClubForm[]> - Array of forms
   */
  async findAllForms(clubId: string): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_forms')
        .select(
          `
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email),
          questions:club_form_questions(
            id,
            question_text,
            question_type,
            required,
            order_index,
            options:club_form_question_options(
              id,
              option_text,
              option_value,
              order_index
            )
          )
        `,
        )
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching club forms:', error);
        throw new BadRequestException(
          `Failed to fetch forms: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching club forms:', error);
      throw new BadRequestException('Failed to fetch club forms');
    }
  }

  /**
   * Gets a form by ID with questions
   * @param clubId - Club ID
   * @param formId - Form ID
   * @returns Promise<ClubForm> - Form data with questions
   */
  async findOneForm(clubId: string, formId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_forms')
        .select(
          `
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email),
          questions:club_form_questions(
            id,
            question_text,
            question_type,
            required,
            order_index,
            options:club_form_question_options(
              id,
              option_text,
              option_value,
              order_index
            )
          )
        `,
        )
        .eq('id', formId)
        .eq('club_id', clubId)
        .single();

      if (error || !data) {
        throw new NotFoundException(
          `Form with ID ${formId} not found in club ${clubId}`,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching form ${formId}:`, error);
      throw new BadRequestException('Failed to fetch form');
    }
  }

  /**
   * Updates a club form
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param updateClubFormDto - Update data
   * @param userId - User updating the form
   * @returns Promise<ClubForm> - Updated form
   */
  async updateForm(
    clubId: string,
    formId: string,
    updateClubFormDto: UpdateClubFormDto,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.findOneForm(clubId, formId);

      // Update form
      const { data, error } = await supabase
        .from('club_forms')
        .update({
          ...updateClubFormDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formId)
        .eq('club_id', clubId)
        .select(
          `
          *,
          club:club_id(id, name),
          created_by_user:created_by(id, full_name, email)
        `,
        )
        .single();

      if (error) {
        this.logger.error(`Error updating form ${formId}:`, error);
        throw new BadRequestException(
          `Failed to update form: ${error.message}`,
        );
      }

      this.logger.log(`Updated club form: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error updating form ${formId}:`, error);
      throw new BadRequestException('Failed to update club form');
    }
  }

  /**
   * Deletes a club form
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param userId - User deleting the form
   * @returns Promise<void>
   */
  async removeForm(
    clubId: string,
    formId: string,
    userId: string,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.findOneForm(clubId, formId);

      const { error } = await supabase
        .from('club_forms')
        .delete()
        .eq('id', formId)
        .eq('club_id', clubId);

      if (error) {
        this.logger.error(`Error deleting form ${formId}:`, error);
        throw new BadRequestException(
          `Failed to delete form: ${error.message}`,
        );
      }

      this.logger.log(`Deleted club form with ID: ${formId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error deleting form ${formId}:`, error);
      throw new BadRequestException('Failed to delete club form');
    }
  }

  /**
   * Adds a question to a form
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param createQuestionDto - Question data
   * @param userId - User adding the question
   * @returns Promise<ClubFormQuestion> - Created question
   */
  async addQuestion(
    clubId: string,
    formId: string,
    createQuestionDto: CreateFormQuestionDto,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.findOneForm(clubId, formId);

      // Start transaction for question and options
      const { data: question, error: questionError } = await supabase
        .from('club_form_questions')
        .insert({
          ...createQuestionDto,
          form_id: formId,
        })
        .select(
          `
          *,
          options:club_form_question_options(
            id,
            option_text,
            option_value,
            order_index
          )
        `,
        )
        .single();

      if (questionError) {
        this.logger.error('Error creating question:', questionError);
        throw new BadRequestException(
          `Failed to create question: ${questionError.message}`,
        );
      }

      // Add options if provided
      if (createQuestionDto.options && createQuestionDto.options.length > 0) {
        const optionsData = createQuestionDto.options.map((option) => ({
          ...option,
          question_id: question.id,
        }));

        const { error: optionsError } = await supabase
          .from('club_form_question_options')
          .insert(optionsData);

        if (optionsError) {
          this.logger.error('Error creating question options:', optionsError);
          throw new BadRequestException(
            `Failed to create question options: ${optionsError.message}`,
          );
        }

        // Fetch question with options
        const { data: questionWithOptions } = await supabase
          .from('club_form_questions')
          .select(
            `
            *,
            options:club_form_question_options(
              id,
              option_text,
              option_value,
              order_index
            )
          `,
          )
          .eq('id', question.id)
          .single();

        return questionWithOptions;
      }

      this.logger.log(
        `Added question to form ${formId}: ${question.question_text}`,
      );
      return question;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error adding question:', error);
      throw new BadRequestException('Failed to add question');
    }
  }

  /**
   * Updates a form question
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param questionId - Question ID
   * @param updateQuestionDto - Update data
   * @param userId - User updating the question
   * @returns Promise<ClubFormQuestion> - Updated question
   */
  async updateQuestion(
    clubId: string,
    formId: string,
    questionId: string,
    updateQuestionDto: UpdateFormQuestionDto,
    userId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.findOneForm(clubId, formId);

      // Update question
      const { data, error } = await supabase
        .from('club_form_questions')
        .update({
          ...updateQuestionDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', questionId)
        .eq('form_id', formId)
        .select(
          `
          *,
          options:club_form_question_options(
            id,
            option_text,
            option_value,
            order_index
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error(`Error updating question ${questionId}:`, error);
        throw new BadRequestException(
          `Failed to update question: ${error.message}`,
        );
      }

      this.logger.log(`Updated question ${questionId} in form ${formId}`);
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
        `Unexpected error updating question ${questionId}:`,
        error,
      );
      throw new BadRequestException('Failed to update question');
    }
  }

  /**
   * Deletes a form question
   * @param clubId - Club ID
   * @param formId - Form ID
   * @param questionId - Question ID
   * @param userId - User deleting the question
   * @returns Promise<void>
   */
  async removeQuestion(
    clubId: string,
    formId: string,
    questionId: string,
    userId: string,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club access and form exists
      await this.verifyClubAccess(clubId, userId);
      await this.findOneForm(clubId, formId);

      const { error } = await supabase
        .from('club_form_questions')
        .delete()
        .eq('id', questionId)
        .eq('form_id', formId);

      if (error) {
        this.logger.error(`Error deleting question ${questionId}:`, error);
        throw new BadRequestException(
          `Failed to delete question: ${error.message}`,
        );
      }

      this.logger.log(`Deleted question ${questionId} from form ${formId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected error deleting question ${questionId}:`,
        error,
      );
      throw new BadRequestException('Failed to delete question');
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
        'Only club officers and advisors can manage forms',
      );
    }
  }
}
