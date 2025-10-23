import { QuizAttemptsService } from '../services/quiz-attempts.service';
import { StartQuizAttemptDto } from '../dto/start-quiz-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { QuizAttempt } from '../entities';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
import { FastifyRequest } from 'fastify';
export declare class QuizAttemptsController {
    private readonly quizAttemptsService;
    private readonly logger;
    constructor(quizAttemptsService: QuizAttemptsService);
    startAttempt(quizId: string, startDto: StartQuizAttemptDto, user: SupabaseUser, request: FastifyRequest): Promise<any>;
    submitAnswer(attemptId: string, submitDto: SubmitAnswerDto, user: SupabaseUser): Promise<{
        message: string;
    }>;
    submitAttempt(attemptId: string, user: SupabaseUser): Promise<any>;
    getAttempt(attemptId: string, user: SupabaseUser): Promise<QuizAttempt>;
}
