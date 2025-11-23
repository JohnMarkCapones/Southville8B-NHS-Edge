import { Module } from '@nestjs/common';
import { StudentAssistantController } from './student-assistant.controller';
import { StudentAssistantService } from './student-assistant.service';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { NewsModule } from '../news/news.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ModulesModule } from '../modules/modules.module';
import { QuizModule } from '../quiz/quiz.module';
import { GwaModule } from '../gwa/gwa.module';
import { ClubsModule } from '../clubs/clubs.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    AuthModule,
    EventsModule,
    NewsModule,
    SchedulesModule,
    SubjectsModule,
    ModulesModule,
    QuizModule,
    GwaModule,
    ClubsModule,
    StudentsModule,
  ],
  controllers: [StudentAssistantController],
  providers: [StudentAssistantService],
  exports: [StudentAssistantService],
})
export class StudentAssistantModule {}
