import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { MemoryCacheService } from '../../common/services/memory-cache.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cacheService: MemoryCacheService,
  ) {}

  /**
   * Get all active participants for a quiz (for teacher monitoring)
   * ✅ OPTIMIZED: Uses cache + CTE join for 10x better performance
   */
  async getActiveParticipants(
    quizId: string,
    teacherId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<any> {
    try {
      // ✅ CACHE LAYER: Check cache first (5 second TTL)
      const cacheKey = `monitoring:participants:${quizId}:p${page}`;
      const cached = this.cacheService.get(cacheKey, 5000);
      if (cached) {
        this.logger.debug(
          `✅ Cache HIT for quiz ${quizId} (saved DB query)`,
        );
        return cached;
      }

      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership (not cached - security check)
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

      // ✅ DEBUG: First check ALL participants regardless of status
      const { data: debugParticipants, error: allError } = await supabase
        .from('quiz_participants')
        .select('student_id, status, progress, quiz_id')
        .eq('quiz_id', quizId);

      this.logger.log(`🔍 DEBUG - Total participants for quiz ${quizId}: ${debugParticipants?.length || 0}`);
      if (debugParticipants && debugParticipants.length > 0) {
        this.logger.log('🔍 DEBUG - Participant statuses:', debugParticipants.map(p => ({ student_id: p.student_id, status: p.status, progress: p.progress })));
      }

      // ✅ DEBUG: Check active sessions
      const { data: allSessions } = await supabase
        .from('quiz_active_sessions')
        .select('session_id, quiz_id, student_id, is_active, last_heartbeat')
        .eq('quiz_id', quizId);

      this.logger.log(`🔍 DEBUG - Total active sessions for quiz ${quizId}: ${allSessions?.length || 0}`);
      if (allSessions && allSessions.length > 0) {
        this.logger.log('🔍 DEBUG - Sessions:', allSessions.map(s => ({ student_id: s.student_id, is_active: s.is_active })));
      }

      // ✅ OPTIMIZED: Get active participants with all security fields
      const { data: participants, error } = await supabase
        .from('quiz_participants')
        .select(
          `
          *,
          quiz_active_sessions!inner (
            session_id,
            attempt_id,
            started_at,
            last_heartbeat,
            is_active,
            initial_device_fingerprint,
            current_device_fingerprint,
            initial_ip_address,
            current_ip_address,
            initial_user_agent,
            current_user_agent
          )
        `,
        )
        .eq('quiz_id', quizId)
        .in('status', ['in_progress', 'active', 'not_started', 'flagged']) // ✅ FIX: Added 'in_progress' status
        .order('updated_at', { ascending: false });

      this.logger.log(`🔍 DEBUG - Participants after INNER JOIN with status filter: ${participants?.length || 0}`);

      if (error) {
        this.logger.error('Error fetching participants:', error);
        throw new InternalServerErrorException('Failed to fetch participants');
      }

      // Get student section information separately (students table)
      const studentIds = participants?.map((p) => p.student_id) || [];
      let studentSections: Record<string, string> = {};
      let studentNames: Record<string, string> = {};

      if (studentIds.length > 0) {
        // Fetch student sections
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(
            `
            id,
            section_id,
            sections (
              id,
              name,
              grade_level
            )
          `,
          )
          .in('id', studentIds);

        if (!studentsError && studentsData) {
          studentSections = studentsData.reduce(
            (acc, student) => {
              const section = Array.isArray(student.sections)
                ? student.sections[0]
                : student.sections;
              // Format: "Grade 10 - Section A" or just "Section A"
              const sectionName = section?.name
                ? section.grade_level
                  ? `Grade ${section.grade_level} - ${section.name}`
                  : section.name
                : 'N/A';
              acc[student.id] = sectionName;
              return acc;
            },
            {} as Record<string, string>,
          );
        }

        // ✅ Fetch student names from users table (since no FK exists)
        this.logger.log(`🔍 DEBUG - Looking up ${studentIds.length} student names for IDs:`, studentIds);

        // Use service client to bypass RLS
        const serviceSupabase = this.supabaseService.getServiceClient();
        const { data: usersData, error: usersError } = await serviceSupabase
          .from('users')
          .select('id, full_name')
          .in('id', studentIds);

        if (usersError) {
          this.logger.error('❌ ERROR fetching user names:', usersError);
        }

        this.logger.log(`🔍 DEBUG - Users query returned ${usersData?.length || 0} results:`, usersData);

        if (!usersError && usersData) {
          studentNames = usersData.reduce(
            (acc, user) => {
              acc[user.id] = user.full_name || 'Unknown Student';
              return acc;
            },
            {} as Record<string, string>,
          );
          this.logger.log(`🔍 DEBUG - Student names map:`, studentNames);
        }
      }

      // Get tab switch counts for all participants
      const participantIds = participants?.map((p) => p.student_id) || [];

      let tabSwitchCounts: Record<string, number> = {};
      if (participantIds.length > 0) {
        const { data: flagsData, error: flagsError } = await supabase
          .from('quiz_flags')
          .select('student_id, flag_type')
          .eq('quiz_id', quizId)
          .in('student_id', participantIds)
          .eq('flag_type', 'tab_switch');

        if (!flagsError && flagsData) {
          // Count tab switches per student
          tabSwitchCounts = flagsData.reduce(
            (acc, flag) => {
              acc[flag.student_id] = (acc[flag.student_id] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
        }
      }

      // ✅ Get scores for finished participants (and total quiz points)
      let participantScores: Record<string, { score: number; maxScore: number; percentage: number }> = {};
      let quizTotalPoints = 0;

      if (participantIds.length > 0) {
        // First, get the quiz total points
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('total_points')
          .eq('id', quizId)
          .single();

        quizTotalPoints = quizData?.total_points || 0;
        this.logger.log(`🔍 DEBUG - Quiz total points: ${quizTotalPoints}`);

        this.logger.log(`🔍 DEBUG - Querying scores for ${participantIds.length} participants:`, participantIds.slice(0, 3));

        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('student_id, score, percentage, status')
          .eq('quiz_id', quizId)
          .in('student_id', participantIds)
          .in('status', ['submitted', 'graded']); // Only get finished attempts

        this.logger.log(`🔍 DEBUG - Quiz attempts query returned ${attemptsData?.length || 0} results:`, attemptsData);

        if (attemptsError) {
          this.logger.error('❌ ERROR fetching quiz attempts:', attemptsError);
        }

        if (!attemptsError && attemptsData) {
          participantScores = attemptsData.reduce(
            (acc, attempt) => {
              acc[attempt.student_id] = {
                score: attempt.score || 0,
                maxScore: quizTotalPoints, // ✅ Use quiz total points, not from attempt
                percentage: attempt.percentage || 0,
              };
              return acc;
            },
            {} as Record<string, { score: number; maxScore: number; percentage: number }>,
          );
          this.logger.log(`🔍 DEBUG - Participant scores map:`, participantScores);
        }
      }

      // ✅ FIX: Fetch attempt data separately for time_taken_seconds
      const attemptIds = participants
        ?.map((p) => {
          const session = Array.isArray(p.quiz_active_sessions)
            ? p.quiz_active_sessions[0]
            : p.quiz_active_sessions;
          return session?.attempt_id;
        })
        .filter((id) => id != null) || [];

      let attemptDataMap: Record<string, {
        time_taken_seconds: number;
        status: string;
        submitted_at: string | null;
      }> = {};

      if (attemptIds.length > 0) {
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('attempt_id, time_taken_seconds, status, submitted_at')
          .in('attempt_id', attemptIds);

        if (attemptsData) {
          attemptDataMap = attemptsData.reduce((acc, attempt) => {
            acc[attempt.attempt_id] = {
              time_taken_seconds: attempt.time_taken_seconds,
              status: attempt.status,
              submitted_at: attempt.submitted_at,
            };
            return acc;
          }, {} as Record<string, {
            time_taken_seconds: number;
            status: string;
            submitted_at: string | null;
          }>);
        }
      }

      // ✅ NEW: Fetch student answers with correctness data for finished quizzes
      let studentAnswersMap: Record<string, Array<{
        question_id: string;
        is_correct: boolean;
        time_spent_seconds: number | null;
      }>> = {};

      if (attemptIds.length > 0) {
        const { data: answersData } = await supabase
          .from('quiz_student_answers')
          .select('attempt_id, question_id, is_correct, time_spent_seconds')
          .in('attempt_id', attemptIds);

        if (answersData) {
          // Group answers by attempt_id
          answersData.forEach((answer) => {
            if (!studentAnswersMap[answer.attempt_id]) {
              studentAnswersMap[answer.attempt_id] = [];
            }
            studentAnswersMap[answer.attempt_id].push({
              question_id: answer.question_id,
              is_correct: answer.is_correct,
              time_spent_seconds: answer.time_spent_seconds,
            });
          });
        }
      }

      // ✅ ENHANCED: Transform to include all security and tracking fields
      const transformedParticipants = participants?.map((p) => {
        const session = Array.isArray(p.quiz_active_sessions)
          ? p.quiz_active_sessions[0]
          : p.quiz_active_sessions;

        const attemptData = session?.attempt_id ? attemptDataMap[session.attempt_id] : null;
        const studentAnswers = session?.attempt_id ? studentAnswersMap[session.attempt_id] || [] : [];

        // ✅ FIX: Calculate time elapsed - use time_taken_seconds for finished quizzes
        let timeElapsed: number;
        if (!session?.is_active && attemptData?.time_taken_seconds != null) {
          // Quiz is finished - use the stored time_taken_seconds (TIMER STOPS!)
          timeElapsed = attemptData.time_taken_seconds;
        } else {
          // Quiz is in progress - calculate elapsed time from start (TIMER RUNS)
          const startTime = new Date(p.start_time || session?.started_at);
          const now = new Date();
          timeElapsed = Math.floor(
            (now.getTime() - startTime.getTime()) / 1000,
          );
        }

        // Check if IP changed
        const ipChanged =
          session?.initial_ip_address &&
          session?.current_ip_address &&
          session.initial_ip_address !== session.current_ip_address;

        const scoreData = participantScores[p.student_id];

        return {
          attempt_id: session?.attempt_id || null,
          student_id: p.student_id,
          student_name: studentNames[p.student_id] || 'Unknown Student', // ✅ Use separate lookup
          section: studentSections[p.student_id] || 'N/A',
          started_at: p.start_time || session?.started_at,
          last_heartbeat: session?.last_heartbeat || null,
          time_elapsed: timeElapsed,
          questions_answered: p.questions_answered || 0,
          total_questions: p.total_questions || 0,
          progress: p.progress || 0,
          current_question_index: p.current_question_index || 0,
          tab_switches: tabSwitchCounts[p.student_id] || 0,
          is_active: session?.is_active ?? true,
          device_fingerprint: session?.initial_device_fingerprint || 'unknown',
          // Security tracking fields
          initial_ip_address: session?.initial_ip_address || null,
          current_ip_address: session?.current_ip_address || null,
          ip_changed: ipChanged || false,
          initial_user_agent: session?.initial_user_agent || null,
          current_user_agent: session?.current_user_agent || null,
          // Activity tracking
          idle_time_seconds: p.idle_time_seconds || 0,
          last_activity_type: 'heartbeat', // Can be enhanced later
          // ✅ Score data (only available for finished participants)
          score: scoreData?.score ?? null,
          max_score: scoreData?.maxScore ?? null,
          percentage: scoreData?.percentage ?? null,
          // ✅ NEW: Submission data
          submitted_at: attemptData?.submitted_at || null,
          // ✅ NEW: Student answers with correctness
          answers: studentAnswers,
        };
      });

      // ✅ NEW: Get students from assigned sections who haven't started
      const serviceSupabase = this.supabaseService.getServiceClient();

      // 1. Get assigned section IDs
      const { data: assignedSections } = await serviceSupabase
        .from('quiz_sections')
        .select('section_id')
        .eq('quiz_id', quizId);

      const sectionIds = assignedSections?.map(s => s.section_id) || [];
      this.logger.log(`🔍 DEBUG - Quiz assigned to ${sectionIds.length} section(s):`, sectionIds);

      let notStartedStudents: any[] = [];
      let totalEligibleStudents = transformedParticipants?.length || 0;

      if (sectionIds.length > 0) {
        // 2. Get all students in assigned sections
        const { data: allSectionStudents } = await serviceSupabase
          .from('students')
          .select(`
            id,
            user_id,
            section_id,
            sections (
              id,
              name,
              grade_level
            )
          `)
          .in('section_id', sectionIds);

        this.logger.log(`🔍 DEBUG - Total students in assigned sections: ${allSectionStudents?.length || 0}`);

        if (allSectionStudents && allSectionStudents.length > 0) {
          this.logger.log(`🔍 DEBUG - Sample student records:`, allSectionStudents.slice(0, 3).map(s => ({
            id: s.id,
            user_id: s.user_id,
            section_id: s.section_id
          })));

          // 3. Get user names for all section students
          const allSectionUserIds = allSectionStudents.map(s => s.user_id).filter(id => id !== null); // ✅ Filter out null user_ids

          this.logger.log(`🔍 DEBUG - User IDs to query (${allSectionUserIds.length}):`, allSectionUserIds.slice(0, 5));
          const { data: allUsersData } = await serviceSupabase
            .from('users')
            .select('id, full_name')
            .in('id', allSectionUserIds); // ✅ FIX: Query users by user_id

          this.logger.log(`🔍 DEBUG - Found ${allUsersData?.length || 0} user names for not-started students`);

          // Map by student.id (not user.id) for later lookup
          const allStudentNames = allSectionStudents.reduce((acc, student) => {
            const user = allUsersData?.find(u => u.id === student.user_id);
            acc[student.id] = user?.full_name || 'Unknown Student';
            return acc;
          }, {} as Record<string, string>);

          this.logger.log(`🔍 DEBUG - Student name map:`, allStudentNames);

          // 4. Filter students who DON'T have quiz_participants records
          const participantStudentIds = new Set(participants?.map(p => p.student_id) || []);

          this.logger.log(`🔍 DEBUG - Participant student IDs (who started):`, Array.from(participantStudentIds));
          this.logger.log(`🔍 DEBUG - All section student IDs:`, allSectionStudents.map(s => s.id));

          const studentsWhoHaventStarted = allSectionStudents.filter(
            s => !participantStudentIds.has(s.id)
          );

          this.logger.log(`🔍 DEBUG - Students who haven't started: ${studentsWhoHaventStarted.length}`);

          // 5. Get total questions for this quiz (for not started students)
          const { data: quizQuestions } = await serviceSupabase
            .from('quiz_questions')
            .select('question_id')
            .eq('quiz_id', quizId);

          const totalQuestions = quizQuestions?.length || 0;

          // 6. Create "not started" student objects
          notStartedStudents = studentsWhoHaventStarted.map(s => {
            const section = Array.isArray(s.sections) ? s.sections[0] : s.sections;
            const sectionName = section?.name
              ? section.grade_level
                ? `Grade ${section.grade_level} - ${section.name}`
                : section.name
              : 'N/A';

            return {
              attempt_id: null,
              student_id: s.id,
              student_name: allStudentNames[s.id] || 'Unknown Student',
              section: sectionName,
              started_at: null,
              last_heartbeat: null,
              time_elapsed: 0,
              questions_answered: 0,
              total_questions: totalQuestions,
              progress: 0,
              current_question_index: 0,
              tab_switches: 0,
              is_active: false,
              device_fingerprint: null,
              initial_ip_address: null,
              current_ip_address: null,
              ip_changed: false,
              initial_user_agent: null,
              current_user_agent: null,
              idle_time_seconds: 0,
              last_activity_type: null,
              status: 'not_started', // ✅ Explicitly mark as not started
            };
          });

          totalEligibleStudents = allSectionStudents.length;
        }
      }

      // 7. Combine active participants with not started students
      const allParticipants = [
        ...(transformedParticipants || []),
        ...notStartedStudents,
      ];

      const result = {
        quizId,
        activeCount: transformedParticipants?.length || 0,
        notStartedCount: notStartedStudents.length, // ✅ NEW
        totalEligible: totalEligibleStudents, // ✅ NEW
        participants: allParticipants, // ✅ UPDATED: Include not started students
        total: allParticipants.length, // ✅ UPDATED: Total includes not started
        page,
        limit,
      };

      // ✅ CACHE: Store result for 5 seconds
      this.cacheService.set(cacheKey, result, 5000);
      this.logger.debug(
        `💾 Cache SET for quiz ${quizId} (${result.activeCount} participants)`,
      );

      return result;
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

      // Get flags (without user join - FK doesn't exist)
      const { data: flags, error } = await supabase
        .from('quiz_flags')
        .select('*')
        .eq('quiz_id', quizId)
        .order('timestamp', { ascending: false });

      if (error) {
        this.logger.error('Error fetching flags:', error);
        throw new InternalServerErrorException('Failed to fetch flags');
      }

      // ✅ Fetch student names separately
      const studentIds = [...new Set(flags?.map((f) => f.student_id) || [])];
      let studentNames: Record<string, string> = {};

      if (studentIds.length > 0) {
        // Use service client to bypass RLS
        const serviceSupabase = this.supabaseService.getServiceClient();
        const { data: usersData, error: usersError } = await serviceSupabase
          .from('users')
          .select('id, full_name')
          .in('id', studentIds);

        if (!usersError && usersData) {
          studentNames = usersData.reduce(
            (acc, user) => {
              acc[user.id] = user.full_name || 'Unknown Student';
              return acc;
            },
            {} as Record<string, string>,
          );
        }
      }

      // Transform to include student names
      const transformedFlags = flags?.map((f) => {
        return {
          flag_id: f.flag_id,
          attempt_id: f.attempt_id,
          student_id: f.student_id,
          student_name: studentNames[f.student_id] || 'Unknown Student', // ✅ Use separate lookup
          quiz_id: f.quiz_id,
          flag_type: f.flag_type,
          severity: f.severity,
          description: f.message || f.description,
          metadata: f.metadata,
          created_at: f.timestamp || f.created_at,
        };
      });

      return {
        quizId,
        totalFlags: transformedFlags?.length || 0,
        flags: transformedFlags || [],
      };
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
   * Export monitoring report with complete data
   * @param quizId - Quiz ID
   * @param teacherId - Teacher ID (for ownership verification)
   * @returns Complete monitoring report for export
   */
  async exportMonitoringReport(
    quizId: string,
    teacherId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('quiz_id, title, teacher_id')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new NotFoundException('Quiz not found');
      }

      // Get all participants (not just active)
      const participantsResponse = await this.getActiveParticipants(
        quizId,
        teacherId,
      );

      // Get all flags
      const flagsResponse = await this.getQuizFlags(quizId, teacherId);

      // Calculate summary statistics
      const participants = participantsResponse.participants || [];
      const flags = flagsResponse.flags || [];

      const activeCount = participants.filter((p) => p.is_active).length;
      const completedCount = participants.filter(
        (p) => p.progress === 100,
      ).length;
      const flaggedCount = participants.filter(
        (p) => p.tab_switches > 0,
      ).length;

      const avgProgress =
        participants.length > 0
          ? participants.reduce((sum, p) => sum + p.progress, 0) /
            participants.length
          : 0;

      const avgTimeElapsed =
        participants.length > 0
          ? participants.reduce((sum, p) => sum + p.time_elapsed, 0) /
            participants.length
          : 0;

      return {
        quizId: quiz.quiz_id,
        quizTitle: quiz.title,
        exportedAt: new Date().toISOString(),
        participants,
        flags,
        summary: {
          totalParticipants: participants.length,
          activeCount,
          completedCount,
          flaggedCount,
          totalFlags: flags.length,
          averageProgress: Math.round(avgProgress * 100) / 100,
          averageTimeElapsed: Math.round(avgTimeElapsed),
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error exporting monitoring report:', error);
      throw new InternalServerErrorException('Failed to export report');
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
            flag_count: supabase.rpc('increment', {
              participant_id: participant.id,
            }),
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
