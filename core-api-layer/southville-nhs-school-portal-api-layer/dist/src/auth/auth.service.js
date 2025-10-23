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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const jwt_verification_service_1 = require("./jwt-verification.service");
let AuthService = AuthService_1 = class AuthService {
    configService;
    jwtVerificationService;
    logger = new common_1.Logger(AuthService_1.name);
    supabase = null;
    authClient = null;
    constructor(configService, jwtVerificationService) {
        this.configService = configService;
        this.jwtVerificationService = jwtVerificationService;
    }
    validateConfig() {
        const supabaseUrl = this.configService.get('supabase.url');
        const anonKey = this.configService.get('supabase.anonKey');
        const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL is required but not set in environment variables');
        }
        if (!anonKey) {
            throw new Error('SUPABASE_ANON_KEY is required but not set in environment variables');
        }
        if (!serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set in environment variables');
        }
        try {
            new URL(supabaseUrl);
        }
        catch (error) {
            throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
        }
    }
    getServiceClient() {
        if (!this.supabase) {
            this.validateConfig();
            const supabaseUrl = this.configService.get('supabase.url');
            const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
        }
        return this.supabase;
    }
    getAuthClient() {
        if (!this.authClient) {
            this.validateConfig();
            const supabaseUrl = this.configService.get('supabase.url');
            const anonKey = this.configService.get('supabase.anonKey');
            this.authClient = (0, supabase_js_1.createClient)(supabaseUrl, anonKey);
        }
        return this.authClient;
    }
    async signIn(email, password) {
        try {
            const authClient = this.getAuthClient();
            const { data, error } = await authClient.auth.signInWithPassword({
                email,
                password,
            });
            if (error || !data.user) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            await this.ensureUserExistsInPublicTable(data.user);
            const roleFromDatabase = await this.getUserRoleFromDatabase(data.user.id);
            const user = {
                id: data.user.id,
                email: data.user.email || '',
                role: roleFromDatabase || data.user.role,
                user_metadata: data.user.user_metadata,
                app_metadata: data.user.app_metadata,
                aud: data.user.aud || 'authenticated',
                created_at: data.user.created_at,
                updated_at: data.user.updated_at,
                email_confirmed_at: data.user.email_confirmed_at,
                phone: data.user.phone,
                phone_confirmed_at: data.user.phone_confirmed_at,
                last_sign_in_at: data.user.last_sign_in_at,
                confirmed_at: data.user.confirmed_at,
            };
            return { user, session: data.session };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
    async ensureUserExistsInPublicTable(authUser) {
        try {
            const supabase = this.getServiceClient();
            console.log('🔍 Ensuring user exists in public.users:', authUser.id);
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id, email, role_id')
                .eq('id', authUser.id)
                .single();
            const roleName = authUser.user_metadata?.role || 'Student';
            const { data: role, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('name', roleName)
                .single();
            if (roleError || !role) {
                this.logger.error(`❌ Role '${roleName}' not found in database`, roleError);
                throw new common_1.InternalServerErrorException(`Role '${roleName}' not found. Please ensure roles table is properly seeded.`);
            }
            const roleId = role.id;
            if (checkError && checkError.code !== 'PGRST116') {
                console.error('❌ Error checking existing user:', checkError);
                return;
            }
            if (!existingUser) {
                console.log('📝 User not found, creating new user...');
                const userData = {
                    id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.full_name || authUser.email,
                    ...(roleId ? { role_id: roleId } : {}),
                    status: 'Active',
                };
                console.log('📝 Inserting user data:', userData);
                const { data: insertedUser, error: insertError } = await supabase
                    .from('users')
                    .insert(userData)
                    .select()
                    .single();
                if (insertError) {
                    console.error('❌ Error inserting user:', insertError);
                }
                else {
                    console.log('✅ User successfully inserted:', insertedUser);
                }
            }
            else {
                console.log('📝 User exists, checking if update needed...');
                const needsUpdate = existingUser.email !== authUser.email ||
                    (!existingUser.role_id && !!roleId);
                if (needsUpdate) {
                    console.log('🔄 Updating user information...');
                    const updateData = {};
                    if (existingUser.email !== authUser.email) {
                        updateData.email = authUser.email;
                        updateData.full_name =
                            authUser.user_metadata?.full_name || authUser.email;
                    }
                    if (!existingUser.role_id && roleId) {
                        updateData.role_id = roleId;
                    }
                    console.log('📝 Updating user data:', updateData);
                    const { data: updatedUser, error: updateError } = await supabase
                        .from('users')
                        .update(updateData)
                        .eq('id', authUser.id)
                        .select()
                        .single();
                    if (updateError) {
                        console.error('❌ Error updating user:', updateError);
                    }
                    else {
                        console.log('✅ User successfully updated:', updatedUser);
                    }
                }
                else {
                    console.log('✅ User is up to date');
                }
            }
        }
        catch (error) {
            console.error('❌ Unexpected error in ensureUserExistsInPublicTable:', error);
        }
    }
    async verifyToken(token) {
        try {
            const authClient = this.getAuthClient();
            const { data: { user }, error, } = await authClient.auth.getUser(token);
            if (error || !user) {
                throw new common_1.UnauthorizedException('Invalid or expired token');
            }
            const supabaseUser = {
                id: user.id,
                email: user.email || '',
                role: user.role,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata,
                aud: user.aud || 'authenticated',
                created_at: user.created_at,
                updated_at: user.updated_at,
                email_confirmed_at: user.email_confirmed_at,
                phone: user.phone,
                phone_confirmed_at: user.phone_confirmed_at,
                last_sign_in_at: user.last_sign_in_at,
                confirmed_at: user.confirmed_at,
            };
            return supabaseUser;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token verification failed');
        }
    }
    async extractUserFromToken(token) {
        try {
            const cleanToken = token.replace(/^Bearer\s+/i, '');
            const payload = JSON.parse(Buffer.from(cleanToken.split('.')[1], 'base64').toString());
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token format');
        }
    }
    async getUserRoleFromSupabase(userId) {
        try {
            const supabase = this.getServiceClient();
            const { data, error } = await supabase
                .from('auth.users')
                .select('raw_user_meta_data')
                .eq('id', userId)
                .single();
            if (error) {
                console.error('Error fetching user role:', error);
                return null;
            }
            const role = data?.raw_user_meta_data?.role;
            return role || null;
        }
        catch (error) {
            console.error('Error in getUserRoleFromSupabase:', error);
            return null;
        }
    }
    async getUserRole(userId) {
        try {
            const supabase = this.getServiceClient();
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .single();
            if (error) {
                return undefined;
            }
            return data?.role;
        }
        catch (error) {
            return undefined;
        }
    }
    async hasRole(userId, requiredRole) {
        const userRole = await this.getUserRole(userId);
        return userRole === requiredRole;
    }
    ROLE_HIERARCHY = {
        Admin: ['Admin', 'Teacher', 'Student'],
        Teacher: ['Teacher', 'Student'],
        Student: ['Student'],
    };
    hasRoleHierarchy(userRole, requiredRole) {
        const allowedRoles = this.ROLE_HIERARCHY[userRole] || [];
        return allowedRoles.includes(requiredRole);
    }
    async getUserRoleFromDatabase(userId) {
        try {
            const supabase = this.getServiceClient();
            const { data, error } = await supabase
                .from('users')
                .select(`
          id,
          role_id,
          roles!inner(name)
        `)
                .eq('id', userId)
                .single();
            if (error) {
                console.error('Error fetching user role from database:', error);
                return null;
            }
            const roleName = data?.roles?.name;
            return roleName || null;
        }
        catch (error) {
            console.error('Error in getUserRoleFromDatabase:', error);
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_verification_service_1.JwtVerificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map