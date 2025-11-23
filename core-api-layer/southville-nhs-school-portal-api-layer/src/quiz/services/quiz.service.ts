import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CloudflareImagesService } from '../../common/services/cloudflare-images.service';
import { NotificationService } from '../../common/services/notification.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { ActivityMonitoringService } from '../../activity-monitoring/activity-monitoring.service';
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

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cloudflareImagesService: CloudflareImagesService,
    private readonly notificationService: NotificationService,
    private readonly activityMonitoring: ActivityMonitoringService,
  ) {}

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

      // ✅ Create quiz_settings record
      const { error: settingsError } = await supabase
        .from('quiz_settings')
        .insert({
          quiz_id: quiz.quiz_id,
          // Security features
          secured_quiz: createQuizDto.securedQuiz || false,
          quiz_lockdown: createQuizDto.quizLockdown || false,
          anti_screenshot: createQuizDto.antiScreenshot || false,
          disable_copy_paste: createQuizDto.disableCopyPaste || false,
          disable_right_click: createQuizDto.disableRightClick || false,
          lockdown_ui: createQuizDto.lockdownUI || false,
          // Question pool
          question_pool: createQuizDto.questionPool || false,
          stratified_sampling: createQuizDto.stratifiedSampling || false,
          total_questions: createQuizDto.totalQuestions,
          pool_size: createQuizDto.poolSize,
          // Behavior
          strict_time_limit: createQuizDto.strictTimeLimit || false,
          auto_save: createQuizDto.autoSave !== false, // default true
          backtracking_control: createQuizDto.backtrackingControl || false,
          // Other
          access_code: createQuizDto.accessCode,
          publish_mode: createQuizDto.publishMode || 'immediate',
        });

      if (settingsError) {
        this.logger.error('Error creating quiz settings:', settingsError);
        // Don't throw error - settings are optional, quiz still valid
        this.logger.warn(`Quiz ${quiz.quiz_id} created without settings`);
      }

      // ✅ Assign sections if provided during creation
      if (createQuizDto.sectionIds && createQuizDto.sectionIds.length > 0) {
        const sectionsToInsert = createQuizDto.sectionIds.map((sectionId) => ({
          quiz_id: quiz.quiz_id,
          section_id: sectionId,
          assigned_at: new Date().toISOString(),
        }));

        const { error: sectionsError } = await supabase
          .from('quiz_sections')
          .insert(sectionsToInsert);

        if (sectionsError) {
          this.logger.error('Error assigning sections to quiz:', sectionsError);
          this.logger.warn(
            `Quiz ${quiz.quiz_id} created without section assignments`,
          );
        } else {
          this.logger.log(
            `✅ Assigned ${createQuizDto.sectionIds.length} sections to quiz ${quiz.quiz_id}`,
          );
        }
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
      includeDeleted = false, // New parameter to include deleted quizzes
    } = filters;

    // ✅ SELECT WITH QUESTION COUNT
    // Use LEFT JOIN to count questions per quiz
    let query = supabase.from('quizzes').select(
      `
        *,
        quiz_questions(count)
      `,
      { count: 'exact' },
    );

    // ✅ FILTER OUT SOFT-DELETED QUIZZES BY DEFAULT
    // Only show deleted quizzes if explicitly requested (for archived view)
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Apply filters
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    if (status) {
      // If status is 'archived', show deleted quizzes instead
      if (status === 'archived') {
        query = query.not('deleted_at', 'is', null); // Show only deleted
      } else {
        query = query.eq('status', status);
      }
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

    // ✅ TRANSFORM DATA TO INCLUDE QUESTION COUNT
    // Supabase returns quiz_questions as array with count, extract it
    const transformedData = data?.map((quiz) => ({
      ...quiz,
      question_count: quiz.quiz_questions?.[0]?.count || 0,
      quiz_questions: undefined, // Remove the nested array
    }));

    return {
      data: transformedData,
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
   * @param quizId - The quiz ID
   * @param currentUserId - Optional user ID to filter student attempts (for students, shows only their attempts)
   */
  async findQuizById(quizId: string, currentUserId?: string): Promise<Quiz> {
    const supabase = this.supabaseService.getClient();

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        quiz_questions (
          *,
          quiz_choices (*),
          quiz_question_metadata (*)
        ),
        quiz_settings (*),
        quiz_attempts!quiz_attempts_quiz_id_fkey (
          attempt_id,
          student_id,
          status,
          started_at,
          submitted_at
        )
      `,
      )
      .eq('quiz_id', quizId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Quiz not found');
      }
      this.logger.error('Error fetching quiz:', error);
      throw new InternalServerErrorException('Failed to fetch quiz');
    }

    // ✅ CHECK IF QUIZ IS SOFT-DELETED
    if (quiz && quiz.deleted_at) {
      throw new NotFoundException('Quiz has been deleted');
    }

    // Rename quiz_questions to questions for consistency with frontend
    if (quiz && quiz.quiz_questions) {
      quiz.questions = quiz.quiz_questions;
      delete quiz.quiz_questions;
    }

    // ✅ Extract and flatten quiz_question_metadata for easier frontend access
    if (quiz && quiz.questions) {
      this.logger.log(
        `[MATCHING DEBUG] Processing ${quiz.questions.length} questions for metadata extraction`,
      );

      quiz.questions = quiz.questions.map((question: any) => {
        this.logger.log(
          `[MATCHING DEBUG] Question ${question.question_id} (${question.question_type}):`,
        );
        this.logger.log(
          `[MATCHING DEBUG]   - quiz_question_metadata present: ${!!question.quiz_question_metadata}`,
        );

        if (question.quiz_question_metadata) {
          this.logger.log(
            `[MATCHING DEBUG]   - quiz_question_metadata is array: ${Array.isArray(question.quiz_question_metadata)}`,
          );
          this.logger.log(
            `[MATCHING DEBUG]   - quiz_question_metadata type: ${typeof question.quiz_question_metadata}`,
          );
        }

        // ✅ FIX: Handle both array and object formats from Supabase
        let metadataRecord: any = null;

        if (question.quiz_question_metadata) {
          if (Array.isArray(question.quiz_question_metadata)) {
            // Array format: take first item
            metadataRecord = question.quiz_question_metadata[0];
            this.logger.log(
              `[MATCHING DEBUG]   - Array format, length: ${question.quiz_question_metadata.length}`,
            );
          } else if (typeof question.quiz_question_metadata === 'object') {
            // Object format: use it directly
            metadataRecord = question.quiz_question_metadata;
            this.logger.log(
              `[MATCHING DEBUG]   - Object format (single record)`,
            );
          }
        }

        if (metadataRecord && metadataRecord.metadata) {
          question.metadata = metadataRecord.metadata;
          this.logger.log(
            `[MATCHING DEBUG]   - ✅ Extracted metadata:`,
            JSON.stringify(question.metadata, null, 2),
          );
          delete question.quiz_question_metadata;
        } else {
          this.logger.warn(
            `[MATCHING DEBUG]   - ⚠️ No metadata found for this question`,
          );
        }

        // ✅ Convert snake_case image fields to camelCase for frontend
        // Keep BOTH formats for backward compatibility with student quiz components
        if (question.question_image_id) {
          question.questionImageId = question.question_image_id;
          question.questionImageUrl = question.question_image_url;
          question.questionImageFileSize = question.question_image_file_size;
          question.questionImageMimeType = question.question_image_mime_type;
          // Keep snake_case fields too (student quiz components use these)
        }

        // ✅ Build choiceImages array from quiz_choices for frontend
        // Frontend expects: choiceImages = [{ imageId, imageUrl, fileSize, mimeType }, ...]
        if (question.quiz_choices && Array.isArray(question.quiz_choices)) {
          question.choiceImages = question.quiz_choices.map((choice: any) => {
            if (choice.choice_image_id) {
              return {
                imageId: choice.choice_image_id,
                imageUrl: choice.choice_image_url,
                fileSize: choice.choice_image_file_size,
                mimeType: choice.choice_image_mime_type,
              };
            }
            return {}; // Empty object if no image
          });

          // Keep snake_case fields in choices for student quiz components
          // (they access choice.choice_image_url directly)
        }

        return question;
      });
    }

    // ✅ Extract quiz_settings from array to single object
    if (quiz && quiz.quiz_settings && Array.isArray(quiz.quiz_settings)) {
      quiz.settings = quiz.quiz_settings[0] || null;
      delete quiz.quiz_settings;
    }

    // ✅ Rename quiz_attempts to student_attempts for frontend clarity
    // Filter to current user's attempts if currentUserId provided (for students)
    if (quiz && quiz.quiz_attempts) {
      if (currentUserId) {
        // Student view: only show their own attempts
        quiz.student_attempts = quiz.quiz_attempts.filter(
          (attempt: any) => attempt.student_id === currentUserId,
        );
      } else {
        // Teacher/Admin view: show all attempts
        quiz.student_attempts = quiz.quiz_attempts;
      }
      delete quiz.quiz_attempts;
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

    // Check if this is ONLY a status change (no other fields being updated)
    const isOnlyStatusChange =
      updateQuizDto.status && Object.keys(updateQuizDto).length === 1;

    // Check if quiz is published and has active attempts
    // BUT: Skip version creation if we're only changing status (allow status changes without duplication)
    if (quiz.status === 'published' && !isOnlyStatusChange) {
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
        ...(updateQuizDto.status && {
          status: updateQuizDto.status,
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
      throw new ForbiddenException(
        'You can only create versions of your own quizzes',
      );
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

    // Soft delete by setting status to archived and recording deletion metadata
    const { error } = await supabase
      .from('quizzes')
      .update({
        status: 'archived',
        deleted_at: new Date().toISOString(),
        deleted_by: teacherId,
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

    // Calculate correct_answer from choices
    let correctAnswer: any = null;
    if (createQuestionDto.choices && createQuestionDto.choices.length > 0) {
      const correctChoices = createQuestionDto.choices.filter(
        (c) => c.isCorrect,
      );
      if (correctChoices.length === 1) {
        // Single correct answer - store the text or index
        correctAnswer = correctChoices[0].choiceText;
      } else if (correctChoices.length > 1) {
        // Multiple correct answers - store as array
        correctAnswer = correctChoices.map((c) => c.choiceText);
      }
    }

    // Create question
    const questionData: any = {
      quiz_id: quizId,
      question_text: createQuestionDto.questionText,
      question_type: createQuestionDto.questionType,
      description: createQuestionDto.description,
      is_required: createQuestionDto.isRequired ?? false,
      is_randomize: createQuestionDto.isRandomize ?? false,
      order_index: createQuestionDto.orderIndex,
      points: createQuestionDto.points || 1,
      allow_partial_credit: createQuestionDto.allowPartialCredit || false,
      time_limit_seconds: createQuestionDto.timeLimitSeconds,
      is_pool_question: createQuestionDto.isPoolQuestion || false,
      correct_answer: correctAnswer, // Store correct answer in quiz_questions table
      // Fill-in-blank sensitivity settings
      case_sensitive: createQuestionDto.caseSensitive ?? false,
      whitespace_sensitive: createQuestionDto.whitespaceSensitive ?? false,
      // ============================================================================
      // Image Support Fields (Cloudflare Images)
      // ============================================================================
      question_image_id: createQuestionDto.questionImageId || null,
      question_image_url: createQuestionDto.questionImageUrl || null,
      question_image_file_size: createQuestionDto.questionImageFileSize || null,
      question_image_mime_type: createQuestionDto.questionImageMimeType || null,
    };

    // Only include source_question_bank_id if it's provided and not null
    if (createQuestionDto.sourceQuestionBankId) {
      questionData.source_question_bank_id =
        createQuestionDto.sourceQuestionBankId;
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

    // ✅ AUTO-CREATE: Generate True/False choices if none provided for true_false questions
    if (
      createQuestionDto.questionType === 'true_false' &&
      (!createQuestionDto.choices || createQuestionDto.choices.length === 0)
    ) {
      this.logger.log(
        `Auto-creating True/False choices for question ${question.question_id}`,
      );

      const trueFalseChoices = [
        {
          question_id: question.question_id,
          choice_text: 'True',
          is_correct: false, // Teacher needs to set correct answer later
          order_index: 0,
          metadata: null,
        },
        {
          question_id: question.question_id,
          choice_text: 'False',
          is_correct: false,
          order_index: 1,
          metadata: null,
        },
      ];

      const { error: autoChoicesError } = await supabase
        .from('quiz_choices')
        .insert(trueFalseChoices);

      if (autoChoicesError) {
        this.logger.error(
          'Error auto-creating True/False choices:',
          autoChoicesError,
        );
        // Don't fail the whole operation - question is still created
      }
    }

    // Create choices if provided
    if (createQuestionDto.choices && createQuestionDto.choices.length > 0) {
      const choicesToInsert = createQuestionDto.choices.map((choice) => ({
        question_id: question.question_id,
        choice_text: choice.choiceText,
        is_correct: choice.isCorrect || false,
        order_index: choice.orderIndex,
        metadata: choice.metadata,
        // ============================================================================
        // Image Support Fields (Cloudflare Images)
        // ============================================================================
        choice_image_id: choice.choiceImageId || null,
        choice_image_url: choice.choiceImageUrl || null,
        choice_image_file_size: choice.choiceImageFileSize || null,
        choice_image_mime_type: choice.choiceImageMimeType || null,
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
      // 🔍 DIAGNOSTIC: Log metadata being saved
      this.logger.log(
        `[MATCHING DEBUG] Saving metadata for question type: ${createQuestionDto.questionType}`,
      );
      this.logger.log(
        `[MATCHING DEBUG] Metadata content:`,
        JSON.stringify(createQuestionDto.metadata, null, 2),
      );

      const metadataType = this.getMetadataType(createQuestionDto.questionType);
      this.logger.log(`[MATCHING DEBUG] Metadata type: ${metadataType}`);

      const { error: metadataError } = await supabase
        .from('quiz_question_metadata')
        .insert({
          question_id: question.question_id,
          metadata_type: metadataType,
          metadata: createQuestionDto.metadata,
        });

      if (metadataError) {
        this.logger.error(
          '[MATCHING DEBUG] ❌ Error creating question metadata:',
          metadataError,
        );
      } else {
        this.logger.log(
          `[MATCHING DEBUG] ✅ Metadata saved successfully for question ${question.question_id}`,
        );
      }
    } else {
      this.logger.warn(
        `[MATCHING DEBUG] ⚠️ No metadata provided for question type: ${createQuestionDto.questionType}`,
      );
    }

    // Recalculate total points for the quiz
    await this.recalculateTotalPoints(quizId);

    this.logger.log(`Question added to quiz ${quizId}`);
    return question;
  }

  /**
   * Update a question in a quiz
   */
  async updateQuestion(
    quizId: string,
    questionId: string,
    updateQuestionDto: CreateQuizQuestionDto,
    teacherId: string,
  ): Promise<QuizQuestion> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only update questions in your own quizzes',
      );
    }

    // 🔍 DIAGNOSTIC: Log incoming data for true/false questions
    if (updateQuestionDto.questionType === 'true_false') {
      this.logger.log(`[TRUE_FALSE] Update question ${questionId}:`);
      this.logger.log(`  - Choices provided: ${!!updateQuestionDto.choices}`);
      this.logger.log(
        `  - Choices length: ${updateQuestionDto.choices?.length || 0}`,
      );
      if (updateQuestionDto.choices && updateQuestionDto.choices.length > 0) {
        updateQuestionDto.choices.forEach((c, i) => {
          this.logger.log(
            `  - Choice ${i}: "${c.choiceText}" isCorrect=${c.isCorrect}`,
          );
        });
      }
    }

    // Calculate correct_answer from choices
    let correctAnswer: any = null;
    if (updateQuestionDto.choices && updateQuestionDto.choices.length > 0) {
      const correctChoices = updateQuestionDto.choices.filter(
        (c) => c.isCorrect,
      );
      if (correctChoices.length === 1) {
        // Single correct answer - store the text
        correctAnswer = correctChoices[0].choiceText;
      } else if (correctChoices.length > 1) {
        // Multiple correct answers - store as array
        correctAnswer = correctChoices.map((c) => c.choiceText);
      }
    }

    // 🔍 DIAGNOSTIC: Log calculated correct answer
    if (updateQuestionDto.questionType === 'true_false') {
      this.logger.log(
        `  - Calculated correct_answer: ${JSON.stringify(correctAnswer)}`,
      );
    }

    // Update question
    const questionData: any = {
      question_text: updateQuestionDto.questionText,
      question_type: updateQuestionDto.questionType,
      description: updateQuestionDto.description,
      is_required: updateQuestionDto.isRequired ?? false,
      is_randomize: updateQuestionDto.isRandomize ?? false,
      order_index: updateQuestionDto.orderIndex,
      points: updateQuestionDto.points || 1,
      allow_partial_credit: updateQuestionDto.allowPartialCredit || false,
      time_limit_seconds: updateQuestionDto.timeLimitSeconds,
      is_pool_question: updateQuestionDto.isPoolQuestion || false,
      correct_answer: correctAnswer, // Store correct answer in quiz_questions table
      // Fill-in-blank sensitivity settings
      case_sensitive: updateQuestionDto.caseSensitive ?? false,
      whitespace_sensitive: updateQuestionDto.whitespaceSensitive ?? false,
      // ============================================================================
      // Image Support Fields (Cloudflare Images)
      // ============================================================================
      question_image_id: updateQuestionDto.questionImageId || null,
      question_image_url: updateQuestionDto.questionImageUrl || null,
      question_image_file_size: updateQuestionDto.questionImageFileSize || null,
      question_image_mime_type: updateQuestionDto.questionImageMimeType || null,
      updated_at: new Date().toISOString(),
    };

    // 🔍 DIAGNOSTIC: Log orderIndex value being updated
    this.logger.log(
      `[ORDER_INDEX] Updating question ${questionId}: orderIndex=${updateQuestionDto.orderIndex}`,
    );

    if (updateQuestionDto.sourceQuestionBankId) {
      questionData.source_question_bank_id =
        updateQuestionDto.sourceQuestionBankId;
    }

    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .update(questionData)
      .eq('question_id', questionId)
      .select()
      .single();

    if (questionError) {
      this.logger.error('Error updating question:', questionError);
      throw new InternalServerErrorException('Failed to update question');
    }

    // 🔍 DIAGNOSTIC: Log the actual order_index saved to database
    this.logger.log(
      `[ORDER_INDEX] Question ${questionId} updated successfully. DB order_index=${question.order_index}`,
    );

    // ✅ AUTO-CREATE: Generate True/False choices if none provided for true_false questions
    if (
      updateQuestionDto.questionType === 'true_false' &&
      (!updateQuestionDto.choices || updateQuestionDto.choices.length === 0)
    ) {
      this.logger.warn(
        `[TRUE_FALSE] ⚠️ AUTO-CREATING True/False choices for question ${questionId} - NO CHOICES PROVIDED BY FRONTEND!`,
      );
      this.logger.warn(
        `[TRUE_FALSE] ⚠️ This will RESET both choices to is_correct=false!`,
      );

      // Delete old choices first
      const { error: deleteError } = await supabase
        .from('quiz_choices')
        .delete()
        .eq('question_id', questionId);

      if (deleteError) {
        this.logger.error(
          'Error deleting old True/False choices:',
          deleteError,
        );
        throw new InternalServerErrorException(
          'Failed to delete old True/False choices',
        );
      }

      const trueFalseChoices = [
        {
          question_id: questionId,
          choice_text: 'True',
          is_correct: false, // Teacher needs to set correct answer
          order_index: 0,
          metadata: null,
        },
        {
          question_id: questionId,
          choice_text: 'False',
          is_correct: false,
          order_index: 1,
          metadata: null,
        },
      ];

      const { error: autoChoicesError } = await supabase
        .from('quiz_choices')
        .insert(trueFalseChoices);

      if (autoChoicesError) {
        this.logger.error(
          'Error auto-creating True/False choices:',
          autoChoicesError,
        );
        // Don't fail the whole operation
      }
    }

    // Update choices - delete old ones and insert new ones
    if (updateQuestionDto.choices && updateQuestionDto.choices.length > 0) {
      // Delete old choices
      const { error: deleteError } = await supabase
        .from('quiz_choices')
        .delete()
        .eq('question_id', questionId);

      if (deleteError) {
        this.logger.error('Error deleting old choices:', deleteError);
        throw new InternalServerErrorException(
          'Failed to delete old choices before update',
        );
      }

      this.logger.log(
        `Deleted old choices for question ${questionId}, now inserting new ones`,
      );

      // Insert new choices
      const choicesToInsert = updateQuestionDto.choices.map((choice) => ({
        question_id: questionId,
        choice_text: choice.choiceText,
        is_correct: choice.isCorrect || false,
        order_index: choice.orderIndex,
        metadata: choice.metadata,
        // ============================================================================
        // Image Support Fields (Cloudflare Images)
        // ============================================================================
        choice_image_id: choice.choiceImageId || null,
        choice_image_url: choice.choiceImageUrl || null,
        choice_image_file_size: choice.choiceImageFileSize || null,
        choice_image_mime_type: choice.choiceImageMimeType || null,
      }));

      const { error: choicesError } = await supabase
        .from('quiz_choices')
        .insert(choicesToInsert);

      if (choicesError) {
        this.logger.error('Error updating choices:', choicesError);
        throw new InternalServerErrorException('Failed to update choices');
      }

      // 🔍 DIAGNOSTIC: Log successful choice insertion for true/false
      if (updateQuestionDto.questionType === 'true_false') {
        this.logger.log(
          `[TRUE_FALSE] ✅ Successfully saved ${choicesToInsert.length} choices:`,
        );
        choicesToInsert.forEach((c, i) => {
          this.logger.log(`  - "${c.choice_text}" is_correct=${c.is_correct}`);
        });
      }
    }

    // Update metadata if provided (for complex question types like fill-in-blank)
    if (updateQuestionDto.metadata) {
      // 🔍 DIAGNOSTIC: Log metadata being updated
      this.logger.log(
        `[MATCHING DEBUG] Updating metadata for question type: ${updateQuestionDto.questionType}`,
      );
      this.logger.log(
        `[MATCHING DEBUG] Metadata content:`,
        JSON.stringify(updateQuestionDto.metadata, null, 2),
      );

      // Delete old metadata first
      await supabase
        .from('quiz_question_metadata')
        .delete()
        .eq('question_id', questionId);

      const metadataType = this.getMetadataType(updateQuestionDto.questionType);
      this.logger.log(`[MATCHING DEBUG] Metadata type: ${metadataType}`);

      // Insert new metadata
      const { error: metadataError } = await supabase
        .from('quiz_question_metadata')
        .insert({
          question_id: questionId,
          metadata_type: metadataType,
          metadata: updateQuestionDto.metadata,
        });

      if (metadataError) {
        this.logger.error(
          '[MATCHING DEBUG] ❌ Error updating question metadata:',
          metadataError,
        );
      } else {
        this.logger.log(
          `[MATCHING DEBUG] ✅ Metadata updated successfully for question ${questionId}`,
        );
      }
    } else {
      this.logger.warn(
        `[MATCHING DEBUG] ⚠️ No metadata provided for question type: ${updateQuestionDto.questionType}`,
      );
    }

    // Recalculate total points for the quiz
    await this.recalculateTotalPoints(quizId);

    this.logger.log(`Question ${questionId} updated in quiz ${quizId}`);
    return question;
  }

  /**
   * Delete a question from a quiz
   */
  async deleteQuestion(
    quizId: string,
    questionId: string,
    teacherId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only delete questions from your own quizzes',
      );
    }

    // ============================================================================
    // Image Cleanup: Delete images from Cloudflare before deleting from database
    // ============================================================================

    // Fetch question to check for question image
    const { data: question } = await supabase
      .from('quiz_questions')
      .select('question_image_id')
      .eq('question_id', questionId)
      .single();

    // Delete question image from Cloudflare if it exists
    if (question?.question_image_id) {
      this.logger.log(
        `Deleting question image from Cloudflare: ${question.question_image_id}`,
      );
      await this.cloudflareImagesService.deleteImage(
        question.question_image_id,
      );
    }

    // Fetch all choices to check for choice images
    const { data: choices } = await supabase
      .from('quiz_choices')
      .select('choice_id, choice_image_id')
      .eq('question_id', questionId);

    // Delete all choice images from Cloudflare
    if (choices && choices.length > 0) {
      for (const choice of choices) {
        if (choice.choice_image_id) {
          this.logger.log(
            `Deleting choice image from Cloudflare: ${choice.choice_image_id}`,
          );
          await this.cloudflareImagesService.deleteImage(
            choice.choice_image_id,
          );
        }
      }
    }

    // ============================================================================
    // Database Cleanup: Delete question and related data
    // ============================================================================

    // Delete choices first (cascade may not be set up)
    await supabase.from('quiz_choices').delete().eq('question_id', questionId);

    // Delete question metadata
    await supabase
      .from('quiz_question_metadata')
      .delete()
      .eq('question_id', questionId);

    // Delete question
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('question_id', questionId);

    if (error) {
      this.logger.error('Error deleting question:', error);
      throw new InternalServerErrorException('Failed to delete question');
    }

    // Recalculate total points for the quiz
    await this.recalculateTotalPoints(quizId);

    this.logger.log(`Question ${questionId} deleted from quiz ${quizId}`);
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
        .upsert(sectionsToInsert, {
          onConflict: 'quiz_id,section_id',
        });

      if (sectionsError) {
        this.logger.error('Error assigning quiz to sections:', sectionsError);
        throw new InternalServerErrorException(
          'Failed to assign quiz to sections',
        );
      }
    }

    this.logger.log(
      `Quiz published: ${quizId} with status ${publishDto.status}`,
    );

    // Notify students in assigned sections about published quiz
    try {
      // ✅ Get all assigned sections (from publishDto OR already assigned in quiz_sections)
      let sectionIdsToNotify: string[] = [];

      if (publishDto.sectionIds && publishDto.sectionIds.length > 0) {
        sectionIdsToNotify = publishDto.sectionIds;
      } else {
        // Fetch already assigned sections from quiz_sections table
        const { data: assignedSections } = await supabase
          .from('quiz_sections')
          .select('section_id')
          .eq('quiz_id', quizId);

        if (assignedSections && assignedSections.length > 0) {
          sectionIdsToNotify = assignedSections.map((s) => s.section_id);
        }
      }

      if (sectionIdsToNotify.length > 0) {
        const userIds: string[] = [];
        for (const sectionId of sectionIdsToNotify) {
          const { data: students } = await supabase
            .from('students')
            .select('user_id')
            .eq('section_id', sectionId);
          if (students) {
            const studentUserIds = students
              .map((s) => s.user_id)
              .filter((id) => id);
            userIds.push(...studentUserIds);
          }
        }

        // Activity monitoring - notify assigned students
        if (userIds.length > 0) {
          try {
            await this.activityMonitoring.handleQuizPublished(
              quizId,
              quiz.title,
              userIds,
              teacherId,
            );
          } catch (error) {
            this.logger.warn(
              'Failed to handle quiz publication activity monitoring:',
              error,
            );
          }
        }

        if (userIds.length > 0) {
          await this.notificationService.notifyUsers(
            userIds,
            `New Quiz: ${quiz.title}`,
            `A new quiz "${quiz.title}" has been published and is now available.`,
            NotificationType.INFO,
            teacherId,
            { expiresInDays: 7 },
          );
          this.logger.log(
            `✅ Sent notifications to ${userIds.length} students in ${sectionIdsToNotify.length} sections`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notifications for quiz publication:',
        error,
      );
    }

    return updatedQuiz;
  }

  /**
   * Schedule a quiz for future availability
   * ✅ STRICT VALIDATION: Start date must be in future, end date after start
   */
  async scheduleQuiz(
    quizId: string,
    scheduleData: {
      startDate: string;
      endDate?: string;
      sectionIds: string[];
      sectionSettings?: Record<string, { timeLimit?: number }>;
    },
    teacherId: string,
  ): Promise<Quiz> {
    const supabase = this.supabaseService.getServiceClient();

    // 1. Verify ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only schedule your own quizzes');
    }

    // 2. ✅ VALIDATE DATES
    const now = new Date();
    const startDateTime = new Date(scheduleData.startDate);

    // Start date must be in the future
    if (startDateTime <= now) {
      throw new BadRequestException(
        'Start date must be in the future. Cannot schedule quiz for past dates.',
      );
    }

    // If end date provided, it must be after start date
    if (scheduleData.endDate) {
      const endDateTime = new Date(scheduleData.endDate);
      if (endDateTime <= startDateTime) {
        throw new BadRequestException('End date must be after start date.');
      }
    }

    // 3. Validate sections
    if (!scheduleData.sectionIds || scheduleData.sectionIds.length === 0) {
      throw new BadRequestException(
        'At least one section must be selected to schedule the quiz.',
      );
    }

    // 4. Update quiz status and dates
    const { data: updatedQuiz, error } = await supabase
      .from('quizzes')
      .update({
        status: 'scheduled',
        start_date: scheduleData.startDate,
        end_date: scheduleData.endDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('quiz_id', quizId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error scheduling quiz:', error);
      throw new InternalServerErrorException('Failed to schedule quiz');
    }

    // 5. Assign to sections with optional overrides
    await this.assignQuizToSections(
      quizId,
      scheduleData.sectionIds,
      teacherId,
      {
        startDate: scheduleData.startDate,
        endDate: scheduleData.endDate,
        sectionSettings: scheduleData.sectionSettings,
      },
    );

    this.logger.log(`Quiz scheduled: ${quizId} for ${scheduleData.startDate}`);

    // Notify students in assigned sections about scheduled quiz
    try {
      if (scheduleData.sectionIds && scheduleData.sectionIds.length > 0) {
        const userIds: string[] = [];
        for (const sectionId of scheduleData.sectionIds) {
          const { data: students } = await supabase
            .from('students')
            .select('user_id')
            .eq('section_id', sectionId);
          if (students) {
            const studentUserIds = students
              .map((s) => s.user_id)
              .filter((id) => id);
            userIds.push(...studentUserIds);
          }
        }

        if (userIds.length > 0) {
          const startDate = new Date(
            scheduleData.startDate,
          ).toLocaleDateString();
          await this.notificationService.notifyUsers(
            userIds,
            `Quiz Scheduled: ${quiz.title}`,
            `A quiz "${quiz.title}" has been scheduled and will be available starting ${startDate}.`,
            NotificationType.INFO,
            teacherId,
            { expiresInDays: 7 },
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notifications for quiz scheduling:',
        error,
      );
    }

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
        // Security features (new names)
        secured_quiz: settingsDto.securedQuiz ?? false,
        quiz_lockdown: settingsDto.quizLockdown ?? false,
        anti_screenshot: settingsDto.antiScreenshot ?? false,
        disable_copy_paste: settingsDto.disableCopyPaste ?? false,
        disable_right_click: settingsDto.disableRightClick ?? false,
        lockdown_ui: settingsDto.lockdownUi ?? false,

        // Monitoring (existing)
        track_tab_switches: settingsDto.trackTabSwitches !== false,
        track_device_changes: settingsDto.trackDeviceChanges !== false,
        track_ip_changes: settingsDto.trackIpChanges !== false,
        tab_switch_warning_threshold:
          settingsDto.tabSwitchWarningThreshold || 3,

        // Question pool
        question_pool: settingsDto.questionPool ?? false,
        stratified_sampling: settingsDto.stratifiedSampling ?? false,
        total_questions: settingsDto.totalQuestions,
        pool_size: settingsDto.poolSize,

        // Behavior
        strict_time_limit: settingsDto.strictTimeLimit ?? false,
        auto_save: settingsDto.autoSave ?? true,
        backtracking_control: settingsDto.backtrackingControl ?? false,

        // Other
        access_code: settingsDto.accessCode,
        publish_mode: settingsDto.publishMode ?? 'immediate',
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

    // Check if quiz is published or scheduled (scheduled quizzes can be assigned to sections)
    if (quiz.status !== 'published' && quiz.status !== 'scheduled') {
      throw new BadRequestException(
        'Quiz must be published or scheduled before assigning to sections',
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
    if (
      overrides &&
      (overrides.startDate || overrides.endDate || overrides.timeLimit)
    ) {
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
        this.logger.error(
          'Error setting section-specific settings:',
          settingsError,
        );
        throw new InternalServerErrorException(
          'Failed to set section-specific settings',
        );
      }
    }

    this.logger.log(
      `Quiz ${quizId} assigned to ${sectionIds.length} section(s)`,
    );

    // Notify students in assigned sections about quiz assignment
    try {
      const userIds: string[] = [];
      for (const sectionId of sectionIds) {
        const { data: students } = await supabase
          .from('students')
          .select('user_id')
          .eq('section_id', sectionId);
        if (students) {
          const studentUserIds = students
            .map((s) => s.user_id)
            .filter((id) => id);
          userIds.push(...studentUserIds);
        }
      }

      if (userIds.length > 0) {
        await this.notificationService.notifyUsers(
          userIds,
          `Quiz Assigned: ${quiz.title}`,
          `A quiz "${quiz.title}" has been assigned to your section.`,
          NotificationType.INFO,
          teacherId,
          { expiresInDays: 7 },
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notifications for quiz assignment:',
        error,
      );
    }
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
    await supabase.from('quiz_section_settings').delete().eq('quiz_id', quizId);

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

    // ✅ FILTER OUT SOFT-DELETED QUIZZES
    // Students should never see deleted quizzes
    query = query.is('deleted_at', null);

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
      throw new InternalServerErrorException(
        'Failed to fetch available quizzes',
      );
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

          await supabase
            .from('quiz_question_metadata')
            .insert(metadataToInsert);
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
        tab_switch_warning_threshold:
          originalSettings.tab_switch_warning_threshold,
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
      .select(
        `
        *,
        quiz_choices (*)
      `,
      )
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
   * Import question from question bank to quiz
   */
  async importQuestionFromBank(
    quizId: string,
    questionBankId: string,
    orderIndex: number | undefined,
    teacherId: string,
  ): Promise<QuizQuestion> {
    const supabase = this.supabaseService.getServiceClient();

    // 1. Verify quiz ownership
    const quiz = await this.findQuizById(quizId);
    if (quiz.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only import questions to your own quizzes',
      );
    }

    // 2. Fetch question from bank
    const { data: bankQuestion, error: fetchError } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', questionBankId)
      .single();

    if (fetchError || !bankQuestion) {
      this.logger.error('Error fetching question from bank:', fetchError);
      throw new NotFoundException('Question not found in question bank');
    }

    // 3. Verify teacher owns the question
    if (bankQuestion.teacher_id !== teacherId) {
      throw new ForbiddenException('You can only import your own questions');
    }

    // 4. Determine order index (if not provided, add to end)
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const { count } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quizId);
      finalOrderIndex = count || 0;
    }

    // 🔍 DIAGNOSTIC: Log what we're importing
    this.logger.log(`[IMPORT] Importing question from bank ${questionBankId}:`);
    this.logger.log(`  - Question: "${bankQuestion.question_text}"`);
    this.logger.log(`  - Type: ${bankQuestion.question_type}`);
    this.logger.log(`  - Points: ${bankQuestion.default_points}`);
    this.logger.log(`  - Time limit: ${bankQuestion.time_limit_seconds}s`);
    this.logger.log(`  - Has explanation: ${!!bankQuestion.explanation}`);
    this.logger.log(
      `  - Correct answer: ${JSON.stringify(bankQuestion.correct_answer)}`,
    );
    this.logger.log(`  - Has choices: ${!!bankQuestion.choices}`);
    if (bankQuestion.choices) {
      this.logger.log(`  - Number of choices: ${bankQuestion.choices.length}`);
    }

    // 5. Create quiz question from bank question
    const { data: quizQuestion, error: insertError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_text: bankQuestion.question_text,
        question_type: bankQuestion.question_type,
        description: bankQuestion.explanation || null, // ✅ Map explanation → description
        order_index: finalOrderIndex,
        points: bankQuestion.default_points,
        allow_partial_credit: bankQuestion.allow_partial_credit,
        time_limit_seconds: bankQuestion.time_limit_seconds,
        correct_answer: bankQuestion.correct_answer, // ✅ Already copies correct answer
        source_question_bank_id: questionBankId, // Track source!
      })
      .select()
      .single();

    if (insertError) {
      this.logger.error('Error importing question:', insertError);
      throw new InternalServerErrorException('Failed to import question');
    }

    // 6. Copy choices if they exist in JSONB format
    if (bankQuestion.choices && Array.isArray(bankQuestion.choices)) {
      const choicesToInsert = bankQuestion.choices.map(
        (choice: any, index: number) => ({
          question_id: quizQuestion.question_id,
          choice_text: choice.text || choice.choice_text,
          is_correct: choice.is_correct || false,
          order_index: index,
          metadata: choice.metadata || null,
        }),
      );

      this.logger.log(`[IMPORT] Inserting ${choicesToInsert.length} choices:`);
      choicesToInsert.forEach((c, i) => {
        this.logger.log(
          `  - Choice ${i}: "${c.choice_text}" is_correct=${c.is_correct}`,
        );
      });

      const { error: choicesError } = await supabase
        .from('quiz_choices')
        .insert(choicesToInsert);

      if (choicesError) {
        this.logger.error('[IMPORT] Error importing choices:', choicesError);
        // Don't fail the entire import, choices can be added later
      } else {
        this.logger.log(
          `[IMPORT] ✅ Successfully imported ${choicesToInsert.length} choices`,
        );
      }
    } else {
      this.logger.warn(
        '[IMPORT] ⚠️ No choices to import (choices field missing or not an array)',
      );
    }

    // Recalculate total points for the quiz
    await this.recalculateTotalPoints(quizId);

    this.logger.log(
      `Question imported from bank: ${questionBankId} → ${quizQuestion.question_id}`,
    );
    return quizQuestion;
  }

  /**
   * Helper: Recalculate and update total_points for a quiz
   */
  private async recalculateTotalPoints(quizId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Sum all points from quiz questions
      const { data: questions, error } = await supabase
        .from('quiz_questions')
        .select('points')
        .eq('quiz_id', quizId);

      if (error) {
        this.logger.error(
          `Error fetching questions for total points calculation:`,
          error,
        );
        return;
      }

      const totalPoints =
        questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

      // Update quiz with calculated total_points
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ total_points: totalPoints })
        .eq('quiz_id', quizId);

      if (updateError) {
        this.logger.error(
          `Error updating total_points for quiz ${quizId}:`,
          updateError,
        );
      } else {
        this.logger.log(
          `Total points recalculated for quiz ${quizId}: ${totalPoints}`,
        );
      }
    } catch (error) {
      this.logger.error(`Exception in recalculateTotalPoints:`, error);
    }
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
