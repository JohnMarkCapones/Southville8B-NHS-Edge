"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_module_1 = require("../supabase/supabase.module");
const auth_service_1 = require("./auth.service");
const supabase_auth_guard_1 = require("./supabase-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const jwt_verification_service_1 = require("./jwt-verification.service");
const role_cache_service_1 = require("./services/role-cache.service");
const auth_controller_1 = require("./auth.controller");
const pbac_module_1 = require("./pbac.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            supabase_module_1.SupabaseModule,
            pbac_module_1.PbacModule,
        ],
        providers: [
            auth_service_1.AuthService,
            supabase_auth_guard_1.SupabaseAuthGuard,
            roles_guard_1.RolesGuard,
            jwt_verification_service_1.JwtVerificationService,
            role_cache_service_1.RoleCacheService,
        ],
        exports: [
            auth_service_1.AuthService,
            supabase_auth_guard_1.SupabaseAuthGuard,
            roles_guard_1.RolesGuard,
            jwt_verification_service_1.JwtVerificationService,
            role_cache_service_1.RoleCacheService,
            pbac_module_1.PbacModule,
        ],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map