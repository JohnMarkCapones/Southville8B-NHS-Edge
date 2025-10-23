import { SupabaseService } from '../../supabase/supabase.service';
export declare class NewsAccessService {
    private readonly supabaseService;
    private readonly logger;
    private readonly PUBLISHING_POSITIONS;
    private readonly APPROVER_POSITIONS;
    constructor(supabaseService: SupabaseService);
    private getJournalismDomainId;
    isJournalismMember(userId: string): Promise<boolean>;
    getJournalismPosition(userId: string): Promise<string | null>;
    canPublishNews(userId: string): Promise<boolean>;
    canApproveNews(userId: string): Promise<boolean>;
    canEditArticle(userId: string, newsId: string): Promise<boolean>;
    canDeleteArticle(userId: string, newsId: string): Promise<boolean>;
    requireJournalismMembership(userId: string): Promise<void>;
    requirePublishingPosition(userId: string): Promise<void>;
    requireApprovalPermission(userId: string): Promise<void>;
}
