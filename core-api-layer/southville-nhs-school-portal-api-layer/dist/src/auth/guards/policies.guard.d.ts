import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyEngineService } from '../services/policy-engine.service';
import { DomainMappingService } from '../services/domain-mapping.service';
export declare class PoliciesGuard implements CanActivate {
    private reflector;
    private policyEngineService;
    private domainMappingService;
    private readonly logger;
    constructor(reflector: Reflector, policyEngineService: PolicyEngineService, domainMappingService: DomainMappingService);
    private sanitizeInput;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
