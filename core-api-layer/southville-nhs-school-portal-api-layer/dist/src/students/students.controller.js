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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StudentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const students_service_1 = require("./students.service");
const create_student_dto_1 = require("./dto/create-student.dto");
const update_student_dto_1 = require("./dto/update-student.dto");
const create_emergency_contact_dto_1 = require("./dto/create-emergency-contact.dto");
const update_emergency_contact_dto_1 = require("./dto/update-emergency-contact.dto");
const emergency_contact_entity_1 = require("./entities/emergency-contact.entity");
const create_student_ranking_dto_1 = require("./dto/create-student-ranking.dto");
const update_student_ranking_dto_1 = require("./dto/update-student-ranking.dto");
const student_ranking_entity_1 = require("./entities/student-ranking.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const policies_guard_1 = require("../auth/guards/policies.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const policies_decorator_1 = require("../auth/decorators/policies.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
let StudentsController = StudentsController_1 = class StudentsController {
    studentsService;
    logger = new common_1.Logger(StudentsController_1.name);
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async create(createStudentDto, user) {
        console.log(`Creating student for user: ${user.email} (${user.id})`);
        return this.studentsService.create(createStudentDto);
    }
    async findAll(user, page = 1, limit = 10, search, gradeLevel, sectionId, sortBy = 'created_at', sortOrder = 'desc') {
        this.logger.log('Fetching students');
        return this.studentsService.findAll({
            page,
            limit,
            search,
            gradeLevel,
            sectionId,
            sortBy,
            sortOrder,
        });
    }
    async findOne(id, user) {
        if (user.role === 'Student') {
            const student = await this.studentsService.findOne(id);
            if (student.user_id !== user.id) {
                throw new common_1.ForbiddenException('Students can only view their own data');
            }
        }
        this.logger.log(`Fetching student ${id}`);
        return this.studentsService.findOne(id);
    }
    async update(id, updateStudentDto, user) {
        console.log(`Updating student ${id} for user: ${user.email} (${user.id})`);
        return this.studentsService.update(id, updateStudentDto);
    }
    async remove(id, user) {
        console.log(`Deleting student ${id} for user: ${user.email} (${user.id})`);
        return this.studentsService.remove(id);
    }
    getPublicInfo() {
        return {
            message: 'This is a public endpoint - no authentication required',
            timestamp: new Date().toISOString(),
        };
    }
    async getEmergencyContacts(studentUserId, user) {
        if (user.role === 'Student' && user.id !== studentUserId) {
            throw new common_1.ForbiddenException('You can only view your own emergency contacts');
        }
        return this.studentsService.getEmergencyContacts(studentUserId);
    }
    async addEmergencyContact(studentUserId, createDto) {
        return this.studentsService.addEmergencyContact(studentUserId, createDto);
    }
    async updateEmergencyContact(contactId, updateDto) {
        return this.studentsService.updateEmergencyContact(contactId, updateDto);
    }
    async deleteEmergencyContact(contactId) {
        await this.studentsService.deleteEmergencyContact(contactId);
        return { message: 'Emergency contact deleted successfully' };
    }
    async createRanking(createDto, user) {
        this.logger.log(`Creating student ranking for user: ${user.email} (${user.id})`);
        return this.studentsService.createRanking(createDto);
    }
    async findAllRankings(user, page = 1, limit = 10, gradeLevel, quarter, schoolYear, topN = 100) {
        this.logger.log('Fetching student rankings');
        return this.studentsService.findAllRankings({
            page,
            limit,
            gradeLevel,
            quarter,
            schoolYear,
            topN,
        });
    }
    async findRankingById(id, user) {
        if (user.role === 'Student') {
            const ranking = await this.studentsService.findRankingById(id);
            if (ranking.student_id !== user.id) {
                throw new common_1.ForbiddenException('Students can only view their own rankings');
            }
        }
        this.logger.log(`Fetching student ranking ${id}`);
        return this.studentsService.findRankingById(id);
    }
    async findRankingsByStudent(studentId, user) {
        if (user.role === 'Student' && user.id !== studentId) {
            throw new common_1.ForbiddenException('Students can only view their own rankings');
        }
        this.logger.log(`Fetching rankings for student ${studentId}`);
        return this.studentsService.findRankingsByStudent(studentId);
    }
    async updateRanking(id, updateDto, user) {
        this.logger.log(`Updating student ranking ${id} for user: ${user.email} (${user.id})`);
        return this.studentsService.updateRanking(id, updateDto);
    }
    async deleteRanking(id, user) {
        this.logger.log(`Deleting student ranking ${id} for user: ${user.email} (${user.id})`);
        await this.studentsService.deleteRanking(id);
        return { message: 'Student ranking deleted successfully' };
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new student' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Student already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_dto_1.CreateStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, policies_decorator_1.Policies)('id', 'student:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all students with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'gradeLevel', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sectionId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'first_name', 'last_name', 'student_id'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('gradeLevel')),
    __param(5, (0, common_1.Query)('sectionId')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('id', 'student:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a student by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, policies_decorator_1.Policies)('id', 'student:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a student' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_dto_1.UpdateStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, policies_decorator_1.Policies)('id', 'student:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a student (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('public/info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public student information' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Public information retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getPublicInfo", null);
__decorate([
    (0, common_1.Get)(':studentUserId/emergency-contacts'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get emergency contacts for a student' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Emergency contacts retrieved',
        type: [emergency_contact_entity_1.EmergencyContact],
    }),
    __param(0, (0, common_1.Param)('studentUserId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getEmergencyContacts", null);
__decorate([
    (0, common_1.Post)(':studentUserId/emergency-contacts'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Add emergency contact (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Emergency contact created',
        type: emergency_contact_entity_1.EmergencyContact,
    }),
    __param(0, (0, common_1.Param)('studentUserId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_emergency_contact_dto_1.CreateEmergencyContactDto]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "addEmergencyContact", null);
__decorate([
    (0, common_1.Patch)('emergency-contacts/:contactId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update emergency contact (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Emergency contact updated',
        type: emergency_contact_entity_1.EmergencyContact,
    }),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_emergency_contact_dto_1.UpdateEmergencyContactDto]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "updateEmergencyContact", null);
__decorate([
    (0, common_1.Delete)('emergency-contacts/:contactId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete emergency contact (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Emergency contact deleted' }),
    __param(0, (0, common_1.Param)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "deleteEmergencyContact", null);
__decorate([
    (0, common_1.Post)('rankings'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, policies_decorator_1.Policies)('id', 'student:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new student ranking' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Student ranking created successfully',
        type: student_ranking_entity_1.StudentRanking,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Student already has ranking for this period',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_ranking_dto_1.CreateStudentRankingDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "createRanking", null);
__decorate([
    (0, common_1.Get)('rankings'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, policies_decorator_1.Policies)('id', 'student:read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all student rankings with pagination and filtering',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'gradeLevel',
        required: false,
        type: String,
        description: 'Filter by grade level',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'quarter',
        required: false,
        type: String,
        description: 'Filter by quarter',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'schoolYear',
        required: false,
        type: String,
        description: 'Filter by school year',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'topN',
        required: false,
        type: Number,
        description: 'Get top N students (default: 100)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student rankings retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('gradeLevel')),
    __param(4, (0, common_1.Query)('quarter')),
    __param(5, (0, common_1.Query)('schoolYear')),
    __param(6, (0, common_1.Query)('topN', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAllRankings", null);
__decorate([
    (0, common_1.Get)('rankings/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('id', 'student:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a student ranking by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student ranking retrieved successfully',
        type: student_ranking_entity_1.StudentRanking,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student ranking not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findRankingById", null);
__decorate([
    (0, common_1.Get)(':studentId/rankings'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('id', 'student:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all rankings for a specific student' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student rankings retrieved successfully',
        type: [student_ranking_entity_1.StudentRanking],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findRankingsByStudent", null);
__decorate([
    (0, common_1.Patch)('rankings/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, policies_decorator_1.Policies)('id', 'student:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a student ranking' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student ranking updated successfully',
        type: student_ranking_entity_1.StudentRanking,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student ranking not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Duplicate ranking for this period',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_ranking_dto_1.UpdateStudentRankingDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "updateRanking", null);
__decorate([
    (0, common_1.Delete)('rankings/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, policies_decorator_1.Policies)('id', 'student:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a student ranking' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student ranking deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student ranking not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "deleteRanking", null);
exports.StudentsController = StudentsController = StudentsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Students'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map