"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsOptionsRequiredForTypeConstraint = void 0;
exports.IsOptionsRequiredForType = IsOptionsRequiredForType;
const class_validator_1 = require("class-validator");
const create_form_question_dto_1 = require("../create-form-question.dto");
let IsOptionsRequiredForTypeConstraint = class IsOptionsRequiredForTypeConstraint {
    validate(options, args) {
        const object = args.object;
        const questionType = object.question_type;
        if (questionType === create_form_question_dto_1.QuestionType.DROPDOWN ||
            questionType === create_form_question_dto_1.QuestionType.RADIO ||
            questionType === create_form_question_dto_1.QuestionType.CHECKBOX) {
            return Array.isArray(options) && options.length > 0;
        }
        return true;
    }
    defaultMessage(args) {
        const object = args.object;
        const questionType = object.question_type;
        return `Options are required for ${questionType} question type`;
    }
};
exports.IsOptionsRequiredForTypeConstraint = IsOptionsRequiredForTypeConstraint;
exports.IsOptionsRequiredForTypeConstraint = IsOptionsRequiredForTypeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isOptionsRequiredForType', async: false })
], IsOptionsRequiredForTypeConstraint);
function IsOptionsRequiredForType(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsOptionsRequiredForTypeConstraint,
        });
    };
}
//# sourceMappingURL=is-options-required-for-type.validator.js.map