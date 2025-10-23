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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const create_user_dto_1 = require("./dto/create-user.dto");
const csv_parser_1 = require("csv-parser");
const json2csv_1 = require("json2csv");
let UsersService = UsersService_1 = class UsersService {
    configService;
    logger = new common_1.Logger(UsersService_1.name);
    supabase = null;
    constructor(configService) {
        this.configService = configService;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration is missing');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    generateSecurePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    generatePasswordFromBirthday(birthday) {
        const date = new Date(birthday);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    async validateEmailUniqueness(email) {
        const supabase = this.getSupabaseClient();
        const { data: publicUser, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();
        if (error) {
            this.logger.error('Error validating email uniqueness:', error);
            throw new common_1.InternalServerErrorException('Failed to validate email uniqueness');
        }
        if (publicUser) {
            throw new common_1.ConflictException('Email already exists');
        }
    }
    async validateTeacherUniqueness(email, birthday) {
        const supabase = this.getSupabaseClient();
        const { data: existingTeacher, error } = await supabase
            .from('teachers')
            .select(`
        id,
        user_id,
        first_name,
        last_name,
        birthday,
        user:users!user_id(
          id,
          email
        )
      `)
            .eq('birthday', birthday)
            .eq('user.email', email)
            .maybeSingle();
        if (error) {
            this.logger.error('Error validating teacher uniqueness:', error);
            throw new common_1.InternalServerErrorException('Failed to validate teacher uniqueness');
        }
        if (existingTeacher) {
            throw new common_1.ConflictException(`Teacher with email '${email}' and birthday '${birthday}' already exists`);
        }
    }
    async validateStudentUniqueness(lrnId, birthday) {
        const supabase = this.getSupabaseClient();
        const { data: existingStudent, error } = await supabase
            .from('students')
            .select('id, lrn_id, first_name, last_name, birthday')
            .eq('lrn_id', lrnId)
            .eq('birthday', birthday)
            .maybeSingle();
        if (error) {
            this.logger.error('Error validating student uniqueness:', error);
            throw new common_1.InternalServerErrorException('Failed to validate student uniqueness');
        }
        if (existingStudent) {
            throw new common_1.ConflictException(`Student with LRN '${lrnId}' and birthday '${birthday}' already exists`);
        }
    }
    async getRoleIdByName(roleName) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleName)
            .single();
        if (error) {
            this.logger.error(`Error fetching role ${roleName}:`, error);
            return null;
        }
        return data?.id;
    }
    async createAuthUser(userData, password) {
        const supabase = this.getSupabaseClient();
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: password,
            user_metadata: {
                full_name: userData.fullName,
                role: userData.role,
                user_type: userData.userType,
            },
            email_confirm: true,
        });
        if (authError) {
            this.logger.error('Error creating auth user:', authError);
            throw new common_1.InternalServerErrorException(`Failed to create user: ${authError.message}`);
        }
        return authUser.user;
    }
    async createPublicUser(authUserId, userData, roleId) {
        const supabase = this.getSupabaseClient();
        const { data: publicUser, error: publicError } = await supabase
            .from('users')
            .insert({
            id: authUserId,
            email: userData.email,
            full_name: userData.fullName,
            role_id: roleId,
            status: 'Active',
        })
            .select()
            .single();
        if (publicError) {
            this.logger.error('Error creating public user:', publicError);
            throw new common_1.InternalServerErrorException(`Failed to create user record: ${publicError.message}`);
        }
        return publicUser;
    }
    async createTeacherRecord(userId, teacherData) {
        const supabase = this.getSupabaseClient();
        const { data: teacher, error } = await supabase
            .from('teachers')
            .insert({
            user_id: userId,
            first_name: teacherData.firstName,
            last_name: teacherData.lastName,
            middle_name: teacherData.middleName,
            birthday: teacherData.birthday,
            age: teacherData.age,
            subject_specialization_id: teacherData.subjectSpecializationId,
            department_id: teacherData.departmentId,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating teacher record:', error);
            throw new common_1.InternalServerErrorException(`Failed to create teacher record: ${error.message}`);
        }
        return teacher;
    }
    async createAdminRecord(userId, adminData) {
        const supabase = this.getSupabaseClient();
        const { data: admin, error } = await supabase
            .from('admins')
            .insert({
            user_id: userId,
            role_description: adminData.roleDescription,
            name: adminData.fullName,
            email: adminData.email,
            phone_number: adminData.phoneNumber,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating admin record:', error);
            throw new common_1.InternalServerErrorException(`Failed to create admin record: ${error.message}`);
        }
        return admin;
    }
    async createEmergencyContactRecord(studentId, contactData) {
        const supabase = this.getSupabaseClient();
        const { data: contact, error } = await supabase
            .from('emergency_contacts')
            .insert({
            student_id: studentId,
            guardian_name: contactData.guardianName,
            relationship: contactData.relationship,
            phone_number: contactData.phoneNumber,
            email: contactData.email,
            address: contactData.address,
            is_primary: contactData.isPrimary,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating emergency contact record:', error);
            throw new common_1.InternalServerErrorException(`Failed to create emergency contact record: ${error.message}`);
        }
        return contact;
    }
    async createStudentRecord(userId, studentData) {
        const supabase = this.getSupabaseClient();
        const { data: student, error } = await supabase
            .from('students')
            .insert({
            user_id: userId,
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            middle_name: studentData.middleName,
            student_id: studentData.studentId,
            lrn_id: studentData.lrnId,
            birthday: studentData.birthday,
            grade_level: studentData.gradeLevel,
            enrollment_year: studentData.enrollmentYear,
            honor_status: studentData.honorStatus,
            age: studentData.age,
            section_id: studentData.sectionId,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating student record:', error);
            throw new common_1.InternalServerErrorException(`Failed to create student record: ${error.message}`);
        }
        return student;
    }
    async createUser(userData, createdBy) {
        let authUserId = null;
        let publicUserId = null;
        try {
            await this.validateEmailUniqueness(userData.email);
            if (userData.userType === create_user_dto_1.UserType.TEACHER && userData.birthday) {
                await this.validateTeacherUniqueness(userData.email, userData.birthday);
            }
            if (userData.userType === create_user_dto_1.UserType.STUDENT && userData.birthday) {
                const studentData = userData;
                if (studentData.lrnId) {
                    await this.validateStudentUniqueness(studentData.lrnId, userData.birthday);
                }
            }
            const roleId = await this.getRoleIdByName(userData.role);
            if (!roleId) {
                throw new common_1.BadRequestException(`Role '${userData.role}' does not exist`);
            }
            const password = (userData.userType === create_user_dto_1.UserType.STUDENT ||
                userData.userType === create_user_dto_1.UserType.TEACHER) &&
                userData.birthday
                ? this.generatePasswordFromBirthday(userData.birthday)
                : this.generateSecurePassword();
            const authUser = await this.createAuthUser(userData, password);
            authUserId = authUser.id;
            const publicUser = await this.createPublicUser(authUser.id, userData, roleId);
            publicUserId = publicUser.id;
            let specificRecord = null;
            if (userData.userType === 'teacher') {
                specificRecord = await this.createTeacherRecord(authUser.id, userData);
            }
            else if (userData.userType === 'admin') {
                specificRecord = await this.createAdminRecord(authUser.id, userData);
            }
            else if (userData.userType === 'student') {
                specificRecord = await this.createStudentRecord(authUser.id, userData);
            }
            this.logger.log(`User created successfully: ${userData.email} (${userData.userType})`);
            const response = {
                success: true,
                user: {
                    id: authUser.id,
                    email: userData.email,
                    fullName: userData.fullName,
                    role: userData.role,
                    userType: userData.userType,
                    status: 'Active',
                },
                specificRecord,
                message: `${userData.userType} created successfully`,
            };
            if (userData.userType === create_user_dto_1.UserType.ADMIN) {
                response.temporaryPassword = password;
            }
            return response;
        }
        catch (error) {
            const supabase = this.getSupabaseClient();
            if (authUserId) {
                try {
                    await supabase.auth.admin.deleteUser(authUserId);
                }
                catch (rollbackError) {
                    this.logger.error('Error during auth user rollback:', rollbackError);
                }
            }
            if (publicUserId) {
                try {
                    await supabase.from('users').delete().eq('id', publicUserId);
                }
                catch (rollbackError) {
                    this.logger.error('Error during public user rollback:', rollbackError);
                }
            }
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating user:', error);
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
    }
    async createTeacher(dto, createdBy) {
        if (dto.birthday) {
            await this.validateTeacherUniqueness(dto.email, dto.birthday);
        }
        const userData = {
            ...dto,
            email: dto.email,
            fullName: dto.fullName,
            role: create_user_dto_1.UserRole.TEACHER,
            userType: create_user_dto_1.UserType.TEACHER,
        };
        return this.createUser(userData, createdBy);
    }
    async createAdmin(dto, createdBy) {
        const userData = {
            ...dto,
            email: dto.email,
            fullName: dto.fullName,
            role: create_user_dto_1.UserRole.ADMIN,
            userType: create_user_dto_1.UserType.ADMIN,
        };
        return this.createUser(userData, createdBy);
    }
    async createStudent(dto, createdBy) {
        if (dto.birthday && dto.lrnId) {
            await this.validateStudentUniqueness(dto.lrnId, dto.birthday);
        }
        const userData = {
            email: `${dto.lrnId}@student.local`,
            fullName: `${dto.firstName} ${dto.lastName}`,
            role: create_user_dto_1.UserRole.STUDENT,
            userType: create_user_dto_1.UserType.STUDENT,
            ...dto,
        };
        const result = await this.createUser(userData, createdBy);
        if (dto.emergencyContacts && dto.emergencyContacts.length > 0) {
            const emergencyContacts = [];
            for (const contact of dto.emergencyContacts) {
                try {
                    const contactRecord = await this.createEmergencyContactRecord(result.specificRecord.id, contact);
                    emergencyContacts.push(contactRecord);
                }
                catch (error) {
                    this.logger.error('Error creating emergency contact:', error);
                }
            }
            result.emergencyContacts = emergencyContacts;
        }
        return result;
    }
    async createBulkUsers(dtos, createdBy) {
        const results = [];
        const errors = [];
        for (const bulkUser of dtos.users) {
            try {
                let result;
                const { userType, data } = bulkUser;
                if (userType === 'teacher') {
                    result = await this.createTeacher(data, createdBy);
                }
                else if (userType === 'admin') {
                    result = await this.createAdmin(data, createdBy);
                }
                else if (userType === 'student') {
                    result = await this.createStudent(data, createdBy);
                }
                else {
                    throw new Error(`Unknown user type: ${userType}`);
                }
                results.push(result);
            }
            catch (error) {
                errors.push({
                    userType: bulkUser.userType,
                    email: bulkUser.data.email || 'unknown',
                    error: error.message,
                });
            }
        }
        return {
            success: results.length,
            failed: errors.length,
            results,
            errors,
        };
    }
    async findAll(filters) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, role, status, search, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        const effectiveLimit = Math.min(limit, 1000);
        let query = supabase.from('users').select(`
        *,
        role:roles!role_id(id, name),
        teacher:teachers!user_id(*, department:departments!department_id(id, department_name)),
        admin:admins!user_id(*),
        student:students!user_id(*)
      `, { count: 'exact' });
        if (role) {
            const { data: roleData, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('name', role)
                .maybeSingle();
            if (roleError) {
                this.logger.error('Error fetching role:', roleError);
                throw new common_1.InternalServerErrorException('Failed to fetch role information');
            }
            if (!roleData) {
                this.logger.warn(`Role '${role}' not found, returning empty user list`);
                return {
                    data: [],
                    pagination: {
                        page,
                        limit: effectiveLimit,
                        total: 0,
                        totalPages: 0,
                    },
                };
            }
            query = query.eq('role_id', roleData.id);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        if (effectiveLimit < 1000) {
            const from = (page - 1) * effectiveLimit;
            const to = from + effectiveLimit - 1;
            query = query.range(from, to);
        }
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching users:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch users');
        }
        const transformedData = data?.map((user) => {
            const baseUser = {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role?.name || '',
                status: user.status,
                createdAt: user.created_at,
                lastLogin: user.last_login || null,
                phoneNumber: null,
                department: null,
                studentId: null,
                gradeLevel: null,
                employeeId: null,
                subjectSpecialization: null,
            };
            if (user.student) {
                baseUser.studentId = user.student.student_id;
                baseUser.gradeLevel = user.student.grade_level;
                baseUser.phoneNumber = user.student.phone_number;
            }
            if (user.teacher) {
                baseUser.employeeId = user.teacher.id;
                baseUser.phoneNumber = user.teacher.phone_number;
                baseUser.department =
                    user.teacher.department?.department_name || null;
                baseUser.subjectSpecialization =
                    user.teacher.subject_specialization_id;
            }
            if (user.admin) {
                baseUser.employeeId = user.admin.id;
                baseUser.phoneNumber = user.admin.phone_number;
                baseUser.department = 'Administration';
            }
            return baseUser;
        }) || [];
        return {
            data: transformedData,
            pagination: {
                page,
                limit: effectiveLimit,
                total: count || 0,
                totalPages: effectiveLimit < 1000 ? Math.ceil((count || 0) / effectiveLimit) : 1,
            },
        };
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        this.logger.log(`[findOne] Fetching user with ID: ${id}`);
        const { data: basicUser, error: basicError } = await supabase
            .from('users')
            .select(`
        *,
        role:roles(name),
        teacher:teachers(*),
        admin:admins(*),
        student:students(*)
      `)
            .eq('id', id)
            .single();
        if (basicError) {
            if (basicError.code === 'PGRST116') {
                this.logger.error(`[findOne] User not found: ${id}`);
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.error('[findOne] Error fetching basic user data:', {
                userId: id,
                errorCode: basicError.code,
                errorMessage: basicError.message,
                errorDetails: basicError.details,
                errorHint: basicError.hint,
                fullError: JSON.stringify(basicError, null, 2),
            });
            throw new common_1.InternalServerErrorException('Failed to fetch user');
        }
        if (!basicUser) {
            this.logger.error(`[findOne] User data is null for ID: ${id}`);
            throw new common_1.NotFoundException('User not found');
        }
        this.logger.log(`[findOne] Basic user found: ${basicUser.email}, Role ID: ${basicUser.role_id || 'NO_ROLE_ID'}`);
        let roleData = null;
        if (basicUser.role_id) {
            const { data: role, error: roleError } = await supabase
                .from('roles')
                .select('*')
                .eq('id', basicUser.role_id)
                .single();
            if (roleError) {
                this.logger.error('[findOne] Error fetching role:', {
                    roleId: basicUser.role_id,
                    errorCode: roleError.code,
                    errorMessage: roleError.message,
                });
            }
            else {
                roleData = role;
                this.logger.log(`[findOne] Role found: ${role.name}`);
            }
        }
        let teacherData = null;
        let adminData = null;
        let studentData = null;
        const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('user_id', id)
            .single();
        if (teacherError && teacherError.code !== 'PGRST116') {
            this.logger.error('[findOne] Error fetching teacher data:', {
                userId: id,
                errorCode: teacherError.code,
                errorMessage: teacherError.message,
            });
        }
        else if (teacher) {
            teacherData = teacher;
            this.logger.log(`[findOne] Teacher data found: ${teacher.first_name} ${teacher.last_name}`);
        }
        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', id)
            .single();
        if (adminError && adminError.code !== 'PGRST116') {
            this.logger.error('[findOne] Error fetching admin data:', {
                userId: id,
                errorCode: adminError.code,
                errorMessage: adminError.message,
            });
        }
        else if (admin) {
            adminData = admin;
            this.logger.log(`[findOne] Admin data found: ${admin.name}`);
        }
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', id)
            .single();
        if (studentError && studentError.code !== 'PGRST116') {
            this.logger.error('[findOne] Error fetching student data:', {
                userId: id,
                errorCode: studentError.code,
                errorMessage: studentError.message,
            });
        }
        else if (student) {
            studentData = student;
            this.logger.log(`[findOne] Student data found: ${student.first_name} ${student.last_name}`);
        }
        const user = {
            ...basicUser,
            role: roleData,
            teacher: teacherData,
            admin: adminData,
            student: studentData,
        };
        this.logger.log(`[findOne] Final user object constructed for: ${user.email}`);
        return user;
    }
    async update(id, dto) {
        const supabase = this.getSupabaseClient();
        const updateData = {
            email: dto.email,
            full_name: dto.fullName,
            updated_at: new Date().toISOString(),
        };
        if (dto.role) {
            const roleId = await this.getRoleIdByName(dto.role);
            if (!roleId) {
                throw new common_1.NotFoundException(`Role '${dto.role}' not found`);
            }
            updateData.role_id = roleId;
        }
        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.error('Error updating user:', error);
            throw new common_1.InternalServerErrorException('Failed to update user');
        }
        return user;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase
            .from('users')
            .update({
            status: 'Inactive',
            updated_at: new Date().toISOString(),
        })
            .eq('id', id);
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.error('Error removing user:', error);
            throw new common_1.InternalServerErrorException('Failed to remove user');
        }
    }
    async updateUserStatus(id, statusDto) {
        const supabase = this.getSupabaseClient();
        const { data: user, error } = await supabase
            .from('users')
            .update({
            status: statusDto.status,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.error('Error updating user status:', error);
            throw new common_1.InternalServerErrorException('Failed to update user status');
        }
        return user;
    }
    async suspendUser(id, suspendDto) {
        const supabase = this.getSupabaseClient();
        let suspendedUntil = suspendDto.suspendedUntil;
        if (suspendDto.duration && !suspendedUntil) {
            const suspensionDate = new Date();
            suspensionDate.setDate(suspensionDate.getDate() + suspendDto.duration);
            suspendedUntil = suspensionDate.toISOString().split('T')[0];
        }
        const { data: user, error } = await supabase
            .from('users')
            .update({
            status: 'Suspended',
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error suspending user:', error);
            throw new common_1.InternalServerErrorException('Failed to suspend user');
        }
        this.logger.log(`User ${id} suspended: ${suspendDto.reason}, Duration: ${suspendDto.duration} days, Until: ${suspendedUntil}`);
        return user;
    }
    async exportUsers(format, filters) {
        const { data } = await this.findAll({ ...filters, limit: 1000 });
        const exportData = data.map((user) => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role?.name,
            status: user.status,
            created_at: user.created_at,
        }));
        if (format === 'csv') {
            const parser = new json2csv_1.Parser();
            return parser.parse(exportData);
        }
        return JSON.stringify(exportData, null, 2);
    }
    async importUsers(importDto) {
        const csvData = Buffer.from(importDto.file.split(',')[1], 'base64').toString();
        const users = [];
        return new Promise((resolve, reject) => {
            const stream = require('stream');
            const readable = new stream.Readable();
            readable.push(csvData);
            readable.push(null);
            readable
                .pipe((0, csv_parser_1.default)())
                .on('data', (row) => users.push(row))
                .on('end', async () => {
                try {
                    const results = [];
                    const errors = [];
                    for (const userData of users) {
                        try {
                            const dto = this.convertCsvRowToDto(userData);
                            let result;
                            if (dto.userType === 'teacher') {
                                result = await this.createTeacher(dto, 'system');
                            }
                            else if (dto.userType === 'admin') {
                                result = await this.createAdmin(dto, 'system');
                            }
                            else if (dto.userType === 'student') {
                                result = await this.createStudent(dto, 'system');
                            }
                            else {
                                throw new Error(`Unknown user type: ${dto.userType}`);
                            }
                            results.push(result);
                        }
                        catch (error) {
                            errors.push({
                                row: userData,
                                error: error.message,
                            });
                        }
                    }
                    resolve({
                        success: results.length,
                        failed: errors.length,
                        results,
                        errors,
                    });
                }
                catch (error) {
                    reject(error);
                }
            })
                .on('error', reject);
        });
    }
    convertCsvRowToDto(row) {
        const userType = row.userType || row.user_type;
        if (userType === 'teacher') {
            return {
                email: row.email,
                fullName: row.fullName || row.full_name,
                role: 'Teacher',
                userType: 'teacher',
                firstName: row.firstName || row.first_name,
                lastName: row.lastName || row.last_name,
                middleName: row.middleName || row.middle_name,
                birthday: row.birthday,
                age: row.age ? parseInt(row.age) : undefined,
                subjectSpecializationId: row.subjectSpecializationId || row.subject_specialization_id,
                departmentId: row.departmentId || row.department_id,
                phoneNumber: row.phoneNumber || row.phone_number,
            };
        }
        else if (userType === 'admin') {
            return {
                email: row.email,
                fullName: row.fullName || row.full_name,
                role: 'Admin',
                userType: 'admin',
                name: row.name,
                birthday: row.birthday,
                roleDescription: row.roleDescription || row.role_description,
                phoneNumber: row.phoneNumber || row.phone_number,
            };
        }
        else {
            return {
                email: row.email,
                fullName: row.fullName || row.full_name,
                role: 'Student',
                userType: 'student',
                firstName: row.firstName || row.first_name,
                lastName: row.lastName || row.last_name,
                middleName: row.middleName || row.middle_name,
                studentId: row.studentId || row.student_id,
                lrnId: row.lrnId || row.lrn_id,
                birthday: row.birthday,
                gradeLevel: row.gradeLevel || row.grade_level,
                enrollmentYear: row.enrollmentYear
                    ? parseInt(row.enrollmentYear)
                    : undefined,
                honorStatus: row.honorStatus || row.honor_status,
                age: row.age ? parseInt(row.age) : undefined,
                sectionId: row.sectionId || row.section_id,
            };
        }
    }
    parsePhoneNumber(value) {
        if (value.includes('E+') || value.includes('e+')) {
            const num = parseFloat(value);
            return '+' + num.toString();
        }
        return value;
    }
    async findOrThrowSection(sectionName, gradeLevel) {
        const supabase = this.getSupabaseClient();
        const { data: section, error } = await supabase
            .from('sections')
            .select('id')
            .eq('name', sectionName)
            .eq('grade_level', gradeLevel)
            .maybeSingle();
        if (error) {
            this.logger.error('Error fetching section:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch section information');
        }
        if (section) {
            return section.id;
        }
        this.logger.log(`Creating new section: ${sectionName} for ${gradeLevel}`);
        const { data: newSection, error: createError } = await supabase
            .from('sections')
            .insert({
            name: sectionName,
            grade_level: gradeLevel,
            teacher_id: null,
            room_id: null,
            building_id: null,
        })
            .select('id')
            .single();
        if (createError) {
            this.logger.error('Error creating section:', createError);
            throw new common_1.InternalServerErrorException(`Failed to create section '${sectionName}' for grade '${gradeLevel}'`);
        }
        return newSection.id;
    }
    parseCsvStudentRows(rows) {
        const studentMap = new Map();
        for (const row of rows) {
            const lrnId = row.lrn_id;
            if (!studentMap.has(lrnId)) {
                studentMap.set(lrnId, {
                    student: {
                        firstName: row.first_name,
                        lastName: row.last_name,
                        middleName: row.middle_name,
                        lrnId: row.lrn_id,
                        birthday: row.birthday,
                        gradeLevel: row.grade_level,
                        enrollmentYear: row.enrollment,
                        age: row.age,
                        section: row.section,
                    },
                    emergencyContacts: [],
                });
            }
            const studentData = studentMap.get(lrnId);
            studentData.emergencyContacts.push({
                guardianName: row.guardian_name,
                relationship: row.relationship,
                phoneNumber: this.parsePhoneNumber(row.phone_number),
                email: row.email,
                address: row.address,
                isPrimary: studentData.emergencyContacts.length === 0,
            });
        }
        return studentMap;
    }
    async importStudentsFromCsv(importDto, createdBy) {
        const results = [];
        const errors = [];
        try {
            const studentMap = this.parseCsvStudentRows(importDto.students);
            for (const [lrnId, studentData] of studentMap) {
                try {
                    const sectionId = await this.findOrThrowSection(studentData.student.section, studentData.student.gradeLevel);
                    const studentDto = {
                        firstName: studentData.student.firstName,
                        lastName: studentData.student.lastName,
                        middleName: studentData.student.middleName,
                        studentId: `STU-${Date.now()}`,
                        lrnId: studentData.student.lrnId,
                        birthday: studentData.student.birthday,
                        gradeLevel: studentData.student.gradeLevel,
                        enrollmentYear: studentData.student.enrollmentYear,
                        age: studentData.student.age,
                        sectionId: sectionId,
                        emergencyContacts: studentData.emergencyContacts,
                    };
                    const result = await this.createStudent(studentDto, createdBy);
                    results.push(result);
                }
                catch (error) {
                    errors.push({
                        lrnId: lrnId,
                        studentName: `${studentData.student.firstName} ${studentData.student.lastName}`,
                        error: error.message,
                    });
                }
            }
            return {
                success: results.length,
                failed: errors.length,
                results,
                errors,
            };
        }
        catch (error) {
            this.logger.error('Error importing students from CSV:', error);
            throw new common_1.InternalServerErrorException('Failed to import students from CSV');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map