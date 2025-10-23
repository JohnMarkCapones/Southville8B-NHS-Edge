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
var AccessControlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const crypto_1 = require("crypto");
let AccessControlService = AccessControlService_1 = class AccessControlService {
    supabaseService;
    logger = new common_1.Logger(AccessControlService_1.name);
    TOKEN_LENGTH = 32;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async generateAccessLink(dto) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .select('teacher_id, title, status')
                .eq('quiz_id', dto.quizId)
                .single();
            if (quizError || !quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            if (quiz.teacher_id !== dto.teacherId) {
                throw new common_1.ForbiddenException('You can only create access links for your own quizzes');
            }
            if (quiz.status !== 'published') {
                throw new common_1.BadRequestException('Quiz must be published to generate access links');
            }
            const token = this.generateSecureToken();
            const { data: accessRecord, error: accessError } = await supabase
                .from('quiz_access_links')
                .insert({
                quiz_id: dto.quizId,
                access_token: token,
                expires_at: dto.expiresAt,
                access_code: dto.accessCode,
                max_uses: dto.maxUses,
                requires_auth: dto.requiresAuth !== false,
                created_by: dto.teacherId,
            })
                .select()
                .single();
            if (accessError) {
                this.logger.error('Error creating access link:', accessError);
                throw new common_1.InternalServerErrorException('Failed to create access link');
            }
            const accessLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/access/${token}`;
            const qrCodeData = accessLink;
            this.logger.log(`Access link generated for quiz ${dto.quizId}`);
            return {
                token,
                accessLink,
                qrCodeData,
                expiresAt: dto.expiresAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error generating access link:', error);
            throw new common_1.InternalServerErrorException('Failed to generate access link');
        }
    }
    async validateAccess(dto) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: accessRecord, error: accessError } = await supabase
                .from('quiz_access_links')
                .select('*')
                .eq('access_token', dto.token)
                .single();
            if (accessError || !accessRecord) {
                return {
                    isValid: false,
                    reason: 'Invalid access token',
                };
            }
            if (accessRecord.is_revoked) {
                return {
                    isValid: false,
                    reason: 'Access link has been revoked',
                };
            }
            if (accessRecord.expires_at) {
                const expiresAt = new Date(accessRecord.expires_at);
                const now = new Date();
                if (now > expiresAt) {
                    return {
                        isValid: false,
                        reason: 'Access link has expired',
                    };
                }
            }
            if (accessRecord.max_uses && accessRecord.use_count >= accessRecord.max_uses) {
                return {
                    isValid: false,
                    reason: 'Access link usage limit reached',
                };
            }
            if (accessRecord.access_code && accessRecord.access_code !== dto.accessCode) {
                return {
                    isValid: false,
                    reason: 'Invalid access code',
                };
            }
            if (accessRecord.requires_auth && !dto.studentId) {
                return {
                    isValid: false,
                    reason: 'Authentication required',
                    requiresAuth: true,
                };
            }
            return {
                isValid: true,
                quizId: accessRecord.quiz_id,
                requiresAuth: accessRecord.requires_auth,
            };
        }
        catch (error) {
            this.logger.error('Error validating access:', error);
            return {
                isValid: false,
                reason: 'Access validation failed',
            };
        }
    }
    async recordAccessUsage(token, studentId, metadata) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: accessRecord } = await supabase
                .from('quiz_access_links')
                .select('link_id, quiz_id')
                .eq('access_token', token)
                .single();
            if (!accessRecord) {
                return;
            }
            await supabase
                .from('quiz_access_links')
                .update({
                use_count: supabase.rpc('increment', { row_id: accessRecord.link_id }),
                last_used_at: new Date().toISOString(),
            })
                .eq('link_id', accessRecord.link_id);
            await supabase.from('quiz_access_logs').insert({
                link_id: accessRecord.link_id,
                quiz_id: accessRecord.quiz_id,
                student_id: studentId,
                accessed_at: new Date().toISOString(),
                metadata,
            });
            this.logger.log(`Access recorded for token ${token} by student ${studentId}`);
        }
        catch (error) {
            this.logger.error('Error recording access usage:', error);
        }
    }
    async revokeAccessLink(token, teacherId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: accessRecord, error: fetchError } = await supabase
                .from('quiz_access_links')
                .select('link_id, created_by')
                .eq('access_token', token)
                .single();
            if (fetchError || !accessRecord) {
                throw new common_1.NotFoundException('Access link not found');
            }
            if (accessRecord.created_by !== teacherId) {
                throw new common_1.ForbiddenException('You can only revoke your own access links');
            }
            const { error: revokeError } = await supabase
                .from('quiz_access_links')
                .update({
                is_revoked: true,
                revoked_at: new Date().toISOString(),
            })
                .eq('link_id', accessRecord.link_id);
            if (revokeError) {
                throw new common_1.InternalServerErrorException('Failed to revoke access link');
            }
            this.logger.log(`Access link ${token} revoked by teacher ${teacherId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error revoking access link:', error);
            throw new common_1.InternalServerErrorException('Failed to revoke access link');
        }
    }
    async getQuizAccessLinks(quizId, teacherId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .select('teacher_id')
                .eq('quiz_id', quizId)
                .single();
            if (quizError || !quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            if (quiz.teacher_id !== teacherId) {
                throw new common_1.ForbiddenException('You can only view access links for your own quizzes');
            }
            const { data: accessLinks, error: linksError } = await supabase
                .from('quiz_access_links')
                .select('*')
                .eq('quiz_id', quizId)
                .order('created_at', { ascending: false });
            if (linksError) {
                throw new common_1.InternalServerErrorException('Failed to fetch access links');
            }
            const enrichedLinks = await Promise.all((accessLinks || []).map(async (link) => {
                const { data: usageLogs } = await supabase
                    .from('quiz_access_logs')
                    .select('student_id')
                    .eq('link_id', link.link_id);
                const uniqueUsers = new Set(usageLogs?.map(log => log.student_id)).size;
                return {
                    ...link,
                    uniqueUsers,
                    accessLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/access/${link.access_token}`,
                };
            }));
            return enrichedLinks;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error fetching access links:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch access links');
        }
    }
    generateSecureToken() {
        return (0, crypto_1.randomBytes)(this.TOKEN_LENGTH).toString('hex');
    }
    async generateQRCode(accessLink) {
        try {
            const qrData = {
                type: 'quiz_access',
                url: accessLink,
                format: 'url',
            };
            return JSON.stringify(qrData);
        }
        catch (error) {
            this.logger.error('Error generating QR code:', error);
            throw new common_1.InternalServerErrorException('Failed to generate QR code');
        }
    }
};
exports.AccessControlService = AccessControlService;
exports.AccessControlService = AccessControlService = AccessControlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AccessControlService);
//# sourceMappingURL=access-control.service.js.map