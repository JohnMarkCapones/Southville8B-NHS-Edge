"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const r2_config_module_1 = require("../config/r2-config/r2-config.module");
const r2_storage_service_1 = require("./r2-storage/r2-storage.service");
const r2_health_controller_1 = require("./r2-health/r2-health.controller");
const auth_module_1 = require("../auth/auth.module");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [r2_config_module_1.R2ConfigModule, auth_module_1.AuthModule],
        controllers: [r2_health_controller_1.R2HealthController],
        providers: [r2_storage_service_1.R2StorageService],
        exports: [r2_storage_service_1.R2StorageService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map