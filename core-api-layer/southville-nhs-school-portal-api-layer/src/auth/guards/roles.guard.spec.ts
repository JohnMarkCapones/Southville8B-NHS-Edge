import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { AuthService } from '../auth.service';
import { RoleCacheService } from '../services/role-cache.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let authService: jest.Mocked<AuthService>;
  let roleCacheService: jest.Mocked<RoleCacheService>;
  let reflector: jest.Mocked<Reflector>;

  const mockExecutionContext = (user: any, requiredRoles: string[] = []) => {
    const request = { user };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValue(requiredRoles);
    return context;
  };

  beforeEach(async () => {
    const mockAuthService = {
      getUserRoleFromDatabase: jest.fn(),
      hasRoleHierarchy: jest.fn(),
    };

    const mockRoleCacheService = {
      getCachedRole: jest.fn(),
      setCachedRole: jest.fn(),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: RoleCacheService, useValue: mockRoleCacheService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    authService = module.get(AuthService);
    roleCacheService = module.get(RoleCacheService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', async () => {
      const context = mockExecutionContext({ id: 'user-1' }, []);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = mockExecutionContext(null, ['Student']);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('User not authenticated'),
      );
    });

    it('should allow access when user has required role (cache hit)', async () => {
      const user = { id: 'user-1' };
      const context = mockExecutionContext(user, ['Student']);

      roleCacheService.getCachedRole.mockReturnValue('Student');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(roleCacheService.getCachedRole).toHaveBeenCalledWith('user-1');
    });

    it('should allow access when user has required role (cache miss)', async () => {
      const user = { id: 'user-1' };
      const context = mockExecutionContext(user, ['Student']);

      roleCacheService.getCachedRole.mockReturnValue(null);
      authService.getUserRoleFromDatabase.mockResolvedValue('Student');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(authService.getUserRoleFromDatabase).toHaveBeenCalledWith(
        'user-1',
      );
      expect(roleCacheService.setCachedRole).toHaveBeenCalledWith(
        'user-1',
        'Student',
      );
    });

    it('should allow access with role hierarchy (Admin accessing Student endpoint)', async () => {
      const user = { id: 'user-1' };
      const context = mockExecutionContext(user, ['Student']);

      roleCacheService.getCachedRole.mockReturnValue('Admin');
      authService.hasRoleHierarchy.mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(authService.hasRoleHierarchy).toHaveBeenCalledWith(
        'Admin',
        'Student',
      );
    });

    it('should deny access when user does not have required role', async () => {
      const user = { id: 'user-1' };
      const context = mockExecutionContext(user, ['Teacher']);

      roleCacheService.getCachedRole.mockReturnValue('Student');
      authService.hasRoleHierarchy.mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Access denied. Required roles: Teacher. Your role: Student',
        ),
      );
    });

    it('should throw ForbiddenException when user role not found in database', async () => {
      const user = { id: 'user-1' };
      const context = mockExecutionContext(user, ['Student']);

      roleCacheService.getCachedRole.mockReturnValue(null);
      authService.getUserRoleFromDatabase.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('User role not found in database'),
      );
    });

    it('should sanitize user inputs', async () => {
      const user = { id: 'user-1<script>' };
      const context = mockExecutionContext(user, ['Student']);

      roleCacheService.getCachedRole.mockReturnValue('Student');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(roleCacheService.getCachedRole).toHaveBeenCalledWith('user-1');
    });

    it('should throw ForbiddenException for invalid user ID after sanitization', async () => {
      const user = { id: '<script>alert("xss")</script>' };
      const context = mockExecutionContext(user, ['Student']);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('User role not found in database'),
      );
    });
  });

  describe('sanitizeInput', () => {
    it('should remove XSS characters', () => {
      const input = 'test<script>alert("xss")</script>';
      const result = guard['sanitizeInput'](input);
      expect(result).toBe('testalert("xss")');
    });

    it('should handle null and undefined inputs', () => {
      expect(guard['sanitizeInput'](null)).toBe(null);
      expect(guard['sanitizeInput'](undefined)).toBe(undefined);
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const result = guard['sanitizeInput'](input);
      expect(result).toBe('test');
    });
  });
});
