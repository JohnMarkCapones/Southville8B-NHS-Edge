import { SupabaseService } from '../../supabase/supabase.service';
import { CreateQuestionBankDto } from '../dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from '../dto/update-question-bank.dto';
import { QuestionBank } from '../entities/question-bank.entity';
export declare class QuestionBankService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateQuestionBankDto, teacherId: string): Promise<QuestionBank>;
    findAll(filters?: any): Promise<any>;
    findOne(id: string, teacherId: string): Promise<QuestionBank>;
    update(id: string, updateDto: UpdateQuestionBankDto, teacherId: string): Promise<QuestionBank>;
    remove(id: string, teacherId: string): Promise<void>;
}
