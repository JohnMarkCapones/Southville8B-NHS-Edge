import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PoliciesGuard } from './policies.guard';
import { PolicyEngineService } from '../services/policy-engine.service';
import { DomainMappingService } from '../services/domain-mapping.service';
import { POLICIES_KEY } from '../decorators/policies.decorator';

describe('PoliciesGuard', () => {
  let guard: PoliciesGuard;
  let policyEngineService: jest.Mocked<PolicyEngineService>;
  let domainMappingService: jest.Mocked<DomainMappingService>;
  let reflector: jest.Mocked<Reflector>;

  const mockExecutionContext = (
    user: any,
    policyConfig: any,
    params: any = {},
  ) => {
    const request = {
      user,
      params,
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
      path: '/test/path',
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValue(policyConfig);
    return context;
  };

  beforeEach(async () => {
    const mockPolicyEngineService = {
      evaluatePermission: jest.fn(),
    };

    const mockDomainMappingService = {
      resolveDomainId: jest.fn(),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesGuard,
        { provide: PolicyEngineService, useValue: mockPolicyEngineService },
        { provide: DomainMappingService, useValue: mockDomainMappingService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<PoliciesGuard>(PoliciesGuard);
    policyEngineService = module.get(PolicyEngineService);
    domainMappingService = module.get(DomainMappingService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no policies are required', async () => {
      const context = mockExecutionContext({ id: 'user-1' }, null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const policyConfig = {
        domainParam: 'clubId',
        permissionKey: 'club.manage_finances',
      };
      const context = mockExecutionContext(null, policyConfig);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('User not authenticated'),
      );
    });

    it('should allow access when user has required permission', async () => {
      const user = { id: 'user-1' };
      const policyConfig = {
        domainParam: 'clubId',
        permissionKey: 'club.manage_finances',
      };
      const params = { clubId: 'club-123' };
      const context = mockExecutionContext(user, policyConfig, params);

      domainMappingService.resolveDomainId.mockResolvedValue(1);
      policyEngineService.evaluatePermission.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(domainMappingService.resolveDomainId).toHaveBeenCalledWith(
        'clubId',
        'club-123',
      );
      expect(policyEngineService.evaluatePermission).toHaveBeenCalledWith(
        'user-1',
        1,
        'club.manage_finances',
      );
    });

    it('should deny access when user does not have required permission', async () => {
      const user = { id: 'user-1' };
      const policyConfig = {
        domainParam: 'clubId',
        permissionKey: 'club.manage_finances',
      };
      const params = { clubId: 'club-123' };
      const context = mockExecutionContext(user, policyConfig, params);

      domainMappingService.resolveDomainId.mockResolvedValue(1);
      policyEngineService.evaluatePermission.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Access denied. Required permission: club.manage_finances in domain 1',
        ),
      );
    });

    it('should throw ForbiddenException when domain parameter is missing', async () => {
      const user = { id: 'user-1' };
      const policyConfig = {
        domainParam: 'clubId',
        permissionKey: 'club.manage_finances',
      };
      const params = {};
      const context = mockExecutionContext(user, policyConfig, params);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException("Required parameter 'clubId' not found"),
      );
    });

    it('should throw ForbiddenException when domain ID cannot be resolved', async () => {
      const user = { id: 'user-1' };
      const policyConfig = {
        domainParam: 'clubId',
        permissionKey: 'club.manage_finances',
      };
      const params = { clubId: 'invalid-club' };
      const context = mockExecutionContext(user, policyConfig, params);

      domainMappingService.resolveDomainId.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Invalid clubId or domain not found'),
      );
    });

    it('should sanitize input parameters', async () => {
      const user = { id: 'user-1<script>' };
      const policyConfig = {
        domainParam: 'clubId<script>',
        permissionKey: 'club.manage_finances<script>',
      };
      const params = { clubId: 'club-123<script>' };
      const context = mockExecutionContext(user, policyConfig, params);

      domainMappingService.resolveDomainId.mockResolvedValue(1);
      policyEngineService.evaluatePermission.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(domainMappingService.resolveDomainId).toHaveBeenCalledWith(
        'clubId',
        'club-123',
      );
      expect(policyEngineService.evaluatePermission).toHaveBeenCalledWith(
        'user-1',
        1,
        'club.manage_finances',
      );
    });

    it('should throw ForbiddenException for invalid input after sanitization', async () => {
      const user = { id: '<script>alert("xss")</script>' };
      const policyConfig = {
        domainParam: 'clubId',
        permissionKey: 'club.manage_finances',
      };
      const params = { clubId: 'club-123' };
      const context = mockExecutionContext(user, policyConfig, params);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Invalid clubId or domain not found'),
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
