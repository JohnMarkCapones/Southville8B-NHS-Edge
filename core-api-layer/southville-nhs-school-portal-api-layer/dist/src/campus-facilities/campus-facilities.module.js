"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampusFacilitiesModule = void 0;
const common_1 = require("@nestjs/common");
const campus_facilities_service_1 = require("./campus-facilities.service");
const campus_facilities_controller_1 = require("./campus-facilities.controller");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("../auth/auth.module");
let CampusFacilitiesModule = class CampusFacilitiesModule {
};
exports.CampusFacilitiesModule = CampusFacilitiesModule;
exports.CampusFacilitiesModule = CampusFacilitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, auth_module_1.AuthModule],
        controllers: [campus_facilities_controller_1.CampusFacilitiesController],
        providers: [campus_facilities_service_1.CampusFacilitiesService],
        exports: [campus_facilities_service_1.CampusFacilitiesService],
    })
], CampusFacilitiesModule);
//# sourceMappingURL=campus-facilities.module.js.map