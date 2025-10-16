import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule], // Import AuthModule and SupabaseModule
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
