import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    AuthModule, // Import AuthModule to access AuthService and SupabaseAuthGuard
    SupabaseModule, // Import SupabaseModule to access SupabaseService
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
