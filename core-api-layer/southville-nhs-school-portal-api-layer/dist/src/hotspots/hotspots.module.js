"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotspotsModule = void 0;
const common_1 = require("@nestjs/common");
const hotspots_service_1 = require("./hotspots.service");
const hotspots_controller_1 = require("./hotspots.controller");
const auth_module_1 = require("../auth/auth.module");
let HotspotsModule = class HotspotsModule {
};
exports.HotspotsModule = HotspotsModule;
exports.HotspotsModule = HotspotsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [hotspots_controller_1.HotspotsController],
        providers: [hotspots_service_1.HotspotsService],
    })
], HotspotsModule);
//# sourceMappingURL=hotspots.module.js.map