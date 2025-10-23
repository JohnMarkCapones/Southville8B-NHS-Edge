import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { NewsService } from '../services/news.service';
import { NewsApprovalService } from '../services/news-approval.service';
import { CreateNewsDto, UpdateNewsDto, ApproveNewsDto, RejectNewsDto, AddCoAuthorDto } from '../dto';
export declare class NewsController {
    private readonly newsService;
    private readonly newsApprovalService;
    private readonly r2StorageService;
    private readonly logger;
    constructor(newsService: NewsService, newsApprovalService: NewsApprovalService, r2StorageService: R2StorageService);
    findAllPublic(categoryId?: string, limit?: number, offset?: number): Promise<import("../entities").News[]>;
    findBySlugPublic(slug: string): Promise<import("../entities").News>;
    create(createDto: CreateNewsDto, userId: string): Promise<import("../entities").News>;
    uploadImage(request: any, userId: string): Promise<{
        url: string | undefined;
        fileName: string;
        fileSize: number;
    }>;
    findAll(status?: string, visibility?: string, categoryId?: string, authorId?: string, limit?: number, offset?: number): Promise<import("../entities").News[]>;
    findMyArticles(userId: string): Promise<import("../entities").News[]>;
    getPendingArticles(userId: string): Promise<any[]>;
    findOne(id: string): Promise<import("../entities").News>;
    update(id: string, updateDto: UpdateNewsDto, userId: string): Promise<import("../entities").News>;
    remove(id: string, userId: string): Promise<void>;
    submitForApproval(id: string, userId: string): Promise<{
        message: string;
    }>;
    approve(id: string, approveDto: ApproveNewsDto, userId: string): Promise<import("../entities").NewsApproval>;
    reject(id: string, rejectDto: RejectNewsDto, userId: string): Promise<import("../entities").NewsApproval>;
    publish(id: string, userId: string): Promise<{
        message: string;
    }>;
    getApprovalHistory(id: string): Promise<import("../entities").NewsApproval[]>;
    addCoAuthor(id: string, addCoAuthorDto: AddCoAuthorDto, userId: string): Promise<{
        message: string;
    }>;
    removeCoAuthor(id: string, coAuthorUserId: string, userId: string): Promise<void>;
}
