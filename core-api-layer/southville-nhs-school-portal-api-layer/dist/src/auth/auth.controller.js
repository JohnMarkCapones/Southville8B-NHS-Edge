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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        try {
            const { user, session } = await this.authService.signIn(loginDto.email, loginDto.password);
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at,
                    email_confirmed_at: user.email_confirmed_at,
                    user_metadata: user.user_metadata,
                },
                session: {
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                    expires_at: session.expires_at,
                },
                message: 'Login successful',
            };
        }
        catch (error) {
            throw error;
        }
    }
    async verify(tokenDto) {
        try {
            const user = await this.authService.verifyToken(tokenDto.token);
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at,
                    email_confirmed_at: user.email_confirmed_at,
                    user_metadata: user.user_metadata,
                },
                message: 'Token verified successfully',
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Authenticate user with email and password',
        description: 'Signs in a user with email and password, returns user data and session',
    }),
    (0, swagger_1.ApiBody)({
        description: 'User login credentials',
        type: login_dto_1.LoginDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        created_at: { type: 'string' },
                        email_confirmed_at: { type: 'string' },
                        user_metadata: { type: 'object' },
                    },
                },
                session: {
                    type: 'object',
                    properties: {
                        access_token: { type: 'string' },
                        refresh_token: { type: 'string' },
                        expires_at: { type: 'number' },
                    },
                },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid email or password',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                message: { type: 'string' },
                error: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify JWT token',
        description: 'Verifies a Supabase JWT token and returns user information',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Supabase JWT token',
        type: login_dto_1.TokenVerifyDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token verified successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        created_at: { type: 'string' },
                        email_confirmed_at: { type: 'string' },
                    },
                },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired token',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                message: { type: 'string' },
                error: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.TokenVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map