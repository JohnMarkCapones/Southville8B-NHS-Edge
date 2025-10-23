"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesModule = void 0;
const common_1 = require("@nestjs/common");
const modules_controller_1 = require("./modules.controller");
const modules_service_1 = require("./modules.service");
const supabase_module_1 = require("../supabase/supabase.module");
const storage_module_1 = require("../storage/storage.module");
const auth_module_1 = require("../auth/auth.module");
const module_access_service_1 = require("./services/module-access.service");
const module_storage_service_1 = require("./services/module-storage.service");
const module_download_logger_service_1 = require("./services/module-download-logger.service");
const module_upload_throttle_guard_1 = require("./guards/module-upload-throttle.guard");
let ModulesModule = class ModulesModule {
};
exports.ModulesModule = ModulesModule;
exports.ModulesModule = ModulesModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, storage_module_1.StorageModule, auth_module_1.AuthModule],
        controllers: [modules_controller_1.ModulesController],
        providers: [
            modules_service_1.ModulesService,
            module_access_service_1.ModuleAccessService,
            module_storage_service_1.ModuleStorageService,
            module_download_logger_service_1.ModuleDownloadLoggerService,
            module_upload_throttle_guard_1.ModuleUploadThrottleGuard,
        ],
        exports: [
            modules_service_1.ModulesService,
            module_access_service_1.ModuleAccessService,
            module_storage_service_1.ModuleStorageService,
            module_download_logger_service_1.ModuleDownloadLoggerService,
        ],
    })
], ModulesModule);
//# sourceMappingURL=modules.module.js.map