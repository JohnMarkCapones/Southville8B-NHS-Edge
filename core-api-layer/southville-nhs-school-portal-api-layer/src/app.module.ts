import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { ExamplesModule } from './examples/examples.module';
import { ClubsModule } from './clubs/clubs.module';
import { DomainsModule } from './domains/domains.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { BuildingsModule } from './buildings/buildings.module';
import { FloorsModule } from './floors/floors.module';
import { RoomsModule } from './rooms/rooms.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { EventsModule } from './events/events.module';
import { SchedulesModule } from './schedules/schedules.module';
import { GwaModule } from './gwa/gwa.module';
import { AlertsModule } from './alerts/alerts.module';
import { AcademicCalendarModule } from './academic-calendar/academic-calendar.module';
import { CampusFacilitiesModule } from './campus-facilities/campus-facilities.module';
import { FaqModule } from './faq/faq.module';
import { CommonModule } from './common/common.module';
import { LocationsModule } from './locations/locations.module';
import { HotspotsModule } from './hotspots/hotspots.module';
import { DepartmentsInformationModule } from './departments-information/departments-information.module';
import { R2ConfigValidationService } from './config/r2-config-validation/r2-config-validation.service';
import { R2ConfigModule } from './config/r2-config/r2-config.module';
import { StorageModule } from './storage/storage.module';
import { ModulesModule } from './modules/modules.module';
import { DepartmentsModule } from './departments/departments.module';
import { DesktopSidebarModule } from './desktop-sidebar/desktop-sidebar.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeacherFilesModule } from './teacher-files/teacher-files.module';
import { TeacherActivityModule } from './teacher-activity/teacher-activity.module';
import { QuizModule } from './quiz/quiz.module';
import { NewsModule } from './news/news.module';
import supabaseConfig from './config/supabase.config';
import r2Config from './config/r2.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, r2Config],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute globally
      },
    ]),
    SupabaseModule,
    AuthModule,
    StudentsModule,
    ExamplesModule,
    ClubsModule,
    DomainsModule,
    UsersModule,
    SectionsModule,
    BuildingsModule,
    FloorsModule,
    RoomsModule,
    AnnouncementsModule,
    EventsModule,
    SchedulesModule,
    GwaModule,
    AlertsModule,
    AcademicCalendarModule,
    CampusFacilitiesModule,
    FaqModule,
    CommonModule,
    LocationsModule,
    HotspotsModule,
    DepartmentsInformationModule,
    R2ConfigModule,
    StorageModule,
    ModulesModule,
    DepartmentsModule,
    DesktopSidebarModule,
    AdminDashboardModule,
    SubjectsModule,
    TeacherFilesModule,
    TeacherActivityModule,
    QuizModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [AppService, R2ConfigValidationService],
})
export class AppModule {}
