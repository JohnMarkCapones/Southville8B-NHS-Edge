import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ModuleAccessService } from './services/module-access.service';
import { ModuleStorageService } from './services/module-storage.service';
import { ModuleDownloadLoggerService } from './services/module-download-logger.service';
import { PPTXImageConverterService } from './services/pptx-image-converter.service';
import { ModuleUploadThrottleGuard } from './guards/module-upload-throttle.guard';

@Module({
  imports: [SupabaseModule, StorageModule, AuthModule],
  controllers: [ModulesController],
  providers: [
    ModulesService,
    ModuleAccessService,
    ModuleStorageService,
    ModuleDownloadLoggerService,
    PPTXImageConverterService,
    ModuleUploadThrottleGuard,
  ],
  exports: [
    ModulesService,
    ModuleAccessService,
    ModuleStorageService,
    ModuleDownloadLoggerService,
    PPTXImageConverterService,
  ],
})
export class ModulesModule {}
