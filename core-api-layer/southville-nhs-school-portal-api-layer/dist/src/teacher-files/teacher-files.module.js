"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherFilesModule = void 0;
const common_1 = require("@nestjs/common");
const teacher_files_controller_1 = require("./teacher-files.controller");
const folder_service_1 = require("./services/folder.service");
const file_storage_service_1 = require("./services/file-storage.service");
const file_download_logger_service_1 = require("./services/file-download-logger.service");
const supabase_module_1 = require("../supabase/supabase.module");
const storage_module_1 = require("../storage/storage.module");
const auth_module_1 = require("../auth/auth.module");
let TeacherFilesModule = class TeacherFilesModule {
};
exports.TeacherFilesModule = TeacherFilesModule;
exports.TeacherFilesModule = TeacherFilesModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, storage_module_1.StorageModule, auth_module_1.AuthModule],
        controllers: [teacher_files_controller_1.TeacherFilesController],
        providers: [folder_service_1.FolderService, file_storage_service_1.FileStorageService, file_download_logger_service_1.FileDownloadLoggerService],
        exports: [folder_service_1.FolderService, file_storage_service_1.FileStorageService, file_download_logger_service_1.FileDownloadLoggerService],
    })
], TeacherFilesModule);
//# sourceMappingURL=teacher-files.module.js.map