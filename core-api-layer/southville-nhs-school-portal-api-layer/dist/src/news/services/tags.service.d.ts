import { SupabaseService } from '../../supabase/supabase.service';
import { Tag } from '../entities';
export declare class TagsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    private generateSlug;
    private mapToDto;
    getOrCreate(name: string): Promise<Tag>;
    getOrCreateMultiple(names: string[]): Promise<Tag[]>;
    findAll(): Promise<Tag[]>;
    findPopular(limit?: number): Promise<Tag[]>;
    linkToNews(newsId: string, tagIds: string[]): Promise<void>;
    unlinkFromNews(newsId: string): Promise<void>;
    updateNewsTags(newsId: string, tagNames: string[]): Promise<Tag[]>;
}
