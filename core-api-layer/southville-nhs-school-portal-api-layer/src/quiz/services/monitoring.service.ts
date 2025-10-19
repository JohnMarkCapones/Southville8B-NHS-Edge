import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all active participants for a quiz (for teacher monitoring)
   */
  async getActiveParticipants(quizId: string, teacherId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new NotFoundException('Quiz not found');
      }

      // Get active participants
      const { data: participants, error } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('quiz_id', quizId)
        .in('status', ['active', 'not_started', 'flagged'])
        .order('updated_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching participants:', error);
        throw new InternalServerErrorException('Failed to fetch participants');
      }

      return participants || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching active participants:', error);
      throw new InternalServerErrorException('Failed to fetch participants');
    }
  }

  /**
   * Get all flags for a quiz
   */
  async getQuizFlags(quizId: string, teacherId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new NotFoundException('Quiz not found');
      }

      // Get flags
      const { data: flags, error } = await supabase
        .from('quiz_flags')
        .select('*')
        .eq('quiz_id', quizId)
        .order('timestamp', { ascending: false });

      if (error) {
        this.logger.error('Error fetching flags:', error);
        throw new InternalServerErrorException('Failed to fetch flags');
      }

      return flags || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching quiz flags:', error);
      throw new InternalServerErrorException('Failed to fetch flags');
    }
  }

  /**
   * Terminate a student's quiz attempt (teacher action)
   */
  async terminateAttempt(
    attemptId: string,
    teacherId: string,
    reason?: string,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get attempt and verify quiz ownership
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('quiz_id')
        .eq('attempt_id', attemptId)
        .single();

      if (attemptError || !attempt) {
        throw new NotFoundException('Quiz attempt not found');
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id')
        .eq('quiz_id', attempt.quiz_id)
        .single();

      if (quizError || !quiz || quiz.teacher_id !== teacherId) {
        throw new NotFoundException('Quiz not found');
      }

      // Terminate attempt
      const { error: updateError } = await supabase
        .from('quiz_attempts')
        .update({
          status: 'terminated',
          terminated_by_teacher: true,
          termination_reason: reason || 'Terminated by teacher',
          submitted_at: new Date().toISOString(),
        })
        .eq('attempt_id', attemptId);

      if (updateError) {
        this.logger.error('Error terminating attempt:', updateError);
        throw new InternalServerErrorException('Failed to terminate attempt');
      }

      // Deactivate session
      await supabase
        .from('quiz_active_sessions')
        .update({ is_active: false })
        .eq('attempt_id', attemptId);

      this.logger.log(`Quiz attempt terminated by teacher: ${attemptId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error terminating quiz attempt:', error);
      throw new InternalServerErrorException('Failed to terminate attempt');
    }
  }

  /**
   * Create a flag for suspicious activity
   */
  async createFlag(
    sessionId: string,
    quizId: string,
    studentId: string,
    flagType: string,
    message: string,
    severity: 'info' | 'warning' | 'critical' = 'info',
    metadata?: any,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get participant ID
      const { data: participant } = await supabase
        .from('quiz_participants')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      const { error } = await supabase.from('quiz_flags').insert({
        participant_id: participant?.id,
        session_id: sessionId,
        quiz_id: quizId,
        student_id: studentId,
        flag_type: flagType,
        message,
        severity,
        metadata,
      });

      if (error) {
        this.logger.error('Error creating flag:', error);
      }

      // Increment flag count
      if (participant) {
        await supabase
          .from('quiz_participants')
          .update({
            flag_count: supabase.rpc('increment', { participant_id: participant.id }),
            status: severity === 'critical' ? 'flagged' : undefined,
          })
          .eq('id', participant.id);
      }

      this.logger.log(`Flag created: ${flagType} for student ${studentId}`);
    } catch (error) {
      this.logger.error('Error creating flag:', error);
    }
  }
}
