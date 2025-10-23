import { QuestionBankService } from '../services/question-bank.service';
import { CreateQuestionBankDto } from '../dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from '../dto/update-question-bank.dto';
import { QuestionBank } from '../entities/question-bank.entity';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
export declare class QuestionBankController {
    private readonly questionBankService;
    private readonly logger;
    constructor(questionBankService: QuestionBankService);
    create(createDto: CreateQuestionBankDto, user: SupabaseUser): Promise<QuestionBank>;
    findAll(user: SupabaseUser, page?: number, limit?: number, subjectId?: string, topic?: string, difficulty?: string, questionType?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    findOne(id: string, user: SupabaseUser): Promise<QuestionBank>;
    update(id: string, updateDto: UpdateQuestionBankDto, user: SupabaseUser): Promise<QuestionBank>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
