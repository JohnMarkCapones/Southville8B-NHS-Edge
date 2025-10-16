import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UploadCount {
  count: number;
  resetAt: Date;
}

@Injectable()
export class ModuleUploadThrottleGuard implements CanActivate {
  private readonly uploadCounts = new Map<string, UploadCount>();
  private readonly teacherUploadLimit: number;
  private readonly adminUploadLimit: number = 1000; // Admins have high limit

  constructor(private readonly configService: ConfigService) {
    this.teacherUploadLimit =
      this.configService.get<number>('r2.rateLimiting.teacherUploadLimit') ||
      10;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = user.id;
    const userRole = user.role;

    // Admins have no limit
    if (userRole === 'Admin') {
      return true;
    }

    // Teachers have upload limit
    if (userRole === 'Teacher') {
      return this.checkTeacherUploadLimit(userId);
    }

    // Students cannot upload modules
    if (userRole === 'Student') {
      throw new HttpException(
        'Students cannot upload modules',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }

  private checkTeacherUploadLimit(userId: string): boolean {
    const now = new Date();
    const userUploads = this.uploadCounts.get(userId);

    // If no previous uploads or reset time has passed
    if (!userUploads || now > userUploads.resetAt) {
      this.uploadCounts.set(userId, {
        count: 1,
        resetAt: new Date(now.getTime() + 60 * 60 * 1000), // Reset in 1 hour
      });
      return true;
    }

    // Check if limit exceeded
    if (userUploads.count >= this.teacherUploadLimit) {
      const timeUntilReset = Math.ceil(
        (userUploads.resetAt.getTime() - now.getTime()) / 1000 / 60,
      );
      throw new HttpException(
        `Upload limit exceeded. You can upload ${this.teacherUploadLimit} modules per hour. Try again in ${timeUntilReset} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    userUploads.count++;
    this.uploadCounts.set(userId, userUploads);

    return true;
  }

  /**
   * Get current upload count for user
   */
  getUploadCount(userId: string): {
    count: number;
    limit: number;
    resetAt: Date;
  } {
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

  /**
   * Reset upload count for user (admin function)
   */
  resetUploadCount(userId: string): void {
    this.uploadCounts.delete(userId);
  }

  /**
   * Clean up expired entries
   */
  cleanupExpiredEntries(): void {
    const now = new Date();
    for (const [userId, uploads] of this.uploadCounts.entries()) {
      if (now > uploads.resetAt) {
        this.uploadCounts.delete(userId);
      }
    }
  }
}
