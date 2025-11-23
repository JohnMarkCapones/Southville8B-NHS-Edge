import { Module } from '@nestjs/common';
import { TeacherActivityController } from './teacher-activity.controller';
import { TeacherActivityService } from './teacher-activity.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeacherActivityController],
  providers: [TeacherActivityService],
  exports: [TeacherActivityService],
})
export class TeacherActivityModule {}
