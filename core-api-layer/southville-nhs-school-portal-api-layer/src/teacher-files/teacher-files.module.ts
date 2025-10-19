import { Module } from '@nestjs/common';
import { TeacherFilesController } from './teacher-files.controller';
import { FolderService } from './services/folder.service';
import { FileStorageService } from './services/file-storage.service';
import { FileDownloadLoggerService } from './services/file-download-logger.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, StorageModule, AuthModule],
  controllers: [TeacherFilesController],
  providers: [FolderService, FileStorageService, FileDownloadLoggerService],
  exports: [FolderService, FileStorageService, FileDownloadLoggerService],
})
export class TeacherFilesModule {}
