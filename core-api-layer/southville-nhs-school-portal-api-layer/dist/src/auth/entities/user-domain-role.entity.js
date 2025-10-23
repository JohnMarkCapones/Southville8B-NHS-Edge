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
exports.UserDomainRole = void 0;
const typeorm_1 = require("typeorm");
const domain_role_entity_1 = require("./domain-role.entity");
let UserDomainRole = class UserDomainRole {
    id;
    user_id;
    domain_role_id;
    created_at;
    updated_at;
    domain_role;
};
exports.UserDomainRole = UserDomainRole;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserDomainRole.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], UserDomainRole.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], UserDomainRole.prototype, "domain_role_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserDomainRole.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserDomainRole.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => domain_role_entity_1.DomainRole),
    (0, typeorm_1.JoinColumn)({ name: 'domain_role_id' }),
    __metadata("design:type", domain_role_entity_1.DomainRole)
], UserDomainRole.prototype, "domain_role", void 0);
exports.UserDomainRole = UserDomainRole = __decorate([
    (0, typeorm_1.Entity)('user_domain_roles')
], UserDomainRole);
//# sourceMappingURL=user-domain-role.entity.js.map