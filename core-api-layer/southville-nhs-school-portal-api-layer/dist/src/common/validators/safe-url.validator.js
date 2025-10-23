"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSafeUrlConstraint = void 0;
exports.IsSafeUrl = IsSafeUrl;
const class_validator_1 = require("class-validator");
let IsSafeUrlConstraint = class IsSafeUrlConstraint {
    validate(url, args) {
        if (typeof url !== 'string') {
            return false;
        }
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return false;
            }
            if (!urlObj.hostname || urlObj.hostname.length === 0) {
                return false;
            }
            const privateHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
            if (privateHostnames.includes(urlObj.hostname.toLowerCase())) {
                return false;
            }
            const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
            if (privateIpPattern.test(urlObj.hostname)) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    defaultMessage(args) {
        return `${args.property} must be a valid HTTPS or HTTP URL`;
    }
};
exports.IsSafeUrlConstraint = IsSafeUrlConstraint;
exports.IsSafeUrlConstraint = IsSafeUrlConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isSafeUrl', async: false })
], IsSafeUrlConstraint);
function IsSafeUrl(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSafeUrlConstraint,
        });
    };
}
//# sourceMappingURL=safe-url.validator.js.map