import { Module, Global } from '@nestjs/common';
import { MemoryCacheService } from './services/memory-cache.service';
import { CloudflareImagesService } from './services/cloudflare-images.service';
import { NotificationService } from './services/notification.service';
import { AlertsModule } from '../alerts/alerts.module';

/**
 * Common module for shared validators and utilities
 *
 * This module provides reusable validation decorators and constraints
 * that can be used across different feature modules.
 *
 * @Global decorator makes services available throughout the app without explicit imports
 */
@Global()
@Module({
  imports: [AlertsModule],
  providers: [MemoryCacheService, CloudflareImagesService, NotificationService],
  exports: [MemoryCacheService, CloudflareImagesService, NotificationService],
})
export class CommonModule {}
