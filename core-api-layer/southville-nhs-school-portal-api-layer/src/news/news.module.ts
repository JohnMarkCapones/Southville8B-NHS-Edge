import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

// Controllers
import {
  NewsController,
  NewsCategoriesController,
  JournalismMembershipController,
} from './controllers';

// Services
import {
  NewsService,
  NewsAccessService,
  NewsApprovalService,
  NewsCategoriesService,
  TagsService,
  NewsImageService,
  JournalismMembershipService,
} from './services';

/**
 * News/Journalism Module
 * Handles news article management with approval workflow
 * Supports journalism domain with position-based permissions
 */
@Module({
  imports: [SupabaseModule, AuthModule, StorageModule],
  controllers: [
    NewsController,
    NewsCategoriesController,
    JournalismMembershipController,
  ],
  providers: [
    // Core service
    NewsService,

    // Specialized services
    NewsAccessService,
    NewsApprovalService,
    NewsCategoriesService,
    TagsService,
    NewsImageService,
    JournalismMembershipService,
  ],
  exports: [
    // Export services for use in other modules
    NewsService,
    NewsAccessService,
    NewsApprovalService,
    NewsCategoriesService,
    TagsService,
    NewsImageService,
    JournalismMembershipService,
  ],
})
export class NewsModule {}
