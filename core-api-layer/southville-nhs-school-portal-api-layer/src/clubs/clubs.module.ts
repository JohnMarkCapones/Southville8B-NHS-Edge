import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { ClubFormsService } from './services/club-forms.service';
import { ClubFormResponsesService } from './services/club-form-responses.service';
import { ClubFormsController } from './controllers/club-forms.controller';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ClubsController, ClubFormsController],
  providers: [ClubsService, ClubFormsService, ClubFormResponsesService],
  exports: [ClubsService, ClubFormsService, ClubFormResponsesService],
})
export class ClubsModule {}
