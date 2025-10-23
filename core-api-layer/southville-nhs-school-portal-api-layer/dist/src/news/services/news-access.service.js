"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NewsAccessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsAccessService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let NewsAccessService = NewsAccessService_1 = class NewsAccessService {
    supabaseService;
    logger = new common_1.Logger(NewsAccessService_1.name);
    PUBLISHING_POSITIONS = [
        'Adviser',
        'Co-Adviser',
        'Editor-in-Chief',
        'Co-Editor-in-Chief',
        'Publisher',
        'Writer',
    ];
    APPROVER_POSITIONS = ['Adviser', 'Co-Adviser'];
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getJournalismDomainId() {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('domains')
            .select('id')
            .eq('type', 'journalism')
            .maybeSingle();
        if (error) {
            this.logger.error('Error fetching journalism domain:', error);
            return null;
        }
        return data?.id || null;
    }
    async isJournalismMember(userId) {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        if (!domainId) {
            this.logger.warn('Journalism domain not found');
            return false;
        }
        const { data, error } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        domain_roles!inner(
          domain_id
        )
      `)
            .eq('user_id', userId)
            .eq('domain_roles.domain_id', domainId)
            .limit(1);
        if (error) {
            this.logger.error('Error checking journalism membership:', error);
            return false;
        }
        return data && data.length > 0;
    }
    async getJournalismPosition(userId) {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        if (!domainId)
            return null;
        const { data, error } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        domain_roles!inner(
          domain_id,
          name
        )
      `)
            .eq('user_id', userId)
            .eq('domain_roles.domain_id', domainId)
            .maybeSingle();
        if (error || !data) {
            this.logger.debug(`No journalism position found for user ${userId}`);
            return null;
        }
        const domainRoles = data.domain_roles;
        return domainRoles?.name || null;
    }
    async canPublishNews(userId) {
        const position = await this.getJournalismPosition(userId);
        if (!position) {
            this.logger.debug(`User ${userId} has no journalism position`);
            return false;
        }
        const canPublish = this.PUBLISHING_POSITIONS.includes(position);
        this.logger.debug(`User ${userId} has position ${position}, can publish: ${canPublish}`);
        return canPublish;
    }
    async canApproveNews(userId) {
        const position = await this.getJournalismPosition(userId);
        if (!position) {
            return false;
        }
        const canApprove = this.APPROVER_POSITIONS.includes(position);
        this.logger.debug(`User ${userId} has position ${position}, can approve: ${canApprove}`);
        return canApprove;
    }
    async canEditArticle(userId, newsId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: article, error } = await supabase
            .from('news')
            .select('author_id, status')
            .eq('id', newsId)
            .maybeSingle();
        if (error || !article) {
            this.logger.warn(`Article ${newsId} not found`);
            return false;
        }
        if (article.status === 'published' || article.status === 'archived') {
            this.logger.debug(`Article ${newsId} is ${article.status}, cannot be edited`);
            return false;
        }
        if (article.author_id === userId) {
            this.logger.debug(`User ${userId} is author of article ${newsId}`);
            return true;
        }
        const position = await this.getJournalismPosition(userId);
        if (position && this.APPROVER_POSITIONS.includes(position)) {
            this.logger.debug(`User ${userId} is ${position}, can edit article ${newsId}`);
            return true;
        }
        return false;
    }
    async canDeleteArticle(userId, newsId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: article, error } = await supabase
            .from('news')
            .select('author_id, status')
            .eq('id', newsId)
            .maybeSingle();
        if (error || !article) {
            return false;
        }
        if (article.status !== 'draft') {
            this.logger.debug(`Article ${newsId} is ${article.status}, cannot be deleted`);
            return false;
        }
        if (article.author_id === userId) {
            return true;
        }
        const position = await this.getJournalismPosition(userId);
        return position !== null && this.APPROVER_POSITIONS.includes(position);
    }
    async requireJournalismMembership(userId) {
        const isMember = await this.isJournalismMember(userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You must be a member of the journalism team to perform this action');
        }
    }
    async requirePublishingPosition(userId) {
        const canPublish = await this.canPublishNews(userId);
        if (!canPublish) {
            throw new common_1.ForbiddenException('You must have a publishing position (Writer, Publisher, Editor-in-Chief, Co-Editor-in-Chief, Adviser, or Co-Adviser) to create articles');
        }
    }
    async requireApprovalPermission(userId) {
        const canApprove = await this.canApproveNews(userId);
        if (!canApprove) {
            throw new common_1.ForbiddenException('Only Advisers and Co-Advisers can approve articles');
        }
    }
};
exports.NewsAccessService = NewsAccessService;
exports.NewsAccessService = NewsAccessService = NewsAccessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], NewsAccessService);
//# sourceMappingURL=news-access.service.js.map