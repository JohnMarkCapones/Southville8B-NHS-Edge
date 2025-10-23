import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class FaqController {
    private readonly faqService;
    private readonly logger;
    constructor(faqService: FaqService);
    findAll(page: number, limit: number, search?: string): Promise<{
        data: Faq[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    search(query: string): Promise<{
        data: Faq[];
        total: number;
    }>;
    findOne(id: string): Promise<Faq>;
    create(createFaqDto: CreateFaqDto, user: SupabaseUser): Promise<Faq>;
    update(id: string, updateFaqDto: UpdateFaqDto, user: SupabaseUser): Promise<Faq>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
