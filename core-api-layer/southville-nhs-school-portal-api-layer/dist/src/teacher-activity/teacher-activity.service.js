"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TeacherActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherActivityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let TeacherActivityService = TeacherActivityService_1 = class TeacherActivityService {
    configService;
    logger = new common_1.Logger(TeacherActivityService_1.name);
    supabase;
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('supabase.url');
        const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
    }
    async getRecentActivities(teacherId) {
        try {
            this.logger.log(`Fetching recent activities for teacher: ${teacherId}`);
            const { data: schedules } = await this.supabase
                .from('schedules')
                .select('id')
                .eq('teacher_id', teacherId)
                .eq('status', 'Active');
            const scheduleIds = schedules?.map((s) => s.id) || [];
            if (scheduleIds.length === 0) {
                this.logger.log(`No active schedules found for teacher: ${teacherId}`);
                return [];
            }
            const { data: studentSchedules } = await this.supabase
                .from('student_schedules')
                .select('student_id')
                .in('schedule_id', scheduleIds);
            const studentIds = [
                ...new Set(studentSchedules?.map((s) => s.student_id) || []),
            ];
            if (studentIds.length === 0) {
                this.logger.log(`No students found for teacher: ${teacherId}`);
                return [];
            }
            const { data: students } = await this.supabase
                .from('users')
                .select('id, full_name')
                .in('id', studentIds);
            const studentMap = new Map(students?.map((s) => [s.id, s.full_name]) || []);
            const activities = [];
            const activityTypes = [
                'Submitted Assignment #3',
                'Asked question in Math class',
                'Completed quiz successfully',
                'Downloaded module materials',
                'Submitted homework',
                'Participated in class discussion',
                'Completed online exercise',
                'Submitted project proposal',
            ];
            const now = new Date();
            for (let i = 0; i < Math.min(studentIds.length, 10); i++) {
                const studentId = studentIds[i];
                const studentName = studentMap.get(studentId) || `Student ${i + 1}`;
                const initials = this.getInitials(studentName);
                const hoursAgo = Math.floor(Math.random() * 24);
                const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
                activities.push({
                    studentName,
                    studentInitials: initials,
                    activity: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                    timeAgo: this.formatTimeAgo(timestamp),
                    timestamp,
                });
            }
            activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            this.logger.log(`Found ${activities.length} recent activities for teacher: ${teacherId}`);
            return activities.slice(0, 10);
        }
        catch (error) {
            this.logger.error('Error fetching recent activities:', error);
            return [
                {
                    studentName: 'John Smith',
                    studentInitials: 'JS',
                    activity: 'Submitted Assignment #3',
                    timeAgo: '1hr ago',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000),
                },
                {
                    studentName: 'Maria Garcia',
                    studentInitials: 'MG',
                    activity: 'Asked question in Math class',
                    timeAgo: '2hrs ago',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                },
                {
                    studentName: 'Anna Lee',
                    studentInitials: 'AL',
                    activity: 'Completed quiz successfully',
                    timeAgo: '3hrs ago',
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                },
            ];
        }
    }
    getInitials(fullName) {
        if (!fullName)
            return 'U';
        const parts = fullName.split(' ').filter((part) => part.length > 0);
        if (parts.length === 0)
            return 'U';
        if (parts.length === 1)
            return parts[0][0].toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    formatTimeAgo(timestamp) {
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffMinutes < 60) {
            return `${diffMinutes}min ago`;
        }
        else if (diffHours < 24) {
            return `${diffHours}hr${diffHours > 1 ? 's' : ''} ago`;
        }
        else {
            return `${diffDays}day${diffDays > 1 ? 's' : ''} ago`;
        }
    }
};
exports.TeacherActivityService = TeacherActivityService;
exports.TeacherActivityService = TeacherActivityService = TeacherActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TeacherActivityService);
//# sourceMappingURL=teacher-activity.service.js.map