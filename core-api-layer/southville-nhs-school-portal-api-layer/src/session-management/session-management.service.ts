import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Session Management Service
 *
 * Handles:
 * - Session timeout warnings (2 hours of inactivity)
 * - Active session tracking
 * - Session cleanup
 * - Device management
 * - Security monitoring
 */

interface ActiveSession {
  userId: string;
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    lastActivity: Date;
    createdAt: Date;
  };
  isActive: boolean;
  expiresAt: Date;
}

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  // In-memory store for active sessions (in production, use Redis)
  private readonly activeSessions = new Map<string, ActiveSession>();

  // Session configuration
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
  private readonly WARNING_THRESHOLD = 1.5 * 60 * 60 * 1000; // 1.5 hours (30 min warning)
  private readonly MAX_SESSIONS_PER_USER = 5; // Maximum concurrent sessions per user

  constructor(private readonly supabaseService: SupabaseService) {
    // Start periodic cleanup
    this.startSessionCleanup();
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    sessionId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<ActiveSession> {
    // Check if user has too many active sessions
    await this.enforceSessionLimit(userId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TIMEOUT);

    const session: ActiveSession = {
      userId,
      sessionId,
      deviceInfo: {
        userAgent,
        ipAddress,
        lastActivity: now,
        createdAt: now,
      },
      isActive: true,
      expiresAt,
    };

    this.activeSessions.set(sessionId, session);

    this.logger.log(
      `✅ New session created for user ${userId} from ${ipAddress}. ` +
        `Expires at: ${expiresAt.toISOString()}`,
    );

    return session;
  }

  /**
   * Update session activity (called on each request)
   */
  async updateSessionActivity(sessionId: string): Promise<{
    isActive: boolean;
    timeUntilWarning?: number;
    timeUntilExpiry?: number;
  }> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return { isActive: false };
    }

    const now = new Date();
    const timeSinceLastActivity =
      now.getTime() - session.deviceInfo.lastActivity.getTime();
    const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
    const timeUntilWarning = this.WARNING_THRESHOLD - timeSinceLastActivity;

    // Update last activity
    session.deviceInfo.lastActivity = now;

    // Check if session should be extended
    if (timeUntilExpiry < this.WARNING_THRESHOLD) {
      // Extend session by 2 hours from now
      session.expiresAt = new Date(now.getTime() + this.SESSION_TIMEOUT);
      this.logger.log(`🔄 Session extended for user ${session.userId}`);
    }

    // Check if session is expired
    if (timeUntilExpiry <= 0) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);
      this.logger.log(`⏰ Session expired for user ${session.userId}`);
      return { isActive: false };
    }

    return {
      isActive: true,
      timeUntilWarning: timeUntilWarning > 0 ? timeUntilWarning : undefined,
      timeUntilExpiry,
    };
  }

  /**
   * End a session
   */
  async endSession(sessionId: string, userId?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);

    if (session) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);

      this.logger.log(
        `🔚 Session ended for user ${session.userId} from ${session.deviceInfo.ipAddress}`,
      );
    }
  }

  /**
   * End all sessions for a user
   */
  async endAllUserSessions(userId: string): Promise<number> {
    let endedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
        this.activeSessions.delete(sessionId);
        endedCount++;
      }
    }

    this.logger.log(`🔚 Ended ${endedCount} sessions for user ${userId}`);
    return endedCount;
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<ActiveSession[]> {
    const userSessions: ActiveSession[] = [];

    for (const session of this.activeSessions.values()) {
      if (session.userId === userId && session.isActive) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  /**
   * Check if session needs a timeout warning
   */
  async checkSessionWarning(sessionId: string): Promise<{
    needsWarning: boolean;
    timeRemaining?: number;
  }> {
    const session = this.activeSessions.get(sessionId);

    if (!session || !session.isActive) {
      return { needsWarning: false };
    }

    const now = new Date();
    const timeSinceLastActivity =
      now.getTime() - session.deviceInfo.lastActivity.getTime();
    const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();

    // Show warning if less than 30 minutes remaining
    const needsWarning =
      timeUntilExpiry <= this.WARNING_THRESHOLD && timeUntilExpiry > 0;

    return {
      needsWarning,
      timeRemaining: needsWarning ? timeUntilExpiry : undefined,
    };
  }

  /**
   * Enforce maximum sessions per user
   */
  private async enforceSessionLimit(userId: string): Promise<void> {
    const userSessions = await this.getUserSessions(userId);

    if (userSessions.length >= this.MAX_SESSIONS_PER_USER) {
      // End oldest session
      const oldestSession = userSessions.reduce((oldest, current) =>
        current.deviceInfo.createdAt < oldest.deviceInfo.createdAt
          ? current
          : oldest,
      );

      await this.endSession(oldestSession.sessionId);

      this.logger.log(
        `🔄 Ended oldest session for user ${userId} to enforce session limit`,
      );
    }
  }

  /**
   * Start periodic session cleanup
   */
  private startSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.expiresAt <= now) {
        session.isActive = false;
        this.activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Get session statistics for monitoring
   */
  getSessionStats(): {
    totalActiveSessions: number;
    sessionsByUser: Record<string, number>;
    averageSessionAge: number;
  } {
    const now = new Date();
    const sessionsByUser: Record<string, number> = {};
    let totalAge = 0;
    let activeCount = 0;

    for (const session of this.activeSessions.values()) {
      if (session.isActive) {
        activeCount++;
        sessionsByUser[session.userId] =
          (sessionsByUser[session.userId] || 0) + 1;
        totalAge += now.getTime() - session.deviceInfo.createdAt.getTime();
      }
    }

    return {
      totalActiveSessions: activeCount,
      sessionsByUser,
      averageSessionAge: activeCount > 0 ? totalAge / activeCount : 0,
    };
  }
}
