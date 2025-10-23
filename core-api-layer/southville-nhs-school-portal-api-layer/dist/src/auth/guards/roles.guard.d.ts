import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { RoleCacheService } from '../services/role-cache.service';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private authService;
    private roleCacheService;
    constructor(reflector: Reflector, authService: AuthService, roleCacheService: RoleCacheService);
    private sanitizeInput;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
