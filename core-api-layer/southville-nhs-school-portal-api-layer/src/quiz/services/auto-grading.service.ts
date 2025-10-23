import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface GradingResult {
  isCorrect: boolean | null; // null for manual grading
  pointsAwarded: number;
  feedback?: string;
}

@Injectable()
export class AutoGradingService {
  private readonly logger = new Logger(AutoGradingService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Grade a single student answer automatically
   */
  async gradeAnswer(
    questionId: string,
    studentAnswer: {
      choiceId?: string;
      choiceIds?: string[];
      answerText?: string;
      answerJson?: any;
    },
  ): Promise<GradingResult> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // ===== DEBUG LOGGING =====
      this.logger.debug(`🔍 Attempting to grade question: ${questionId}`);
      this.logger.debug(`📝 Student answer: ${JSON.stringify(studentAnswer)}`);

      // Get question details
      const { data: question, error: questionError } = await supabase
        .from('quiz_questions')
        .select('question_id, question_type, points')
        .eq('question_id', questionId)
        .single();

      // ===== DEBUG LOGGING =====
      this.logger.debug(`📊 Query result - Data: ${JSON.stringify(question)}`);
      this.logger.debug(
        `❌ Query result - Error: ${JSON.stringify(questionError)}`,
      );

      if (questionError || !question) {
        this.logger.error(`❌ FAILED to find question ${questionId}`);
        this.logger.error(`Error details: ${JSON.stringify(questionError)}`);
        throw new InternalServerErrorException(
          `Question not found: ${questionId}`,
        );
      }

      this.logger.debug(`✅ Found question: ${question.question_type}`);
      // ===== END DEBUG LOGGING =====

      // Route to appropriate grading method based on question type
      switch (question.question_type) {
        case 'multiple_choice':
          return await this.gradeMultipleChoice(
            questionId,
            studentAnswer.choiceId,
            question.points,
          );

        case 'true_false':
          return await this.gradeTrueFalse(
            questionId,
            studentAnswer.choiceId,
            question.points,
          );

        case 'checkbox':
          return await this.gradeCheckbox(
            questionId,
            studentAnswer.choiceIds || [],
            question.points,
          );

        case 'fill_in_blank':
          return await this.gradeFillInBlank(
            questionId,
            studentAnswer.answerText || '',
            question.points,
          );

        case 'short_answer':
          return await this.gradeShortAnswer(
            questionId,
            studentAnswer.answerText || '',
            question.points,
          );

        case 'matching':
          return await this.gradeMatching(
            questionId,
            studentAnswer.answerJson,
            question.points,
          );

        case 'ordering':
          return await this.gradeOrdering(
            questionId,
            studentAnswer.answerJson,
            question.points,
          );

        // Essay, file upload, code require manual grading
        case 'essay':
        case 'file_upload':
        case 'code':
          return {
            isCorrect: null,
            pointsAwarded: 0,
            feedback: 'Awaiting manual grading',
          };

        default:
          return {
            isCorrect: null,
            pointsAwarded: 0,
            feedback: 'Unknown question type',
          };
      }
    } catch (error) {
      this.logger.error('Error grading answer:', error);
      throw new InternalServerErrorException('Failed to grade answer');
    }
  }

  /**
   * Grade multiple choice question
   */
  private async gradeMultipleChoice(
    questionId: string,
    studentChoiceId?: string,
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    if (!studentChoiceId) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const supabase = this.supabaseService.getServiceClient();

    const { data: choice, error } = await supabase
      .from('quiz_choices')
      .select('is_correct')
      .eq('choice_id', studentChoiceId)
      .eq('question_id', questionId)
      .single();

    if (error || !choice) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    return {
      isCorrect: choice.is_correct,
      pointsAwarded: choice.is_correct ? maxPoints : 0,
    };
  }

  /**
   * Grade true/false question
   */
  private async gradeTrueFalse(
    questionId: string,
    studentChoiceId?: string,
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    // True/False is the same as multiple choice with 2 options
    return await this.gradeMultipleChoice(
      questionId,
      studentChoiceId,
      maxPoints,
    );
  }

  /**
   * Grade checkbox (multiple select) question
   * All-or-nothing scoring: all correct answers must be selected, no incorrect answers
   */
  private async gradeCheckbox(
    questionId: string,
    studentChoiceIds: string[],
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    const supabase = this.supabaseService.getServiceClient();

    // Get all choices for this question
    const { data: allChoices, error } = await supabase
      .from('quiz_choices')
      .select('choice_id, is_correct')
      .eq('question_id', questionId);

    if (error || !allChoices) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    // Get correct answer choice IDs
    const correctChoiceIds = allChoices
      .filter((c) => c.is_correct)
      .map((c) => c.choice_id);

    // Check if student selected exactly the correct answers
    const studentSet = new Set(studentChoiceIds);
    const correctSet = new Set(correctChoiceIds);

    // All-or-nothing: must match exactly
    const isCorrect =
      studentSet.size === correctSet.size &&
      [...studentSet].every((id) => correctSet.has(id));

    return {
      isCorrect,
      pointsAwarded: isCorrect ? maxPoints : 0,
    };
  }

  /**
   * Grade fill-in-blank question
   * Supports case-insensitive and multiple acceptable answers
   */
  private async gradeFillInBlank(
    questionId: string,
    studentAnswer: string,
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    if (!studentAnswer) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    // Fetch correct answer from database
    const supabase = this.supabaseService.getClient();
    const { data: choices, error } = await supabase
      .from('quiz_choices')
      .select('*')
      .eq('question_id', questionId)
      .eq('is_correct', true);

    if (error || !choices || choices.length === 0) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const correctAnswer = choices[0].choice_text;
    const caseSensitive = false; // Default to case-insensitive
    const acceptableAnswers = Array.isArray(correctAnswer)
      ? correctAnswer
      : [correctAnswer];

    // Normalize answers
    const normalizedStudent = caseSensitive
      ? studentAnswer.trim()
      : studentAnswer.trim().toLowerCase();

    const isCorrect = acceptableAnswers.some((answer) => {
      const normalizedCorrect = caseSensitive
        ? answer.trim()
        : answer.trim().toLowerCase();
      return normalizedStudent === normalizedCorrect;
    });

    return {
      isCorrect,
      pointsAwarded: isCorrect ? maxPoints : 0,
    };
  }

  /**
   * Grade short answer question
   * Uses keyword matching or exact match based on settings
   */
  private async gradeShortAnswer(
    questionId: string,
    studentAnswer: string,
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    if (!studentAnswer) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    // Fetch correct answer from database
    const supabase = this.supabaseService.getClient();
    const { data: choices, error } = await supabase
      .from('quiz_choices')
      .select('*')
      .eq('question_id', questionId)
      .eq('is_correct', true);

    if (error || !choices || choices.length === 0) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const correctAnswer = choices[0].choice_text;
    const gradingMethod = 'keywords'; // Default to keyword matching

    if (gradingMethod === 'keywords') {
      // Keyword-based grading
      const keywords = Array.isArray(correctAnswer)
        ? correctAnswer
        : [correctAnswer];
      const caseSensitive = false; // Default to case-insensitive

      const normalizedAnswer = caseSensitive
        ? studentAnswer
        : studentAnswer.toLowerCase();

      // Count matched keywords
      let matchedCount = 0;
      keywords.forEach((keyword) => {
        const normalizedKeyword = caseSensitive
          ? keyword
          : keyword.toLowerCase();
        if (normalizedAnswer.includes(normalizedKeyword)) {
          matchedCount++;
        }
      });

      const requiredKeywords = keywords.length; // Require all keywords by default
      const isCorrect = matchedCount >= requiredKeywords;
      const partialCredit = false; // Default to no partial credit

      if (isCorrect) {
        return { isCorrect: true, pointsAwarded: maxPoints };
      } else if (partialCredit && matchedCount > 0) {
        const pointsAwarded = (matchedCount / keywords.length) * maxPoints;
        return {
          isCorrect: false,
          pointsAwarded: Math.round(pointsAwarded * 100) / 100,
          feedback: `Partial credit: ${matchedCount}/${keywords.length} keywords found`,
        };
      } else {
        return { isCorrect: false, pointsAwarded: 0 };
      }
    } else {
      // Default to manual grading
      return {
        isCorrect: null,
        pointsAwarded: 0,
        feedback: 'Awaiting manual grading',
      };
    }
  }

  /**
   * Grade matching question
   * Expects answerJson: { leftItemId: rightItemId, ... }
   */
  private async gradeMatching(
    questionId: string,
    studentAnswer: any,
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    if (!studentAnswer) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    // Fetch correct answer from database
    const supabase = this.supabaseService.getClient();
    const { data: choices, error } = await supabase
      .from('quiz_choices')
      .select('*')
      .eq('question_id', questionId)
      .eq('is_correct', true);

    if (error || !choices || choices.length === 0) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const correctAnswer = choices[0].metadata; // Matching answers are stored in metadata

    let matchedCount = 0;
    let totalPairs = 0;

    for (const [leftId, rightId] of Object.entries(correctAnswer)) {
      totalPairs++;
      if (studentAnswer[leftId] === rightId) {
        matchedCount++;
      }
    }

    const isCorrect = matchedCount === totalPairs;
    const pointsAwarded = (matchedCount / totalPairs) * maxPoints;

    return {
      isCorrect,
      pointsAwarded: Math.round(pointsAwarded * 100) / 100,
    };
  }

  /**
   * Grade ordering question
   * Expects answerJson: [id1, id2, id3, ...]
   */
  private async gradeOrdering(
    questionId: string,
    studentAnswer: any,
    maxPoints: number = 1,
  ): Promise<GradingResult> {
    if (!Array.isArray(studentAnswer)) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    // Fetch correct answer from database
    const supabase = this.supabaseService.getClient();
    const { data: choices, error } = await supabase
      .from('quiz_choices')
      .select('*')
      .eq('question_id', questionId)
      .eq('is_correct', true)
      .order('order_index');

    if (error || !choices || choices.length === 0) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    const correctAnswer = choices.map((choice) => choice.choice_id);

    if (studentAnswer.length !== correctAnswer.length) {
      return { isCorrect: false, pointsAwarded: 0 };
    }

    let correctCount = 0;
    for (let i = 0; i < correctAnswer.length; i++) {
      if (studentAnswer[i] === correctAnswer[i]) {
        correctCount++;
      }
    }

    const isCorrect = correctCount === correctAnswer.length;
    const pointsAwarded = (correctCount / correctAnswer.length) * maxPoints;

    return {
      isCorrect,
      pointsAwarded: Math.round(pointsAwarded * 100) / 100,
    };
  }

  /**
   * Grade all answers for a quiz attempt
   * Returns total score and updates quiz_student_answers table
   */
  async gradeQuizAttempt(attemptId: string): Promise<{
    totalScore: number;
    maxScore: number;
    gradedCount: number;
    manualGradingRequired: number;
  }> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get all student answers for this attempt
      const { data: answers, error: answersError } = await supabase
        .from('quiz_student_answers')
        .select(
          'answer_id, question_id, choice_id, choice_ids, answer_text, answer_json',
        )
        .eq('attempt_id', attemptId);

      if (answersError) {
        throw new InternalServerErrorException('Failed to fetch answers');
      }

      if (!answers || answers.length === 0) {
        return {
          totalScore: 0,
          maxScore: 0,
          gradedCount: 0,
          manualGradingRequired: 0,
        };
      }

      let totalScore = 0;
      let maxScore = 0;
      let gradedCount = 0;
      let manualGradingRequired = 0;

      // Grade each answer
      for (const answer of answers) {
        const gradingResult = await this.gradeAnswer(answer.question_id, {
          choiceId: answer.choice_id,
          choiceIds: answer.choice_ids,
          answerText: answer.answer_text,
          answerJson: answer.answer_json,
        });

        // Update answer with grading results
        const { error: updateError } = await supabase
          .from('quiz_student_answers')
          .update({
            is_correct: gradingResult.isCorrect,
            points_awarded: gradingResult.pointsAwarded,
            graded_at: new Date().toISOString(),
            grader_feedback: gradingResult.feedback,
          })
          .eq('answer_id', answer.answer_id);

        if (updateError) {
          this.logger.error('Error updating answer:', updateError);
        }

        // Get question points for max score
        const { data: question } = await supabase
          .from('quiz_questions')
          .select('points')
          .eq('question_id', answer.question_id)
          .single();

        const questionPoints = question?.points || 0;
        maxScore += questionPoints;

        if (gradingResult.isCorrect !== null) {
          totalScore += gradingResult.pointsAwarded;
          gradedCount++;
        } else {
          manualGradingRequired++;
        }
      }

      // Update quiz attempt with score
      const attemptStatus = manualGradingRequired > 0 ? 'submitted' : 'graded';
      const { error: attemptUpdateError } = await supabase
        .from('quiz_attempts')
        .update({
          score: Math.round(totalScore * 100) / 100,
          status: attemptStatus,
        })
        .eq('attempt_id', attemptId);

      if (attemptUpdateError) {
        this.logger.error('Error updating attempt:', attemptUpdateError);
      }

      this.logger.log(
        `Graded attempt ${attemptId}: ${totalScore}/${maxScore} (${gradedCount} auto-graded, ${manualGradingRequired} manual)`,
      );

      return {
        totalScore: Math.round(totalScore * 100) / 100,
        maxScore,
        gradedCount,
        manualGradingRequired,
      };
    } catch (error) {
      this.logger.error('Error grading quiz attempt:', error);
      throw new InternalServerErrorException('Failed to grade quiz attempt');
    }
  }
}
