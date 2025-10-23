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
exports.ClubForm = void 0;
const typeorm_1 = require("typeorm");
const club_entity_1 = require("./club.entity");
const club_form_question_entity_1 = require("./club-form-question.entity");
const club_form_response_entity_1 = require("./club-form-response.entity");
let ClubForm = class ClubForm {
    id;
    club_id;
    created_by;
    name;
    description;
    is_active;
    auto_approve;
    form_type;
    created_at;
    updated_at;
    club;
    questions;
    responses;
    created_by_user;
};
exports.ClubForm = ClubForm;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClubForm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ClubForm.prototype, "club_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ClubForm.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], ClubForm.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClubForm.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ClubForm.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ClubForm.prototype, "auto_approve", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'member_registration' }),
    __metadata("design:type", String)
], ClubForm.prototype, "form_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubForm.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubForm.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => club_entity_1.Club, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'club_id' }),
    __metadata("design:type", club_entity_1.Club)
], ClubForm.prototype, "club", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => club_form_question_entity_1.ClubFormQuestion, (question) => question.form, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ClubForm.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => club_form_response_entity_1.ClubFormResponse, (response) => response.form, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ClubForm.prototype, "responses", void 0);
exports.ClubForm = ClubForm = __decorate([
    (0, typeorm_1.Entity)('club_forms')
], ClubForm);
//# sourceMappingURL=club-form.entity.js.map