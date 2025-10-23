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
exports.ClubFormAnswer = void 0;
const typeorm_1 = require("typeorm");
const club_form_response_entity_1 = require("./club-form-response.entity");
const club_form_question_entity_1 = require("./club-form-question.entity");
let ClubFormAnswer = class ClubFormAnswer {
    id;
    response_id;
    question_id;
    answer_text;
    answer_value;
    created_at;
    response;
    question;
};
exports.ClubFormAnswer = ClubFormAnswer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClubFormAnswer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ClubFormAnswer.prototype, "response_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ClubFormAnswer.prototype, "question_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClubFormAnswer.prototype, "answer_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClubFormAnswer.prototype, "answer_value", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubFormAnswer.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => club_form_response_entity_1.ClubFormResponse, (response) => response.answers, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'response_id' }),
    __metadata("design:type", club_form_response_entity_1.ClubFormResponse)
], ClubFormAnswer.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => club_form_question_entity_1.ClubFormQuestion, (question) => question.answers, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'question_id' }),
    __metadata("design:type", club_form_question_entity_1.ClubFormQuestion)
], ClubFormAnswer.prototype, "question", void 0);
exports.ClubFormAnswer = ClubFormAnswer = __decorate([
    (0, typeorm_1.Entity)('club_form_answers'),
    (0, typeorm_1.Unique)(['response_id', 'question_id'])
], ClubFormAnswer);
//# sourceMappingURL=club-form-answer.entity.js.map