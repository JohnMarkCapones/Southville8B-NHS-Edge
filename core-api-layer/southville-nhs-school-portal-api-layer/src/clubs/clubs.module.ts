import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { GalleryModule } from '../gallery/gallery.module';
import { StudentActivitiesModule } from '../student-activities/student-activities.module';
import { ActivityMonitoringModule } from '../activity-monitoring/activity-monitoring.module';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { ClubFormsService } from './services/club-forms.service';
import { ClubFormResponsesService } from './services/club-form-responses.service';
import { ClubFormsController } from './controllers/club-forms.controller';
import { ClubMembershipsService } from './services/club-memberships.service';
import { ClubMembershipsController } from './controllers/club-memberships.controller';
import { ClubAnnouncementsService } from './services/club-announcements.service';
import { ClubAnnouncementsController } from './controllers/club-announcements.controller';
import { ClubBenefitsService } from './services/club-benefits.service';
import { ClubFaqsService } from './services/club-faqs.service';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    StorageModule,
    GalleryModule,
    StudentActivitiesModule,
    ActivityMonitoringModule,
  ],
  controllers: [
    ClubsController,
    ClubFormsController,
    ClubMembershipsController,
    ClubAnnouncementsController,
  ],
  providers: [
    ClubsService,
    ClubFormsService,
    ClubFormResponsesService,
    ClubMembershipsService,
    ClubAnnouncementsService,
    ClubBenefitsService,
    ClubFaqsService,
  ],
  exports: [
    ClubsService,
    ClubFormsService,
    ClubFormResponsesService,
    ClubMembershipsService,
    ClubAnnouncementsService,
    ClubBenefitsService,
    ClubFaqsService,
  ],
})
export class ClubsModule {}
