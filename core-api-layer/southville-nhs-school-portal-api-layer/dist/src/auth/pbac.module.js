"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PbacModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const policy_engine_service_1 = require("./services/policy-engine.service");
const domain_mapping_service_1 = require("./services/domain-mapping.service");
const pbac_management_service_1 = require("./services/pbac-management.service");
const policies_guard_1 = require("./guards/policies.guard");
let PbacModule = class PbacModule {
};
exports.PbacModule = PbacModule;
exports.PbacModule = PbacModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule],
        providers: [
            policy_engine_service_1.PolicyEngineService,
            domain_mapping_service_1.DomainMappingService,
            pbac_management_service_1.PbacManagementService,
            policies_guard_1.PoliciesGuard,
        ],
        exports: [
            policy_engine_service_1.PolicyEngineService,
            domain_mapping_service_1.DomainMappingService,
            pbac_management_service_1.PbacManagementService,
            policies_guard_1.PoliciesGuard,
        ],
    })
], PbacModule);
//# sourceMappingURL=pbac.module.js.map