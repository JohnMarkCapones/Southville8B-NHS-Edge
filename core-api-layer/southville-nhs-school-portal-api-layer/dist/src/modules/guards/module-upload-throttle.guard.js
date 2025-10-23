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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleUploadThrottleGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ModuleUploadThrottleGuard = class ModuleUploadThrottleGuard {
    configService;
    uploadCounts = new Map();
    teacherUploadLimit;
    adminUploadLimit = 1000;
    constructor(configService) {
        this.configService = configService;
        this.teacherUploadLimit =
            this.configService.get('r2.rateLimiting.teacherUploadLimit') ||
                10;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.HttpException('User not authenticated', common_1.HttpStatus.UNAUTHORIZED);
        }
        const userId = user.id;
        const userRole = user.role;
        if (userRole === 'Admin') {
            return true;
        }
        if (userRole === 'Teacher') {
            return this.checkTeacherUploadLimit(userId);
        }
        if (userRole === 'Student') {
            throw new common_1.HttpException('Students cannot upload modules', common_1.HttpStatus.FORBIDDEN);
        }
        return true;
    }
    checkTeacherUploadLimit(userId) {
        const now = new Date();
        const userUploads = this.uploadCounts.get(userId);
        if (!userUploads || now > userUploads.resetAt) {
            this.uploadCounts.set(userId, {
                count: 1,
                resetAt: new Date(now.getTime() + 60 * 60 * 1000),
            });
            return true;
        }
        if (userUploads.count >= this.teacherUploadLimit) {
            const timeUntilReset = Math.ceil((userUploads.resetAt.getTime() - now.getTime()) / 1000 / 60);
            throw new common_1.HttpException(`Upload limit exceeded. You can upload ${this.teacherUploadLimit} modules per hour. Try again in ${timeUntilReset} minutes.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        userUploads.count++;
        this.uploadCounts.set(userId, userUploads);
        return true;
    }
    getUploadCount(userId) {
        const userUploads = this.uploadCounts.get(userId);
        const now = new Date();
        if (!userUploads || now > userUploads.resetAt) {
            return {
                count: 0,
                limit: this.teacherUploadLimit,
                resetAt: new Date(now.getTime() + 60 * 60 * 1000),
            };
        }
        return {
            count: userUploads.count,
            limit: this.teacherUploadLimit,
            resetAt: userUploads.resetAt,
        };
    }
    resetUploadCount(userId) {
        this.uploadCounts.delete(userId);
    }
    cleanupExpiredEntries() {
        const now = new Date();
        for (const [userId, uploads] of this.uploadCounts.entries()) {
            if (now > uploads.resetAt) {
                this.uploadCounts.delete(userId);
            }
        }
    }
};
exports.ModuleUploadThrottleGuard = ModuleUploadThrottleGuard;
exports.ModuleUploadThrottleGuard = ModuleUploadThrottleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ModuleUploadThrottleGuard);
//# sourceMappingURL=module-upload-throttle.guard.js.map