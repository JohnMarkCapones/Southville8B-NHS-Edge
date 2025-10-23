import { SupabaseService } from '../../supabase/supabase.service';
import { CreateNewsCategoryDto } from '../dto';
import { NewsCategory } from '../entities';
export declare class NewsCategoriesService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    private generateSlug;
    private mapToDto;
    create(createDto: CreateNewsCategoryDto): Promise<NewsCategory>;
    findAll(): Promise<NewsCategory[]>;
    findOne(id: string): Promise<NewsCategory>;
    findBySlug(slug: string): Promise<NewsCategory>;
    update(id: string, updateDto: Partial<CreateNewsCategoryDto>): Promise<NewsCategory>;
    remove(id: string): Promise<void>;
}
