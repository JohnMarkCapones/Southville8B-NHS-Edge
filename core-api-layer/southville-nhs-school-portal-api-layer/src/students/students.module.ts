import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Import AuthModule to access AuthService and SupabaseAuthGuard
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
