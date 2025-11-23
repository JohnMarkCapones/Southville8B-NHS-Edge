import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventRemindersService } from './event-reminders.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    StorageModule,
    GalleryModule, // Import GalleryModule to use CloudflareImagesService
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRemindersService],
  exports: [EventsService, EventRemindersService],
})
export class EventsModule {}
