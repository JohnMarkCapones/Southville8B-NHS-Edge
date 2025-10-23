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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtVerificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
let JwtVerificationService = class JwtVerificationService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async verifyTokenLocally(token) {
        try {
            const cleanToken = token.replace(/^Bearer\s+/i, '');
            const decodedHeader = jwt.decode(cleanToken, { complete: true });
            if (!decodedHeader || typeof decodedHeader === 'string') {
                throw new common_1.UnauthorizedException('Invalid token format');
            }
            const payload = decodedHeader.payload;
            const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
            if (!serviceRoleKey) {
                throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for JWT verification');
            }
            const verifiedPayload = jwt.verify(cleanToken, serviceRoleKey);
            const currentTime = Math.floor(Date.now() / 1000);
            if (verifiedPayload.exp && verifiedPayload.exp < currentTime) {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            const user = {
                id: verifiedPayload.sub || verifiedPayload.user_id,
                email: verifiedPayload.email || '',
                role: verifiedPayload.role || verifiedPayload.user_metadata?.role,
                user_metadata: verifiedPayload.user_metadata,
                app_metadata: verifiedPayload.app_metadata,
                aud: verifiedPayload.aud || 'authenticated',
                created_at: verifiedPayload.created_at,
                updated_at: verifiedPayload.updated_at,
                email_confirmed_at: verifiedPayload.email_confirmed_at,
                phone: verifiedPayload.phone,
                phone_confirmed_at: verifiedPayload.phone_confirmed_at,
                last_sign_in_at: verifiedPayload.last_sign_in_at,
                confirmed_at: verifiedPayload.confirmed_at,
            };
            return user;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid token signature');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            throw new common_1.UnauthorizedException('Token verification failed');
        }
    }
    extractPayload(token) {
        try {
            const cleanToken = token.replace(/^Bearer\s+/i, '');
            const payload = jwt.decode(cleanToken);
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token format');
        }
    }
};
exports.JwtVerificationService = JwtVerificationService;
exports.JwtVerificationService = JwtVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtVerificationService);
//# sourceMappingURL=jwt-verification.service.js.map