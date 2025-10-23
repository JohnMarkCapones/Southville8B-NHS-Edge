"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionValidationPipe = void 0;
const common_1 = require("@nestjs/common");
let PermissionValidationPipe = class PermissionValidationPipe {
    transform(value, metadata) {
        if (typeof value !== 'string') {
            return value;
        }
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts.length > 2) {
                throw new common_1.BadRequestException('Invalid permission format. Expected format: "domain.action" (e.g., "club.manage_finances")');
            }
            const [domain, action] = parts;
            if (!domain || !action) {
                throw new common_1.BadRequestException('Invalid permission format. Expected format: "domain.action" (e.g., "club.manage_finances")');
            }
            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(domain)) {
                throw new common_1.BadRequestException('Invalid domain format. Domain must start with a letter and contain only letters, numbers, and underscores');
            }
            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(action)) {
                throw new common_1.BadRequestException('Invalid action format. Action must start with a letter and contain only letters, numbers, and underscores');
            }
        }
        return value;
    }
};
exports.PermissionValidationPipe = PermissionValidationPipe;
exports.PermissionValidationPipe = PermissionValidationPipe = __decorate([
    (0, common_1.Injectable)()
], PermissionValidationPipe);
//# sourceMappingURL=permission-validation.pipe.js.map