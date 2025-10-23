import { Test, TestingModule } from '@nestjs/testing';
import { RoleCacheService } from './role-cache.service';

describe('RoleCacheService', () => {
  let service: RoleCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleCacheService],
    }).compile();

    service = module.get<RoleCacheService>(RoleCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCachedRole', () => {
    it('should return null for non-existent user', () => {
      const result = service.getCachedRole('non-existent-user');
      expect(result).toBeNull();
    });

    it('should return cached role for existing user', () => {
      service.setCachedRole('user-1', 'Student');
      const result = service.getCachedRole('user-1');
      expect(result).toBe('Student');
    });

    it('should return null for expired cache entry', () => {
      service.setCachedRole('user-1', 'Student');

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 61000); // 61 seconds later

      const result = service.getCachedRole('user-1');
      expect(result).toBeNull();

      Date.now = originalNow;
    });
  });

  describe('setCachedRole', () => {
    it('should cache user role', () => {
      service.setCachedRole('user-1', 'Teacher');
      const result = service.getCachedRole('user-1');
      expect(result).toBe('Teacher');
    });

    it('should overwrite existing cache entry', () => {
      service.setCachedRole('user-1', 'Student');
      service.setCachedRole('user-1', 'Teacher');
      const result = service.getCachedRole('user-1');
      expect(result).toBe('Teacher');
    });
  });

  describe('removeCachedRole', () => {
    it('should remove cached role for user', () => {
      service.setCachedRole('user-1', 'Student');
      service.removeCachedRole('user-1');
      const result = service.getCachedRole('user-1');
      expect(result).toBeNull();
    });

    it('should not throw error when removing non-existent user', () => {
      expect(() => service.removeCachedRole('non-existent-user')).not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached roles', () => {
      service.setCachedRole('user-1', 'Student');
      service.setCachedRole('user-2', 'Teacher');
      service.clearCache();

      expect(service.getCachedRole('user-1')).toBeNull();
      expect(service.getCachedRole('user-2')).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('should return empty stats for empty cache', () => {
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries).toEqual([]);
    });

    it('should return correct stats for cached entries', () => {
      service.setCachedRole('user-1', 'Student');
      service.setCachedRole('user-2', 'Teacher');

      const stats = service.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('userId');
      expect(stats.entries[0]).toHaveProperty('role');
      expect(stats.entries[0]).toHaveProperty('age');
    });
  });
});
