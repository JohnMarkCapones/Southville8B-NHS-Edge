import { Injectable } from '@nestjs/common';

interface CachedRole {
  role: string;
  timestamp: number;
}

@Injectable()
export class RoleCacheService {
  private cache = new Map<string, CachedRole>();
  private readonly TTL = 60 * 1000; // 60 seconds in milliseconds

  /**
   * Get user role from cache
   * @param userId - The user ID
   * @returns The cached role or null if not found/expired
   */
  getCachedRole(userId: string): string | null {
    const cached = this.cache.get(userId);

    if (!cached) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(userId);
      return null;
    }

    return cached.role;
  }

  /**
   * Cache user role
   * @param userId - The user ID
   * @param role - The user's role
   */
  setCachedRole(userId: string, role: string): void {
    this.cache.set(userId, {
      role,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove user role from cache
   * @param userId - The user ID
   */
  removeCachedRole(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all cached roles
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ userId: string; role: string; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(
      ([userId, cached]) => ({
        userId,
        role: cached.role,
        age: Date.now() - cached.timestamp,
      }),
    );

    return {
      size: this.cache.size,
      entries,
    };
  }
}
