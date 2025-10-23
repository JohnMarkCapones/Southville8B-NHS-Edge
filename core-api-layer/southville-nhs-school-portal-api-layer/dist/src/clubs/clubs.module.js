"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubsModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const auth_module_1 = require("../auth/auth.module");
const clubs_service_1 = require("./clubs.service");
const clubs_controller_1 = require("./clubs.controller");
const club_forms_service_1 = require("./services/club-forms.service");
const club_form_responses_service_1 = require("./services/club-form-responses.service");
const club_forms_controller_1 = require("./controllers/club-forms.controller");
const club_memberships_service_1 = require("./services/club-memberships.service");
const club_memberships_controller_1 = require("./controllers/club-memberships.controller");
let ClubsModule = class ClubsModule {
};
exports.ClubsModule = ClubsModule;
exports.ClubsModule = ClubsModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, auth_module_1.AuthModule],
        controllers: [
            clubs_controller_1.ClubsController,
            club_forms_controller_1.ClubFormsController,
            club_memberships_controller_1.ClubMembershipsController,
        ],
        providers: [
            clubs_service_1.ClubsService,
            club_forms_service_1.ClubFormsService,
            club_form_responses_service_1.ClubFormResponsesService,
            club_memberships_service_1.ClubMembershipsService,
        ],
        exports: [
            clubs_service_1.ClubsService,
            club_forms_service_1.ClubFormsService,
            club_form_responses_service_1.ClubFormResponsesService,
            club_memberships_service_1.ClubMembershipsService,
        ],
    })
], ClubsModule);
//# sourceMappingURL=clubs.module.js.map