import { SupabaseService } from '../supabase/supabase.service';
import { Subject } from './entities/subject.entity';
import { SubjectQueryDto } from './dto/subject-query.dto';
interface PaginatedResult {
    data: Subject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class SubjectsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    private getSupabaseClient;
    findAll(query: SubjectQueryDto): Promise<PaginatedResult>;
    findOne(id: string): Promise<Subject>;
}
export {};
