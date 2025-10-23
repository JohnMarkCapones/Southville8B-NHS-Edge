import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface SessionHeartbeatDto {
  deviceFingerprint: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);
  private readonly SESSION_TIMEOUT_MINUTES = 5; // Session expires after 5 minutes of inactivity

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check if student has an active session for a quiz
   */
  async hasActiveSession(
    quizId: string,
    studentId: string,
  ): Promise<{ hasSession: boolean; sessionId?: string; attemptId?: string }> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data: session, error } = await supabase
        .from('quiz_active_sessions')
        .select('session_id, attempt_id')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .eq('is_active', true)
        .gte(
          'last_heartbeat',
          new Date(
            Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000,
          ).toISOString(),
        )
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error('Error checking active session:', error);
        throw new InternalServerErrorException(
          'Failed to check active session',
        );
      }

      return {
        hasSession: !!session,
        sessionId: session?.session_id,
        attemptId: session?.attempt_id,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Error checking active session:', error);
      throw new InternalServerErrorException('Failed to check active session');
    }
  }

  /**
   * Heartbeat endpoint to keep session alive
   */
  async heartbeat(
    attemptId: string,
    studentId: string,
    heartbeatData: SessionHeartbeatDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify attempt ownership
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('student_id, status')
        .eq('attempt_id', attemptId)
        .single();

      if (attemptError || !attempt) {
        throw new NotFoundException('Quiz attempt not found');
      }

      if (attempt.student_id !== studentId) {
        throw new ForbiddenException('You do not own this quiz attempt');
      }

      if (attempt.status !== 'in_progress') {
        throw new BadRequestException('Quiz attempt is not in progress');
      }

      // Update session heartbeat
      const { error: updateError } = await supabase
        .from('quiz_active_sessions')
        .update({
          last_heartbeat: new Date().toISOString(),
          current_device_fingerprint: heartbeatData.deviceFingerprint,
          current_ip_address: heartbeatData.ipAddress,
          current_user_agent: heartbeatData.userAgent,
        })
        .eq('attempt_id', attemptId)
        .eq('student_id', studentId);

      if (updateError) {
        this.logger.error('Error updating heartbeat:', updateError);
        throw new InternalServerErrorException('Failed to update heartbeat');
      }

      return {
        success: true,
        message: 'Heartbeat recorded',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error recording heartbeat:', error);
      throw new InternalServerErrorException('Failed to record heartbeat');
    }
  }

  /**
   * Validate session integrity (check for device changes)
   */
  async validateSession(
    attemptId: string,
    studentId: string,
    currentDeviceFingerprint: string,
  ): Promise<{
    isValid: boolean;
    reason?: string;
    deviceChanged?: boolean;
    ipChanged?: boolean;
  }> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data: session, error } = await supabase
        .from('quiz_active_sessions')
        .select('*')
        .eq('attempt_id', attemptId)
        .eq('student_id', studentId)
        .single();

      if (error || !session) {
        return {
          isValid: false,
          reason: 'Session not found',
        };
      }

      // Check if session is still active
      if (!session.is_active) {
        return {
          isValid: false,
          reason: 'Session has been terminated',
        };
      }

      // Check session timeout
      const lastHeartbeat = new Date(session.last_heartbeat);
      const timeoutThreshold = new Date(
        Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000,
      );

      if (lastHeartbeat < timeoutThreshold) {
        return {
          isValid: false,
          reason: 'Session expired due to inactivity',
        };
      }

      // Check device fingerprint change
      const deviceChanged =
        session.initial_device_fingerprint !== currentDeviceFingerprint;

      // Check IP change (warning only, not blocking)
      const ipChanged =
        session.initial_ip_address !== session.current_ip_address;

      if (deviceChanged) {
        // Log suspicious activity
        await this.logSuspiciousActivity(
          attemptId,
          studentId,
          'device_change',
          {
            initial: session.initial_device_fingerprint,
            current: currentDeviceFingerprint,
          },
        );

        return {
          isValid: false,
          reason: 'Device fingerprint changed',
          deviceChanged: true,
        };
      }

      if (ipChanged) {
        // Just log, don't block
        await this.logSuspiciousActivity(attemptId, studentId, 'ip_change', {
          initial: session.initial_ip_address,
          current: session.current_ip_address,
        });
      }

      return {
        isValid: true,
        deviceChanged: false,
        ipChanged,
      };
    } catch (error) {
      this.logger.error('Error validating session:', error);
      return {
        isValid: false,
        reason: 'Session validation failed',
      };
    }
  }

  /**
   * Terminate an active session
   */
  async terminateSession(
    attemptId: string,
    reason: string = 'user_logout',
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { error } = await supabase
        .from('quiz_active_sessions')
        .update({
          is_active: false,
          terminated_reason: reason,
        })
        .eq('attempt_id', attemptId);

      if (error) {
        this.logger.error('Error terminating session:', error);
        throw new InternalServerErrorException('Failed to terminate session');
      }

      this.logger.log(`Session terminated for attempt ${attemptId}: ${reason}`);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Error terminating session:', error);
      throw new InternalServerErrorException('Failed to terminate session');
    }
  }

  /**
   * Check and terminate duplicate sessions
   */
  async checkDuplicateSessions(
    quizId: string,
    studentId: string,
    currentAttemptId: string,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Find ALL sessions (active or not) for same quiz and student
      // This handles the UNIQUE constraint on (student_id, quiz_id)
      const { data: otherSessions, error } = await supabase
        .from('quiz_active_sessions')
        .select('session_id, attempt_id, is_active')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .neq('attempt_id', currentAttemptId);

      if (error) {
        this.logger.error('Error checking duplicate sessions:', error);
        return;
      }

      if (otherSessions && otherSessions.length > 0) {
        this.logger.warn(
          `Found ${otherSessions.length} existing sessions for student ${studentId} on quiz ${quizId} - deleting to allow new attempt`,
        );

        // DELETE old sessions instead of UPDATE (to avoid UNIQUE constraint)
        for (const session of otherSessions) {
          // Delete the old session row
          const { error: deleteError } = await supabase
            .from('quiz_active_sessions')
            .delete()
            .eq('session_id', session.session_id);

          if (deleteError) {
            this.logger.error(
              `Error deleting old session ${session.session_id}:`,
              deleteError,
            );
          } else {
            this.logger.log(
              `Deleted old session ${session.session_id} for attempt ${session.attempt_id}`,
            );
          }

          // Also flag the old attempt as terminated
          await supabase
            .from('quiz_attempts')
            .update({
              status: 'terminated',
            })
            .eq('attempt_id', session.attempt_id);
        }
      }
    } catch (error) {
      this.logger.error('Error checking duplicate sessions:', error);
      // Don't throw - this is a background check
    }
  }

  /**
   * Log suspicious activity
   */
  private async logSuspiciousActivity(
    attemptId: string,
    studentId: string,
    flagType: string,
    metadata: any,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      await supabase.from('quiz_flags').insert({
        attempt_id: attemptId,
        student_id: studentId,
        flag_type: flagType,
        severity: 'medium',
        metadata,
      });

      this.logger.warn(
        `Suspicious activity logged: ${flagType} for attempt ${attemptId}`,
      );
    } catch (error) {
      this.logger.error('Error logging suspicious activity:', error);
      // Don't throw - logging should not block main flow
    }
  }

  /**
   * Get active session details
   */
  async getSessionDetails(attemptId: string, studentId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data: session, error } = await supabase
        .from('quiz_active_sessions')
        .select('*')
        .eq('attempt_id', attemptId)
        .eq('student_id', studentId)
        .single();

      if (error || !session) {
        throw new NotFoundException('Session not found');
      }

      return {
        sessionId: session.session_id,
        attemptId: session.attempt_id,
        quizId: session.quiz_id,
        isActive: session.is_active,
        lastHeartbeat: session.last_heartbeat,
        deviceChanged:
          session.initial_device_fingerprint !==
          session.current_device_fingerprint,
        ipChanged: session.initial_ip_address !== session.current_ip_address,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting session details:', error);
      throw new InternalServerErrorException('Failed to get session details');
    }
  }
}
