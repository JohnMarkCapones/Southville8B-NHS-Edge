import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { ClubFormsService } from './services/club-forms.service';
import { ClubFormResponsesService } from './services/club-form-responses.service';
import { ClubFormsController } from './controllers/club-forms.controller';
import { ClubMembershipsService } from './services/club-memberships.service';
import { ClubMembershipsController } from './controllers/club-memberships.controller';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [
    ClubsController,
    ClubFormsController,
    ClubMembershipsController,
  ],
  providers: [
    ClubsService,
    ClubFormsService,
    ClubFormResponsesService,
    ClubMembershipsService,
  ],
  exports: [
    ClubsService,
    ClubFormsService,
    ClubFormResponsesService,
    ClubMembershipsService,
  ],
})
export class ClubsModule {}
