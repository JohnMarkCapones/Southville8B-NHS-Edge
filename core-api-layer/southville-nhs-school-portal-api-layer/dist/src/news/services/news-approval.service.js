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
var NewsApprovalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsApprovalService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const news_access_service_1 = require("./news-access.service");
let NewsApprovalService = NewsApprovalService_1 = class NewsApprovalService {
    supabaseService;
    newsAccessService;
    logger = new common_1.Logger(NewsApprovalService_1.name);
    constructor(supabaseService, newsAccessService) {
        this.supabaseService = supabaseService;
        this.newsAccessService = newsAccessService;
    }
    async submitForApproval(newsId, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: article, error: fetchError } = await supabase
            .from('news')
            .select('author_id, status')
            .eq('id', newsId)
            .maybeSingle();
        if (fetchError || !article) {
            throw new common_1.NotFoundException(`Article with ID ${newsId} not found`);
        }
        if (article.author_id !== userId) {
            throw new common_1.ForbiddenException('Only the article author can submit it for approval');
        }
        if (article.status !== 'draft') {
            throw new common_1.BadRequestException(`Article is already ${article.status}. Only draft articles can be submitted for approval.`);
        }
        const { error: updateError } = await supabase
            .from('news')
            .update({
            status: 'pending_approval',
            updated_at: new Date().toISOString(),
        })
            .eq('id', newsId);
        if (updateError) {
            this.logger.error('Error submitting article for approval:', updateError);
            throw new common_1.BadRequestException(`Failed to submit article: ${updateError.message}`);
        }
        this.logger.log(`Article ${newsId} submitted for approval by user ${userId}`);
    }
    async approveArticle(newsId, approverId, approveDto) {
        const supabase = this.supabaseService.getServiceClient();
        await this.newsAccessService.requireApprovalPermission(approverId);
        const { data: article, error: fetchError } = await supabase
            .from('news')
            .select('status')
            .eq('id', newsId)
            .maybeSingle();
        if (fetchError || !article) {
            throw new common_1.NotFoundException(`Article with ID ${newsId} not found`);
        }
        if (article.status !== 'pending_approval') {
            throw new common_1.BadRequestException(`Article is ${article.status}. Only pending articles can be approved.`);
        }
        const { error: updateError } = await supabase
            .from('news')
            .update({
            status: 'approved',
            updated_at: new Date().toISOString(),
        })
            .eq('id', newsId);
        if (updateError) {
            this.logger.error('Error approving article:', updateError);
            throw new common_1.BadRequestException(`Failed to approve article: ${updateError.message}`);
        }
        const { data: approvalRecord, error: approvalError } = await supabase
            .from('news_approval')
            .insert({
            news_id: newsId,
            approver_id: approverId,
            status: 'approved',
            remarks: approveDto.remarks || null,
        })
            .select()
            .single();
        if (approvalError) {
            this.logger.error('Error creating approval record:', approvalError);
            throw new common_1.BadRequestException(`Failed to create approval record: ${approvalError.message}`);
        }
        this.logger.log(`Article ${newsId} approved by ${approverId}`);
        return {
            id: approvalRecord.id,
            news_id: approvalRecord.news_id,
            approver_id: approvalRecord.approver_id,
            status: approvalRecord.status,
            remarks: approvalRecord.remarks,
            action_at: approvalRecord.action_at,
        };
    }
    async rejectArticle(newsId, approverId, rejectDto) {
        const supabase = this.supabaseService.getServiceClient();
        await this.newsAccessService.requireApprovalPermission(approverId);
        const { data: article, error: fetchError } = await supabase
            .from('news')
            .select('status')
            .eq('id', newsId)
            .maybeSingle();
        if (fetchError || !article) {
            throw new common_1.NotFoundException(`Article with ID ${newsId} not found`);
        }
        if (article.status !== 'pending_approval') {
            throw new common_1.BadRequestException(`Article is ${article.status}. Only pending articles can be rejected.`);
        }
        const { error: updateError } = await supabase
            .from('news')
            .update({
            status: 'rejected',
            updated_at: new Date().toISOString(),
        })
            .eq('id', newsId);
        if (updateError) {
            this.logger.error('Error rejecting article:', updateError);
            throw new common_1.BadRequestException(`Failed to reject article: ${updateError.message}`);
        }
        const { data: rejectionRecord, error: rejectionError } = await supabase
            .from('news_approval')
            .insert({
            news_id: newsId,
            approver_id: approverId,
            status: 'rejected',
            remarks: rejectDto.remarks,
        })
            .select()
            .single();
        if (rejectionError) {
            this.logger.error('Error creating rejection record:', rejectionError);
            throw new common_1.BadRequestException(`Failed to create rejection record: ${rejectionError.message}`);
        }
        this.logger.log(`Article ${newsId} rejected by ${approverId}`);
        return {
            id: rejectionRecord.id,
            news_id: rejectionRecord.news_id,
            approver_id: rejectionRecord.approver_id,
            status: rejectionRecord.status,
            remarks: rejectionRecord.remarks,
            action_at: rejectionRecord.action_at,
        };
    }
    async publishArticle(newsId, publisherId) {
        const supabase = this.supabaseService.getServiceClient();
        await this.newsAccessService.requireApprovalPermission(publisherId);
        const { data: article, error: fetchError } = await supabase
            .from('news')
            .select('status')
            .eq('id', newsId)
            .maybeSingle();
        if (fetchError || !article) {
            throw new common_1.NotFoundException(`Article with ID ${newsId} not found`);
        }
        if (article.status !== 'approved') {
            throw new common_1.BadRequestException(`Article is ${article.status}. Only approved articles can be published.`);
        }
        const { error: updateError } = await supabase
            .from('news')
            .update({
            status: 'published',
            published_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .eq('id', newsId);
        if (updateError) {
            this.logger.error('Error publishing article:', updateError);
            throw new common_1.BadRequestException(`Failed to publish article: ${updateError.message}`);
        }
        this.logger.log(`Article ${newsId} published by ${publisherId}`);
    }
    async getApprovalHistory(newsId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news_approval')
            .select(`
        *,
        approver:users!news_approval_approver_id_fkey(id, full_name, email)
      `)
            .eq('news_id', newsId)
            .order('action_at', { ascending: false });
        if (error) {
            this.logger.error('Error fetching approval history:', error);
            throw new common_1.BadRequestException(`Failed to fetch approval history: ${error.message}`);
        }
        return data.map((record) => ({
            id: record.id,
            news_id: record.news_id,
            approver_id: record.approver_id,
            status: record.status,
            remarks: record.remarks,
            action_at: record.action_at,
            approver: record.approver,
        }));
    }
    async getPendingArticles() {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news')
            .select(`
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug)
      `)
            .eq('status', 'pending_approval')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (error) {
            this.logger.error('Error fetching pending articles:', error);
            throw new common_1.BadRequestException(`Failed to fetch pending articles: ${error.message}`);
        }
        return data;
    }
};
exports.NewsApprovalService = NewsApprovalService;
exports.NewsApprovalService = NewsApprovalService = NewsApprovalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        news_access_service_1.NewsAccessService])
], NewsApprovalService);
//# sourceMappingURL=news-approval.service.js.map