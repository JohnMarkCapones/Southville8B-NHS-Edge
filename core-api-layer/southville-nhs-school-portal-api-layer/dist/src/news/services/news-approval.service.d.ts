import { SupabaseService } from '../../supabase/supabase.service';
import { NewsAccessService } from './news-access.service';
import { ApproveNewsDto, RejectNewsDto } from '../dto';
import { NewsApproval } from '../entities';
export declare class NewsApprovalService {
    private readonly supabaseService;
    private readonly newsAccessService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, newsAccessService: NewsAccessService);
    submitForApproval(newsId: string, userId: string): Promise<void>;
    approveArticle(newsId: string, approverId: string, approveDto: ApproveNewsDto): Promise<NewsApproval>;
    rejectArticle(newsId: string, approverId: string, rejectDto: RejectNewsDto): Promise<NewsApproval>;
    publishArticle(newsId: string, publisherId: string): Promise<void>;
    getApprovalHistory(newsId: string): Promise<NewsApproval[]>;
    getPendingArticles(): Promise<any[]>;
}
