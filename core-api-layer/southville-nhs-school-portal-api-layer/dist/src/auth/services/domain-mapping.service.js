"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DomainMappingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainMappingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let DomainMappingService = DomainMappingService_1 = class DomainMappingService {
    supabaseService;
    logger = new common_1.Logger(DomainMappingService_1.name);
    domainMappings = new Map([
        [
            'club',
            {
                entityType: 'club',
                tableName: 'clubs',
                domainIdColumn: 'domain_id',
            },
        ],
        [
            'event',
            {
                entityType: 'event',
                tableName: 'events',
                domainIdColumn: 'domain_id',
            },
        ],
        [
            'project',
            {
                entityType: 'project',
                tableName: 'projects',
                domainIdColumn: 'domain_id',
            },
        ],
    ]);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    registerMapping(entityType, mapping) {
        this.domainMappings.set(entityType, mapping);
        this.logger.log(`Registered domain mapping for entity type: ${entityType}`);
    }
    async resolveDomainId(paramName, entityId) {
        try {
            const normalizedParam = paramName.trim().toLowerCase();
            const entityType = this.extractEntityTypeFromParam(normalizedParam);
            if (!entityType) {
                this.logger.warn(`Could not extract entity type from parameter: ${paramName}`);
                return null;
            }
            const mapping = this.domainMappings.get(entityType);
            if (!mapping) {
                this.logger.warn(`No domain mapping found for entity type: ${entityType}`);
                return null;
            }
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from(mapping.tableName)
                .select(mapping.domainIdColumn)
                .eq('id', entityId)
                .maybeSingle();
            if (error || !data) {
                this.logger.warn(`Domain not found for ${entityType} with id ${entityId}`);
                return null;
            }
            const domainId = data[mapping.domainIdColumn];
            this.logger.debug(`Resolved domain ID ${domainId} for ${entityType}:${entityId}`);
            return domainId;
        }
        catch (error) {
            this.logger.error(`Error resolving domain ID: ${error.message}`);
            return null;
        }
    }
    extractEntityTypeFromParam(paramName) {
        if (paramName.endsWith('Id')) {
            return paramName.slice(0, -2).toLowerCase();
        }
        const patterns = [
            { pattern: /^(\w+)Id$/, replacement: '$1' },
            { pattern: /^(\w+)_id$/, replacement: '$1' },
        ];
        for (const { pattern, replacement } of patterns) {
            const match = paramName.match(pattern);
            if (match) {
                return match[1].toLowerCase();
            }
        }
        return null;
    }
    getAllMappings() {
        return new Map(this.domainMappings);
    }
    hasMapping(entityType) {
        return this.domainMappings.has(entityType);
    }
};
exports.DomainMappingService = DomainMappingService;
exports.DomainMappingService = DomainMappingService = DomainMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DomainMappingService);
//# sourceMappingURL=domain-mapping.service.js.map