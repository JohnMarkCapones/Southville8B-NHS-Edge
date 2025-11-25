import { Module } from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { IsDateRangeValidConstraint } from './dto/validators/is-date-range-valid.validator';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService, IsDateRangeValidConstraint],
  exports: [AcademicYearsService],
})
export class AcademicYearsModule {}
