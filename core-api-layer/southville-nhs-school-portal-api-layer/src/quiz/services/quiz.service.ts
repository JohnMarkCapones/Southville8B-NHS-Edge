import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  CreateQuizSettingsDto,
  PublishQuizDto,
} from '../dto';
import { Quiz, QuizQuestion, QuizSettings } from '../entities';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new quiz (draft status)
   */
  async createQuiz(
    createQuizDto: CreateQuizDto,
    teacherId: string,
  ): Promise<Quiz> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Validate question pool logic
      if (createQuizDto.questionPoolSize && createQuizDto.questionsToDisplay) {
        if (createQuizDto.questionsToDisplay > createQuizDto.questionPoolSize) {
          throw new BadRequestException(
            'Questions to display cannot exceed question pool size',
          );
        }
      }

      // Create quiz
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .insert({
          title: createQuizDto.title,
          description: createQuizDto.description,
          subject_id: createQuizDto.subjectId,
          teacher_id: teacherId,
          type: createQuizDto.type || 'form',
          grading_type: createQuizDto.gradingType || 'auto',
          time_limit: createQuizDto.timeLimit,
          start_date: createQuizDto.startDate,
          end_date: createQuizDto.endDate,
          visibility: createQuizDto.visibility || 'section_only',
          question_pool_size: createQuizDto.questionPoolSize,
          questions_to_display: createQuizDto.questionsToDisplay,
          allow_retakes: createQuizDto.allowRetakes || false,
          allow_backtracking: createQuizDto.allowBacktracking !== false,
          shuffle_questions: createQuizDto.shuffleQuestions || false,
          shuffle_choices: createQuizDto.shuffleChoices || false,
          total_points: createQuizDto.totalPoints,
          passing_score: createQuizDto.passingScore,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating quiz:', error);
        throw new InternalServerErrorException(
          `Failed to create quiz: ${error.message}`,
        );
      }

      this.logger.log(`Quiz created successfully: ${quiz.quiz_id}`);
      return quiz;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error creating quiz:', error);
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }

  /**
   * Get all quizzes with filters and pagination
   */
  async findAllQuizzes(filters: any = {}): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const {
      page = 1,
      limit = 10,
      teacherId,
      subjectId,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('quizzes').select('*', { count: 'exact' });

    // Apply filters
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching quizzes:', error);
      throw new InternalServerErrorException('Failed to fetch quizzes');
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get a single quiz by ID
   */
  async findQuizById(quizId: string): Promise<Quiz> {
    const supabase = this.supabaseService.getClient();

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('quiz_id', quizId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Quiz not found');
      }
      this.logger.error('Error fetching quiz:', error);
      throw new InternalServerErrorException('Failed to fetch quiz');
    }

    return quiz;
  }

  /**
   * Update a quiz
   * If quiz is published and has active attempts, create a new version
   */
  async updateQuiz(
    quizId: string,
    updateQuizDto: UpdateQuizDto,
    teacherId: string,
  ): Promise<Quiz> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only update your own quizzes');
    }

    // Validate question pool logic if updating
    if (updateQuizDto.questionPoolSize && updateQuizDto.questionsToDisplay) {
      if (updateQuizDto.questionsToDisplay > updateQuizDto.questionPoolSize) {
        throw new BadRequestException(
          'Questions to display cannot exceed question pool size',
        );
      }
    }

    // Check if quiz is published and has active attempts
    if (quiz.status === 'published') {
      const { data: activeAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempt_id')
        .eq('quiz_id', quizId)
        .in('status', ['in_progress', 'submitted'])
        .limit(1);

      if (attemptsError) {
        this.logger.error('Error checking active attempts:', attemptsError);
      }

      // If there are active attempts, create a new version instead
      if (activeAttempts && activeAttempts.length > 0) {
        this.logger.log(
          `Quiz ${quizId} has active attempts, creating new version`,
        );
        return await this.createQuizVersion(quizId, updateQuizDto, teacherId);
      }
    }

    // If no active attempts or quiz is draft, update directly
    const { data: updatedQuiz, error } = await supabase
      .from('quizzes')
      .update({
        ...(updateQuizDto.title && { title: updateQuizDto.title }),
        ...(updateQuizDto.description !== undefined && {
          description: updateQuizDto.description,
        }),
        ...(updateQuizDto.subjectId !== undefined && {
          subject_id: updateQuizDto.subjectId,
        }),
        ...(updateQuizDto.type && { type: updateQuizDto.type }),
        ...(updateQuizDto.gradingType && {
          grading_type: updateQuizDto.gradingType,
        }),
        ...(updateQuizDto.timeLimit !== undefined && {
          time_limit: updateQuizDto.timeLimit,
        }),
        ...(updateQuizDto.startDate !== undefined && {
          start_date: updateQuizDto.startDate,
        }),
        ...(updateQuizDto.endDate !== undefined && {
          end_date: updateQuizDto.endDate,
        }),
        ...(updateQuizDto.visibility && {
          visibility: updateQuizDto.visibility,
        }),
        ...(updateQuizDto.questionPoolSize !== undefined && {
          question_pool_size: updateQuizDto.questionPoolSize,
        }),
        ...(updateQuizDto.questionsToDisplay !== undefined && {
          questions_to_display: updateQuizDto.questionsToDisplay,
        }),
        ...(updateQuizDto.allowRetakes !== undefined && {
          allow_retakes: updateQuizDto.allowRetakes,
        }),
        ...(updateQuizDto.allowBacktracking !== undefined && {
          allow_backtracking: updateQuizDto.allowBacktracking,
        }),
        ...(updateQuizDto.shuffleQuestions !== undefined && {
          shuffle_questions: updateQuizDto.shuffleQuestions,
        }),
        ...(updateQuizDto.shuffleChoices !== undefined && {
          shuffle_choices: updateQuizDto.shuffleChoices,
        }),
        ...(updateQuizDto.totalPoints !== undefined && {
          total_points: updateQuizDto.totalPoints,
        }),
        ...(updateQuizDto.passingScore !== undefined && {
          passing_score: updateQuizDto.passingScore,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('quiz_id', quizId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating quiz:', error);
      throw new InternalServerErrorException('Failed to update quiz');
    }

    this.logger.log(`Quiz updated successfully: ${quizId}`);
    return updatedQuiz;
  }

  /**
   * Create a new version of a quiz (for published quizzes with active attempts)
   */
  async createQuizVersion(
    originalQuizId: string,
    updateQuizDto: UpdateQuizDto,
    teacherId: string,
  ): Promise<Quiz> {
    const supabase = this.supabaseService.getServiceClient();

    // Get original quiz
    const originalQuiz = await this.findQuizById(originalQuizId);
    if (originalQuiz.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only create versions of your own quizzes');
    }

    // Create new quiz with incremented version
    const newVersion = (originalQuiz.version || 1) + 1;
    const { data: newQuiz, error: newQuizError } = await supabase
      .from('quizzes')
      .insert({
        title: updateQuizDto.title || originalQuiz.title,
        description: updateQuizDto.description ?? originalQuiz.description,
        subject_id: updateQuizDto.subjectId ?? originalQuiz.subject_id,
        teacher_id: teacherId,
        type: updateQuizDto.type || originalQuiz.type,
        grading_type: updateQuizDto.gradingType || originalQuiz.grading_type,
        time_limit: updateQuizDto.timeLimit ?? originalQuiz.time_limit,
        start_date: updateQuizDto.startDate ?? originalQuiz.start_date,
        end_date: updateQuizDto.endDate ?? originalQuiz.end_date,
        status: originalQuiz.status,
        version: newVersion,
        parent_quiz_id: originalQuizId,
        visibility: updateQuizDto.visibility || originalQuiz.visibility,
        question_pool_size:
          updateQuizDto.questionPoolSize ?? originalQuiz.question_pool_size,
        questions_to_display:
          updateQuizDto.questionsToDisplay ?? originalQuiz.questions_to_display,
        allow_retakes: updateQuizDto.allowRetakes ?? originalQuiz.allow_retakes,
        allow_backtracking:
          updateQuizDto.allowBacktracking ?? originalQuiz.allow_backtracking,
        shuffle_questions:
          updateQuizDto.shuffleQuestions ?? originalQuiz.shuffle_questions,
        shuffle_choices:
          updateQuizDto.shuffleChoices ?? originalQuiz.shuffle_choices,
        total_points: updateQuizDto.totalPoints ?? originalQuiz.total_points,
        passing_score: updateQuizDto.passingScore ?? originalQuiz.passing_score,
      })
      .select()
      .single();

    if (newQuizError) {
      this.logger.error('Error creating quiz version:', newQuizError);
      throw new InternalServerErrorException('Failed to create quiz version');
    }

    // Copy questions from original quiz
    const { data: originalQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', originalQuizId);

    if (questionsError) {
      this.logger.error('Error fetching original questions:', questionsError);
    } else if (originalQuestions && originalQuestions.length > 0) {
      // Create question ID mapping (old -> new)
      const questionIdMap = new Map<string, string>();

      for (const originalQuestion of originalQuestions) {
        const { data: newQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: newQuiz.quiz_id,
            question_text: originalQuestion.question_text,
            question_type: originalQuestion.question_type,
            order_index: originalQuestion.order_index,
            points: originalQuestion.points,
            allow_partial_credit: originalQuestion.allow_partial_credit,
            time_limit_seconds: originalQuestion.time_limit_seconds,
            is_pool_question: originalQuestion.is_pool_question,
            source_question_bank_id: originalQuestion.source_question_bank_id,
            correct_answer: originalQuestion.correct_answer,
            settings: originalQuestion.settings,
          })
          .select('question_id')
          .single();

        if (questionError) {
          this.logger.error('Error creating question copy:', questionError);
          continue;
        }

        questionIdMap.set(
          originalQuestion.question_id,
          newQuestion.question_id,
        );

        // Copy choices
        const { data: originalChoices } = await supabase
          .from('quiz_choices')
          .select('*')
          .eq('question_id', originalQuestion.question_id);

        if (originalChoices && originalChoices.length > 0) {
          const choicesToInsert = originalChoices.map((choice) => ({
            question_id: newQuestion.question_id,
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
            order_index: choice.order_index,
            metadata: choice.metadata,
          }));

          await supabase.from('quiz_choices').insert(choicesToInsert);
        }
      }
    }

    // Copy section assignments
    const { data: originalSections } = await supabase
      .from('quiz_sections')
      .select('*')
      .eq('quiz_id', originalQuizId);

    if (originalSections && originalSections.length > 0) {
      const sectionsToInsert = originalSections.map((section) => ({
        quiz_id: newQuiz.quiz_id,
        section_id: section.section_id,
        start_date: section.start_date,
        end_date: section.end_date,
        time_limit: section.time_limit,
        section_settings: section.section_settings,
      }));

      await supabase.from('quiz_sections').insert(sectionsToInsert);
    }

    this.logger.log(
      `Quiz version ${newVersion} created for quiz ${originalQuizId}`,
    );
    return newQuiz;
  }

  /**
   * Delete a quiz (soft delete by archiving)
   */
  async deleteQuiz(quizId: string, teacherId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only delete your own quizzes');
    }

    // Soft delete by setting status to archived
    const { error } = await supabase
      .from('quizzes')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('quiz_id', quizId);

    if (error) {
      this.logger.error('Error deleting quiz:', error);
      throw new InternalServerErrorException('Failed to delete quiz');
    }

    this.logger.log(`Quiz archived successfully: ${quizId}`);
  }

  /**
   * Add a question to a quiz
   */
  async addQuestion(
    quizId: string,
    createQuestionDto: CreateQuizQuestionDto,
    teacherId: string,
  ): Promise<QuizQuestion> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only add questions to your own quizzes',
      );
    }

    // Create question
    const questionData: any = {
      quiz_id: quizId,
      question_text: createQuestionDto.questionText,
      question_type: createQuestionDto.questionType,
      order_index: createQuestionDto.orderIndex,
      points: createQuestionDto.points || 1,
      allow_partial_credit: createQuestionDto.allowPartialCredit || false,
      time_limit_seconds: createQuestionDto.timeLimitSeconds,
      is_pool_question: createQuestionDto.isPoolQuestion || false,
    };

    // Only include source_question_bank_id if it's provided and not null
    if (createQuestionDto.sourceQuestionBankId) {
      questionData.source_question_bank_id = createQuestionDto.sourceQuestionBankId;
    }

    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .insert(questionData)
      .select()
      .single();

    if (questionError) {
      this.logger.error('Error creating question:', questionError);
      throw new InternalServerErrorException('Failed to create question');
    }

    // Create choices if provided
    if (createQuestionDto.choices && createQuestionDto.choices.length > 0) {
      const choicesToInsert = createQuestionDto.choices.map((choice) => ({
        question_id: question.question_id,
        choice_text: choice.choiceText,
        is_correct: choice.isCorrect || false,
        order_index: choice.orderIndex,
        metadata: choice.metadata,
      }));

      const { error: choicesError } = await supabase
        .from('quiz_choices')
        .insert(choicesToInsert);

      if (choicesError) {
        // Rollback question creation
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('question_id', question.question_id);

        this.logger.error('Error creating choices:', choicesError);
        throw new InternalServerErrorException('Failed to create choices');
      }
    }

    // Create metadata if provided (for complex question types)
    if (createQuestionDto.metadata) {
      const { error: metadataError } = await supabase
        .from('quiz_question_metadata')
        .insert({
          question_id: question.question_id,
          metadata_type: this.getMetadataType(createQuestionDto.questionType),
          metadata: createQuestionDto.metadata,
        });

      if (metadataError) {
        this.logger.warn('Error creating question metadata:', metadataError);
      }
    }

    this.logger.log(`Question added to quiz ${quizId}`);
    return question;
  }

  /**
   * Publish a quiz
   */
  async publishQuiz(
    quizId: string,
    publishDto: PublishQuizDto,
    teacherId: string,
  ): Promise<Quiz> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only publish your own quizzes');
    }

    // Update quiz status
    const { data: updatedQuiz, error } = await supabase
      .from('quizzes')
      .update({
        status: publishDto.status,
        updated_at: new Date().toISOString(),
      })
      .eq('quiz_id', quizId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error publishing quiz:', error);
      throw new InternalServerErrorException('Failed to publish quiz');
    }

    // Assign to sections if provided
    if (publishDto.sectionIds && publishDto.sectionIds.length > 0) {
      const sectionsToInsert = publishDto.sectionIds.map((sectionId) => ({
        quiz_id: quizId,
        section_id: sectionId,
      }));

      const { error: sectionsError } = await supabase
        .from('quiz_sections')
        .insert(sectionsToInsert);

      if (sectionsError) {
        this.logger.error('Error assigning quiz to sections:', sectionsError);
        throw new InternalServerErrorException(
          'Failed to assign quiz to sections',
        );
      }
    }

    this.logger.log(`Quiz published: ${quizId} with status ${publishDto.status}`);
    return updatedQuiz;
  }

  /**
   * Create quiz settings
   */
  async createQuizSettings(
    quizId: string,
    settingsDto: CreateQuizSettingsDto,
    teacherId: string,
  ): Promise<QuizSettings> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only configure settings for your own quizzes',
      );
    }

    // Create or update settings
    const { data: settings, error } = await supabase
      .from('quiz_settings')
      .upsert({
        quiz_id: quizId,
        lockdown_browser: settingsDto.lockdownBrowser || false,
        anti_screenshot: settingsDto.antiScreenshot || false,
        disable_copy_paste: settingsDto.disableCopyPaste || false,
        disable_right_click: settingsDto.disableRightClick || false,
        require_fullscreen: settingsDto.requireFullscreen || false,
        track_tab_switches: settingsDto.trackTabSwitches !== false,
        track_device_changes: settingsDto.trackDeviceChanges !== false,
        track_ip_changes: settingsDto.trackIpChanges !== false,
        tab_switch_warning_threshold:
          settingsDto.tabSwitchWarningThreshold || 3,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating quiz settings:', error);
      throw new InternalServerErrorException('Failed to create quiz settings');
    }

    this.logger.log(`Quiz settings configured for quiz ${quizId}`);
    return settings;
  }

  /**
   * Assign quiz to sections with optional overrides
   */
  async assignQuizToSections(
    quizId: string,
    sectionIds: string[],
    teacherId: string,
    overrides?: {
      startDate?: string;
      endDate?: string;
      timeLimit?: number;
      sectionSettings?: any;
    },
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only assign your own quizzes to sections',
      );
    }

    // Check if quiz is published
    if (quiz.status !== 'published') {
      throw new BadRequestException(
        'Quiz must be published before assigning to sections',
      );
    }

    // Step 1: Insert into quiz_sections (junction table)
    const sectionsToInsert = sectionIds.map((sectionId) => ({
      quiz_id: quizId,
      section_id: sectionId,
    }));

    const { error: sectionsError } = await supabase
      .from('quiz_sections')
      .upsert(sectionsToInsert, {
        onConflict: 'quiz_id,section_id',
      });

    if (sectionsError) {
      this.logger.error('Error assigning quiz to sections:', sectionsError);
      throw new InternalServerErrorException(
        'Failed to assign quiz to sections',
      );
    }

    // Step 2: If there are overrides, insert into quiz_section_settings
    if (overrides && (overrides.startDate || overrides.endDate || overrides.timeLimit)) {
      const settingsToInsert = sectionIds.map((sectionId) => ({
        quiz_id: quizId,
        section_id: sectionId,
        start_date: overrides.startDate || quiz.start_date,
        end_date: overrides.endDate || quiz.end_date,
        time_limit_override: overrides.timeLimit || quiz.time_limit,
      }));

      const { error: settingsError } = await supabase
        .from('quiz_section_settings')
        .upsert(settingsToInsert, {
          onConflict: 'quiz_id,section_id',
        });

      if (settingsError) {
        this.logger.error('Error setting section-specific settings:', settingsError);
        throw new InternalServerErrorException(
          'Failed to set section-specific settings',
        );
      }
    }

    this.logger.log(
      `Quiz ${quizId} assigned to ${sectionIds.length} section(s)`,
    );
  }

  /**
   * Get sections assigned to a quiz
   */
  async getQuizSections(quizId: string): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    // Get basic section assignments
    const { data: sections, error } = await supabase
      .from('quiz_sections')
      .select('section_id, assigned_at')
      .eq('quiz_id', quizId);

    if (error) {
      this.logger.error('Error fetching quiz sections:', error);
      throw new InternalServerErrorException('Failed to fetch quiz sections');
    }

    if (!sections || sections.length === 0) {
      return [];
    }

    // Get section-specific settings if they exist
    const { data: sectionSettings } = await supabase
      .from('quiz_section_settings')
      .select('section_id, start_date, end_date, time_limit_override')
      .eq('quiz_id', quizId);

    // Merge section assignments with their settings
    const enrichedSections = sections.map((section) => {
      const settings = sectionSettings?.find(
        (s) => s.section_id === section.section_id,
      );
      return {
        section_id: section.section_id,
        assigned_at: section.assigned_at,
        start_date: settings?.start_date || null,
        end_date: settings?.end_date || null,
        time_limit: settings?.time_limit_override || null,
      };
    });

    return enrichedSections;
  }

  /**
   * Remove quiz from all sections
   */
  async removeQuizFromAllSections(
    quizId: string,
    teacherId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only remove your own quizzes from sections',
      );
    }

    // Delete all section assignments for this quiz
    const { error } = await supabase
      .from('quiz_sections')
      .delete()
      .eq('quiz_id', quizId);

    if (error) {
      this.logger.error('Error removing quiz from all sections:', error);
      throw new InternalServerErrorException(
        'Failed to remove quiz from all sections',
      );
    }

    // Also delete section-specific settings
    await supabase
      .from('quiz_section_settings')
      .delete()
      .eq('quiz_id', quizId);

    this.logger.log(`Quiz ${quizId} removed from all sections`);
  }

  /**
   * Remove quiz from specific sections
   */
  async removeQuizFromSections(
    quizId: string,
    sectionIds: string[],
    teacherId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only remove your own quizzes from sections',
      );
    }

    const { error } = await supabase
      .from('quiz_sections')
      .delete()
      .eq('quiz_id', quizId)
      .in('section_id', sectionIds);

    if (error) {
      this.logger.error('Error removing quiz from sections:', error);
      throw new InternalServerErrorException(
        'Failed to remove quiz from sections',
      );
    }

    // Also delete section-specific settings for these sections
    await supabase
      .from('quiz_section_settings')
      .delete()
      .eq('quiz_id', quizId)
      .in('section_id', sectionIds);

    this.logger.log(
      `Quiz ${quizId} removed from ${sectionIds.length} section(s)`,
    );
  }

  /**
   * Get available quizzes for a student based on their sections
   */
  async getAvailableQuizzes(
    studentId: string,
    filters: {
      subjectId?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const { subjectId, status = 'published', page = 1, limit = 10 } = filters;

    // First, get student's section IDs
    const { data: studentSections, error: sectionsError } = await supabase
      .from('students')
      .select('section_id')
      .eq('user_id', studentId)
      .single();

    if (sectionsError || !studentSections) {
      this.logger.error('Error fetching student sections:', sectionsError);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const sectionId = studentSections.section_id;

    // Get quiz IDs assigned to this section
    const { data: quizSections, error: quizSectionsError } = await supabase
      .from('quiz_sections')
      .select('quiz_id')
      .eq('section_id', sectionId);

    if (quizSectionsError) {
      this.logger.error('Error fetching quiz sections:', quizSectionsError);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const quizIds = quizSections?.map((qs) => qs.quiz_id) || [];

    if (quizIds.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Get section-specific settings for these quizzes
    const { data: sectionSettings } = await supabase
      .from('quiz_section_settings')
      .select('quiz_id, start_date, end_date, time_limit_override')
      .eq('section_id', sectionId)
      .in('quiz_id', quizIds);

    // Build query for published quizzes
    let query = supabase
      .from('quizzes')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .in('quiz_id', quizIds);

    // Apply filters
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    // Filter by date (only show quizzes that are currently active)
    const now = new Date().toISOString();
    query = query.or(`start_date.is.null,start_date.lte.${now}`);
    query = query.or(`end_date.is.null,end_date.gte.${now}`);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Sort by start date descending
    query = query.order('start_date', { ascending: false });

    const { data: quizzes, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching available quizzes:', error);
      throw new InternalServerErrorException('Failed to fetch available quizzes');
    }

    // Enrich quizzes with section-specific settings
    const enrichedQuizzes = quizzes?.map((quiz) => {
      const settings = sectionSettings?.find((s) => s.quiz_id === quiz.quiz_id);
      return {
        ...quiz,
        sectionStartDate: settings?.start_date || quiz.start_date,
        sectionEndDate: settings?.end_date || quiz.end_date,
        sectionTimeLimit: settings?.time_limit_override || quiz.time_limit,
      };
    });

    return {
      data: enrichedQuizzes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Clone/duplicate a quiz
   */
  async cloneQuiz(
    originalQuizId: string,
    teacherId: string,
    newTitle?: string,
  ): Promise<Quiz> {
    const supabase = this.supabaseService.getServiceClient();

    // Get original quiz
    const originalQuiz = await this.findQuizById(originalQuizId);

    // Check if user has permission to clone (own quiz or admin)
    if (originalQuiz.teacher_id !== teacherId) {
      // For now, only allow cloning own quizzes
      throw new ForbiddenException('You can only clone your own quizzes');
    }

    // Create new quiz as draft
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: newTitle || `${originalQuiz.title} (Copy)`,
        description: originalQuiz.description,
        subject_id: originalQuiz.subject_id,
        teacher_id: teacherId,
        type: originalQuiz.type,
        grading_type: originalQuiz.grading_type,
        time_limit: originalQuiz.time_limit,
        start_date: null, // Reset dates for cloned quiz
        end_date: null,
        status: 'draft', // Always create as draft
        version: 1, // New quiz, not a version
        parent_quiz_id: null,
        visibility: originalQuiz.visibility,
        question_pool_size: originalQuiz.question_pool_size,
        questions_to_display: originalQuiz.questions_to_display,
        allow_retakes: originalQuiz.allow_retakes,
        allow_backtracking: originalQuiz.allow_backtracking,
        shuffle_questions: originalQuiz.shuffle_questions,
        shuffle_choices: originalQuiz.shuffle_choices,
        total_points: originalQuiz.total_points,
        passing_score: originalQuiz.passing_score,
      })
      .select()
      .single();

    if (quizError) {
      this.logger.error('Error cloning quiz:', quizError);
      throw new InternalServerErrorException('Failed to clone quiz');
    }

    // Clone questions
    const { data: originalQuestions } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', originalQuizId)
      .order('order_index', { ascending: true });

    if (originalQuestions && originalQuestions.length > 0) {
      for (const originalQuestion of originalQuestions) {
        const { data: newQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: newQuiz.quiz_id,
            question_text: originalQuestion.question_text,
            question_type: originalQuestion.question_type,
            order_index: originalQuestion.order_index,
            points: originalQuestion.points,
            allow_partial_credit: originalQuestion.allow_partial_credit,
            time_limit_seconds: originalQuestion.time_limit_seconds,
            is_pool_question: originalQuestion.is_pool_question,
            source_question_bank_id: originalQuestion.source_question_bank_id,
            correct_answer: originalQuestion.correct_answer,
            settings: originalQuestion.settings,
          })
          .select('question_id')
          .single();

        if (questionError) {
          this.logger.error('Error cloning question:', questionError);
          continue;
        }

        // Clone choices
        const { data: originalChoices } = await supabase
          .from('quiz_choices')
          .select('*')
          .eq('question_id', originalQuestion.question_id)
          .order('order_index', { ascending: true });

        if (originalChoices && originalChoices.length > 0) {
          const choicesToInsert = originalChoices.map((choice) => ({
            question_id: newQuestion.question_id,
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
            order_index: choice.order_index,
            metadata: choice.metadata,
          }));

          await supabase.from('quiz_choices').insert(choicesToInsert);
        }

        // Clone question metadata
        const { data: originalMetadata } = await supabase
          .from('quiz_question_metadata')
          .select('*')
          .eq('question_id', originalQuestion.question_id);

        if (originalMetadata && originalMetadata.length > 0) {
          const metadataToInsert = originalMetadata.map((meta) => ({
            question_id: newQuestion.question_id,
            metadata_type: meta.metadata_type,
            metadata: meta.metadata,
          }));

          await supabase.from('quiz_question_metadata').insert(metadataToInsert);
        }
      }
    }

    // Clone settings
    const { data: originalSettings } = await supabase
      .from('quiz_settings')
      .select('*')
      .eq('quiz_id', originalQuizId)
      .single();

    if (originalSettings) {
      await supabase.from('quiz_settings').insert({
        quiz_id: newQuiz.quiz_id,
        lockdown_browser: originalSettings.lockdown_browser,
        anti_screenshot: originalSettings.anti_screenshot,
        disable_copy_paste: originalSettings.disable_copy_paste,
        disable_right_click: originalSettings.disable_right_click,
        require_fullscreen: originalSettings.require_fullscreen,
        track_tab_switches: originalSettings.track_tab_switches,
        track_device_changes: originalSettings.track_device_changes,
        track_ip_changes: originalSettings.track_ip_changes,
        tab_switch_warning_threshold: originalSettings.tab_switch_warning_threshold,
      });
    }

    // Note: We don't clone section assignments - teacher must manually assign

    this.logger.log(`Quiz cloned: ${originalQuizId} → ${newQuiz.quiz_id}`);
    return newQuiz;
  }

  /**
   * Get quiz preview (for teachers to test quiz before publishing)
   */
  async getQuizPreview(quizId: string, teacherId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only preview your own quizzes');
    }

    // Get questions with choices
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
        *,
        quiz_choices (*)
      `)
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw new InternalServerErrorException('Failed to fetch quiz questions');
    }

    // Get settings
    const { data: settings } = await supabase
      .from('quiz_settings')
      .select('*')
      .eq('quiz_id', quizId)
      .single();

    return {
      quiz,
      questions,
      settings,
      preview: true,
      note: 'This is a preview. Student data will not be recorded.',
    };
  }

  /**
   * Helper: Get metadata type based on question type
   */
  private getMetadataType(questionType: string): string {
    const mapping: { [key: string]: string } = {
      matching: 'matching_pairs',
      ordering: 'ordering_items',
      drag_drop: 'drag_drop_zones',
      fill_in_blank: 'fill_in_blanks',
    };
    return mapping[questionType] || questionType;
  }
}
