import { Injectable, Logger } from '@nestjs/common';

/**
 * Simple In-Memory Cache Service
 *
 * Lightweight caching solution for low-spec servers.
 * No external dependencies (Redis-free).
 *
 * Perfect for:
 * - Frequently accessed data (monitoring, participants)
 * - Short TTL data (5-60 seconds)
 * - Single-instance deployments
 *
 * NOT suitable for:
 * - Multi-instance deployments (use Redis)
 * - Long-term storage (use database)
 * - Large datasets (> 100 MB)
 *
 * @module common/services/memory-cache
 */
@Injectable()
export class MemoryCacheService {
  private readonly logger = new Logger(MemoryCacheService.name);
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private readonly MAX_CACHE_SIZE = 100; // Maximum cache entries
  private readonly DEFAULT_TTL = 5000; // 5 seconds default

  /**
   * Get cached data if not expired
   *
   * @param key - Cache key
   * @param maxAge - Optional override for max age (ms)
   * @returns Cached data or null if expired/missing
   *
   * @example
   * ```typescript
   * const data = this.cache.get('participants:quiz-123', 10000);
   * if (data) {
   *   return data; // Served from cache
   * }
   * ```
   */
  get<T = any>(key: string, maxAge?: number): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const ttl = maxAge ?? cached.ttl;
    const age = Date.now() - cached.timestamp;

    if (age > ttl) {
      // Expired - delete and return null
      this.cache.delete(key);
      this.logger.debug(`Cache MISS (expired): ${key} (age: ${age}ms)`);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key} (age: ${age}ms, ttl: ${ttl}ms)`);
    return cached.data as T;
  }

  /**
   * Set cached data with TTL
   *
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time-to-live in milliseconds (default: 5000)
   *
   * @example
   * ```typescript
   * this.cache.set('participants:quiz-123', data, 10000); // Cache for 10s
   * ```
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    this.logger.debug(`Cache SET: ${key} (ttl: ${ttl}ms)`);

    // Auto-cleanup if cache gets too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
  }

  /**
   * Delete cached data
   *
   * @param key - Cache key
   *
   * @example
   * ```typescript
   * this.cache.delete('participants:quiz-123');
   * ```
   */
  delete(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache DELETE: ${key}`);
    }
  }

  /**
   * Delete all cached data matching a pattern
   *
   * @param pattern - Key pattern (supports wildcards)
   *
   * @example
   * ```typescript
   * this.cache.deletePattern('participants:*'); // Delete all participant caches
   * ```
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );

    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    if (deleted > 0) {
      this.logger.debug(`Cache DELETE PATTERN: ${pattern} (${deleted} keys)`);
    }

    return deleted;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cache CLEARED: ${size} entries removed`);
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics object
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
    totalSize: number;
  } {
    const keys = Array.from(this.cache.keys());

    // Estimate memory usage (rough approximation)
    const totalSize = keys.reduce((sum, key) => {
      const cached = this.cache.get(key);
      if (cached) {
        const dataSize = JSON.stringify(cached.data).length;
        return sum + dataSize + key.length;
      }
      return sum;
    }, 0);

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys,
      totalSize, // bytes (approximate)
    };
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   *
   * @param key - Cache key
   * @param factory - Function to compute value if cache miss
   * @param ttl - Time-to-live in milliseconds
   * @returns Cached or computed value
   *
   * @example
   * ```typescript
   * const data = await this.cache.getOrSet(
   *   'participants:quiz-123',
   *   async () => await this.fetchFromDatabase(),
   *   10000
   * );
   * ```
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<T> {
    // Try cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - compute value
    this.logger.debug(`Cache MISS: ${key} - computing value`);
    const value = await factory();

    // Store in cache
    this.set(key, value, ttl);

    return value;
  }

  /**
   * Evict oldest cache entry (LRU-style)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(
        `Cache EVICT: ${oldestKey} (cache full at ${this.MAX_CACHE_SIZE})`,
      );
    }
  }

  /**
   * Start automatic cleanup task (removes expired entries)
   *
   * Runs every 60 seconds to clean up expired cache entries.
   * Call this in onModuleInit() to enable automatic cleanup.
   */
  startCleanupTask(): void {
    setInterval(() => {
      let cleaned = 0;
      const now = Date.now();

      for (const [key, value] of this.cache.entries()) {
        const age = now - value.timestamp;
        if (age > value.ttl) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        this.logger.debug(
          `Cache CLEANUP: ${cleaned} expired entries removed`,
        );
      }
    }, 60000); // Every 60 seconds
  }
}
