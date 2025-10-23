"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCacheService = void 0;
const common_1 = require("@nestjs/common");
let RoleCacheService = class RoleCacheService {
    cache = new Map();
    TTL = 60 * 1000;
    getCachedRole(userId) {
        const cached = this.cache.get(userId);
        if (!cached) {
            return null;
        }
        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(userId);
            return null;
        }
        return cached.role;
    }
    setCachedRole(userId, role) {
        this.cache.set(userId, {
            role,
            timestamp: Date.now(),
        });
    }
    removeCachedRole(userId) {
        this.cache.delete(userId);
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheStats() {
        const entries = Array.from(this.cache.entries()).map(([userId, cached]) => ({
            userId,
            role: cached.role,
            age: Date.now() - cached.timestamp,
        }));
        return {
            size: this.cache.size,
            entries,
        };
    }
};
exports.RoleCacheService = RoleCacheService;
exports.RoleCacheService = RoleCacheService = __decorate([
    (0, common_1.Injectable)()
], RoleCacheService);
//# sourceMappingURL=role-cache.service.js.map