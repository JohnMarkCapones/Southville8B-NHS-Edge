import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { StudentActivitiesModule } from '../student-activities/student-activities.module';
import { GalleryModule } from '../gallery/gallery.module';

// Controllers
import {
  NewsController,
  NewsCategoriesController,
  JournalismMembershipController,
} from './controllers';
import { NewsKpiController } from './controllers/news-kpi.controller';

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
import { NewsKpiService } from './services/news-kpi.service';
import { NewsReviewCommentsService } from './services/news-review-comments.service';

/**
 * News/Journalism Module
 * Handles news article management with approval workflow
 * Supports journalism domain with position-based permissions
 */
@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    StorageModule,
    StudentActivitiesModule,
    GalleryModule,
  ],
  controllers: [
    NewsController,
    NewsCategoriesController,
    JournalismMembershipController,
    NewsKpiController,
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
    NewsReviewCommentsService,
    NewsKpiService,
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
