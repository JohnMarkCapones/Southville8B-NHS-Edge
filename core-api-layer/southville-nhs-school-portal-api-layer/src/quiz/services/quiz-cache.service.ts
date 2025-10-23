import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Quiz Cache Service
 *
 * Provides caching functionality for quiz data to improve performance.
 * Uses in-memory caching (FREE solution, no Redis required for MVP).
 *
 * Cache Keys Pattern:
 * - quiz:{quiz_id} - Full quiz object
 * - quiz:{quiz_id}:questions - Quiz questions
 * - quiz:{quiz_id}:settings - Quiz settings
 * - quiz:{quiz_id}:sections - Assigned sections
 * - student:{student_id}:quizzes - Student's available quizzes
 * - analytics:{quiz_id} - Quiz analytics
 */
@Injectable()
export class QuizCacheService {
  private readonly logger = new Logger(QuizCacheService.name);

  // Cache TTL (Time To Live) in seconds
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly QUIZ_TTL = 600; // 10 minutes
  private readonly QUESTIONS_TTL = 600; // 10 minutes
  private readonly ANALYTICS_TTL = 60; // 1 minute (frequently changing)
  private readonly STUDENT_QUIZZES_TTL = 180; // 3 minutes

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get cached quiz
   */
  async getQuiz(quizId: string): Promise<any | null> {
    try {
      const key = this.getQuizKey(quizId);
      const cached = await this.cacheManager.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT: ${key}`);
        return cached;
      }
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting cached quiz:', error);
      return null;
    }
  }

  /**
   * Set quiz cache
   */
  async setQuiz(quizId: string, quiz: any): Promise<void> {
    try {
      const key = this.getQuizKey(quizId);
      await this.cacheManager.set(key, quiz, this.QUIZ_TTL * 1000);
      this.logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      this.logger.error('Error setting quiz cache:', error);
    }
  }

  /**
   * Get cached quiz questions
   */
  async getQuizQuestions(quizId: string): Promise<any | null> {
    try {
      const key = this.getQuestionsKey(quizId);
      const cached = await this.cacheManager.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT: ${key}`);
        return cached;
      }
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting cached questions:', error);
      return null;
    }
  }

  /**
   * Set quiz questions cache
   */
  async setQuizQuestions(quizId: string, questions: any): Promise<void> {
    try {
      const key = this.getQuestionsKey(quizId);
      await this.cacheManager.set(key, questions, this.QUESTIONS_TTL * 1000);
      this.logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      this.logger.error('Error setting questions cache:', error);
    }
  }

  /**
   * Get cached quiz settings
   */
  async getQuizSettings(quizId: string): Promise<any | null> {
    try {
      const key = this.getSettingsKey(quizId);
      return await this.cacheManager.get(key);
    } catch (error) {
      this.logger.error('Error getting cached settings:', error);
      return null;
    }
  }

  /**
   * Set quiz settings cache
   */
  async setQuizSettings(quizId: string, settings: any): Promise<void> {
    try {
      const key = this.getSettingsKey(quizId);
      await this.cacheManager.set(key, settings, this.DEFAULT_TTL * 1000);
      this.logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      this.logger.error('Error setting settings cache:', error);
    }
  }

  /**
   * Get cached quiz sections
   */
  async getQuizSections(quizId: string): Promise<any | null> {
    try {
      const key = this.getSectionsKey(quizId);
      return await this.cacheManager.get(key);
    } catch (error) {
      this.logger.error('Error getting cached sections:', error);
      return null;
    }
  }

  /**
   * Set quiz sections cache
   */
  async setQuizSections(quizId: string, sections: any): Promise<void> {
    try {
      const key = this.getSectionsKey(quizId);
      await this.cacheManager.set(key, sections, this.DEFAULT_TTL * 1000);
      this.logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      this.logger.error('Error setting sections cache:', error);
    }
  }

  /**
   * Get cached student quizzes
   */
  async getStudentQuizzes(studentId: string): Promise<any | null> {
    try {
      const key = this.getStudentQuizzesKey(studentId);
      const cached = await this.cacheManager.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT: ${key}`);
        return cached;
      }
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting cached student quizzes:', error);
      return null;
    }
  }

  /**
   * Set student quizzes cache
   */
  async setStudentQuizzes(studentId: string, quizzes: any): Promise<void> {
    try {
      const key = this.getStudentQuizzesKey(studentId);
      await this.cacheManager.set(
        key,
        quizzes,
        this.STUDENT_QUIZZES_TTL * 1000,
      );
      this.logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      this.logger.error('Error setting student quizzes cache:', error);
    }
  }

  /**
   * Get cached analytics
   */
  async getAnalytics(quizId: string): Promise<any | null> {
    try {
      const key = this.getAnalyticsKey(quizId);
      return await this.cacheManager.get(key);
    } catch (error) {
      this.logger.error('Error getting cached analytics:', error);
      return null;
    }
  }

  /**
   * Set analytics cache
   */
  async setAnalytics(quizId: string, analytics: any): Promise<void> {
    try {
      const key = this.getAnalyticsKey(quizId);
      await this.cacheManager.set(key, analytics, this.ANALYTICS_TTL * 1000);
      this.logger.debug(`Cache SET: ${key}`);
    } catch (error) {
      this.logger.error('Error setting analytics cache:', error);
    }
  }

  /**
   * Invalidate quiz cache (when quiz is updated)
   */
  async invalidateQuiz(quizId: string): Promise<void> {
    try {
      await Promise.all([
        this.cacheManager.del(this.getQuizKey(quizId)),
        this.cacheManager.del(this.getQuestionsKey(quizId)),
        this.cacheManager.del(this.getSettingsKey(quizId)),
        this.cacheManager.del(this.getSectionsKey(quizId)),
        this.cacheManager.del(this.getAnalyticsKey(quizId)),
      ]);
      this.logger.log(`Quiz cache invalidated: ${quizId}`);
    } catch (error) {
      this.logger.error('Error invalidating quiz cache:', error);
    }
  }

  /**
   * Invalidate student quizzes cache
   */
  async invalidateStudentQuizzes(studentId: string): Promise<void> {
    try {
      await this.cacheManager.del(this.getStudentQuizzesKey(studentId));
      this.logger.log(`Student quizzes cache invalidated: ${studentId}`);
    } catch (error) {
      this.logger.error('Error invalidating student quizzes cache:', error);
    }
  }

  /**
   * Invalidate analytics cache
   */
  async invalidateAnalytics(quizId: string): Promise<void> {
    try {
      await this.cacheManager.del(this.getAnalyticsKey(quizId));
      this.logger.log(`Analytics cache invalidated: ${quizId}`);
    } catch (error) {
      this.logger.error('Error invalidating analytics cache:', error);
    }
  }

  /**
   * Clear all quiz-related cache
   * Note: cache-manager v5 doesn't support reset(), so we skip this for now
   */
  async clearAll(): Promise<void> {
    try {
      // cache-manager v5 doesn't have reset() method
      // Individual cache keys can be deleted using del()
      this.logger.log('Cache clear not supported in current version');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  async getCacheStats(): Promise<{
    keys: string[];
    size: number;
  }> {
    try {
      // Note: cache-manager doesn't provide built-in stats
      // This is a placeholder for future implementation
      return {
        keys: [],
        size: 0,
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return {
        keys: [],
        size: 0,
      };
    }
  }

  // ============ Private Helper Methods ============

  private getQuizKey(quizId: string): string {
    return `quiz:${quizId}`;
  }

  private getQuestionsKey(quizId: string): string {
    return `quiz:${quizId}:questions`;
  }

  private getSettingsKey(quizId: string): string {
    return `quiz:${quizId}:settings`;
  }

  private getSectionsKey(quizId: string): string {
    return `quiz:${quizId}:sections`;
  }

  private getStudentQuizzesKey(studentId: string): string {
    return `student:${studentId}:quizzes`;
  }

  private getAnalyticsKey(quizId: string): string {
    return `analytics:${quizId}`;
  }
}
