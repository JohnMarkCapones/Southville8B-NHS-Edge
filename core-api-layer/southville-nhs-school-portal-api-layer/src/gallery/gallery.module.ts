import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

// Controller
import { GalleryController } from './gallery.controller';
import { GalleryTagsController } from './controllers/gallery-tags.controller';

// Services
import { GalleryItemsService } from './services/gallery-items.service';
import { GalleryTagsService } from './services/gallery-tags.service';
import { GalleryStorageService } from './services/gallery-storage.service';
import { GalleryDownloadLoggerService } from './services/gallery-download-logger.service';
import { GalleryViewTrackerService } from './services/gallery-view-tracker.service';

/**
 * Gallery Module (Simplified - No Albums)
 * Provides simple photo/video gallery functionality
 */
@Module({
  imports: [SupabaseModule, StorageModule, AuthModule],
  controllers: [GalleryController, GalleryTagsController],
  providers: [
    // Main services
    GalleryItemsService,
    GalleryTagsService,

    // Helper services
    GalleryStorageService,
    GalleryDownloadLoggerService,
    GalleryViewTrackerService,
  ],
  exports: [
    GalleryItemsService,
    GalleryTagsService,
    GalleryStorageService,
    GalleryDownloadLoggerService,
    GalleryViewTrackerService,
  ],
})
export class GalleryModule {}
