import { ConfigService } from '@nestjs/config';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
export declare class FaqService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createFaqDto: CreateFaqDto): Promise<Faq>;
    findAll(filters?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        data: Faq[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Faq>;
    update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq>;
    remove(id: string): Promise<void>;
    search(query: string): Promise<{
        data: Faq[];
        total: number;
    }>;
}
