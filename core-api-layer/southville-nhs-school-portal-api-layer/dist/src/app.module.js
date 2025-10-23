"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const supabase_module_1 = require("./supabase/supabase.module");
const auth_module_1 = require("./auth/auth.module");
const students_module_1 = require("./students/students.module");
const examples_module_1 = require("./examples/examples.module");
const clubs_module_1 = require("./clubs/clubs.module");
const domains_module_1 = require("./domains/domains.module");
const users_module_1 = require("./users/users.module");
const sections_module_1 = require("./sections/sections.module");
const buildings_module_1 = require("./buildings/buildings.module");
const floors_module_1 = require("./floors/floors.module");
const rooms_module_1 = require("./rooms/rooms.module");
const announcements_module_1 = require("./announcements/announcements.module");
const events_module_1 = require("./events/events.module");
const schedules_module_1 = require("./schedules/schedules.module");
const gwa_module_1 = require("./gwa/gwa.module");
const alerts_module_1 = require("./alerts/alerts.module");
const academic_calendar_module_1 = require("./academic-calendar/academic-calendar.module");
const campus_facilities_module_1 = require("./campus-facilities/campus-facilities.module");
const faq_module_1 = require("./faq/faq.module");
const common_module_1 = require("./common/common.module");
const locations_module_1 = require("./locations/locations.module");
const hotspots_module_1 = require("./hotspots/hotspots.module");
const departments_information_module_1 = require("./departments-information/departments-information.module");
const r2_config_validation_service_1 = require("./config/r2-config-validation/r2-config-validation.service");
const r2_config_module_1 = require("./config/r2-config/r2-config.module");
const storage_module_1 = require("./storage/storage.module");
const modules_module_1 = require("./modules/modules.module");
const departments_module_1 = require("./departments/departments.module");
const desktop_sidebar_module_1 = require("./desktop-sidebar/desktop-sidebar.module");
const admin_dashboard_module_1 = require("./admin-dashboard/admin-dashboard.module");
const subjects_module_1 = require("./subjects/subjects.module");
const teacher_files_module_1 = require("./teacher-files/teacher-files.module");
const teacher_activity_module_1 = require("./teacher-activity/teacher-activity.module");
const quiz_module_1 = require("./quiz/quiz.module");
const news_module_1 = require("./news/news.module");
const supabase_config_1 = require("./config/supabase.config");
const r2_config_1 = require("./config/r2.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [supabase_config_1.default, r2_config_1.default],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            students_module_1.StudentsModule,
            examples_module_1.ExamplesModule,
            clubs_module_1.ClubsModule,
            domains_module_1.DomainsModule,
            users_module_1.UsersModule,
            sections_module_1.SectionsModule,
            buildings_module_1.BuildingsModule,
            floors_module_1.FloorsModule,
            rooms_module_1.RoomsModule,
            announcements_module_1.AnnouncementsModule,
            events_module_1.EventsModule,
            schedules_module_1.SchedulesModule,
            gwa_module_1.GwaModule,
            alerts_module_1.AlertsModule,
            academic_calendar_module_1.AcademicCalendarModule,
            campus_facilities_module_1.CampusFacilitiesModule,
            faq_module_1.FaqModule,
            common_module_1.CommonModule,
            locations_module_1.LocationsModule,
            hotspots_module_1.HotspotsModule,
            departments_information_module_1.DepartmentsInformationModule,
            r2_config_module_1.R2ConfigModule,
            storage_module_1.StorageModule,
            modules_module_1.ModulesModule,
            departments_module_1.DepartmentsModule,
            desktop_sidebar_module_1.DesktopSidebarModule,
            admin_dashboard_module_1.AdminDashboardModule,
            subjects_module_1.SubjectsModule,
            teacher_files_module_1.TeacherFilesModule,
            teacher_activity_module_1.TeacherActivityModule,
            quiz_module_1.QuizModule,
            news_module_1.NewsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, r2_config_validation_service_1.R2ConfigValidationService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map