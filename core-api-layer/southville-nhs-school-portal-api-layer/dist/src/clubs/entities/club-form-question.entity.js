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
exports.ClubFormQuestion = void 0;
const typeorm_1 = require("typeorm");
const club_form_entity_1 = require("./club-form.entity");
const club_form_question_option_entity_1 = require("./club-form-question-option.entity");
const club_form_answer_entity_1 = require("./club-form-answer.entity");
let ClubFormQuestion = class ClubFormQuestion {
    id;
    form_id;
    question_text;
    question_type;
    required;
    order_index;
    created_at;
    updated_at;
    form;
    options;
    answers;
};
exports.ClubFormQuestion = ClubFormQuestion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClubFormQuestion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ClubFormQuestion.prototype, "form_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], ClubFormQuestion.prototype, "question_text", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: 'text',
        enum: [
            'text',
            'textarea',
            'dropdown',
            'radio',
            'checkbox',
            'number',
            'email',
            'date',
        ],
    }),
    __metadata("design:type", String)
], ClubFormQuestion.prototype, "question_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ClubFormQuestion.prototype, "required", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ClubFormQuestion.prototype, "order_index", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubFormQuestion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClubFormQuestion.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => club_form_entity_1.ClubForm, (form) => form.questions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'form_id' }),
    __metadata("design:type", club_form_entity_1.ClubForm)
], ClubFormQuestion.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => club_form_question_option_entity_1.ClubFormQuestionOption, (option) => option.question, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ClubFormQuestion.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => club_form_answer_entity_1.ClubFormAnswer, (answer) => answer.question, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ClubFormQuestion.prototype, "answers", void 0);
exports.ClubFormQuestion = ClubFormQuestion = __decorate([
    (0, typeorm_1.Entity)('club_form_questions')
], ClubFormQuestion);
//# sourceMappingURL=club-form-question.entity.js.map