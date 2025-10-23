import { SupabaseService } from '../../supabase/supabase.service';
import { StartQuizAttemptDto } from '../dto/start-quiz-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { QuizAttempt } from '../entities';
import { AutoGradingService } from './auto-grading.service';
import { SessionManagementService } from './session-management.service';
export declare class QuizAttemptsService {
    private readonly supabaseService;
    private readonly autoGradingService;
    private readonly sessionManagementService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, autoGradingService: AutoGradingService, sessionManagementService: SessionManagementService);
    startAttempt(quizId: string, studentId: string, startDto: StartQuizAttemptDto, ipAddress?: string): Promise<any>;
    submitAnswer(attemptId: string, studentId: string, submitDto: SubmitAnswerDto): Promise<void>;
    submitAttempt(attemptId: string, studentId: string): Promise<any>;
    getAttempt(attemptId: string, studentId: string): Promise<QuizAttempt>;
}
