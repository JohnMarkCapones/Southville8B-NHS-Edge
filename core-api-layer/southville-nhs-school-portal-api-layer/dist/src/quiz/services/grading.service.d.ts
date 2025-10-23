import { SupabaseService } from '../../supabase/supabase.service';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
export declare class GradingService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getUngradedAnswers(quizId: string, teacherId: string): Promise<any>;
    gradeAnswer(answerId: string, teacherId: string, gradeDto: GradeAnswerDto): Promise<any>;
    private recalculateAttemptScore;
}
