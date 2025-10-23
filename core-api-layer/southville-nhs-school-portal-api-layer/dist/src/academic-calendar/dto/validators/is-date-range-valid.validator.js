"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDateRangeValidConstraint = void 0;
const class_validator_1 = require("class-validator");
let IsDateRangeValidConstraint = class IsDateRangeValidConstraint {
    validate(value, args) {
        const object = args.object;
        const startDate = object.start_date;
        const endDate = object.end_date;
        if (!startDate || !endDate) {
            return true;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return true;
        }
        return end >= start;
    }
    defaultMessage(args) {
        return 'end_date must be the same as or after start_date';
    }
};
exports.IsDateRangeValidConstraint = IsDateRangeValidConstraint;
exports.IsDateRangeValidConstraint = IsDateRangeValidConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isDateRangeValid', async: false })
], IsDateRangeValidConstraint);
//# sourceMappingURL=is-date-range-valid.validator.js.map