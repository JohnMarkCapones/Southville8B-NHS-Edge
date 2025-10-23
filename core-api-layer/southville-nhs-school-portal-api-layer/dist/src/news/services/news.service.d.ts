import { SupabaseService } from '../../supabase/supabase.service';
import { NewsAccessService } from './news-access.service';
import { NewsImageService } from './news-image.service';
import { TagsService } from './tags.service';
import { CreateNewsDto, UpdateNewsDto, AddCoAuthorDto } from '../dto';
import { News } from '../entities';
export declare class NewsService {
    private readonly supabaseService;
    private readonly newsAccessService;
    private readonly newsImageService;
    private readonly tagsService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, newsAccessService: NewsAccessService, newsImageService: NewsImageService, tagsService: TagsService);
    private generateSlug;
    private getJournalismDomainId;
    private mapToDto;
    create(createDto: CreateNewsDto, userId: string): Promise<News>;
    update(newsId: string, updateDto: UpdateNewsDto, userId: string): Promise<News>;
    remove(newsId: string, userId: string): Promise<void>;
    findAll(filters?: {
        status?: string;
        visibility?: string;
        categoryId?: string;
        authorId?: string;
        limit?: number;
        offset?: number;
    }): Promise<News[]>;
    findOne(id: string): Promise<News>;
    findBySlug(slug: string): Promise<News>;
    private incrementViews;
    private addCoAuthorsInternal;
    addCoAuthor(newsId: string, addCoAuthorDto: AddCoAuthorDto, userId: string): Promise<void>;
    removeCoAuthor(newsId: string, coAuthorUserId: string, userId: string): Promise<void>;
    findMyArticles(userId: string): Promise<News[]>;
}
