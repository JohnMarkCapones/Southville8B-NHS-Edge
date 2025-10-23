import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ModuleUploadThrottleGuard implements CanActivate {
    private readonly configService;
    private readonly uploadCounts;
    private readonly teacherUploadLimit;
    private readonly adminUploadLimit;
    constructor(configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkTeacherUploadLimit;
    getUploadCount(userId: string): {
        count: number;
        limit: number;
        resetAt: Date;
    };
    resetUploadCount(userId: string): void;
    cleanupExpiredEntries(): void;
}
