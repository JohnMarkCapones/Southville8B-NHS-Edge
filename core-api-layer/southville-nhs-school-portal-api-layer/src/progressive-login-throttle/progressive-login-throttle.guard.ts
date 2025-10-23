import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Progressive Login Throttle Guard
 *
 * Implements progressive rate limiting for login attempts:
 * - 5 failed attempts → 1 minute lockout
 * - 8 total attempts → 5 minutes lockout
 * - 10 total attempts → 15 minutes lockout
 *
 * This exponentially increases difficulty for attackers while being
 * user-friendly for legitimate users who make mistakes.
 */

interface LoginAttempt {
  count: number;
  firstAttempt: Date;
  lastAttempt: Date;
  lockoutUntil?: Date;
  lockoutLevel: number; // 0 = no lockout, 1 = 1min, 2 = 5min, 3 = 15min
}

@Injectable()
export class ProgressiveLoginThrottleGuard implements CanActivate {
  private readonly logger = new Logger(ProgressiveLoginThrottleGuard.name);

  // In-memory store for login attempts (in production, use Redis)
  private readonly loginAttempts = new Map<string, LoginAttempt>();

  // Progressive lockout levels
  private readonly LOCKOUT_LEVELS = [
    { attempts: 5, duration: 1 * 60 * 1000, name: '1 minute' }, // 5 attempts → 1 min
    { attempts: 8, duration: 5 * 60 * 1000, name: '5 minutes' }, // 8 attempts → 5 min
    { attempts: 10, duration: 15 * 60 * 1000, name: '15 minutes' }, // 10 attempts → 15 min
  ];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Create unique identifier for this client
    const clientId = `${clientIp}:${userAgent}`;

    // Debug logging
    this.logger.log(
      `🔍 ProgressiveLoginThrottleGuard called for IP: ${clientIp}, UserAgent: ${userAgent}`,
    );
    this.logger.log(`🔍 Client ID: ${clientId}`);

    // Clean up old attempts periodically
    this.cleanupOldAttempts();

    // Get current attempt record
    const attempt = this.loginAttempts.get(clientId);

    // Check if currently locked out
    if (attempt?.lockoutUntil && new Date() < attempt.lockoutUntil) {
      const remainingTime = Math.ceil(
        (attempt.lockoutUntil.getTime() - Date.now()) / 1000 / 60,
      );

      this.logger.warn(
        `🚫 Login blocked for ${clientIp} - ${
          attempt.lockoutLevel === 1
            ? '1 minute'
            : attempt.lockoutLevel === 2
              ? '5 minutes'
              : '15 minutes'
        } lockout active. ` +
          `Remaining: ${remainingTime} minutes. Total attempts: ${attempt.count}`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many failed login attempts. Please try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`,
          error: 'Rate Limited',
          retryAfter: Math.ceil(
            (attempt.lockoutUntil.getTime() - Date.now()) / 1000,
          ),
          lockoutLevel: attempt.lockoutLevel,
          totalAttempts: attempt.count,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // If lockout period has expired, reset the attempt count
    if (attempt?.lockoutUntil && new Date() >= attempt.lockoutUntil) {
      this.logger.log(
        `✅ Lockout expired for ${clientIp}, resetting attempt count`,
      );
      this.loginAttempts.delete(clientId);
    }

    return true;
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(request: Request): void {
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const clientId = `${clientIp}:${userAgent}`;

    const now = new Date();
    const existingAttempt = this.loginAttempts.get(clientId);

    if (existingAttempt) {
      // Increment attempt count
      existingAttempt.count++;
      existingAttempt.lastAttempt = now;

      // Check if we need to apply a lockout
      const lockoutLevel = this.getLockoutLevel(existingAttempt.count);
      if (lockoutLevel > existingAttempt.lockoutLevel) {
        const lockoutDuration = this.LOCKOUT_LEVELS[lockoutLevel - 1].duration;
        existingAttempt.lockoutUntil = new Date(
          now.getTime() + lockoutDuration,
        );
        existingAttempt.lockoutLevel = lockoutLevel;

        this.logger.warn(
          `🔒 Progressive lockout applied to ${clientIp}: ` +
            `Level ${lockoutLevel} (${this.LOCKOUT_LEVELS[lockoutLevel - 1].name}) ` +
            `for ${existingAttempt.count} failed attempts`,
        );
      }
    } else {
      // First failed attempt
      this.loginAttempts.set(clientId, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        lockoutLevel: 0,
      });

      this.logger.log(`📝 First failed login attempt recorded for ${clientIp}`);
    }
  }

  /**
   * Record a successful login (reset attempts)
   */
  recordSuccessfulLogin(request: Request): void {
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const clientId = `${clientIp}:${userAgent}`;

    const attempt = this.loginAttempts.get(clientId);
    if (attempt) {
      this.logger.log(
        `✅ Successful login for ${clientIp}, clearing ${attempt.count} previous failed attempts`,
      );
      this.loginAttempts.delete(clientId);
    }
  }

  /**
   * Get the appropriate lockout level based on attempt count
   */
  private getLockoutLevel(attemptCount: number): number {
    for (let i = this.LOCKOUT_LEVELS.length - 1; i >= 0; i--) {
      if (attemptCount >= this.LOCKOUT_LEVELS[i].attempts) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.connection as any)?.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Clean up old attempt records (older than 24 hours)
   */
  private cleanupOldAttempts(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [clientId, attempt] of this.loginAttempts.entries()) {
      if (attempt.lastAttempt < cutoffTime) {
        this.loginAttempts.delete(clientId);
      }
    }
  }

  /**
   * Get current attempt statistics for monitoring
   */
  getAttemptStats(): {
    totalClients: number;
    lockedOutClients: number;
    attemptsByLevel: Record<number, number>;
  } {
    const now = new Date();
    let lockedOutClients = 0;
    const attemptsByLevel: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

    for (const attempt of this.loginAttempts.values()) {
      if (attempt.lockoutUntil && now < attempt.lockoutUntil) {
        lockedOutClients++;
      }
      attemptsByLevel[attempt.lockoutLevel]++;
    }

    return {
      totalClients: this.loginAttempts.size,
      lockedOutClients,
      attemptsByLevel,
    };
  }
}
