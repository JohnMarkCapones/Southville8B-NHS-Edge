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
exports.ClubFormResponse = void 0;
const typeorm_1 = require("typeorm");
const club_form_entity_1 = require("./club-form.entity");
const club_form_answer_entity_1 = require("./club-form-answer.entity");
let ClubFormResponse = class ClubFormResponse {
    id;
    form_id;
    user_id;
    status;
    reviewed_by;
    reviewed_at;
    review_notes;
    created_at;
    updated_at;
    form;
    answers;
    user;
    reviewed_by_user;
};
exports.ClubFormResponse = ClubFormResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClubFormResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ClubFormResponse.prototype, "form_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ClubFormResponse.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected'],
    }),
    __metadata("design:type", String)
], ClubFormResponse.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ClubFormResponse.prototype, "reviewed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], ClubFormResponse.prototype, "reviewed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClubFormResponse.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubFormResponse.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubFormResponse.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => club_form_entity_1.ClubForm, (form) => form.responses, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'form_id' }),
    __metadata("design:type", club_form_entity_1.ClubForm)
], ClubFormResponse.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => club_form_answer_entity_1.ClubFormAnswer, (answer) => answer.response, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ClubFormResponse.prototype, "answers", void 0);
exports.ClubFormResponse = ClubFormResponse = __decorate([
    (0, typeorm_1.Entity)('club_form_responses'),
    (0, typeorm_1.Unique)(['form_id', 'user_id'])
], ClubFormResponse);
//# sourceMappingURL=club-form-response.entity.js.map