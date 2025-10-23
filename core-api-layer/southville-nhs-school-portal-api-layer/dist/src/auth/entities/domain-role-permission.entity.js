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
exports.DomainRolePermission = void 0;
const typeorm_1 = require("typeorm");
const domain_role_entity_1 = require("./domain-role.entity");
const permission_entity_1 = require("./permission.entity");
let DomainRolePermission = class DomainRolePermission {
    id;
    domain_role_id;
    permission_id;
    allowed;
    created_at;
    updated_at;
    domain_role;
    permission;
};
exports.DomainRolePermission = DomainRolePermission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DomainRolePermission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], DomainRolePermission.prototype, "domain_role_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], DomainRolePermission.prototype, "permission_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DomainRolePermission.prototype, "allowed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DomainRolePermission.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DomainRolePermission.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => domain_role_entity_1.DomainRole),
    (0, typeorm_1.JoinColumn)({ name: 'domain_role_id' }),
    __metadata("design:type", domain_role_entity_1.DomainRole)
], DomainRolePermission.prototype, "domain_role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id' }),
    __metadata("design:type", permission_entity_1.Permission)
], DomainRolePermission.prototype, "permission", void 0);
exports.DomainRolePermission = DomainRolePermission = __decorate([
    (0, typeorm_1.Entity)('domain_role_permissions')
], DomainRolePermission);
//# sourceMappingURL=domain-role-permission.entity.js.map