"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Policies = exports.POLICIES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.POLICIES_KEY = 'policies';
const Policies = (domainParam, permissionKey) => (0, common_1.SetMetadata)(exports.POLICIES_KEY, { domainParam, permissionKey });
exports.Policies = Policies;
//# sourceMappingURL=policies.decorator.js.map