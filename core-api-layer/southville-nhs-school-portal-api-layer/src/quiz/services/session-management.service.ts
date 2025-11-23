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
          'last_heartbeat', // ✅ Correct field name from schema
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
  ): Promise<{ success: boolean; message: string; deviceChanged?: boolean }> {
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

      // ✅ GRACEFUL HANDLING: If quiz is already submitted/terminated, return success without error
      if (attempt.status !== 'in_progress') {
        this.logger.log(
          `Heartbeat received for completed attempt ${attemptId} (status: ${attempt.status}) - ignoring gracefully`,
        );
        return {
          success: false,
          message: `Quiz attempt is ${attempt.status}`,
        };
      }

      // Get current session state for comparison
      const { data: session } = await supabase
        .from('quiz_active_sessions')
        .select(
          'session_id, quiz_id, current_device_fingerprint, current_ip_address',
        )
        .eq('attempt_id', attemptId)
        .eq('is_active', true)
        .single();

      if (!session) {
        throw new NotFoundException('Active session not found');
      }

      // Detect device change
      const currentFingerprint = session.current_device_fingerprint;
      const newFingerprint = heartbeatData.deviceFingerprint;
      const deviceChanged =
        currentFingerprint && currentFingerprint !== newFingerprint;

      if (deviceChanged) {
        this.logger.warn(
          `🚨 DEVICE CHANGE DETECTED for attempt ${attemptId}: ${currentFingerprint} → ${newFingerprint}`,
        );

        // Mark old device as no longer current
        await supabase
          .from('quiz_device_sessions')
          .update({
            is_current: false,
            last_seen_at: new Date().toISOString(),
          })
          .eq('session_id', session.session_id)
          .eq('device_fingerprint', currentFingerprint);

        // Create new device session
        await supabase.from('quiz_device_sessions').insert({
          session_id: session.session_id,
          device_fingerprint: newFingerprint,
          ip_address: heartbeatData.ipAddress,
          user_agent: heartbeatData.userAgent,
          device_type: this.detectDeviceType(heartbeatData.userAgent),
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          is_current: true,
        });

        this.logger.log(`🖥️ New device session created for ${newFingerprint}`);

        // Create security flag for device change (OPTIMIZED: use existing session data)
        await this.createFlagDirect(
          session.session_id,
          session.quiz_id,
          studentId,
          'device_change',
          'warning',
          {
            previous_device: currentFingerprint,
            new_device: newFingerprint,
            previous_ip: session.current_ip_address,
            new_ip: heartbeatData.ipAddress,
            user_agent: heartbeatData.userAgent,
            device_type: this.detectDeviceType(heartbeatData.userAgent),
            timestamp: new Date().toISOString(),
          },
        );
      } else {
        // Update last_seen_at for current device
        const { error: deviceUpdateError } = await supabase
          .from('quiz_device_sessions')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('session_id', session.session_id)
          .eq('device_fingerprint', newFingerprint)
          .eq('is_current', true);

        if (deviceUpdateError) {
          this.logger.warn(
            'Failed to update device last_seen_at:',
            deviceUpdateError,
          );
          // Don't throw - this is not critical
        }
      }

      // Update session heartbeat
      const { error: updateError } = await supabase
        .from('quiz_active_sessions')
        .update({
          last_heartbeat: new Date().toISOString(), // ✅ Correct field name from schema
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
        deviceChanged, // Let frontend know if device changed
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
      const lastHeartbeat = new Date(session.last_heartbeat); // ✅ Correct field name from schema
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
          // ✅ DELETE RELATED RECORDS FIRST (to avoid foreign key violations)

          // 1. Delete flags
          await supabase
            .from('quiz_flags')
            .delete()
            .eq('session_id', session.session_id);

          // 2. Delete session answers
          await supabase
            .from('quiz_session_answers')
            .delete()
            .eq('session_id', session.session_id);

          // 3. Delete device sessions
          await supabase
            .from('quiz_device_sessions')
            .delete()
            .eq('session_id', session.session_id);

          // 4. Delete activity logs
          await supabase
            .from('quiz_activity_logs')
            .delete()
            .eq('session_id', session.session_id);

          // 5. Delete participant record
          await supabase
            .from('quiz_participants')
            .delete()
            .eq('session_id', session.session_id);

          // 6. Finally, delete the session itself
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
              `Deleted old session ${session.session_id} and all related records for attempt ${session.attempt_id}`,
            );
          }

          // Also flag the old attempt as terminated (only if still in_progress)
          // ✅ FIX: Don't overwrite submitted/graded attempts - only terminate in_progress ones
          const { data: oldAttempt } = await supabase
            .from('quiz_attempts')
            .select('status')
            .eq('attempt_id', session.attempt_id)
            .single();

          if (oldAttempt && oldAttempt.status === 'in_progress') {
            await supabase
              .from('quiz_attempts')
              .update({
                status: 'terminated',
              })
              .eq('attempt_id', session.attempt_id);
            this.logger.log(
              `Terminated in-progress attempt ${session.attempt_id} due to duplicate session`,
            );
          } else {
            this.logger.log(
              `Skipped terminating attempt ${session.attempt_id} - status is '${oldAttempt?.status}' (not in_progress)`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error checking duplicate sessions:', error);
      // Don't throw - this is a background check
    }
  }

  /**
   * Update student progress for real-time monitoring
   */
  async updateProgress(
    attemptId: string,
    studentId: string,
    progressDto: {
      currentQuestionIndex: number;
      questionsAnswered: number;
      progress: number;
      idleTimeSeconds?: number;
    },
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get session
      const { data: session, error: sessionError } = await supabase
        .from('quiz_active_sessions')
        .select('session_id, quiz_id')
        .eq('attempt_id', attemptId)
        .eq('student_id', studentId)
        .eq('is_active', true)
        .single();

      if (sessionError || !session) {
        this.logger.error('Active session not found:', sessionError);
        throw new NotFoundException('Active session not found');
      }

      // Update participant progress
      const { error: updateError } = await supabase
        .from('quiz_participants')
        .update({
          current_question_index: progressDto.currentQuestionIndex,
          questions_answered: progressDto.questionsAnswered,
          progress: progressDto.progress,
          idle_time_seconds: progressDto.idleTimeSeconds || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', session.session_id);

      if (updateError) {
        this.logger.error('Failed to update progress:', updateError);
        throw new InternalServerErrorException('Failed to update progress');
      }

      this.logger.log(
        `📊 Progress updated: Student ${studentId} at question ${progressDto.currentQuestionIndex + 1} (${progressDto.progress}%)`,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error updating progress:', error);
      throw new InternalServerErrorException('Failed to update progress');
    }
  }

  /**
   * Submit a client-side detected flag
   * Students can call this to self-report suspicious events (tab switches, etc.)
   */
  async submitClientFlag(
    attemptId: string,
    studentId: string,
    flagType: string,
    metadata?: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify attempt ownership and that it's in progress
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

      // ✅ GRACEFUL HANDLING: If quiz is already submitted/terminated, ignore flag without error
      if (attempt.status !== 'in_progress') {
        this.logger.log(
          `Flag submission received for completed attempt ${attemptId} (status: ${attempt.status}) - ignoring gracefully`,
        );
        return {
          success: false,
          message: `Quiz attempt is ${attempt.status} - flag not recorded`,
        };
      }

      // Determine severity based on flag type
      let severity: 'info' | 'warning' | 'critical' = 'info';
      if (['tab_switch', 'fullscreen_exit', 'copy_paste', 'screenshot_attempt'].includes(flagType)) {
        severity = 'warning';
      } else if (['multiple_sessions', 'device_change'].includes(flagType)) {
        severity = 'critical';
      }

      // Create the flag
      await this.createFlag(attemptId, studentId, flagType, severity, {
        ...metadata,
        client_submitted: true,
        submission_time: new Date().toISOString(),
      });

      this.logger.log(
        `Client flag submitted: ${flagType} for attempt ${attemptId}`,
      );

      return {
        success: true,
        message: 'Flag recorded successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error submitting client flag:', error);
      throw new InternalServerErrorException('Failed to submit flag');
    }
  }

  /**
   * Detect device type from user agent string
   */
  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
      return 'mobile';
    }

    // Tablets
    if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    }

    // Desktop
    return 'desktop';
  }

  /**
   * OPTIMIZED flag creation - when you already have session_id and quiz_id
   * Avoids 2 extra database queries
   */
  private async createFlagDirect(
    sessionId: string,
    quizId: string,
    studentId: string,
    flagType: string,
    severity: 'info' | 'warning' | 'critical',
    metadata?: any,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Fetch participant_id from session (only 1 query needed)
      const { data: participant } = await supabase
        .from('quiz_participants')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      // Use correct field names per schema
      const flagData: any = {
        session_id: sessionId,
        quiz_id: quizId,
        participant_id: participant?.id,
        student_id: studentId,
        flag_type: flagType,
        severity,
        metadata: metadata || {},
      };

      const { error } = await supabase.from('quiz_flags').insert(flagData);

      if (error) {
        this.logger.error('Failed to create flag:', error);
        return; // Silent failure - don't block main flow
      }

      // Log with appropriate emoji based on severity
      const emoji =
        severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
      this.logger.warn(
        `${emoji} Flag created: ${flagType} (${severity}) for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error('Error creating flag:', error);
      // Don't throw - flag creation should not block main flow
    }
  }

  /**
   * Centralized flag creation service
   * Creates security flags with proper severity levels and structured metadata
   */
  async createFlag(
    attemptId: string,
    studentId: string,
    flagType: string,
    severity: 'info' | 'warning' | 'critical',
    metadata?: any,
    autoResolved?: boolean,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // ✅ Fetch session data from attempt (quiz_flags needs session_id, quiz_id, not attempt_id)
      const { data: session, error: sessionError } = await supabase
        .from('quiz_active_sessions')
        .select('session_id, quiz_id')
        .eq('attempt_id', attemptId)
        .single();

      if (sessionError || !session) {
        this.logger.error('Session not found for flag creation:', sessionError);
        return; // Silent failure - don't block main flow
      }

      // ✅ Fetch participant_id from session
      const { data: participant } = await supabase
        .from('quiz_participants')
        .select('id')
        .eq('session_id', session.session_id)
        .single();

      // ✅ Use correct field names per schema (quiz_schema_documentation.md lines 394-414)
      const flagData: any = {
        session_id: session.session_id, // ✅ Correct field
        quiz_id: session.quiz_id, // ✅ Correct field
        participant_id: participant?.id, // ✅ Correct field
        student_id: studentId,
        flag_type: flagType,
        severity,
        metadata: metadata || {},
      };

      const { error } = await supabase.from('quiz_flags').insert(flagData);

      if (error) {
        this.logger.error('Failed to create flag:', error);
        return; // Silent failure - don't block main flow
      }

      // Log with appropriate emoji based on severity
      const emoji =
        severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
      this.logger.warn(
        `${emoji} Flag created: ${flagType} (${severity}) for attempt ${attemptId}`,
      );
    } catch (error) {
      this.logger.error('Error creating flag:', error);
      // Don't throw - flag creation should not block main flow
    }
  }

  /**
   * Log suspicious activity (legacy method - calls createFlag)
   * @deprecated Use createFlag directly for better control over severity
   */
  private async logSuspiciousActivity(
    attemptId: string,
    studentId: string,
    flagType: string,
    metadata: any,
  ): Promise<void> {
    await this.createFlag(attemptId, studentId, flagType, 'warning', metadata);
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
        lastHeartbeat: session.last_heartbeat, // ✅ Correct field name from schema
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

  /**
   * Get device history for a quiz attempt
   * Teachers can use this to audit which devices were used during a quiz
   */
  async getDeviceHistory(attemptId: string): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getClient();

      // First get the session for this attempt
      const { data: session, error: sessionError } = await supabase
        .from('quiz_active_sessions')
        .select('session_id')
        .eq('attempt_id', attemptId)
        .single();

      if (sessionError || !session) {
        throw new NotFoundException('Session not found for this attempt');
      }

      // Get all device sessions for this session
      const { data: deviceSessions, error: devicesError } = await supabase
        .from('quiz_device_sessions')
        .select('*')
        .eq('session_id', session.session_id)
        .order('first_seen_at', { ascending: true });

      if (devicesError) {
        this.logger.error('Error fetching device history:', devicesError);
        throw new InternalServerErrorException(
          'Failed to fetch device history',
        );
      }

      // Format the response
      return (deviceSessions || []).map((device) => ({
        deviceFingerprint: device.device_fingerprint,
        deviceType: device.device_type,
        ipAddress: device.ip_address,
        userAgent: device.user_agent,
        firstSeenAt: device.first_seen_at,
        lastSeenAt: device.last_seen_at,
        isCurrent: device.is_current,
        duration: this.calculateDuration(
          device.first_seen_at,
          device.last_seen_at,
        ),
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting device history:', error);
      throw new InternalServerErrorException('Failed to get device history');
    }
  }

  /**
   * Calculate duration between two timestamps in human-readable format
   */
  private calculateDuration(start: string, end: string): string {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;

    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
